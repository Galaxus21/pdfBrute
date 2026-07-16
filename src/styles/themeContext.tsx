/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ThemeTokens } from './theme';
import { lightTheme, darkTheme } from './theme';

interface ThemeContextType {
  theme: ThemeTokens;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {
    // 1. Check if user previously saved a preference
    const saved = localStorage.getItem('pdfbrute-theme') as 'light' | 'dark' | null;
    if (saved) return saved;

    // 2. Check OS/System preference
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    // 3. Fallback to default
    return 'light';
  });

  const theme = themeMode === 'light' ? lightTheme : darkTheme;

  const toggleTheme = () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
    localStorage.setItem('pdfbrute-theme', newMode);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
  }, [themeMode]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

