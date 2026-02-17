// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import institutionAssetsPlugin from './src/institution-assets-plugin.js';
import jhThemePlugin from './src/jh-theme-plugin.js';
import consumerLayoutPlugin from './src/consumer-layout-plugin.js';
import consumerAuthPlugin from './src/consumer-auth-plugin.js';
import type { ConsumerAuthOptions } from './src/consumer-auth-plugin.js';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { normalizePath } from 'vite';
import { fileURLToPath } from 'node:url';

// Export individual plugins
export { institutionAssetsPlugin, jhThemePlugin, consumerLayoutPlugin, consumerAuthPlugin };

const fontsUrl = await import.meta.resolve?.('../../dist/fonts');
const fontsPath = normalizePath(fileURLToPath(fontsUrl));

interface ConsumerConfigOptions {
  rootTagName: string;
  institutionId: string;
  onlineDomain: string;
  routeConfigPath?: string;
  auth?: ConsumerAuthOptions;
}

// Combines the consumer plugins
export default function consumerConfig({
  rootTagName,
  institutionId,
  onlineDomain,
  routeConfigPath,
  auth,
}: ConsumerConfigOptions) {
  const plugins = [
    viteStaticCopy({
      targets: [
        {
          src: `${fontsPath}/**/*`,
          dest: 'fonts',
        },
      ],
    }),
    institutionAssetsPlugin({ institutionId, onlineDomain }),
    jhThemePlugin({ institutionId, apiBaseUrl: onlineDomain }),
    consumerLayoutPlugin({ rootTagName, institutionId, routeConfigPath }),
  ];

  // Only include auth plugin if auth configuration is provided
  if (auth) {
    plugins.push(consumerAuthPlugin(auth));
  }

  return plugins;
}
