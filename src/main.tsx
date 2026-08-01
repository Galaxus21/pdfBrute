import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './styles/themeContext';
import './firebase'; // Initialize Firebase Analytics

// Set initial theme based on saved preference or default to light mode
const savedTheme = typeof window !== 'undefined' ? (localStorage.getItem('pdfbrute-theme') as 'light' | 'dark' | null) : null;
const initialTheme = savedTheme || 'light';
document.documentElement.setAttribute('data-theme', initialTheme);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
