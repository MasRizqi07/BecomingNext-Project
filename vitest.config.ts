import react from '@vitejs/plugin-react';
import path from 'node:path';
import {defineConfig} from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      '@shared': path.resolve(import.meta.dirname, 'shared'),
    },
  },
  test: {
    environment: 'jsdom',
    maxWorkers: 1,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'shared/**/*.test.ts'],
    exclude: ['functions/**', 'tests/e2e/**', 'tests/rules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      thresholds: {lines: 50, functions: 45, branches: 45, statements: 50},
    },
  },
});
