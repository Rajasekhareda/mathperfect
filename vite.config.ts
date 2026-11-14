import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5000,        // ✅ Port 5000 — safe for all browsers (6000 blocked by Chromium)
    strictPort: true,  // Fails fast if 5000 is taken (prevents silent fallback)
    open: true,        // Auto-opens browser at http://localhost:5000
    proxy: {
      // Forwards /api calls to the Express backend (same port in dev via middleware)
      '/api': 'http://localhost:5000'
    }
  }
});