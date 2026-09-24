/**
 * Determines whether a pattern + known-character + year-range
 * configuration produces a usable search space, and explains why when it doesn't.
 */
import type { PatternToken, YearRange } from '../types';
import { parsePattern, getTokenLength } from './patterns';
import {
  buildConstrainedGenerators,
  DEFAULT_YEAR_RANGE,
} from './generators';

// A JS `number` loses integer precision above this value, so a combination
// count (and the worker's range-partition math built on it) can no longer
// be trusted past it — see Number.MAX_SAFE_INTEGER.
export const MAX_FEASIBLE_COMBINATIONS = Number.MAX_SAFE_INTEGER;

const TOKEN_LABELS: Readonly<Record<PatternToken['type'], string>> = {
  UPPER: 'an uppercase letter (L)',
  LOWER: 'a lowercase letter (l)',
  DIGIT: 'a digit (d)',
  DAY: 'a day (DD)',
  MONTH: 'a month (MM)',
  YEAR: 'a year (YYYY)',
  ANY: 'a printable-ASCII character (?)',
  INVALID: 'this slot',
};

/**
 * Calculates the exact number of combinations for a given pattern, known
 * characters, and year range. Single source of truth.
 */
export function estimateCombinations(
  pattern: string,
  knownChars: string[],
  yearRange: YearRange = DEFAULT_YEAR_RANGE
): number {
  const tokens = parsePattern(pattern);
  const generators = buildConstrainedGenerators(tokens, knownChars, yearRange);
  return generators.reduce((acc, g) => acc * g.size(), 1);
}

/**
 * Finds the first pinned position that cannot be produced by its token
 * type (e.g. a letter pinned into a digit slot, or a day pin like "9_"
 * that no valid day starts with), so the UI can name the exact position
 * instead of just reporting the resulting search space as empty.
 */
export function findIncompatibleKnownChar(
  pattern: string,
  knownChars: string[],
  yearRange: YearRange = DEFAULT_YEAR_RANGE
): string | null {
  const tokens = parsePattern(pattern);
  const generators = buildConstrainedGenerators(tokens, knownChars, yearRange);

  let currentPos = 0;
  for (let i = 0; i < tokens.length; i++) {
    const len = getTokenLength(tokens[i]);
    if (generators[i].size() === 0) {
      return describeIncompatiblePin(tokens[i].type, knownChars, currentPos, len);
    }
    currentPos += len;
  }
  return null;
}

function describeIncompatiblePin(
  tokenType: PatternToken['type'],
  knownChars: string[],
  startPos: number,
  len: number
): string {
  const pinnedPositions = knownChars
    .slice(startPos, startPos + len)
    .map((char, offset) => (char && char !== '*' ? startPos + offset + 1 : null))
    .filter((position): position is number => position !== null);

  const label = TOKEN_LABELS[tokenType] ?? 'this slot';
  const positionWord = pinnedPositions.length > 1 ? 'Positions' : 'Position';
  return `${positionWord} ${pinnedPositions.join(', ')}: the pinned character can't match ${label}.`;
}

/**
 * Gates the "Start" action: returns the combination count plus a blocking
 * error when the space is empty (an impossible pin) or too large to
 * represent/search reliably (see MAX_FEASIBLE_COMBINATIONS).
 */
export function getCombinationsFeasibility(
  pattern: string,
  knownChars: string[],
  yearRange: YearRange = DEFAULT_YEAR_RANGE
): { count: number; error: string | null } {
  const tokens = parsePattern(pattern);

  if (yearRange.from > yearRange.to && tokens.some(t => t.type === 'YEAR')) {
    return {
      count: 0,
      error: `Year range is inverted (${yearRange.from}–${yearRange.to}). Set "from" ≤ "to".`,
    };
  }

  const generators = buildConstrainedGenerators(tokens, knownChars, yearRange);
  const count = generators.reduce((acc, g) => acc * g.size(), 1);

  if (count === 0) {
    let currentPos = 0;
    let reason: string | null = null;
    for (let i = 0; i < tokens.length; i++) {
      const len = getTokenLength(tokens[i]);
      if (generators[i].size() === 0) {
        reason = describeIncompatiblePin(tokens[i].type, knownChars, currentPos, len);
        break;
      }
      currentPos += len;
    }
    return {
      count: 0,
      error: reason ?? 'No password can match this pattern with the pinned characters given.',
    };
  }

  if (count > MAX_FEASIBLE_COMBINATIONS) {
    return {
      count,
      error: 'This search space is too large to brute-force in a browser. Narrow the pattern or pin more characters.',
    };
  }

  return { count, error: null };
}
