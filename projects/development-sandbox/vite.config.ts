// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import * as fs from 'fs';
import { defineConfig } from 'vite';
import { institutionAssetsPlugin, institutionThemePlugin, designSystemThemePlugin } from '@jack-henry/consumer-tools/vite-plugins';

const institutionId = process.env.INSTITUTION_ID; //garden bank institutionId
const onlineDomain = 'devbank.banno-staging.com';

export default defineConfig(async ({ mode }) => {
  const server = {
    port: 8445,
    host: 'localhost',
  };

  console.log(`Using institutionId: ${institutionId || 'none'}, onlineDomain: ${onlineDomain}`);

  const plugins = institutionId ?
    [
      institutionAssetsPlugin({ institutionId, onlineDomain }),
      institutionThemePlugin({ institutionId, apiBaseUrl: onlineDomain }),
    ] : [
      institutionAssetsPlugin({ institutionId: '4d5abed5-de03-6d15-8506-c143afc8d1e5', onlineDomain }), // Get Jack Henry assets if no institutionId is provided
      designSystemThemePlugin()
    ];

  return {
    server,
    preview: server,
    plugins,
  };
});