/**
 * Manages recovery state and PDF object URL lifecycle.
 */
import { useRef, useState, useCallback, useEffect } from 'react';
import type { RecoveryState, PatternConfig, WorkerProgressMessage } from '../types';
import { parsePattern } from '../utils/patterns';
import { startRecoveryPool, getWorkerCount } from '../workers/recoveryWorkerPool';

// A PDF always opens with this literal header — checked before we ever spin
// up a worker, so a non-PDF upload fails fast with a clear message (F12).
const PDF_MAGIC_BYTES = '%PDF-';

const NOT_PASSWORD_PROTECTED_MESSAGE =
  "This PDF doesn't require a password to open — there's no open password to recover.";

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

interface WorkerStats {
  tested: number;
  speed: number;
  elapsedMs: number;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePDFRecovery() {
  const [state, setState] = useState<RecoveryState>(INITIAL_STATE);
  const workersRef = useRef<Worker[]>([]);
  const pdfUrlRef = useRef<string | null>(null);
  const workerStatsRef = useRef<Map<number, WorkerStats>>(new Map());

  const revokePdfUrl = useCallback(() => {
    if (pdfUrlRef.current) {
      URL.revokeObjectURL(pdfUrlRef.current);
      pdfUrlRef.current = null;
    }
  }, []);

  // Belt-and-suspenders: also revoke if the component unmounts mid-session.
  useEffect(() => () => revokePdfUrl(), [revokePdfUrl]);

  /** Validates the file looks like a PDF and mints a blob: URL for the workers to load. */
  const loadPDF = useCallback(async (file: File): Promise<void> => {
    const header = await file.slice(0, PDF_MAGIC_BYTES.length).text();
    if (header !== PDF_MAGIC_BYTES) {
      throw new Error("This file doesn't look like a PDF (missing %PDF- header).");
    }
    revokePdfUrl();
    pdfUrlRef.current = URL.createObjectURL(file);
  }, [revokePdfUrl]);

  /** Terminate any running workers and reset state */
  const stop = useCallback(() => {
    workersRef.current.forEach(worker => worker.terminate());
    workersRef.current = [];
    workerStatsRef.current.clear();
    setState(prev =>
      prev.status === 'running' ? { ...prev, status: 'idle' } : prev
    );
  }, []);

  const applyProgress = useCallback(
    (workerIndex: number, msg: WorkerProgressMessage) => {
      workerStatsRef.current.set(workerIndex, { tested: msg.tested, speed: msg.speed, elapsedMs: msg.elapsedMs });

      let totalTested = 0;
      let totalSpeed = 0;
      let maxElapsed = 0;
      workerStatsRef.current.forEach(stats => {
        totalTested += stats.tested;
        totalSpeed += stats.speed;
        maxElapsed = Math.max(maxElapsed, stats.elapsedMs);
      });

      setState(prev => {
        if (prev.status !== 'running') return prev;
        return {
          ...prev,
          currentPassword: msg.current,
          tested: totalTested,
          total: msg.total,
          speed: totalSpeed,
          elapsedMs: maxElapsed,
        };
      });
    },
    []
  );

  /** Start the recovery process */
  const start = useCallback((config: PatternConfig) => {
    if (!pdfUrlRef.current) {
      setState(prev => ({ ...prev, status: 'error', errorMessage: 'No PDF loaded.' }));
      return;
    }

    // Terminate any previous workers before spawning new ones
    stop();

    const tokens = parsePattern(config.pattern);
    workerStatsRef.current.clear();

    workersRef.current = startRecoveryPool(
      { pdfUrl: pdfUrlRef.current, tokens, knownChars: config.knownChars, yearRange: config.yearRange },
      {
        onProgress: applyProgress,
        onFound: password => setState(prev => ({ ...prev, status: 'found', foundPassword: password })),
        onExhausted: () => setState(prev => ({ ...prev, status: 'exhausted', tested: prev.total })),
        onError: message => setState(prev => ({ ...prev, status: 'error', errorMessage: message })),
        onNotPasswordProtected: () =>
          setState(prev => ({ ...prev, status: 'error', errorMessage: NOT_PASSWORD_PROTECTED_MESSAGE })),
      }
    );

    setState({
      ...INITIAL_STATE,
      status: 'running',
      activeWorkers: getWorkerCount(),
    });
  }, [stop, applyProgress]);

  const reset = useCallback(() => {
    stop();
    setState(INITIAL_STATE);
    revokePdfUrl();
  }, [stop, revokePdfUrl]);

  const clearResults = useCallback(() => {
    stop();
    setState(INITIAL_STATE);
  }, [stop]);

  const setError = useCallback((msg: string) => {
    setState(prev => ({ ...prev, status: 'error', errorMessage: msg }));
  }, []);

  return { state, loadPDF, start, stop, reset, clearResults, setError };
}
