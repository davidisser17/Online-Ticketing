import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    // Use jsdom to simulate a browser DOM environment
    environment: 'jsdom',

    // Run this file before every test suite
    setupFiles: ['./src/test/setup.ts'],

    // Collect coverage from src/ (excluding test files and type declarations)
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/test/**',
        'src/**/*.d.ts',
      ],
    },

    globals: true,
  },
});
