// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import * as fs from 'fs';
import { defineConfig } from 'vite';
import { institutionAssetsPlugin, jhThemePlugin } from '@jack-henry/consumer-tools/vite-plugins';

const institutionId = process.env.INSTITUTION_ID || '4d5abed5-de03-6d15-8506-c143afc8d1e5'; //garden bank institutionId
const onlineDomain = 'devbank.banno-staging.com';

export default defineConfig(({mode}) => {
  const server = {
    port: 8445,
    host: 'localhost',
  };

  const config = process.env.INSTITUTION_ID ? { institutionId, apiBaseUrl: onlineDomain } : undefined;

  const plugins =
  [
    institutionAssetsPlugin({ institutionId, onlineDomain }),
    jhThemePlugin(config),
  ];

  return {
    server,
    preview: server,
    plugins,
  };
});