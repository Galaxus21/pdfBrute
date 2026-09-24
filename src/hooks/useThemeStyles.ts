import { useMemo } from 'react';
import { StyleSheet, type StyleDeclaration, type StyleDeclarationValue } from 'aphrodite';
import { useTheme } from '../styles/themeContext';
import type { ThemeTokens } from '../styles/theme';

export type StyleDefinitions = Record<string, Record<string, unknown>>;

/**
 * Custom hook to dynamically generate Aphrodite stylesheets that respond to theme changes.
 * @param getStyles Function that receives the current theme and returns style definitions.
 */
export function useThemeStyles<T extends StyleDefinitions>(
  getStyles: (theme: ThemeTokens) => T
): { [K in keyof T]: StyleDeclarationValue } {
  const { theme } = useTheme();

  // Aphrodite creates classes statically, so we re-create them when the theme object changes.
  return useMemo(
    () => StyleSheet.create(getStyles(theme) as unknown as StyleDeclaration<T>),
    [theme, getStyles]
  );
}
