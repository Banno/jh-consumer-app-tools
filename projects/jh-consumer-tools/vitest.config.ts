// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import { fileURLToPath } from 'node:url';
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
        define: {
          ONLINE_DOMAIN: JSON.stringify('online.example.com'),
          CLIENT_ID: JSON.stringify('own-client-id'),
        },
        test: {
          include: ['./controllers/__test__/**/*.test.ts'],
          name: 'controllers',
          environment: 'node',
        },
      },
      {
        resolve: {
          alias: [
            {
              find: /^@jack-henry\/jh-icons\/icons-wc\/.*/,
              replacement: fileURLToPath(new URL('./components/nav/__test__/icon-stub.ts', import.meta.url)),
            },
          ],
        },
        define: {
          ONLINE_DOMAIN: JSON.stringify('online.example.com'),
          CLIENT_ID: JSON.stringify('own-client-id'),
          ASSETS: JSON.stringify({
            light: { menuLogo: '', backgroundLandscape: '' },
            dark: { menuLogo: '', backgroundLandscape: '' },
          }),
          banno: JSON.stringify({
            web: { config: { id: 'baked', abilities: { rdc: true, schedulableTransfers: true }, links: [] } },
          }),
        },
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
