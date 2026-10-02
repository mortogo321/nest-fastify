import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['apps/**/*.spec.ts', 'libs/**/*.spec.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', 'apps/**/test/**'],
    testTimeout: 10000,
  },
  resolve: {
    alias: {
      '@app/common': fileURLToPath(new URL('./libs/common/src', import.meta.url)),
    },
  },
});
