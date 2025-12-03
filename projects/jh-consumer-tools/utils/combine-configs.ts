// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import type { WebserverConfigResponse, UserInstitutionResponse, Institution } from '../types/institution';

export default function combineConfigs(
  webserverConfig: WebserverConfigResponse,
  userConfig: UserInstitutionResponse,
): Institution {
  // user institution properties that overlap with webserverConfig.properties take priority.
  delete webserverConfig.ndsConfig;
  delete webserverConfig.mixpanel;
  delete webserverConfig.ndsConfig;
  delete webserverConfig.brandProtection;
  delete webserverConfig.properties.androidSha256CertFingerprints;
  delete webserverConfig.properties.themes;
  delete webserverConfig.properties.images;
  delete userConfig.theme;

  const combined = { ...webserverConfig.properties, ...webserverConfig, ...userConfig };
  delete combined.properties;
  return combined;
}
