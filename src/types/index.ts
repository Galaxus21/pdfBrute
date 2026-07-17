// ─── Shared Interfaces & Types ───────────────────────────────────────────────

/**
 * A single "token" produced by the pattern parser.
 * Each token represents one position in the password template.
 * ISP: the interface is minimal — generators only implement what they need.
 */
export interface PatternToken {
  type: TokenType;
  literal?: string;
}

type TokenType =
  | 'UPPER'    // L  — uppercase letter A-Z
  | 'LOWER'    // l  — lowercase letter a-z
  | 'DIGIT'    // d  — digit 0-9
  | 'DAY'      // DD — two-digit day 01-31
  | 'MONTH'    // MM — two-digit month 01-12
  | 'YEAR'     // YYYY — four-digit year
  | 'ANY'      // ?  — any printable character
  | 'INVALID';

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

// ─── Worker Messages ──────────────────────────────────────────────────────────

export interface WorkerStartMessage {
  type: 'START';
  pdfBuffer: ArrayBuffer;
  tokens: PatternToken[];
  knownChars: string[];
  direction: 'forward' | 'reverse';
  strideId: number;
  strideCount: number;
  isBidirectional: boolean;
}

interface WorkerStopMessage {
  type: 'STOP';
}

export type WorkerInMessage = WorkerStartMessage | WorkerStopMessage;

// ─────────────────────────────────────────────────────────────────────────────

interface WorkerProgressMessage {
  type: 'PROGRESS';
  current: string;
  tested: number;
  total: number;
  speed: number; // passwords per second
  elapsedMs: number;
}

interface WorkerFoundMessage {
  type: 'FOUND';
  password: string;
}

interface WorkerExhaustedMessage {
  type: 'EXHAUSTED';
}

interface WorkerErrorMessage {
  type: 'ERROR';
  message: string;
}

export type WorkerOutMessage =
  | WorkerProgressMessage
  | WorkerFoundMessage
  | WorkerExhaustedMessage
  | WorkerErrorMessage;

// ─── App State ────────────────────────────────────────────────────────────────

type RecoveryStatus =
  | 'idle'
  | 'running'
  | 'found'
  | 'exhausted'
  | 'error';

export interface RecoveryState {
  status: RecoveryStatus;
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
}
