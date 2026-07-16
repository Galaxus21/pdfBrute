import React from 'react';
import { css } from 'aphrodite';
import type { ThemeTokens } from '../../styles/theme';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import { utils, mobileView } from '../../styles/utilities';

interface ActionAreaProps {
  canStart: boolean;
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
}

export const ActionArea: React.FC<ActionAreaProps> = ({ canStart, isRunning, onStart, onStop }) => {
  const styles = useThemeStyles(getStyles);

  return (
    <section className={css(utils.flexRow, utils.alignItemsCenter, styles.actionArea)}>
      <button
        className={css(utils.flexRow, utils.alignItemsCenter, utils.justifyCenter, styles.btnStart, (!canStart || isRunning) && styles.btnDisabled)}
        onClick={onStart}
        disabled={!canStart || isRunning}
      >
        <span className="material-symbols-outlined">play_arrow</span>
        Start Recovery
      </button>

      {isRunning && (
        <button className={css(utils.flexRow, utils.alignItemsCenter, utils.justifyCenter, styles.btnStop)} onClick={onStop}>
          <span className="material-symbols-outlined">stop</span>
          Stop
        </button>
      )}
    </section>
  );
};

const getStyles = (theme: ThemeTokens) => ({
  actionArea: {
    gap: theme.spacing.gutterSm,
    [mobileView]: {
      flexDirection: 'column',
      alignItems: 'stretch',
    },
  },
  btnStart: {
    flex: 1,
    backgroundColor: theme.colors.primary, // screen2 uses primary
    color: theme.colors.onPrimary, // screen2 uses on-primary for text
    fontFamily: theme.typography.fontMono,
    fontSize: theme.typography.sizes.labelCaps,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    fontWeight: theme.typography.weights.bold,
    padding: `${theme.spacing.gutterSm} ${theme.spacing.gutterSm}`, // roughly py-4 px-gutter-sm
    borderRadius: theme.shape.radiusButton,
    border: 'none',
    cursor: 'pointer',
    gap: theme.spacing.unit,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', // shadow-md
    transition: 'all 0.2s',
    [mobileView]: {
      width: '100%',
    },
    ':hover': { 
      backgroundColor: theme.colors.primary, 
      color: theme.colors.onPrimary,
      opacity: 0.9,
    },
    ':active': {
      transform: 'scale(0.95)',
    }
  },
  btnDisabled: {
    opacity: 0.5,
    pointerEvents: 'none',
  },
  btnStop: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    border: `1px solid ${theme.colors.error}`,
    color: theme.colors.error,
    fontFamily: theme.typography.fontMono,
    fontSize: theme.typography.sizes.labelCaps,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    fontWeight: theme.typography.weights.bold,
    padding: `${theme.spacing.gutterSm} ${theme.spacing.gutterSm}`, // py-4
    borderRadius: theme.shape.radiusButton,
    cursor: 'pointer',
    gap: theme.spacing.unit,
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', // shadow-sm
    transition: 'all 0.2s',
    [mobileView]: {
      width: '100%',
    },
    ':hover': { backgroundColor: theme.colors.errorContainer, color: theme.colors.onErrorContainer },
    ':active': {
      transform: 'scale(0.95)',
    }
  },
});
