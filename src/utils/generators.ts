import type { GeneratorStrategy, PatternToken, YearRange } from '../types';
import { getTokenLength } from './patterns';

// ─── Constants ────────────────────────────────────────────────────────────────

export const DEFAULT_YEAR_RANGE: YearRange = { from: 1900, to: 2100 };

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Zero-pad a number to a fixed width. DRY: used by Day, Month, Year generators */
function pad(n: number, width: number): string {
  return String(n).padStart(width, '0');
}

/** Precomputed static character pools to avoid re-allocation */
const UPPER_CHARS = Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
const LOWER_CHARS = Array.from('abcdefghijklmnopqrstuvwxyz');
const DIGIT_CHARS = Array.from('0123456789');
const DAY_STRINGS = Array.from({ length: 31 }, (_, i) => pad(i + 1, 2));
const MONTH_STRINGS = Array.from({ length: 12 }, (_, i) => pad(i + 1, 2));
const PRINTABLE_ASCII_CHARS = Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i));

/** Converts a global mixed-radix index into per-pool indices (pool 0 = least-significant/fastest). */
function unrank(index: number, sizes: number[]): number[] {
  const indices = new Array<number>(sizes.length);
  let remainder = index;
  for (let pool = 0; pool < sizes.length; pool++) {
    indices[pool] = remainder % sizes[pool];
    remainder = Math.floor(remainder / sizes[pool]);
  }
  return indices;
}

/** Advances a mixed-radix digit vector by one, carrying from pool 0 upward. */
function incrementOdometer(indices: number[], sizes: number[]): void {
  for (let pool = 0; pool < sizes.length; pool++) {
    indices[pool]++;
    if (indices[pool] < sizes[pool]) return;
    indices[pool] = 0;
  }
}

// ─── Concrete Generators ──────────────────────────────────────────────────────

class StaticPoolGenerator implements GeneratorStrategy {
  private readonly pool: readonly string[];
  constructor(pool: readonly string[]) {
    this.pool = pool;
  }
  size() { return this.pool.length; }
  *values(): IterableIterator<string> { yield* this.pool; }
}

/** Yields years in range (inclusive) */
class YearGenerator implements GeneratorStrategy {
  private from: number;
  private to: number;
  constructor(from: number, to: number) {
    this.from = from;
    this.to = to;
  }
  size() { return Math.max(0, this.to - this.from + 1); }
  *values(): IterableIterator<string> {
    for (let y = this.from; y <= this.to; y++) yield pad(y, 4);
  }
}

/** Filters values from a base generator according to position-specific constraints */
export class ConstrainedGenerator implements GeneratorStrategy {
  private cachedValues: string[] | null = null;

  private base: GeneratorStrategy;
  private expectedLength: number;
  private constraints: string[];
  constructor(base: GeneratorStrategy, expectedLength: number, constraints: string[]) {
    this.base = base;
    this.expectedLength = expectedLength;
    this.constraints = constraints;
  }

  private getFilteredValues(): string[] {
    if (this.cachedValues !== null) return this.cachedValues;
    const list: string[] = [];
    for (const val of this.base.values()) {
      let matches = true;
      for (let i = 0; i < this.expectedLength; i++) {
        const constraint = this.constraints[i];
        if (constraint !== undefined && constraint !== '*' && val[i] !== constraint) {
          matches = false;
          break;
        }
      }
      if (matches) {
        list.push(val);
      }
    }
    this.cachedValues = list;
    return list;
  }

  size(): number {
    return this.getFilteredValues().length;
  }

  *values(): IterableIterator<string> {
    yield* this.getFilteredValues();
  }
}

// ─── Cartesian Product Generator (OCP: wraps any list of strategies) ─────────

/**
 * Composes multiple GeneratorStrategy instances and lazily yields every
 * combination in a given worker range without modulo striding or duplicate work.
 */
export class CartesianProductGenerator implements GeneratorStrategy {
  private readonly pools: GeneratorStrategy[];

  constructor(generators: GeneratorStrategy[]) {
    this.pools = generators;
  }

  size(): number {
    return this.pools.reduce((acc, g) => acc * g.size(), 1);
  }

  *values(): IterableIterator<string> {
    yield* this.valuesInRange(0, this.size());
  }

  /**
   * Yields exactly `count` candidates starting at global index `start`,
   * without generating (or discarding) anything outside that range.
   * Direct string accumulation avoids per-iteration array allocations in the hot loop.
   */
  *valuesInRange(start: number, count: number): IterableIterator<string> {
    const pools = this.pools.map(g => [...g.values()]);
    const sizes = pools.map(p => p.length);
    const poolCount = pools.length;

    if (poolCount === 0) {
      if (start === 0 && count > 0) yield '';
      return;
    }

    const indices = unrank(start, sizes);
    for (let n = 0; n < count; n++) {
      let candidate = '';
      for (let p = 0; p < poolCount; p++) {
        candidate += pools[p][indices[p]];
      }
      yield candidate;
      incrementOdometer(indices, sizes);
    }
  }
}

/**
 * Splits `total` candidates into `workerCount` contiguous, back-to-back
 * blocks that partition the space exactly (block sizes differ by at most
 * one). Every candidate belongs to exactly one worker's range.
 */
export function computeWorkerRange(
  total: number,
  workerCount: number,
  workerIndex: number
): { start: number; count: number } {
  const base = Math.floor(total / workerCount);
  const remainder = total % workerCount;
  const start = workerIndex * base + Math.min(workerIndex, remainder);
  const count = base + (workerIndex < remainder ? 1 : 0);
  return { start, count };
}

// ─── Factory: token → GeneratorStrategy (OCP: extend by adding cases) ────────

export function tokenToGenerator(
  token: PatternToken,
  yearRange: YearRange = DEFAULT_YEAR_RANGE
): GeneratorStrategy {
  switch (token.type) {
    case 'UPPER':   return new StaticPoolGenerator(UPPER_CHARS);
    case 'LOWER':   return new StaticPoolGenerator(LOWER_CHARS);
    case 'DIGIT':   return new StaticPoolGenerator(DIGIT_CHARS);
    case 'DAY':     return new StaticPoolGenerator(DAY_STRINGS);
    case 'MONTH':   return new StaticPoolGenerator(MONTH_STRINGS);
    case 'YEAR':    return new YearGenerator(yearRange.from, yearRange.to);
    case 'ANY':     return new StaticPoolGenerator(PRINTABLE_ASCII_CHARS);
    case 'INVALID': throw new Error('Invalid token');
  }
}

/**
 * Builds one ConstrainedGenerator per token, applying the matching slice of
 * `knownChars` to each. Single source of truth for "pattern + known chars
 * + year range → per-token generators" — the worker's range partitioning,
 * the combination-count estimate, and the known-char validator all call
 * this instead of each re-deriving the same position bookkeeping.
 */
export function buildConstrainedGenerators(
  tokens: PatternToken[],
  knownChars: string[],
  yearRange: YearRange = DEFAULT_YEAR_RANGE
): ConstrainedGenerator[] {
  let currentPos = 0;
  return tokens.map(token => {
    const len = getTokenLength(token);
    const tokenConstraints = knownChars.slice(currentPos, currentPos + len);
    currentPos += len;
    return new ConstrainedGenerator(tokenToGenerator(token, yearRange), len, tokenConstraints);
  });
}
