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
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePDFRecovery() {
  const [state, setState] = useState<RecoveryState>(INITIAL_STATE);
  const workerRef = useRef<Worker | null>(null);
  const pdfBufferRef = useRef<ArrayBuffer | null>(null);

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
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'STOP' });
      workerRef.current.terminate();
      workerRef.current = null;
    }
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

    // Terminate any previous worker before spawning a new one
    stop();

    const tokens = parsePattern(config.pattern);

    // Vite-native Web Worker import
    const worker = new Worker(
      new URL('../workers/recovery.worker.ts', import.meta.url),
      { type: 'module' }
    );

    worker.onmessage = (event: MessageEvent<WorkerOutMessage>) => {
      const msg = event.data;
      switch (msg.type) {
        case 'PROGRESS':
          setState({
            status: 'running',
            currentPassword: msg.current,
            tested: msg.tested,
            total: msg.total,
            speed: msg.speed,
            elapsedMs: msg.elapsedMs,
            foundPassword: null,
            errorMessage: null,
          });
          break;
        case 'FOUND':
          setState(prev => ({
            ...prev,
            status: 'found',
            foundPassword: msg.password,
          }));
          worker.terminate();
          workerRef.current = null;
          break;
        case 'EXHAUSTED':
          setState(prev => ({ ...prev, status: 'exhausted', tested: prev.total }));
          worker.terminate();
          workerRef.current = null;
          break;
        case 'ERROR':
          setState(prev => ({
            ...prev,
            status: 'error',
            errorMessage: msg.message,
          }));
          worker.terminate();
          workerRef.current = null;
          break;
      }
    };

    worker.onerror = err => {
      setState(prev => ({
        ...prev,
        status: 'error',
        errorMessage: err.message,
      }));
      worker.terminate();
      workerRef.current = null;
    };

    workerRef.current = worker;

    // Transfer pdfBuffer to worker (zero-copy) — keeps main thread memory free
    const bufferCopy = pdfBufferRef.current.slice(0);
    const startMsg: WorkerStartMessage = {
      type: 'START',
      pdfBuffer: bufferCopy,
      tokens,
      knownChars: config.knownChars,
    };
    worker.postMessage(startMsg, [bufferCopy]);

    setState({
      ...INITIAL_STATE,
      status: 'running',
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

