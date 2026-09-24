import React from 'react';
import { Tooltip, Typography } from 'antd';
import { css } from 'aphrodite';
import { type ThemeTokens, getCardStyle } from '../../styles/theme';
import { useTheme } from '../../styles/themeContext';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import { utils } from '../../styles/utilities';
import { formatCount } from '../../utils/formatting';

const { Text } = Typography;

export const SystemIdle: React.FC<{ estimatedCombinations: number | null }> = ({ estimatedCombinations }) => {
  const styles = useThemeStyles(getStyles);
  const { theme } = useTheme();

  return (
    <article className={css(utils.flexColumn, utils.alignItemsCenter, utils.justifyCenter, utils.height100P, styles.systemIdle)}>
      <span className="material-symbols-outlined" style={{ fontSize: 48, color: theme.colors.onSurface, marginBottom: 8 }}>memory</span>
      <p style={{ fontFamily: theme.typography.fontMono, fontSize: theme.typography.sizes.bodyMd, fontWeight: 600, color: theme.colors.onSurface }}>System Ready</p>
      <p style={{ fontFamily: theme.typography.fontMono, fontSize: theme.typography.sizes.labelCaps, color: theme.colors.onSurfaceVariant }}>
        Awaiting configuration
      </p>
      {estimatedCombinations !== null && (
        <Tooltip title="The total number of possible passwords based on your pattern. More combinations means longer processing time." placement="bottom">
          <div style={{ marginTop: 16, textAlign: 'center', cursor: 'help' }}>
            <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 12 }}>Estimated combinations: </Text>
            <Text strong style={{ color: theme.colors.primary }}>
              {formatCount(estimatedCombinations)}
            </Text>
            <span className="material-symbols-outlined" style={{ fontSize: 14, color: theme.colors.onSurfaceVariant, verticalAlign: 'middle', marginLeft: 4 }}>info</span>
          </div>
        </Tooltip>
      )}
    </article>
  );
};

const getStyles = (theme: ThemeTokens) => ({
  systemIdle: {
    ...getCardStyle(theme),
    textAlign: 'center' as const,
    minHeight: '200px',
  },
});
