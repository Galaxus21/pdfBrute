import React, { useState } from 'react';
import { css } from 'aphrodite';
import { type ThemeTokens, getCardStyle } from '../../styles/theme';
import { useTheme } from '../../styles/themeContext';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import { utils, mobileView } from '../../styles/utilities';

// Persisted so a visitor who dismisses this doesn't see it again next
// session — unlike hiding it based on upload state, this also spares a
// returning user who dismisses it before ever uploading a file.
const WELCOME_DISMISSED_KEY = 'pdfbrute-welcome-dismissed';

function readDismissed(): boolean {
  try {
    return localStorage.getItem(WELCOME_DISMISSED_KEY) === 'true';
  } catch {
    return false;
  }
}

export const WelcomeGuide: React.FC = () => {
  const styles = useThemeStyles(getStyles);
  const { theme } = useTheme();
  const [dismissed, setDismissed] = useState(readDismissed);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(WELCOME_DISMISSED_KEY, 'true');
    } catch {
      // Storage unavailable (e.g. blocked) — dismissal just won't persist across reloads.
    }
  };

  const steps = [
    {
      num: 1,
      icon: 'upload_file',
      title: 'Upload PDF',
      desc: 'Select or drop your password-protected PDF file.',
    },
    {
      num: 2,
      icon: 'pattern',
      title: 'Define Format',
      desc: 'Use patterns or presets for fast recovery.',
    },
    {
      num: 3,
      icon: 'play_arrow',
      title: 'Start Recovery',
      desc: 'Multi-core browser cracking begins 100% locally.',
    },
  ];

  if (dismissed) return null;

  return (
    <div className={css(utils.flexColumn, styles.container)}>
      <div className={css(utils.flexRow, utils.alignItemsCenter, styles.header)}>
        <span className="material-symbols-outlined" style={{ fontSize: 24, color: theme.colors.primary }}>
          verified_user
        </span>
        <div className={css(styles.headerText)}>
          <h2 className={css(styles.title)}>Welcome to PDFBrute!</h2>
          <p className={css(styles.subtitle)}>
            To get started, upload your password-protected PDF. Your file is processed entirely in your browser and is <strong>never uploaded</strong> to any server.
          </p>
        </div>
        <button
          type="button"
          aria-label="Dismiss welcome guide"
          className={css(styles.dismissBtn)}
          onClick={handleDismiss}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
        </button>
      </div>

      <div className={css(utils.flexRow, styles.stepsGrid)}>
        {steps.map((step) => (
          <div key={step.num} className={css(utils.flexRow, utils.alignItemsCenter, styles.stepCard)}>
            <div className={css(styles.badge)}>{step.num}</div>
            <span className="material-symbols-outlined" style={{ fontSize: 22, color: theme.colors.primary, flexShrink: 0 }}>
              {step.icon}
            </span>
            <div>
              <div className={css(styles.stepTitle)}>{step.title}</div>
              <div className={css(styles.stepDesc)}>{step.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const getStyles = (theme: ThemeTokens) => ({
  container: {
    ...getCardStyle(theme),
    padding: '20px 24px',
    gap: '16px',
    width: '100%',
  },
  header: {
    gap: '12px',
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  dismissBtn: {
    background: theme.colors.surfaceContainer,
    border: 'none',
    borderRadius: '9999px',
    padding: '6px',
    cursor: 'pointer',
    color: theme.colors.secondary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    alignSelf: 'flex-start' as const,
  },
  title: {
    fontFamily: theme.typography.fontBody,
    fontSize: '16px',
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.onSurface,
    lineHeight: 1.2,
  },
  subtitle: {
    fontFamily: theme.typography.fontBody,
    fontSize: '13px',
    color: theme.colors.onSurfaceVariant,
    marginTop: '2px',
  },
  stepsGrid: {
    gap: '12px',
    width: '100%',
    [mobileView]: {
      flexDirection: 'column' as const,
    },
  },
  stepCard: {
    flex: 1,
    gap: '12px',
    backgroundColor: theme.colors.surfaceContainerLow,
    border: `1px solid ${theme.colors.outlineVariant}`,
    borderRadius: theme.shape.radiusCard,
    padding: '12px 16px',
  },
  badge: {
    fontFamily: theme.typography.fontMono,
    fontWeight: theme.typography.weights.bold,
    fontSize: '12px',
    color: theme.colors.primary,
    width: '24px',
    height: '24px',
    borderRadius: '9999px',
    backgroundColor: `color-mix(in srgb, ${theme.colors.primary} 15%, transparent)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepTitle: {
    fontFamily: theme.typography.fontBody,
    fontSize: '14px',
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.onSurface,
  },
  stepDesc: {
    fontFamily: theme.typography.fontBody,
    fontSize: '12px',
    color: theme.colors.onSurfaceVariant,
    lineHeight: 1.3,
  },
});
