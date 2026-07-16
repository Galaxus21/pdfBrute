/**
 * theme.ts
 * Single source of truth for all design tokens used across the app.
 * Relies entirely on TypeScript objects (no CSS variables).
 */

interface ThemeColors {
  background: string;
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  tintBg: string;
  tintBgHover: string;
  onSurface: string;
  onSurfaceVariant: string;
  primary: string;
  onPrimary: string;
  secondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  error: string;
  errorContainer: string;
  onErrorContainer: string;
  outline: string;
  outlineVariant: string;
}

interface ThemeTypography {
  fontBody: string;
  fontMono: string;
  sizes: {
    labelCaps: string;
    bodySm: string;
    bodyMd: string;
    headlineLgMobile: string;
    headlineLg: string;
    headlineXl: string;
  };
  weights: {
    regular: number;
    medium: number;
    semibold: number;
    bold: number;
  };
}

interface ThemeShape {
  radiusCard: string;
  radiusInput: string;
  radiusButton: string;
  radiusIconBox: string;
  radiusLegend: string;
  radiusStats: string;
}

export interface ThemeSpacing {
  unit: string;
  gutterSm: string;
  gutterMd: string;
  marginMobile: string;
  marginDesktop: string;
}

export interface ThemeTokens {
  mode: 'light' | 'dark';
  colors: ThemeColors;
  typography: ThemeTypography;
  shape: ThemeShape;
  spacing: ThemeSpacing;
}

// ─── Shared Tokens (Independent of Mode) ────────────────────────────────────

export const spacing: ThemeSpacing = {
  unit: '8px',
  gutterSm: '16px',
  gutterMd: '24px',
  marginMobile: '20px',
  marginDesktop: '64px',
};

const shape: ThemeShape = {
  radiusCard: '24px',
  radiusInput: '9999px',
  radiusButton: '9999px',
  radiusIconBox: '9999px',
  radiusLegend: '9999px',
  radiusStats: '16px',
};

const typographyBase = {
  sizes: {
    labelCaps: '12px',
    bodySm: '14px',
    bodyMd: '16px',
    headlineLgMobile: '28px',
    headlineLg: '32px',
    headlineXl: '48px',
  },
  weights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  }
};

// ─── Light Theme ────────────────────────────────────────────────────────────

export const lightTheme: ThemeTokens = {
  mode: 'light',
  colors: {
    background: '#ffffff',
    surfaceContainerLowest: '#ffffff',
    surfaceContainerLow: '#f3f3f4',
    surfaceContainer: '#eeeeee',
    surfaceContainerHigh: '#e8e8e8',
    onSurface: '#10232A',
    onSurfaceVariant: '#42474e',
    primary: '#b58863',
    onPrimary: '#ffffff',
    secondary: '#3d4d55',
    secondaryContainer: '#c0d1d9',
    onSecondaryContainer: '#132128',
    error: '#ba1a1a',
    errorContainer: '#ffdad6',
    onErrorContainer: '#410002',
    outline: '#d3c3b9',
    outlineVariant: '#d3c3b9',
    tintBg: 'rgba(211, 195, 185, 0.2)',
    tintBgHover: 'rgba(211, 195, 185, 0.4)',
  },
  typography: {
    fontBody: "'Plus Jakarta Sans', sans-serif",
    fontMono: "'JetBrains Mono', monospace",
    ...typographyBase,
  },
  shape,
  spacing,
};

// ─── Dark Theme ─────────────────────────────────────────────────────────────

export const darkTheme: ThemeTokens = {
  mode: 'dark',
  colors: {
    background: '#131313',
    surfaceContainerLowest: '#0e0e0e',
    surfaceContainerLow: '#1c1b1b',
    surfaceContainer: '#201f1f',
    surfaceContainerHigh: '#2a2a2a',
    onSurface: '#e5e2e1',
    onSurfaceVariant: '#c2c7ca',
    primary: '#b6cad3',
    onPrimary: '#20333a',
    secondary: '#efbc94',
    secondaryContainer: '#623f20',
    onSecondaryContainer: '#dcab84',
    error: '#ffb4ab',
    errorContainer: '#93000a',
    onErrorContainer: '#ffdad6',
    outline: '#8c9194',
    outlineVariant: '#42484a',
    tintBg: '#0e0e0e', // surfaceContainerLowest
    tintBgHover: '#1c1b1b', // surfaceContainerLow
  },
  typography: {
    fontBody: "'Manrope', sans-serif",
    fontMono: "'JetBrains Mono', monospace",
    ...typographyBase,
  },
  shape,
  spacing,
};

// ─── Component Specific Helpers ─────────────────────────────────────────────

export const getTokenColors = (theme: ThemeTokens) => ({
  upper: theme.colors.primary,       
  lower: theme.colors.primary,       
  digit: theme.colors.onSurface,     
  day: theme.colors.onSurface,       
  month: theme.colors.onSurface,     
  year: theme.colors.onSurface,      
  any: theme.colors.error,           
});

export const getStatusColors = (theme: ThemeTokens) => ({
  found: {
    text: theme.colors.primary, 
    bg: `color-mix(in srgb, ${theme.colors.primary} 20%, transparent)`,
    border: `color-mix(in srgb, ${theme.colors.primary} 30%, transparent)`,
  },
  error: {
    text: theme.colors.error,
    bg: `color-mix(in srgb, ${theme.colors.errorContainer} 20%, transparent)`,
    border: `color-mix(in srgb, ${theme.colors.error} 33%, transparent)`,
  }
});

// ─── Shared Component Styles ────────────────────────────────────────────────

export const getCardStyle = (theme: ThemeTokens) => ({
  backgroundColor: theme.colors.tintBg,
  borderRadius: theme.shape.radiusCard,
  border: `1px solid ${theme.colors.outlineVariant}`,
  padding: theme.spacing.gutterSm,
  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  display: 'flex',
  flexDirection: 'column' as const,
});

export const getLabelCapsStyle = (theme: ThemeTokens) => ({
  fontFamily: theme.typography.fontMono,
  fontSize: theme.typography.sizes.labelCaps,
  color: theme.colors.onSurfaceVariant,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.1em',
  fontWeight: theme.typography.weights.bold,
});

export const getIconBoxStyle = (theme: ThemeTokens) => ({
  backgroundColor: theme.colors.surfaceContainerLowest,
  borderRadius: theme.shape.radiusIconBox,
  padding: theme.spacing.unit,
  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});
