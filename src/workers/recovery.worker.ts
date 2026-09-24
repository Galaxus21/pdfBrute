/**
 * recovery.worker.ts
 *
 * SRP: This file is responsible solely for password generation and PDF testing.
 * It has NO knowledge of React, the DOM, or Aphrodite.
 * DIP: It depends on the GeneratorStrategy abstraction, not on concrete classes.
 *
 * Loads the PDF via a blob: URL (see recoveryWorkerPool.ts) rather than a
 * transferred ArrayBuffer — pd.js unconditionally puts `data.buffer` in the
 * postMessage transfer list to its own internal worker
 * (`sendWithPromise("GetDocRequest", docParams, data ? [data.buffer] : null)`),
 * which forces one full buffer per worker. A `url` load sidesteps that: the
 * browser's Blob store is read directly, so N workers cost 1x the file's
 * memory, not Nx, with no SharedArrayBuffer or cross-origin-isolation headers.
 *
 * Uses the `onPassword` event-driven approach: one loadingTask per worker,
 * re-fed with the next candidate on every wrong-password callback.
 */

import * as pdfjsLib from 'pdfjs-dist';
import type {
  WorkerInMessage,
  WorkerOutMessage,
  PatternToken,
  YearRange,
} from '../types';
import { buildConstrainedGenerators, CartesianProductGenerator, computeWorkerRange } from '../utils/generators';
import { describePdfLoadError } from '../utils/pdfErrorMessages';

import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const PROGRESS_INTERVAL_MS = 250;

let stopped = false;
let currentLoadingTask: pdfjsLib.PDFDocumentLoadingTask | null = null;

/**
 * pd.js's `getDocument({ url })` only accepts a string OR a URL object, but
 * when given a string it resolves it via `window.location`
 * (api_utils.js `getUrlProp`) — a reference-error inside a Worker, which has
 * no `window`. Passing a URL object skips that branch entirely, so resolve
 * it ourselves with `self.location` (always available in a Worker) as the base.
 */
function toWorkerSafeUrl(url: string): URL {
  return new URL(url, self.location.href);
}

/** Pre-flight check: does the PDF open without a password? Run once, by one worker — see CHECK. */
async function checkIsUnencrypted(pdfUrl: string): Promise<boolean> {
  const loadingTask = pdfjsLib.getDocument({ url: toWorkerSafeUrl(pdfUrl) });
  try {
    const doc = await loadingTask.promise;
    await doc.cleanup();
    return true;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'PasswordException') {
      return false; // Encrypted!
    }
    throw err;
  } finally {
    loadingTask.destroy();
  }
}

// ─── Recovery Engine ──────────────────────────────────────────────────────────

interface PasswordAttemptState {
  tested: number;
  foundPassword: string;
  exhausted: boolean;
}

/** Builds this worker's contiguous, non-overlapping slice of the keyspace. */
function buildRangeIterator(
  tokens: PatternToken[],
  knownChars: string[],
  yearRange: YearRange,
  workerIndex: number,
  workerCount: number
) {
  const generators = buildConstrainedGenerators(tokens, knownChars, yearRange);
  const composite = new CartesianProductGenerator(generators);
  const total = composite.size();
  const { start, count } = computeWorkerRange(total, workerCount, workerIndex);
  return { total, iterator: composite.valuesInRange(start, count) };
}

/** Pulls the next candidate on every pd.js "wrong password" callback and reports progress. */
function createOnPasswordHandler(
  iterator: IterableIterator<string>,
  state: PasswordAttemptState,
  postProgress: (current: string) => void
) {
  let lastProgressTime = Date.now();

  return (updatePassword: (password: string) => void) => {
    if (stopped) {
      currentLoadingTask?.destroy();
      return;
    }

    const next = iterator.next();
    if (next.done) {
      state.exhausted = true;
      currentLoadingTask?.destroy();
      return;
    }

    state.tested++;
    state.foundPassword = next.value;

    const now = Date.now();
    if (now - lastProgressTime >= PROGRESS_INTERVAL_MS) {
      postProgress(next.value);
      lastProgressTime = now;
    }

    updatePassword(next.value);
  };
}

/** Builds a postProgress(current) closure that reports this worker's running stats. */
function createProgressReporter(state: PasswordAttemptState, total: number, startTime: number) {
  return (current: string) => {
    const elapsedMs = Date.now() - startTime;
    const speed = elapsedMs > 0 ? Math.round(state.tested / (elapsedMs / 1000)) : state.tested;
    const msg: WorkerOutMessage = { type: 'PROGRESS', current, tested: state.tested, total, speed, elapsedMs };
    self.postMessage(msg);
  };
}

async function runRecovery(
  pdfUrl: string,
  tokens: PatternToken[],
  knownChars: string[],
  yearRange: YearRange,
  workerIndex: number,
  workerCount: number
): Promise<void> {
  const { total, iterator } = buildRangeIterator(tokens, knownChars, yearRange, workerIndex, workerCount);
  const state: PasswordAttemptState = { tested: 0, foundPassword: '', exhausted: false };
  const postProgress = createProgressReporter(state, total, Date.now());

  currentLoadingTask = pdfjsLib.getDocument({ url: toWorkerSafeUrl(pdfUrl) });
  currentLoadingTask.onPassword = createOnPasswordHandler(iterator, state, postProgress);

  try {
    const doc = await currentLoadingTask.promise;
    await doc.cleanup();
    // If it resolves, the last password tested (state.foundPassword) was correct.
    postProgress(state.foundPassword);
    self.postMessage({ type: 'FOUND', password: state.foundPassword } satisfies WorkerOutMessage);
  } catch (err: unknown) {
    if (stopped) return; // Aborted by user — no error to report.

    if (state.exhausted) {
      postProgress(state.foundPassword); // Flush final stats
      self.postMessage({ type: 'EXHAUSTED' } satisfies WorkerOutMessage);
    } else {
      throw err;
    }
  } finally {
    currentLoadingTask = null;
  }
}

// ─── Message Handler ──────────────────────────────────────────────────────────

async function handleCheck(pdfUrl: string): Promise<void> {
  try {
    const isUnencrypted = await checkIsUnencrypted(pdfUrl);
    self.postMessage({ type: 'CHECK_RESULT', isUnencrypted } satisfies WorkerOutMessage);
  } catch (err) {
    self.postMessage({ type: 'ERROR', message: describePdfLoadError(err) } satisfies WorkerOutMessage);
  }
}

async function handleStart(msg: Extract<WorkerInMessage, { type: 'START' }>): Promise<void> {
  stopped = false;
  try {
    await runRecovery(msg.pdfUrl, msg.tokens, msg.knownChars, msg.yearRange, msg.workerIndex, msg.workerCount);
  } catch (err) {
    self.postMessage({ type: 'ERROR', message: describePdfLoadError(err) } satisfies WorkerOutMessage);
  }
}

self.onmessage = async (event: MessageEvent<WorkerInMessage>) => {
  const msg = event.data;

  switch (msg.type) {
    case 'STOP':
      stopped = true;
      currentLoadingTask?.destroy();
      currentLoadingTask = null;
      return;
    case 'CHECK':
      await handleCheck(msg.pdfUrl);
      return;
    case 'START':
      await handleStart(msg);
      return;
  }
};
