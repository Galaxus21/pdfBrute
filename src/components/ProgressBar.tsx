/**
 * ProgressBar.tsx
 * SRP: Real-time visualization of the recovery progress.
 * Now styled using Aphrodite to match the Stitch design.
 */
import React from 'react';
import { css } from 'aphrodite';
import { type ThemeTokens, getCardStyle, getLabelCapsStyle } from '../styles/theme';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { utils, mobileView, tabletView } from '../styles/utilities';
import type { RecoveryState } from '../types';
import { formatCount } from '../utils/validators';

interface ProgressBarProps {
  state: RecoveryState;
}

export const RecoveryProgress: React.FC<ProgressBarProps> = ({ state }) => {
  const styles = useThemeStyles(getStyles);
  
  const { currentPassword: currentCandidate, tested, total: totalCombinations, speed, elapsedMs } = state;
  const isDone = state.status === 'found' || state.status === 'exhausted';

  const progress = totalCombinations > 0 ? (tested / totalCombinations) * 100 : 0;
  
  const stats = {
    totalTested: tested,
    speed,
    elapsedSeconds: Math.floor(elapsedMs / 1000),
    etaSeconds: speed > 0 ? Math.floor((totalCombinations - tested) / speed) : null,
  };

  const formatSpeed = (speed: number) => {
    if (speed > 1000) return `${(speed / 1000).toFixed(1)}k/s`;
    return `${speed}/s`;
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Prevent divide by zero / initial state issues
  const testedCount = stats.totalTested > 0 ? formatCount(stats.totalTested) : '0';
  const totalStr = totalCombinations ? formatCount(totalCombinations) : '...';
  const percent = Math.min(100, Math.max(0, progress));

  return (
    <section className={css(styles.wrapper)}>
      {/* Top accent bar */}
      <div className={css(styles.topAccent)}></div>
      
      {/* Header */}
      <div className={css(utils.flexRow, utils.justifySpaceBetween, utils.alignItemsCenter, styles.header)}>
        <h2 className={css(utils.flexRow, utils.alignItemsCenter, styles.headerTitle)}>2. RECOVERY PROGRESS</h2>
        <span className={css(styles.workerBadge)}>Worker 1</span>
      </div>

      {/* Candidate Preview */}
      <div className={css(utils.flexColumn, utils.alignItemsCenter, utils.justifyCenter, styles.previewContainer)}>
        <div className={css(styles.previewLabel)}>Trying candidate:</div>
        <div className={css(utils.flexRow, utils.alignItemsCenter, styles.candidateBox)}>
          {currentCandidate || '—'}
          {!isDone && <span className={css(styles.cursor)}></span>}
        </div>
      </div>

      {/* Progress Bar Track */}
      <div className={css(styles.barTrackWrapper)}>
        <div className={css(styles.barTrack)}>
          <div 
            className={css(styles.barFill)} 
            style={{ width: `${percent}%` }}
          >
            <div className={css(styles.barThumb)}></div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={css(utils.grid, styles.statsGrid)}>
        <div className={css(utils.flexColumn, styles.statBox)}>
          <span className={css(styles.statLabel)}>Tested</span>
          <span className={css(styles.statValue)}>{testedCount} / {totalStr}</span>
        </div>
        <div className={css(utils.flexColumn, styles.statBox)}>
          <span className={css(styles.statLabel)}>Speed</span>
          <span className={css(styles.statValue, styles.textPrimary)}>{formatSpeed(stats.speed)}</span>
        </div>
        <div className={css(utils.flexColumn, styles.statBox)}>
          <span className={css(styles.statLabel)}>Elapsed</span>
          <span className={css(styles.statValue)}>{formatTime(stats.elapsedSeconds)}</span>
        </div>
        <div className={css(utils.flexColumn, styles.statBox)}>
          <span className={css(styles.statLabel)}>ETA</span>
          <span className={css(styles.statValue, styles.textSecondary)}>
            {stats.etaSeconds !== null ? formatTime(stats.etaSeconds) : '—'}
          </span>
        </div>
      </div>
    </section>
  );
};

const pulseKeyframes = {
  '0%': { opacity: 1 },
  '50%': { opacity: 0.3 },
  '100%': { opacity: 1 },
};

const getStyles = (theme: ThemeTokens) => ({
  wrapper: {
    ...getCardStyle(theme),
    border: `1px solid color-mix(in srgb, ${theme.colors.primary} 50%, transparent)`, // border-primary/50
    position: 'relative',
    overflow: 'hidden',
    height: '100%',
  },
  topAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '8px',
    backgroundColor: theme.colors.primary,
    opacity: 0.2,
  },
  header: {
    paddingTop: '8px', // pt-2
  },
  headerTitle: {
    ...getLabelCapsStyle(theme),
    color: theme.colors.primary,
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  workerBadge: {
    ...getLabelCapsStyle(theme),
    backgroundColor: theme.colors.surfaceContainerLowest,
    padding: '6px 16px', // px-4 py-1.5
    borderRadius: theme.shape.radiusLegend, // rounded-full
    border: `1px solid ${theme.colors.outlineVariant}`,
  },
  previewContainer: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.shape.radiusCard, // rounded-3xl
    border: `1px solid ${theme.colors.outlineVariant}`,
    padding: theme.spacing.gutterSm,
    paddingTop: theme.spacing.marginDesktop,
    paddingBottom: theme.spacing.marginDesktop,
    marginTop: theme.spacing.unit,
    position: 'relative',
    boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)', // shadow-inner
  },
  previewLabel: {
    fontFamily: theme.typography.fontMono,
    fontSize: theme.typography.sizes.labelCaps,
    color: theme.colors.onSurfaceVariant,
    position: 'absolute',
    top: theme.spacing.unit,
    left: theme.spacing.unit,
  },
  candidateBox: {
    fontFamily: theme.typography.fontMono,
    fontSize: '24px', // text-2xl
    color: theme.colors.onSurface,
    letterSpacing: '0.2em', // tracking-[0.2em]
    fontWeight: theme.typography.weights.bold,
    wordBreak: 'break-all',
    [mobileView]: {
      fontSize: '18px',
    },
  },
  cursor: {
    width: '12px',
    height: '24px',
    backgroundColor: theme.colors.primary,
    marginLeft: '4px',
    animationName: [pulseKeyframes],
    animationDuration: '1s',
    animationIterationCount: 'infinite',
  },
  barTrackWrapper: {
    width: '100%',
    marginTop: theme.spacing.unit,
  },
  barTrack: {
    width: '100%',
    backgroundColor: theme.colors.surfaceContainerLowest,
    border: `1px solid ${theme.colors.outlineVariant}`,
    borderRadius: '9999px',
    height: '12px', // h-3
  },
  barFill: {
    backgroundColor: theme.colors.primary,
    height: '100%', // h-full
    borderRadius: '9999px',
    transition: 'width 300ms ease-in-out',
    position: 'relative',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  },
  barThumb: {
    position: 'absolute',
    right: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    width: '16px', // w-4
    height: '16px', // h-4
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: '9999px',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    border: `2px solid ${theme.colors.primary}`,
  },
  statsGrid: {
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '8px', // gap-2
    marginTop: theme.spacing.unit,
    [tabletView]: {
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    },
  },
  statBox: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    padding: '12px', // p-3
    borderRadius: theme.shape.radiusStats, // rounded-2xl
    border: `1px solid ${theme.colors.outlineVariant}`,
  },
  statLabel: {
    fontFamily: theme.typography.fontMono,
    fontSize: '10px',
    color: theme.colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  statValue: {
    fontFamily: theme.typography.fontMono,
    fontSize: theme.typography.sizes.labelCaps,
    color: theme.colors.onSurface,
    fontVariantNumeric: 'tabular-nums',
    fontWeight: theme.typography.weights.semibold,
    marginTop: '2px',
  },
  textSecondary: {
    color: theme.colors.secondary,
    fontWeight: theme.typography.weights.bold,
  },
  textPrimary: {
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.bold,
  },
});
