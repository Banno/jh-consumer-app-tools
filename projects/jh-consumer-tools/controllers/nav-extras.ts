// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import { type Institution } from '../types/institution';
import { type NavigationExtras } from './navigation';

export interface NavExtrasOptions {
  wireTransfers?: boolean;
  fetchFn?: typeof fetch;
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 5000;
/** Never throws. Anything that is not a usable answer is undefined. */
async function getJson(
  url: string,
  { fetchFn = globalThis.fetch, timeoutMs = DEFAULT_TIMEOUT_MS }: NavExtrasOptions,
): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchFn(url, { signal: controller.signal, headers: { Accept: 'application/json' } });
    return response.ok ? await response.json() : undefined;
  } catch {
    return undefined;
  } finally {
    clearTimeout(timer);
  }
}

async function loadMerchantStatus(institution: Institution, userId: string, options: NavExtrasOptions) {
  if (institution.abilities?.merchantAcquisition !== true) return undefined;
  const body = (await getJson(
    `/a/consumer/api/v1/users/${encodeURIComponent(userId)}/merchant-acquisition/enrollment/status`,
    options,
  )) as { status?: unknown } | undefined;
  return typeof body?.status === 'string' ? body.status : undefined;
}

async function loadWireTransfers(institution: Institution, userId: string, options: NavExtrasOptions) {
  if (!options.wireTransfers || institution.abilities?.graphEnabled !== true) {
    return undefined;
  }
  const body = (await getJson(
    `/a/graph/api/v0/institutions/${encodeURIComponent(institution.id)}/consumers/${encodeURIComponent(userId)}/features/wires`,
    options,
  )) as { booleanEntitlements?: Array<{ entitlement?: string; value?: unknown }> } | undefined;
  if (!body || !Array.isArray(body.booleanEntitlements)) return undefined;
  return body.booleanEntitlements.find((entry) => entry?.entitlement === 'wires')?.value === true;
}

export async function loadNavExtras(
  institution: Institution,
  userId: string,
  options: NavExtrasOptions = {},
): Promise<NavigationExtras> {
  if (!institution || !userId) return {};
  const [merchantStatus, hasWireTransfers] = await Promise.all([
    loadMerchantStatus(institution, userId, options),
    loadWireTransfers(institution, userId, options),
  ]);
  const extras: NavigationExtras = {};
  if (merchantStatus !== undefined) extras.merchantStatus = merchantStatus;
  if (hasWireTransfers !== undefined) extras.hasWireTransfers = hasWireTransfers;
  return extras;
}
