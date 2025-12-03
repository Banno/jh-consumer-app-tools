// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import * as fs from 'fs';
import { defineConfig, loadEnv } from 'vite';
import consumerPlugins from '@jack-henry/consumer-tools/vite-plugins';
import { checkCerts } from './bin/ssl/check-certs.js';

const apiBaseUrl = 'https://devbank.banno-staging.com';

export default defineConfig(async ({ mode }) => {
  // load .env file
  const env = await loadEnv(mode, process.cwd());
  if (mode === 'development' && !env.VITE_CLIENT_SECRET) {
    throw new Error('VITE_CLIENT_SECRET is not defined in .env file');
  }
  const clientConfig = {
    client_id: '6a9f0a25-fa68-4b03-9000-fdc47388521e', // "Conversations dev" client
    client_secret: env.VITE_CLIENT_SECRET,
    grant_types: ['authorization_code'],
    response_types: ['code'],
    token_endpoint_auth_method: 'client_secret_post' as const,
    redirect_uris: ['https://localhost:8445/auth/cb'],
  };

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
      consumerPlugins({
        rootTagName: 'example-consumer-app',
        institutionId: '5db40b7a-ee76-42b3-acb9-eb7045011c2a', //dev bank institutionId
        onlineDomain: 'devbank.banno-staging.com',
        auth: {
          apiBaseUrl,
          clientConfig,
        },
        routeConfigPath: './src/routing/route-config.ts',
      }),
    ],
  };
});
