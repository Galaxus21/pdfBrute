import { useMemo } from 'react';
import { StyleSheet } from 'aphrodite';
import { useTheme } from '../styles/themeContext';
import type { ThemeTokens } from '../styles/theme';

/**
 * Custom hook to dynamically generate Aphrodite stylesheets that respond to theme changes.
 * @param getStyles Function that receives the current theme and returns style definitions.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useThemeStyles<T extends { [key: string]: any }>(
  getStyles: (theme: ThemeTokens) => T
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): { [K in keyof T]: any } {
  const { theme } = useTheme();
  
  // Aphrodite creates classes statically, so we re-create them when the theme object changes.
  return useMemo(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    () => StyleSheet.create(getStyles(theme)) as any, 
    [theme, getStyles]
  );
}
