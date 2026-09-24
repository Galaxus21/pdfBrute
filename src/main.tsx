import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './styles/themeContext';

// The initial data-theme attribute (and the pre-paint CSS variables it
// gates) is set by the blocking inline script in index.html <head> — it
// has to run before this deferred module does to avoid a theme flash.
// ThemeProvider re-derives its own state from the same localStorage key.

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
