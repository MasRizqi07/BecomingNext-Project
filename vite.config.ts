import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import {defineConfig} from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      '@shared': path.resolve(import.meta.dirname, 'shared'),
    },
  },
  optimizeDeps: {
    entries: ['index.html', 'test-showcase.html'],
  },
  build: {
    target: 'es2022',
    sourcemap: process.env.SOURCE_MAPS === 'true',
    chunkSizeWarningLimit: 500,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'shared-icons',
              test: /\/lucide-react\/dist\/esm\/icons\/(circle-alert|circle-check|clock|layout-dashboard|plus|refresh-ccw|trash-2)\.js$/,
              includeDependenciesRecursively: false,
            },
          ],
        },
      },
    },
  },
});
