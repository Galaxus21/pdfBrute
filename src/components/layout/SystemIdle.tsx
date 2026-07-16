import React from 'react';
import { Typography } from 'antd';
import { css } from 'aphrodite';
import { type ThemeTokens, getCardStyle } from '../../styles/theme';
import { useTheme } from '../../styles/themeContext';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import { utils } from '../../styles/utilities';
import { formatCount } from '../../utils/validators';

const { Text } = Typography;

interface SystemIdleProps {
  estimatedCombinations: number | null;
}

export const SystemIdle: React.FC<SystemIdleProps> = ({ estimatedCombinations }) => {
  const styles = useThemeStyles(getStyles);
  const { theme } = useTheme(); // use the properly imported hook

  return (
    <div className={css(utils.flexColumn, utils.alignItemsCenter, utils.justifyCenter, utils.height100P, styles.systemIdle)}>
      <span className="material-symbols-outlined" style={{ fontSize: 48, color: theme.colors.onSurface, marginBottom: 8 }}>memory</span>
      <p style={{ fontFamily: theme.typography.fontMono, fontSize: theme.typography.sizes.bodyMd, fontWeight: 600, color: theme.colors.onSurface }}>System Ready</p>
      <p style={{ fontFamily: theme.typography.fontMono, fontSize: theme.typography.sizes.labelCaps, color: theme.colors.onSurfaceVariant }}>
        Awaiting configuration
      </p>
      {estimatedCombinations !== null && (
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 12 }}>Estimated combinations: </Text>
          <Text strong style={{ color: theme.colors.primary }}>
            {formatCount(estimatedCombinations)}
          </Text>
        </div>
      )}
    </div>
  );
};

const getStyles = (theme: ThemeTokens) => ({
  systemIdle: {
    ...getCardStyle(theme),
    textAlign: 'center',
    minHeight: '200px',
  },
});
