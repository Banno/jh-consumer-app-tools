import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/*.test.js'],
    watch: false,
    testTimeout: 60000,
    hookTimeout: 30000,
    globalSetup: './vitest.global-setup.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'dist/**',
        'example-consumer-app/**',
        '**/*.test.js',
        '__tests__/utils/**',
        'vitest.config.js',
        'bin/cli.js',
        'src/index.js',
        'src/prompts.js',
      ],
    },
  },
});
