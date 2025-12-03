// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import type { WebserverConfigResponse, UserInstitutionResponse, Institution } from '../types/institution';
import combineConfigs from '../utils/combine-configs';

export async function loadInstitution(institutionId: string, userId: string): Promise<Institution> {
  const webserverConfigResponse = await fetch(`/api/config/${institutionId}`);
  const userInstitutionResponse = await fetch(`/a/consumer/api/v0/users/${userId}/institutions/${institutionId}`);
  if (!webserverConfigResponse.ok) {
    throw new Error('Error fetching webserver config');
  }
  if (!userInstitutionResponse.ok) {
    throw new Error('Error fetching institution');
  }
  const webserverConfig = (await webserverConfigResponse.json()) as WebserverConfigResponse;
  const institutionConfig = (await userInstitutionResponse.json()) as UserInstitutionResponse;
  return combineConfigs(webserverConfig, institutionConfig);
}
