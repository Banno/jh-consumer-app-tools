// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import { InstitutionAssetMap } from './vite-plugins/src/institution-assets-plugin';
import { Institution } from './types/institution';

declare global {
  // global vars declared and defined by vite config
  declare const ASSETS: InstitutionAssetMap;
  declare const ONLINE_DOMAIN: string;
  declare const CLIENT_ID: string;
  declare const banno: {
    web: {
      config: Institution;
    };
  };
}
