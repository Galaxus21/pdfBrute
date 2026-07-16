import type { GeneratorStrategy, PatternToken } from '../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Zero-pad a number to a fixed width. DRY: used by Day, Month, Year generators */
function pad(n: number, width: number): string {
  return String(n).padStart(width, '0');
}

/** Produce all strings from cartesian product of per-position iterables. OCP/SRP. */
function* cartesianProduct(pools: string[][]): IterableIterator<string> {
  if (pools.length === 0) { yield ''; return; }
  const [first, ...rest] = pools;
  for (const tail of cartesianProduct(rest)) {
    for (const head of first) {
      yield head + tail;
    }
  }
}

// ─── Concrete Generators (SRP: one responsibility each) ───────────────────────

/** Yields A-Z */
class UpperLetterGenerator implements GeneratorStrategy {
  private readonly chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  size() { return 26; }
  *values(): IterableIterator<string> { yield* this.chars; }
}

/** Yields a-z */
class LowerLetterGenerator implements GeneratorStrategy {
  private readonly chars = 'abcdefghijklmnopqrstuvwxyz'.split('');
  size() { return 26; }
  *values(): IterableIterator<string> { yield* this.chars; }
}

/** Yields 0-9 */
class DigitGenerator implements GeneratorStrategy {
  size() { return 10; }
  *values(): IterableIterator<string> {
    for (let i = 0; i <= 9; i++) yield String(i);
  }
}

/** Yields 01-31 (all, not calendar-validated — validator handles that) */
class DayGenerator implements GeneratorStrategy {
  size() { return 31; }
  *values(): IterableIterator<string> {
    for (let i = 1; i <= 31; i++) yield pad(i, 2);
  }
}

/** Yields 01-12 */
class MonthGenerator implements GeneratorStrategy {
  size() { return 12; }
  *values(): IterableIterator<string> {
    for (let i = 1; i <= 12; i++) yield pad(i, 2);
  }
}

/** Yields years in range (inclusive) */
class YearGenerator implements GeneratorStrategy {
  private from: number;
  private to: number;
  constructor(from: number, to: number) { this.from = from; this.to = to; }
  size() { return Math.max(0, this.to - this.from + 1); }
  *values(): IterableIterator<string> {
    for (let y = this.from; y <= this.to; y++) yield pad(y, 4);
  }
}

/** Yields any printable ASCII character (32-126) */
class AnyCharGenerator implements GeneratorStrategy {
  private readonly chars: string[];
  constructor() {
    this.chars = Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i));
  }
  size() { return 95; }
  *values(): IterableIterator<string> { yield* this.chars; }
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
 * combination. Memory-efficient: produces one candidate at a time.
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
    const pools = this.pools.map(g => [...g.values()]);
    yield* cartesianProduct(pools);
  }
}

// ─── Factory: token → GeneratorStrategy (OCP: extend by adding cases) ────────

export function tokenToGenerator(
  token: PatternToken
): GeneratorStrategy {
  switch (token.type) {
    case 'UPPER':   return new UpperLetterGenerator();
    case 'LOWER':   return new LowerLetterGenerator();
    case 'DIGIT':   return new DigitGenerator();
    case 'DAY':     return new DayGenerator();
    case 'MONTH':   return new MonthGenerator();
    case 'YEAR':    return new YearGenerator(1900, 2100);
    case 'ANY':     return new AnyCharGenerator();
    case 'INVALID': throw new Error('Invalid token');
  }
}
