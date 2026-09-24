/**
 * Manages Worker lifecycle and message routing for a recovery run.
 * The encryption pre-check runs once on worker 0 before starting the pool.
 */
import type {
  PatternToken,
  WorkerOutMessage,
  WorkerProgressMessage,
  YearRange,
} from '../types';

const MIN_WORKER_COUNT = 1;
// Leaves one core free so the UI thread (progress rendering, Stop button) stays responsive.
const CORES_RESERVED_FOR_UI = 1;
const FALLBACK_CORE_COUNT = 4;

/** Worker count for a run: all cores but one, never fewer than one. */
export function getWorkerCount(): number {
  const cores = navigator.hardwareConcurrency || FALLBACK_CORE_COUNT;
  return Math.max(MIN_WORKER_COUNT, cores - CORES_RESERVED_FOR_UI);
}

export interface RecoveryPoolConfig {
  pdfUrl: string;
  tokens: PatternToken[];
  knownChars: string[];
  yearRange: YearRange;
}

export interface RecoveryPoolCallbacks {
  onProgress(workerIndex: number, msg: WorkerProgressMessage): void;
  onFound(password: string): void;
  onExhausted(): void;
  onError(message: string): void;
  onNotPasswordProtected(): void;
}

function createRecoveryWorker(): Worker {
  return new Worker(new URL('./recovery.worker.ts', import.meta.url), { type: 'module' });
}

function sendStartToAll(workers: Worker[], config: RecoveryPoolConfig): void {
  workers.forEach((worker, workerIndex) => {
    const startMsg = {
      type: 'START',
      pdfUrl: config.pdfUrl,
      tokens: config.tokens,
      knownChars: config.knownChars,
      yearRange: config.yearRange,
      workerIndex,
      workerCount: workers.length,
    };
    worker.postMessage(startMsg);
  });
}

function createMessageRouter(
  workers: Worker[],
  config: RecoveryPoolConfig,
  callbacks: RecoveryPoolCallbacks
) {
  let exhaustedCount = 0;
  let isDone = false;
  const terminateAll = () => {
    isDone = true;
    workers.forEach(w => w.terminate());
  };

  return (workerIndex: number) => (event: MessageEvent<WorkerOutMessage>) => {
    if (isDone) return;
    const msg = event.data;
    switch (msg.type) {
      case 'CHECK_RESULT':
        if (msg.isUnencrypted) {
          terminateAll();
          callbacks.onNotPasswordProtected();
        } else {
          sendStartToAll(workers, config);
        }
        break;
      case 'PROGRESS':
        callbacks.onProgress(workerIndex, msg);
        break;
      case 'FOUND':
        terminateAll();
        callbacks.onFound(msg.password);
        break;
      case 'EXHAUSTED':
        exhaustedCount++;
        if (exhaustedCount === workers.length) {
          terminateAll();
          callbacks.onExhausted();
        }
        break;
      case 'ERROR':
        terminateAll();
        callbacks.onError(msg.message);
        break;
    }
  };
}

/**
 * Spawns the worker pool for one recovery run and kicks off the CHECK/START
 * handshake. Returns the live workers so the caller can terminate them
 * (e.g. on Stop) — this module never holds onto them itself.
 */
export function startRecoveryPool(
  config: RecoveryPoolConfig,
  callbacks: RecoveryPoolCallbacks
): Worker[] {
  const workers = Array.from({ length: getWorkerCount() }, createRecoveryWorker);
  const routeMessage = createMessageRouter(workers, config, callbacks);

  workers.forEach((worker, workerIndex) => {
    worker.onmessage = routeMessage(workerIndex);
    worker.onerror = err => {
      workers.forEach(w => w.terminate());
      callbacks.onError(err.message);
    };
  });

  const checkMsg = { type: 'CHECK', pdfUrl: config.pdfUrl };
  workers[0].postMessage(checkMsg);

  return workers;
}
