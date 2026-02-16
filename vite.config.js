import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { imagetools } from 'vite-imagetools';
import path from 'path';

// Vite config with proxy setup for API calls (to bypass CORS in development)
// ini cuman utk testing ngebypass CORS, di production pake direct URL aja
//
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), imagetools()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://api.mindsync.my',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false,
        rejectUnauthorized: false,
      },
    },
  },
});
