import type { PatternToken } from '../types';

/**
 * Parses a pattern string into an array of PatternToken.
 * Supports multi-character tokens (YYYY, MM, DD) and flags isolated D, M, Y as INVALID.
 */
export function parsePattern(pattern: string): PatternToken[] {
  const tokens: PatternToken[] = [];
  let i = 0;
  while (i < pattern.length) {
    if (pattern.startsWith('YYYY', i)) {
      tokens.push({ type: 'YEAR' });
      i += 4;
    } else if (pattern.startsWith('MM', i)) {
      tokens.push({ type: 'MONTH' });
      i += 2;
    } else if (pattern.startsWith('DD', i)) {
      tokens.push({ type: 'DAY' });
      i += 2;
    } else {
      const char = pattern[i];
      switch (char) {
        case 'L': tokens.push({ type: 'UPPER' }); i++; break;
        case 'l': tokens.push({ type: 'LOWER' }); i++; break;
        case 'd': tokens.push({ type: 'DIGIT' }); i++; break;
        case '?': tokens.push({ type: 'ANY' }); i++; break;
        default:
          tokens.push({ type: 'INVALID', literal: char });
          i++;
      }
    }
  }
  return tokens;
}


/**
 * Returns the output string length of a pattern token.
 */
export function getTokenLength(token: PatternToken): number {
  switch (token.type) {
    case 'UPPER':
    case 'LOWER':
    case 'DIGIT':
    case 'ANY':
      return 1;
    case 'DAY':
    case 'MONTH':
      return 2;
    case 'YEAR':
      return 4;
    default:
      return 0;
  }
}

/**
 * Returns the total output string length of a pattern.
 */
export function getPatternLength(pattern: string): number {
  const tokens = parsePattern(pattern);
  return tokens.reduce((sum, t) => sum + getTokenLength(t), 0);
}

/**
 * Returns a preview of what a pattern will generate.
 * e.g. "LLddmm" → "AB0101" (first candidate example).
 */
export function patternPreview(pattern: string): string {
  const tokens = parsePattern(pattern);
  return tokens
    .map(t => {
      switch (t.type) {
        case 'UPPER': return 'A';
        case 'LOWER': return 'a';
        case 'DIGIT': return '0';
        case 'DAY': return '01';
        case 'MONTH': return '01';
        case 'YEAR': return '2000';
        case 'ANY': return '*';
        default: return '';
      }
    })
    .join('');
}

