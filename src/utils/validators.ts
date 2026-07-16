import { parsePattern } from './patterns';

// ─── Pattern Validation ───────────────────────────────────────────────────────

/**
 * Returns null if valid, or an error message string.
 * SRP: only validates — does not parse or generate.
 */
export function validatePattern(pattern: string): string | null {
  if (!pattern || pattern.trim().length === 0) {
    return 'Pattern cannot be empty.';
  }
  if (pattern.length > 32) {
    return 'Pattern is too long (max 32 characters).';
  }
  const tokens = parsePattern(pattern);
  const invalidToken = tokens.find(t => t.type === 'INVALID');
  if (invalidToken) {
    return `Invalid symbol '${invalidToken.literal}'. Use 'DD' for Date, 'MM' for Month, 'YYYY' for Year.`;
  }
  return null;
}

// ─── Combination Count ────────────────────────────────────────────────────────

import { ConstrainedGenerator, CartesianProductGenerator, tokenToGenerator } from './generators';
import { getTokenLength } from './patterns';

/**
 * Calculates the exact number of combinations for a given pattern and constraints.
 * DRY: Uses the exact same generator configuration logic as the worker.
 */
export function estimateCombinations(pattern: string, knownChars: string[]): number {
  const tokens = parsePattern(pattern);
  let currentPos = 0;

  const generators = tokens.map(t => {
    const len = getTokenLength(t);
    const tokenConstraints = knownChars.slice(currentPos, currentPos + len);
    currentPos += len;

    const baseGen = tokenToGenerator(t);
    return new ConstrainedGenerator(baseGen, len, tokenConstraints);
  });

  const composite = new CartesianProductGenerator(generators);
  return composite.size();
}

// ─── Number Formatting ────────────────────────────────────────────────────────

/** Formats a large number as a readable string (e.g. 1,200,000 → "1.2M") */
export function formatCount(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000)     return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)         return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}


