import React from 'react';
import { css } from 'aphrodite';
import { type ThemeTokens, getCardStyle, getLabelCapsStyle } from '../../styles/theme';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import { utils } from '../../styles/utilities';

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
}

export const SectionCard: React.FC<SectionCardProps> = ({ title, children }) => {
  const styles = useThemeStyles(getStyles);

  return (
    <section className={css(utils.flexColumn, styles.sectionCard)}>
      <h2 className={css(styles.sectionTitle)}>{title}</h2>
      {children}
    </section>
  );
};

const getStyles = (theme: ThemeTokens) => ({
  sectionCard: {
    ...getCardStyle(theme),
    gap: theme.spacing.unit,
  },
  sectionTitle: {
    ...getLabelCapsStyle(theme),
    color: theme.colors.onSurface,
  },
});
