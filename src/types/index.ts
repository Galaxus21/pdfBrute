// ─── Shared Interfaces & Types ───────────────────────────────────────────────

/**
 * A single "token" produced by the pattern parser.
 * Each token represents one position in the password template.
 * ISP: the interface is minimal — generators only implement what they need.
 */
export interface PatternToken {
  type: 'UPPER' | 'LOWER' | 'DIGIT' | 'DAY' | 'MONTH' | 'YEAR' | 'ANY' | 'INVALID';
  literal?: string;
}

// 'UPPER'    L  — uppercase letter A-Z
// 'LOWER'    l  — lowercase letter a-z
// 'DIGIT'    d  — digit 0-9
// 'DAY'      DD — two-digit day 01-31
// 'MONTH'    MM — two-digit month 01-12
// 'YEAR'     YYYY — four-digit year
// 'ANY'      ?  — any printable ASCII character (0x20-0x7E)

// ─── Generator Strategy (ISP / OCP compliant) ────────────────────────────────

/**
 * All generators implement this interface.
 * The worker depends on this abstraction, not on any concrete class.
 * DIP: the worker only knows about GeneratorStrategy.
 */
export interface GeneratorStrategy {
  /** Total number of values this generator can produce */
  size(): number;
  /** Returns an iterator of all possible string values */
  values(): IterableIterator<string>;
}

/**
 * Inclusive bounds for the YYYY token. Reused across the generator layer,
 * the validation layer, and the worker START message so all three can never
 * disagree about what "year" means for a given run.
 */
export interface YearRange {
  from: number;
  to: number;
}

// ─── Worker Messages ──────────────────────────────────────────────────────────

/**
 * Sent to exactly one worker before any START — confirms the PDF actually
 * needs a password. Kept separate from START so the whole pool doesn't
 * redundantly re-parse the file (see recoveryWorkerPool.ts).
 */

export type WorkerInMessage =
  | { type: 'CHECK'; pdfUrl: string }
  | { type: 'START'; pdfUrl: string; tokens: PatternToken[]; knownChars: string[]; yearRange: YearRange; workerIndex: number; workerCount: number }
  | { type: 'STOP' };
// ─────────────────────────────────────────────────────────────────────────────

export type WorkerProgressMessage = {
  type: 'PROGRESS';
  current: string;
  tested: number;
  total: number;
  speed: number; // passwords per second
  elapsedMs: number;
};

export type WorkerOutMessage =
  | { type: 'CHECK_RESULT'; isUnencrypted: boolean }
  | WorkerProgressMessage
  | { type: 'FOUND'; password: string }
  | { type: 'EXHAUSTED' }
  | { type: 'ERROR'; message: string };

// ─── App State ────────────────────────────────────────────────────────────────

export interface RecoveryState {
  status: 'idle' | 'running' | 'found' | 'exhausted' | 'error';
  currentPassword: string;
  tested: number;
  total: number;
  speed: number;
  elapsedMs: number;
  foundPassword: string | null;
  errorMessage: string | null;
  activeWorkers: number;
}

export interface PatternConfig {
  pattern: string;
  passwordLength: number;
  knownChars: string[];
  yearRange: YearRange;
}
