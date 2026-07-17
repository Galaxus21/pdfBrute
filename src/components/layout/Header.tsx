import React from 'react';
import { css } from 'aphrodite';
import { type ThemeTokens, getLabelCapsStyle } from '../../styles/theme';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import { utils, mobileView } from '../../styles/utilities';

interface HeaderProps {
  theme: string;
  toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ theme, toggleTheme }) => {
  const styles = useThemeStyles(getStyles);

  const handleShare = async () => {
    const shareData = {
      title: 'PDFBrute - PDF Password Recovery',
      text: 'Recover your forgotten PDF passwords securely in your browser using multi-core parallel processing and bidirectional search. 100% private, no uploads!',
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <div className={css(styles.headerWrapper)}>
      <header className={css(utils.flexRow, utils.alignItemsCenter, utils.justifySpaceBetween, styles.header)}>
        <div className={css(utils.flexRow, utils.alignItemsCenter, styles.headerLeft)}>
          <span className={css(styles.logoIcon)}>lock_open</span>
          <div>
            <h1 className={css(styles.title)}>PDFBrute</h1>
            <p className={css(styles.subtitle)}>PDF Password Recovery · Client-side only · Your file never leaves this browser</p>
          </div>
        </div>
        <div className={css(utils.flexRow, utils.alignItemsCenter, styles.headerRight)}>
          <button
            aria-label="Share PDFBrute"
            className={css(utils.flexRow, styles.iconButton)}
            onClick={handleShare}
            title="Share PDFBrute"
          >
            <span className="material-symbols-outlined">share</span>
          </button>
          <button
            aria-label="Toggle Theme"
            className={css(utils.flexRow, styles.iconButton)}
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            <span className="material-symbols-outlined">
              {theme === 'light' ? 'dark_mode' : 'light_mode'}
            </span>
          </button>
        </div>
      </header>
    </div>
  );
};

const getStyles = (theme: ThemeTokens) => ({
  headerWrapper: {
    padding: `24px ${theme.spacing.marginDesktop} 0 ${theme.spacing.marginDesktop}`,
    maxWidth: 1280,
    margin: '0 auto',
    width: '100%',
    [mobileView]: { padding: `16px ${theme.spacing.marginMobile} 0 ${theme.spacing.marginMobile}` },
  },
  header: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    border: `1px solid ${theme.colors.outlineVariant}`,
    borderRadius: '9999px',
    padding: '12px 24px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    width: '100%',
  },
  headerLeft: {
    gap: theme.spacing.unit,
  },
  logoIcon: {
    fontFamily: '"Material Symbols Outlined"',
    fontSize: 32,
    color: theme.colors.primary,
  },
  title: {
    fontFamily: theme.typography.fontBody,
    fontSize: theme.typography.sizes.headlineLg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.onSurface,
    lineHeight: 1,
    [mobileView]: { fontSize: theme.typography.sizes.headlineLgMobile },
  },
  subtitle: {
    ...getLabelCapsStyle(theme),
    marginTop: 4,
  },
  headerRight: {
    gap: theme.spacing.gutterSm,
  },
  iconButton: {
    background: 'none',
    border: 'none',
    padding: theme.spacing.unit,
    borderRadius: '9999px',
    cursor: 'pointer',
    color: theme.colors.secondary,
    backgroundColor: theme.colors.surfaceContainer,
  },
});
