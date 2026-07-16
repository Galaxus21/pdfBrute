/**
 * ResultCard.tsx
 * SRP: Renders the final outcome of the recovery attempt.
 */
import React, { useState } from 'react';
import { css } from 'aphrodite';
import { type ThemeTokens, getStatusColors, getCardStyle, getIconBoxStyle, getLabelCapsStyle } from '../styles/theme';
import { useTheme } from '../styles/themeContext';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { utils, mobileView } from '../styles/utilities';
import type { RecoveryState } from '../types';
import { formatCount } from '../utils/validators';

interface ResultCardProps {
  state: RecoveryState;
}

export const ResultCard: React.FC<ResultCardProps> = ({ state }) => {
  const { theme } = useTheme();
  const styles = useThemeStyles(getStyles);

  const { status, foundPassword, errorMessage, tested, elapsedMs } = state;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (foundPassword) {
      navigator.clipboard.writeText(foundPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (status !== 'found' && status !== 'exhausted' && status !== 'error') {
    return null;
  }

  const isFound = status === 'found';
  const isError = status === 'error';

  const statusColors = getStatusColors(theme);

  // Map status to semantic colors
  const statusTheme = isFound
    ? statusColors.found
    : statusColors.error;

  const title = isFound
    ? 'Password Found!'
    : isError
      ? 'Error'
      : 'Search Exhausted';

  const iconName = isFound
    ? 'check_circle'
    : isError
      ? 'error'
      : 'cancel';

  return (
    <section className={css(utils.flexColumn, styles.wrapper)} style={{ borderColor: statusTheme.border }}>
      <div className={css(utils.flexRow, utils.alignItemsCenter, styles.header)}>
        <div className={css(styles.iconBox)} style={{ backgroundColor: statusTheme.bg }}>
          <span className="material-symbols-outlined" style={{ color: statusTheme.text, fontSize: '30px', fontVariationSettings: "'FILL' 1" }}>
            {iconName}
          </span>
        </div>
        <h2 className={css(styles.title)}>{title}</h2>
      </div>

      <div className={css(utils.flexColumn, utils.alignItemsCenter, utils.justifyCenter, styles.contentContainer)} style={{ borderColor: statusTheme.border }}>
        {isFound ? (
          <>
            <div className={css(styles.label)} style={{ color: statusTheme.text }}>Decryption Key:</div>
            <div className={css(styles.passwordBox)} style={{ color: statusTheme.text, borderColor: statusTheme.border }}>
              {foundPassword}
            </div>
            <button className={css(utils.flexRow, utils.alignItemsCenter, styles.copyBtn)} onClick={handleCopy}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                {copied ? 'check' : 'content_copy'}
              </span>
              {copied ? 'COPIED!' : 'COPY'}
            </button>
          </>
        ) : (
          <div style={{ padding: theme.spacing.gutterMd, textAlign: 'center' }}>
            <p style={{ color: theme.colors.onSurfaceVariant, margin: 0, fontFamily: theme.typography.fontBody, fontSize: theme.typography.sizes.bodyMd }}>
              {errorMessage || 'No password matched the given pattern. Try expanding or double-checking the pattern.'}
            </p>
          </div>
        )}
      </div>

      {/* Summary Footer */}
      <div className={css(styles.footer)}>
        <div className={css(utils.flexRow, utils.justifySpaceBetween, utils.alignItemsCenter, styles.footerInner)}>
          <span className={css(styles.footerStat)}>
            Time: <span className={css(styles.footerValue)}>{formatTime(elapsedMs)}</span>
          </span>
          <span className={css(styles.footerStat)}>
            Checked: <span className={css(styles.footerValue)}>{formatCount(tested)}</span>
          </span>
        </div>
      </div>
    </section>
  );
};

const getStyles = (theme: ThemeTokens) => ({
  wrapper: {
    ...getCardStyle(theme),
    position: 'relative',
    overflow: 'hidden',
    height: '100%',
  },

  header: {
    gap: theme.spacing.unit,
    marginBottom: theme.spacing.unit,
    paddingTop: theme.spacing.unit,
  },
  iconBox: {
    ...getIconBoxStyle(theme),
    padding: '12px',
  },
  title: {
    fontFamily: theme.typography.fontBody,
    fontSize: theme.typography.sizes.headlineLgMobile,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.onSurface,
  },
  contentContainer: {
    backgroundColor: theme.colors.surfaceContainerLowest, // bg-surface-container-lowest
    borderRadius: theme.shape.radiusCard, // rounded-3xl
    border: '1px solid',
    padding: theme.spacing.gutterMd,
    gap: theme.spacing.gutterSm,
    boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)', // shadow-inner
  },
  label: {
    ...getLabelCapsStyle(theme),
    fontWeight: theme.typography.weights.semibold,
    letterSpacing: '0.05em', // tracking-wider
  },
  passwordBox: {
    fontFamily: theme.typography.fontMono,
    fontSize: theme.typography.sizes.headlineLg,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: '0.2em', // tracking-[0.2em]
    backgroundColor: theme.colors.tintBg, // bg-[#D3C3B9]/20
    padding: `${theme.spacing.gutterSm} ${theme.spacing.gutterMd}`,
    borderRadius: theme.shape.radiusStats, // rounded-2xl
    border: '1px solid',
    fontVariantNumeric: 'tabular-nums',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    wordBreak: 'break-all',
    [mobileView]: { fontSize: theme.typography.sizes.headlineLgMobile, padding: theme.spacing.gutterSm },
  },
  copyBtn: {
    marginTop: theme.spacing.unit,
    backgroundColor: theme.colors.surfaceContainerLowest,
    border: `1px solid ${theme.colors.outlineVariant}`,
    color: theme.colors.onSurface,
    fontFamily: theme.typography.fontMono,
    fontSize: theme.typography.sizes.labelCaps,
    textTransform: 'uppercase',
    letterSpacing: '0.1em', // tracking-widest
    fontWeight: theme.typography.weights.bold,
    padding: `12px ${theme.spacing.gutterSm}`, // py-3 px-gutter-sm
    borderRadius: theme.shape.radiusButton, // rounded-full
    cursor: 'pointer',
    gap: '8px', // gap-2
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: theme.colors.surfaceContainerLow,
    },
    ':active': {
      transform: 'scale(0.95)',
    }
  },
  footer: {
    marginTop: 'auto',
    paddingTop: theme.spacing.unit,
    borderTop: `1px solid ${theme.colors.outlineVariant}`,
    paddingBottom: theme.spacing.unit,
  },
  footerInner: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    padding: '16px', // p-4
    borderRadius: theme.shape.radiusCard, // rounded-3xl
    border: `1px solid ${theme.colors.outlineVariant}`,
    [mobileView]: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: '8px',
    },
  },
  footerStat: {
    ...getLabelCapsStyle(theme),
    textTransform: 'none',
    fontWeight: theme.typography.weights.medium,
  },
  footerValue: {
    color: theme.colors.onSurface,
    fontWeight: theme.typography.weights.bold,
  }
});
