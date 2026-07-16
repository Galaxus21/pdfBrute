/**
 * recovery.worker.ts
 *
 * SRP: This file is responsible solely for password generation and PDF testing.
 * It has NO knowledge of React, the DOM, or Aphrodite.
 * DIP: It depends on the GeneratorStrategy abstraction, not on concrete classes.
 *
 * This version uses the `onPassword` event-driven approach. 
 * We do not clone the PDF buffer on every guess.
 */

import * as pdfjsLib from 'pdfjs-dist';
import type {
  WorkerInMessage,
  WorkerOutMessage,
  PatternToken
} from '../types';
import {
  ConstrainedGenerator,
  CartesianProductGenerator,
  tokenToGenerator,
} from '../utils/generators';
import { getTokenLength } from '../utils/patterns';

import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

/**
 * Pre-flight check: see if the PDF opens without a password.
 * We use slice(0) here just once, in case it mutates or transfers.
 */
async function isUnencryptedCheck(pdfBytes: Uint8Array): Promise<boolean> {
  const loadingTask = pdfjsLib.getDocument({
    data: pdfBytes.slice(0),
  });

  try {
    const doc = await loadingTask.promise;
    await doc.cleanup();
    return true;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'PasswordException') {
      return false; // Encrypted!
    }
    throw err;
  }
}

// ─── Recovery Engine ──────────────────────────────────────────────────────────

let stopped = false;
let currentLoadingTask: pdfjsLib.PDFDocumentLoadingTask | null = null;

async function runRecovery(
  pdfBuffer: ArrayBuffer,
  tokens: PatternToken[],
  knownChars: string[]
): Promise<void> {
  // Wrap once — used for the pre-flight check and the main brute force loop
  const pdfBytes = new Uint8Array(pdfBuffer);

  const isUnencrypted = await isUnencryptedCheck(pdfBytes);
  if (isUnencrypted) {
    throw new Error('This PDF is not password protected.');
  }

  // Setup generators
  let currentPos = 0;
  const generators = tokens.map(t => {
    const len = getTokenLength(t);
    const tokenConstraints = knownChars.slice(currentPos, currentPos + len);
    currentPos += len;

    const baseGen = tokenToGenerator(t);
    return new ConstrainedGenerator(baseGen, len, tokenConstraints);
  });

  const composite = new CartesianProductGenerator(generators);
  const total = composite.size();
  const iterator = composite.values();

  let tested = 0;
  const startTime = Date.now();
  let lastProgressTime = startTime;
  const PROGRESS_INTERVAL_MS = 250;

  const postProgress = (current: string) => {
    const now = Date.now();
    const elapsedMs = now - startTime;
    const speed = elapsedMs > 0 ? Math.round(tested / (elapsedMs / 1000)) : tested;
    const msg: WorkerOutMessage = {
      type: 'PROGRESS',
      current,
      tested,
      total,
      speed,
      elapsedMs,
    };
    self.postMessage(msg);
  };

  let foundPassword = '';
  let exhausted = false;

  currentLoadingTask = pdfjsLib.getDocument({
    data: pdfBytes, // NO SLICE(0)! This is the huge optimization.
  });

  // Event-driven brute-force loop
  currentLoadingTask.onPassword = (updatePassword: (password: string) => void) => {
    if (stopped) {
      // User aborted
      if (currentLoadingTask) currentLoadingTask.destroy();
      return;
    }

    const next = iterator.next();
    if (next.done) {
      // We ran out of passwords to try
      exhausted = true;
      if (currentLoadingTask) currentLoadingTask.destroy();
      return;
    }

    const candidate = next.value;
    tested++;

    const now = Date.now();
    if (now - lastProgressTime >= PROGRESS_INTERVAL_MS) {
      postProgress(candidate);
      lastProgressTime = now;
    }

    // Save the candidate so we know which one was correct if the promise resolves
    foundPassword = candidate;
    
    // Test the password
    updatePassword(candidate);
  };

  try {
    const doc = await currentLoadingTask.promise;
    await doc.cleanup();
    
    // If it resolves, it means the last password tested was correct!
    postProgress(foundPassword);
    const msg: WorkerOutMessage = { type: 'FOUND', password: foundPassword };
    self.postMessage(msg);
  } catch (err: unknown) {
    if (stopped) {
      // Task was aborted by user. No need to send an error.
      return;
    }
    
    // When we call destroy() because we exhausted candidates, it rejects the promise.
    if (exhausted) {
      postProgress(foundPassword); // Flush final stats
      const msg: WorkerOutMessage = { type: 'EXHAUSTED' };
      self.postMessage(msg);
    } else {
      // An actual unexpected error occurred during parsing
      throw err;
    }
  } finally {
    currentLoadingTask = null;
  }
}

// ─── Message Handler ──────────────────────────────────────────────────────────

self.onmessage = async (event: MessageEvent<WorkerInMessage>) => {
  const msg = event.data;

  if (msg.type === 'STOP') {
    stopped = true;
    if (currentLoadingTask) {
      currentLoadingTask.destroy();
      currentLoadingTask = null;
    }
    return;
  }

  if (msg.type === 'START') {
    stopped = false;
    try {
      await runRecovery(
        msg.pdfBuffer,
        msg.tokens,
        msg.knownChars
      );
    } catch (err) {
      const errMsg: WorkerOutMessage = {
        type: 'ERROR',
        message: err instanceof Error ? err.message : String(err),
      };
      self.postMessage(errMsg);
    }
  }
};
