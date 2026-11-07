import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));

// The console is served at /console; its built files live under /app so the static marketing page,
// the login page and the legacy assets in public/ keep their addresses.
export default defineConfig({
  root: here,
  base: '/app/',
  plugins: [react()],
  build: {
    outDir: fileURLToPath(new URL('../public/app', import.meta.url)),
    emptyOutDir: true,
    sourcemap: false,
    target: 'es2022',
    // The page's Content-Security-Policy forbids inline scripts, so nothing may be inlined into the HTML.
    assetsInlineLimit: 0,
    modulePreload: { polyfill: false },
  },
  server: { proxy: { '/api': 'http://127.0.0.1:8787' } },
});
