import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// End-to-end suite — requires running infrastructure:
// postgres + rabbitmq (see docker/compose.dev.yml) and a populated .env.dev.
// Not part of CI; run locally via `bun run test:e2e`.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['apps/**/test/*.e2e-spec.ts'],
    testTimeout: 60000,
    hookTimeout: 60000,
  },
  resolve: {
    alias: {
      '@app/common': fileURLToPath(new URL('./libs/common/src', import.meta.url)),
    },
  },
});
