import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // pdfjs-dist needs to be pre-bundled for the browser
    include: ['pdfjs-dist'],
  },
  worker: {
    // Use ES module format for workers — required for Vite native worker imports
    format: 'es',
  },
  server: {
    allowedHosts: true
  },
  build: {
    chunkSizeWarningLimit: 1500, // pdfjs worker is large
  }
});
