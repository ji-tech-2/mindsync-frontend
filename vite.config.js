import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { imagetools } from 'vite-imagetools';
import path from 'path';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // loadEnv reads .env / .env.local etc. Note: this only affects the dev
  // server config here — nothing is baked into the browser bundle.
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget =
    process.env.VITE_API_TARGET ||
    env.VITE_API_TARGET ||
    'http://localhost:8000';

  return {
    plugins: [react(), imagetools()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      // Dev proxy: forwards /api/* to the backend, stripping the /api prefix.
      // This mirrors what nginx does in the Docker container.
      // Override VITE_API_TARGET in .env.local to point at a different backend.
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  };
});
