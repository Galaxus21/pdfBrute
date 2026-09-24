import { parsePattern } from './patterns';

/**
 * Validates pattern syntax. Returns null if valid, or an error message string.
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

