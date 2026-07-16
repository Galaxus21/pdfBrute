import React from 'react';
import { ConfigProvider, theme as antdThemeAPI, type ThemeConfig } from 'antd';
import { Home } from './pages/Home';
import { useTheme } from './styles/themeContext';

const App: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  const antdTheme: ThemeConfig = {
    algorithm: theme.mode === 'dark' ? antdThemeAPI.darkAlgorithm : antdThemeAPI.defaultAlgorithm,
    token: {
      colorPrimary: theme.colors.primary,
      colorBgBase: theme.colors.surfaceContainerLowest,
      colorTextBase: theme.colors.onSurface,
      borderRadius: 8,
      fontFamily: theme.typography.fontBody,
    },
  };

  return (
    <ConfigProvider theme={antdTheme}>
      <Home theme={theme.mode} toggleTheme={toggleTheme} />
    </ConfigProvider>
  );
};

export default App;
