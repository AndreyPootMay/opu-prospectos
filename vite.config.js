import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const isCapacitor = process.env.CAPACITOR_BUILD === 'true';

  return {
    plugins: [react()],
    build: {
      outDir: isCapacitor ? 'out' : 'dist',
    },
    server: {
      port: 5174,
      host: true,
      proxy: {
        '/api': {
          target: process.env.VITE_API_PROXY_TARGET || 'http://localhost/opu/api/v1',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api/, ''),
        },
      },
    },
  };
});
