/**
 * PatternBuilder.tsx
 * SRP: Handles pattern input, preview, and symbol legend display only.
 */
import React, { useMemo } from 'react';
import { Tooltip } from 'antd';
import { css } from 'aphrodite';
import { patternPreview } from '../utils/patterns';
import { type ThemeTokens, getTokenColors, getLabelCapsStyle } from '../styles/theme';
import { useTheme } from '../styles/themeContext';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { utils, mobileView } from '../styles/utilities';

interface PatternBuilderProps {
  value: string;
  onChange: (pattern: string) => void;
  disabled?: boolean;
}

const QUICK_EXAMPLES = [
  { label: 'Name + Date', pattern: 'LLLLDDMM', desc: 'e.g. JOHN1508' },
  { label: 'Phone/Account', pattern: 'dddddddddd', desc: '10 digits' },
  { label: 'Name + Year', pattern: 'LLLLYYYY', desc: 'e.g. JOHN1990' },
  { label: 'Custom Mix', pattern: 'LL??dd', desc: 'e.g. AB!@12' },
];

export const PatternBuilder: React.FC<PatternBuilderProps> = ({
  value,
  onChange,
  disabled,
}) => {
  const { theme } = useTheme();
  const styles = useThemeStyles(getStyles);
  const preview = value ? patternPreview(value) : '—';

  const symbolLegend = useMemo(() => {
    const tokenColors = getTokenColors(theme);
    return [
      { symbol: 'L', meaning: 'Uppercase (A-Z)', color: tokenColors.upper, example: 'e.g. A, B, … Z' },
      { symbol: 'l', meaning: 'Lowercase (a-z)', color: tokenColors.lower, example: 'e.g. a, b, … z' },
      { symbol: 'd', meaning: 'Digit (0-9)', color: tokenColors.digit, example: 'e.g. 0, 1, … 9' },
      { symbol: 'DD', meaning: 'Day (01-31)', color: tokenColors.day, example: 'e.g. 01, 15, 31' },
      { symbol: 'MM', meaning: 'Month (01-12)', color: tokenColors.month, example: 'e.g. 01, 06, 12' },
      { symbol: 'YYYY', meaning: 'Year', color: tokenColors.year, example: 'e.g. 1990, 2005, 2024\n(Range: 1900-2100)' },
      { symbol: '?', meaning: 'Special Char', color: tokenColors.any, example: 'e.g. !, @, A, 3, … (all printable)' },
    ];
  }, [theme]);

  return (
    <div className={css(utils.flexColumn, styles.wrapper)}>
      {/* Input */}
      <div className={css(utils.flexColumn, styles.inputGroup)}>
        <label htmlFor="pattern-input" className={css(styles.label)}>Pattern Mask</label>
        <p className={css(styles.helperText)}>
          Construct a mask that matches your likely password format using the symbols below.
        </p>
        <input
          id="pattern-input"
          type="text"
          autoComplete="off"
          spellCheck="false"
          placeholder="e.g. LLLLDDMM or ?????YYYY"
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          className={css(styles.input)}
        />
      </div>

      {/* Quick Examples */}
      <div className={css(utils.flexRow, utils.alignItemsCenter, utils.flexWrap, styles.examplesWrapper)}>
        <span className={css(styles.examplesLabel)}>Quick Start:</span>
        <div className={css(utils.flexRow, utils.flexWrap, styles.examplesList)}>
          {QUICK_EXAMPLES.map((ex) => (
            <Tooltip key={ex.pattern} title={ex.desc} placement="top">
              <button
                type="button"
                className={css(styles.exampleBtn)}
                onClick={() => onChange(ex.pattern)}
                disabled={disabled}
              >
                {ex.label}
              </button>
            </Tooltip>
          ))}
        </div>
      </div>



      {/* Legend */}
      <div className={css(utils.flexRow, utils.alignItemsCenter, utils.flexWrap, styles.legend)}>
        <span className={css(styles.legendLabel)}>SYMBOL REFERENCE:</span>
        {symbolLegend.map(({ symbol, meaning, color, example }) => (
          <Tooltip
            key={symbol}
            title={<span style={{ whiteSpace: 'pre-line' }}>{example}</span>}
            placement="top"
          >
            <div className={css(utils.flexRow, utils.alignItemsCenter, styles.legendItem)}>
              <span className={css(styles.legendSymbol)} style={{ color }}>{symbol}</span>
              {': '}{meaning}
            </div>
          </Tooltip>
        ))}
      </div>

      {/* Live Preview */}
      {value && (
        <div className={css(utils.flexRow, utils.alignItemsCenter, utils.justifySpaceBetween, styles.preview)}>
          <span className={css(styles.previewLabel)}>Live Preview:</span>
          <span className={css(styles.previewCode)}>
            {preview}
          </span>
        </div>
      )}
    </div>
  );
};

const getStyles = (theme: ThemeTokens) => ({
  wrapper: {
    width: '100%',
    gap: theme.spacing.gutterSm,
  },
  examplesWrapper: {
    gap: '12px',
    marginBottom: '4px',
  },
  examplesLabel: {
    fontFamily: theme.typography.fontMono,
    fontSize: theme.typography.sizes.labelCaps,
    color: theme.colors.onSurfaceVariant,
    fontWeight: theme.typography.weights.semibold,
    textTransform: 'uppercase',
  },
  examplesList: {
    gap: '8px',
  },
  exampleBtn: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    border: `1px solid ${theme.colors.outlineVariant}`,
    color: theme.colors.primary,
    fontFamily: theme.typography.fontMono,
    fontSize: '12px',
    padding: '4px 10px',
    borderRadius: theme.shape.radiusButton,
    cursor: 'pointer',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: theme.colors.surfaceContainerLow,
      borderColor: theme.colors.primary,
    },
    ':disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
  inputGroup: {
    gap: '4px',
  },
  label: {
    ...getLabelCapsStyle(theme),
    color: theme.colors.onSurface,
  },
  helperText: {
    fontFamily: theme.typography.fontBody,
    fontSize: '13px',
    color: theme.colors.onSurfaceVariant,
    marginBottom: '4px',
  },
  input: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    border: `1px solid ${theme.colors.outline}`,
    color: theme.colors.onSurface,
    fontFamily: theme.typography.fontMono,
    fontSize: theme.typography.sizes.bodyMd,
    borderRadius: theme.shape.radiusInput, // rounded-full
    padding: `${theme.spacing.gutterSm} 24px`, // px-6
    width: '100%',
    transition: 'all 0.2s',
    outline: 'none',
    [mobileView]: {
      padding: '12px 16px',
    },
    ':focus': {
      borderColor: theme.colors.primary,
      boxShadow: `0 0 0 1px ${theme.colors.primary}`, // ring-1 ring-primary
    },
    ':disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
  legend: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.shape.radiusCard, // rounded-3xl
    padding: theme.spacing.unit,
    border: `1px solid ${theme.colors.outlineVariant}`,
    gap: '4px',
  },
  legendLabel: {
    fontFamily: theme.typography.fontMono,
    fontSize: '11px',
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.onSurfaceVariant,
    width: '100%',
    marginBottom: '8px',
    marginLeft: '4px',
  },
  legendItem: {
    gap: '4px',
    backgroundColor: theme.colors.surfaceContainerLow,
    border: `1px solid ${theme.colors.outlineVariant}`,
    padding: '6px 12px', // py-1.5 px-3
    borderRadius: theme.shape.radiusLegend, // rounded-full inside
    fontSize: '12px',
    fontFamily: theme.typography.fontMono,
    color: theme.colors.onSurface,
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', // shadow-sm
    cursor: 'help',
  },
  legendSymbol: {
    fontWeight: theme.typography.weights.bold,
  },
  preview: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.shape.radiusInput, // rounded-full
    border: `1px solid ${theme.colors.outlineVariant}`,
    padding: `${theme.spacing.gutterSm} 24px`, // px-6
    [mobileView]: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: '8px',
      padding: '12px 16px',
    },
  },
  previewLabel: {
    ...getLabelCapsStyle(theme),
    color: theme.colors.onSurface,
  },
  previewCode: {
    fontFamily: theme.typography.fontMono,
    fontSize: theme.typography.sizes.bodyMd,
    color: theme.colors.primary,
    letterSpacing: '0.1em', // tracking-widest
    fontWeight: theme.typography.weights.bold,
    wordBreak: 'break-all',
    maxWidth: '100%',
  },
});
