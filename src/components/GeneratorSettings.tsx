/**
 * GeneratorSettings.tsx
 * SRP: Handles known-info positional character overrides using simple inputs.
 */
import React from 'react';
import { css } from 'aphrodite';
import type { PatternConfig } from '../types';
import { useTheme } from '../styles/themeContext';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { type ThemeTokens, getCardStyle } from '../styles/theme';
import { utils } from '../styles/utilities';

interface GeneratorSettingsProps {
  config: PatternConfig;
  onChange: (updates: Partial<PatternConfig>) => void;
  disabled?: boolean;
}

export const GeneratorSettings: React.FC<GeneratorSettingsProps> = ({
  config,
  onChange,
  disabled,
}) => {
  const { passwordLength, knownChars } = config;
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  const { theme } = useTheme();
  const styles = useThemeStyles(getStyles);

  return (
    <div className={css(styles.wrapper)} style={{ marginTop: '20px' }}>
      <label className={css(styles.label)}>Known Letters/Digits, Leave empty if unknown (Optional)</label>

      {passwordLength === 0 ? (
        <span style={{ color: theme.colors.onSurfaceVariant, fontSize: 13, fontStyle: 'italic', fontFamily: theme.typography.fontMono }}>
          Type a pattern above to generate character boxes...
        </span>
      ) : (
        <div className={css(styles.scrollContainer)}>
          <div className={css(utils.flexRow, styles.boxesContainer)}>
            {Array.from({ length: passwordLength }).map((_, i) => (
              <input
                key={i}
                ref={el => { inputRefs.current[i] = el; }}
                value={knownChars[i] !== '*' ? knownChars[i] : ''}
                onChange={e => {
                  const val = e.target.value;
                  const char = val[val.length - 1]; // take the last typed character
                  const updated = [...knownChars];
                  updated[i] = char && char.trim() ? char : '*';
                  onChange({ knownChars: updated });

                  // Auto-focus next input
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
              />
            ))}
          </div>
        </div>
      )}
      {passwordLength > 0 && (
        <p className={css(styles.helperText)} style={{ marginTop: '8px', lineHeight: 1.5 }}>
          <strong>Example:</strong> Type any characters you are absolutely certain about into their exact positions (e.g., if you know the 3rd character is <strong>A</strong>, type <strong>A</strong> into the 3rd box). Leave all unknown positions empty.
        </p>
      )}
    </div>
  );
};

const getStyles = (theme: ThemeTokens) => ({
  wrapper: {
    ...getCardStyle(theme),
    gap: theme.spacing.unit,
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
  scrollContainer: {
    overflowX: 'auto',
    paddingBottom: '8px',
    // hide scrollbar cross-browser
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
    '::-webkit-scrollbar': {
      display: 'none',
    },
  },
  boxesContainer: {
    gap: '8px', // gap-2
  },
  inputBox: {
    width: '48px', // w-12
    height: '48px', // h-12
    backgroundColor: theme.colors.surfaceContainerLowest,
    border: `1px solid ${theme.colors.outlineVariant}`,
    textAlign: 'center',
    color: theme.colors.onSurface,
    fontFamily: theme.typography.fontMono,
    fontSize: theme.typography.sizes.bodyMd,
    borderRadius: theme.shape.radiusIconBox, // rounded-full (screen2) vs rounded-xl (screen1)
    transition: 'all 0.2s',
    outline: 'none',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', // shadow-sm
    ':focus': {
      borderColor: theme.colors.primary,
      boxShadow: `0 0 0 1px ${theme.colors.primary}`, // ring-1 ring-primary
    },
    ':disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
});
