import { defineConfig } from 'vitest/config';
import path from 'path';

/**
 * Configure testing parameters including jsdom environment, aliases, and coverage configs.
 */
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
