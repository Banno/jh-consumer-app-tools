// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import * as fs from 'fs';
import { defineConfig, loadEnv } from 'vite';
import { institutionAssetsPlugin, institutionThemePlugin } from '@jack-henry/consumer-tools/vite-plugins';
import { checkCerts } from './bin/ssl/check-certs.js';

const apiBaseUrl = 'https://devbank.banno-staging.com';
const institutionId = '5db40b7a-ee76-42b3-acb9-eb7045011c2a'; //dev bank institutionId
const onlineDomain = 'devbank.banno-staging.com';

export default defineConfig(async ({ mode }) => {

  await checkCerts('./certs');

  const server = {
    port: 8445,
    host: 'localhost',
    https: {
      ca: fs.readFileSync('./certs/ca.pem', 'utf8'),
      cert: fs.readFileSync('./certs/cert.pem', 'utf8'),
      key: fs.readFileSync('./certs/key.pem', 'utf8'),
    },
  };

  return {
    server,
    preview: server,
    plugins: [
      institutionAssetsPlugin({ institutionId, onlineDomain }),
      institutionThemePlugin({ institutionId, apiBaseUrl: onlineDomain }),
    ],
  };
});
