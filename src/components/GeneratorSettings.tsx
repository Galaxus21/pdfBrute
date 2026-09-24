import React, { useState, useMemo } from 'react';
import { css } from 'aphrodite';
import type { PatternConfig } from '../types';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { type ThemeTokens, getCardStyle, getDisabledStyle } from '../styles/theme';
import { utils } from '../styles/utilities';
import { parsePattern } from '../utils/patterns';

// A YYYY token always renders as 4 digits, so bound inputs to that range.
const MIN_YEAR = 0;
const MAX_YEAR = 9999;

interface GeneratorSettingsProps {
  config: PatternConfig;
  onChange: (updates: Partial<PatternConfig>) => void;
  disabled?: boolean;
}

function clampYear(rawValue: string, fallback: number): number {
  if (rawValue === '') return 0;
  const parsed = Number.parseInt(rawValue, 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(MAX_YEAR, Math.max(MIN_YEAR, parsed));
}

export const GeneratorSettings: React.FC<GeneratorSettingsProps> = ({
  config,
  onChange,
  disabled,
}) => {
  const { passwordLength, knownChars, yearRange } = config;
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  const styles = useThemeStyles(getStyles);

  const hasYearToken = useMemo(
    () => parsePattern(config.pattern).some(t => t.type === 'YEAR'),
    [config.pattern]
  );

  if (passwordLength === 0) return null;

  return (
    <div className={css(styles.wrapper)} style={{ marginTop: '12px' }}>
      {/* Advanced Options Toggle */}
      <button
        type="button"
        className={css(utils.flexRow, utils.alignItemsCenter, styles.toggleBtn)}
        onClick={() => setIsExpanded(prev => !prev)}
        disabled={disabled}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 16, transition: 'transform 0.2s', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
          chevron_right
        </span>
        <span>Advanced: Known Characters</span>
        <span className={css(styles.optionalBadge)}>optional</span>
      </button>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className={css(styles.content)}>
          <label className={css(styles.label)}>Pin any characters you already know</label>
          <p className={css(styles.helperText)}>
            Type a character into a box if you know exactly what's in that position. Leave blank if unsure.
          </p>

          <div className={css(styles.scrollContainer)}>
            <div className={css(utils.flexRow, styles.boxesContainer)}>
              {Array.from({ length: passwordLength }).map((_, i) => (
                <input
                  key={i}
                  ref={el => { inputRefs.current[i] = el; }}
                  value={knownChars[i] !== '*' ? knownChars[i] : ''}
                  onChange={e => {
                    const val = e.target.value;
                    const char = val[val.length - 1];
                    const updated = [...knownChars];
                    updated[i] = char && char.trim() ? char : '*';
                    onChange({ knownChars: updated });

                    if (char && char.trim() && i < passwordLength - 1) {
                      inputRefs.current[i + 1]?.focus();
                    }
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Backspace' && knownChars[i] === '*' && i > 0) {
                      inputRefs.current[i - 1]?.focus();
                    }
                  }}
                  disabled={disabled}
                  maxLength={2}
                  className={css(styles.inputBox)}
                  placeholder={`${i + 1}`}
                />
              ))}
            </div>
          </div>

          <p className={css(styles.exampleText)}>
            <strong>Example:</strong> If you know the 3rd character is <strong>A</strong>, type <strong>A</strong> into box 3.
          </p>

          {hasYearToken && (
            <div className={css(styles.yearSection)}>
              <label className={css(styles.label)}>YYYY year range</label>
              <p className={css(styles.helperText)}>
                Narrow the years YYYY will try. Defaults to 1900–2100.
              </p>
              <div className={css(utils.flexRow, utils.alignItemsCenter, styles.yearRow)}>
                <input
                  type="number"
                  inputMode="numeric"
                  value={yearRange.from === 0 ? '' : yearRange.from}
                  onChange={e => onChange({ yearRange: { ...yearRange, from: clampYear(e.target.value, yearRange.from) } })}
                  onBlur={() => {
                    if (yearRange.from === 0) {
                      onChange({ yearRange: { ...yearRange, from: 1900 } });
                    }
                  }}
                  disabled={disabled}
                  min={MIN_YEAR}
                  max={MAX_YEAR}
                  className={css(styles.yearInput)}
                  aria-label="Year range start"
                />
                <span className={css(styles.yearSeparator)}>to</span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={yearRange.to === 0 ? '' : yearRange.to}
                  onChange={e => onChange({ yearRange: { ...yearRange, to: clampYear(e.target.value, yearRange.to) } })}
                  onBlur={() => {
                    if (yearRange.to === 0) {
                      onChange({ yearRange: { ...yearRange, to: 2100 } });
                    }
                  }}
                  disabled={disabled}
                  min={MIN_YEAR}
                  max={MAX_YEAR}
                  className={css(styles.yearInput)}
                  aria-label="Year range end"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const getStyles = (theme: ThemeTokens) => ({
  wrapper: {
    ...getCardStyle(theme),
    gap: theme.spacing.unit,
    padding: '0',
    overflow: 'hidden',
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left' as const,
    gap: '6px',
    fontFamily: theme.typography.fontMono,
    fontSize: theme.typography.sizes.labelCaps,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.onSurface,
    padding: theme.spacing.gutterSm,
    borderRadius: theme.shape.radiusCard,
    transition: 'background 0.15s',
    ':hover': {
      backgroundColor: theme.colors.surfaceContainerLow,
    },
    ...getDisabledStyle(),
  },
  optionalBadge: {
    fontFamily: theme.typography.fontMono,
    fontSize: '10px',
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.primary,
    backgroundColor: `color-mix(in srgb, ${theme.colors.primary} 15%, transparent)`,
    borderRadius: '9999px',
    padding: '2px 8px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  content: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: theme.spacing.unit,
    padding: `0 ${theme.spacing.gutterSm} ${theme.spacing.gutterSm}`,
    borderTop: `1px solid ${theme.colors.outlineVariant}`,
    paddingTop: theme.spacing.gutterSm,
  },
  label: {
    fontFamily: theme.typography.fontMono,
    fontSize: theme.typography.sizes.labelCaps,
    color: theme.colors.onSurface,
  },
  helperText: {
    fontFamily: theme.typography.fontBody,
    fontSize: '13px',
    color: theme.colors.onSurfaceVariant,
    margin: '0 0 4px 0',
  },
  exampleText: {
    fontFamily: theme.typography.fontBody,
    fontSize: '13px',
    color: theme.colors.onSurfaceVariant,
    marginTop: '8px',
    lineHeight: 1.5,
  },
  scrollContainer: {
    overflowX: 'auto',
    paddingBottom: '8px',
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
    '::-webkit-scrollbar': {
      display: 'none',
    },
  },
  boxesContainer: {
    gap: '8px',
  },
  inputBox: {
    width: '48px',
    height: '48px',
    backgroundColor: theme.colors.surfaceContainerLowest,
    border: `1px solid ${theme.colors.outlineVariant}`,
    textAlign: 'center' as const,
    color: theme.colors.onSurface,
    fontFamily: theme.typography.fontMono,
    fontSize: theme.typography.sizes.bodyMd,
    borderRadius: theme.shape.radiusIconBox,
    transition: 'all 0.2s',
    outline: 'none',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    ':focus': {
      borderColor: theme.colors.primary,
      boxShadow: `0 0 0 1px ${theme.colors.primary}`,
    },
    ...getDisabledStyle(),
  },
  yearSection: {
    marginTop: theme.spacing.gutterSm,
    paddingTop: theme.spacing.gutterSm,
    borderTop: `1px solid ${theme.colors.outlineVariant}`,
  },
  yearRow: {
    gap: '10px',
    marginTop: '4px',
  },
  yearSeparator: {
    fontFamily: theme.typography.fontMono,
    fontSize: '13px',
    color: theme.colors.onSurfaceVariant,
  },
  yearInput: {
    width: '84px',
    height: '40px',
    backgroundColor: theme.colors.surfaceContainerLowest,
    border: `1px solid ${theme.colors.outlineVariant}`,
    textAlign: 'center' as const,
    color: theme.colors.onSurface,
    fontFamily: theme.typography.fontMono,
    fontSize: theme.typography.sizes.bodyMd,
    borderRadius: theme.shape.radiusIconBox,
    transition: 'all 0.2s',
    outline: 'none',
    ':focus': {
      borderColor: theme.colors.primary,
      boxShadow: `0 0 0 1px ${theme.colors.primary}`,
    },
    ...getDisabledStyle(),
  },
});
