// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import * as fs from 'fs';
import { defineConfig, loadEnv } from 'vite';
import consumerPlugins from '@jack-henry/consumer-tools/vite-plugins';
import { checkCerts } from './bin/ssl/check-certs.js';

export default defineConfig(async ({ mode }) => {
  // load .env file
  const env = await loadEnv(mode, process.cwd(), '');

  // Validate required environment variables
  const requiredEnvVars = ['INSTITUTION_ID', 'CLIENT_ID', 'CLIENT_SECRET', 'API_URL', 'REDIRECT_URIS'];

  for (const varName of requiredEnvVars) {
    if (!env[varName]) {
      throw new Error(`${varName} is not defined in .env file`);
    }
  }

  const apiBaseUrl = env.API_URL;
  const redirectUris = JSON.parse(env.REDIRECT_URIS);

  // Extract domain from API URL for onlineDomain (remove https:// prefix)
  const onlineDomain = apiBaseUrl.replace(/^https?:\/\//, '');

  const clientConfig = {
    client_id: env.CLIENT_ID,
    client_secret: env.CLIENT_SECRET,
    grant_types: ['authorization_code'],
    response_types: ['code'],
    token_endpoint_auth_method: 'client_secret_post' as const,
    redirect_uris: redirectUris,
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
        institutionId: env.INSTITUTION_ID,
        onlineDomain,
        auth: {
          apiBaseUrl,
          clientConfig,
          // example providing additional scopes
          // authScope: 'https://api.banno.com/consumer/auth/accounts.readonly',
        },
        routeConfigPath: './src/routing/route-config.ts',
      }),
    ],
  };
});
