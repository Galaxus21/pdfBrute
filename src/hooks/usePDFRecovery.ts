/**
 * usePDFRecovery.ts
 *
 * SRP: This hook owns the Web Worker lifecycle and recovery state only.
 *      It does not render anything.
 * DIP: Depends on WorkerInMessage / WorkerOutMessage abstractions.
 */

import { useRef, useState, useCallback } from 'react';
import type {
  RecoveryState,
  PatternConfig,
  WorkerOutMessage,
  WorkerStartMessage,
} from '../types';
import { parsePattern } from '../utils/patterns';

// ─── Initial State (DRY: single source of truth) ─────────────────────────────

const INITIAL_STATE: RecoveryState = {
  status: 'idle',
  currentPassword: '',
  tested: 0,
  total: 0,
  speed: 0,
  elapsedMs: 0,
  foundPassword: null,
  errorMessage: null,
  activeWorkers: 0,
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePDFRecovery() {
  const [state, setState] = useState<RecoveryState>(INITIAL_STATE);
  const workersRef = useRef<Worker[]>([]);
  const pdfBufferRef = useRef<ArrayBuffer | null>(null);
  const workerStatsRef = useRef<Map<number, { tested: number; speed: number; currentPassword: string; total: number; elapsedMs: number }>>(new Map());

  /** Store the PDF file's ArrayBuffer for later use by the worker */
  const loadPDF = useCallback((file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        pdfBufferRef.current = e.target?.result as ArrayBuffer;
        resolve();
      };
      reader.onerror = () => reject(new Error('Failed to read PDF file.'));
      reader.readAsArrayBuffer(file);
    });
  }, []);

  /** Terminate any running worker and reset state */
  const stop = useCallback(() => {
    workersRef.current.forEach(worker => {
      worker.postMessage({ type: 'STOP' });
      worker.terminate();
    });
    workersRef.current = [];
    workerStatsRef.current.clear();
    setState(prev =>
      prev.status === 'running' ? { ...prev, status: 'idle' } : prev
    );
  }, []);

  /** Start the recovery process */
  const start = useCallback((config: PatternConfig) => {
    if (!pdfBufferRef.current) {
      setState(prev => ({
        ...prev,
        status: 'error',
        errorMessage: 'No PDF loaded.',
      }));
      return;
    }

    // Terminate any previous workers before spawning new ones
    stop();

    const tokens = parsePattern(config.pattern);
    const numWorkers = navigator.hardwareConcurrency || 4;
    workerStatsRef.current.clear();
    let exhaustedCount = 0;
    
    const forwardWorkers = Math.ceil(numWorkers / 2);
    const reverseWorkers = Math.floor(numWorkers / 2);

    for (let i = 0; i < numWorkers; i++) {
      // Vite-native Web Worker import
      const worker = new Worker(
        new URL('../workers/recovery.worker.ts', import.meta.url),
        { type: 'module' }
      );

      worker.onmessage = (event: MessageEvent<WorkerOutMessage>) => {
        const msg = event.data;
        switch (msg.type) {
          case 'PROGRESS': {
            workerStatsRef.current.set(i, {
              tested: msg.tested,
              speed: msg.speed,
              currentPassword: msg.current,
              total: msg.total,
              elapsedMs: msg.elapsedMs
            });

            let totalTested = 0;
            let totalSpeed = 0;
            const currentPwd = msg.current;
            let maxElapsed = 0;

            workerStatsRef.current.forEach(stats => {
              totalTested += stats.tested;
              totalSpeed += stats.speed;
              maxElapsed = Math.max(maxElapsed, stats.elapsedMs);
            });

            setState(prev => ({
              ...prev,
              status: 'running',
              currentPassword: currentPwd,
              tested: totalTested,
              total: msg.total,
              speed: totalSpeed,
              elapsedMs: maxElapsed,
              foundPassword: null,
              errorMessage: null,
            }));
            break;
          }
          case 'FOUND':
            setState(prev => ({
              ...prev,
              status: 'found',
              foundPassword: msg.password,
            }));
            workersRef.current.forEach(w => w.terminate());
            workersRef.current = [];
            break;
          case 'EXHAUSTED':
            exhaustedCount++;
            if (exhaustedCount === numWorkers) {
              setState(prev => ({ ...prev, status: 'exhausted', tested: prev.total }));
              workersRef.current.forEach(w => w.terminate());
              workersRef.current = [];
            }
            break;
          case 'ERROR':
            setState(prev => ({
              ...prev,
              status: 'error',
              errorMessage: msg.message,
            }));
            workersRef.current.forEach(w => w.terminate());
            workersRef.current = [];
            break;
        }
      };

      worker.onerror = err => {
        setState(prev => ({
          ...prev,
          status: 'error',
          errorMessage: err.message,
        }));
        workersRef.current.forEach(w => w.terminate());
        workersRef.current = [];
      };

      workersRef.current.push(worker);

      // Transfer pdfBuffer to worker (zero-copy) — keeps main thread memory free
      // Note: slice(0) copies the buffer so each worker gets its own ArrayBuffer.
      const bufferCopy = pdfBufferRef.current.slice(0);
      
      const direction = i < forwardWorkers ? 'forward' : 'reverse';
      const strideId = i < forwardWorkers ? i : i - forwardWorkers;
      const strideCount = direction === 'forward' ? forwardWorkers : reverseWorkers;

      const isBidirectional = reverseWorkers > 0;

      const startMsg: WorkerStartMessage = {
        type: 'START',
        pdfBuffer: bufferCopy,
        tokens,
        knownChars: config.knownChars,
        direction,
        strideId,
        strideCount,
        isBidirectional
      };
      worker.postMessage(startMsg, [bufferCopy]);
    }

    setState({
      ...INITIAL_STATE,
      status: 'running',
      activeWorkers: numWorkers,
    });
  }, [stop]);

  const reset = useCallback(() => {
    stop();
    setState(INITIAL_STATE);
    pdfBufferRef.current = null;
  }, [stop]);

  const clearResults = useCallback(() => {
    stop();
    setState(INITIAL_STATE);
  }, [stop]);

  const setError = useCallback((msg: string) => {
    setState(prev => ({ ...prev, status: 'error', errorMessage: msg }));
  }, []);

  return { state, loadPDF, start, stop, reset, clearResults, setError };
}

