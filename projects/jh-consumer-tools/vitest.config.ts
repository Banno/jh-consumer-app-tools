// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          include: ['./vite-plugins/__test__/**/*.test.ts'],
          name: 'plugins',
          environment: 'node',
        },
      },
      {
        test: {
          include: ['./components/**/*.test.{ts,js}'],
          name: 'components',
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [
              {
                browser: 'chromium',
              },
            ],
          },
        },
      },
    ],
  },
});
