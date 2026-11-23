// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';
import { loadNavExtras } from '../nav-extras';
import { makeInstitution } from './fixtures';

const json = (body: unknown, status = 200) =>
  Promise.resolve({ ok: status >= 200 && status < 300, status, json: () => Promise.resolve(body) } as Response);

const withMerchant = makeInstitution({ merchantAcquisition: true });
const withGraph = makeInstitution({ graphEnabled: true });
const withBoth = makeInstitution({ merchantAcquisition: true, graphEnabled: true });

const merchantUrl = '/a/consumer/api/v1/users/u1/merchant-acquisition/enrollment/status';
const wiresUrl = '/a/graph/api/v0/institutions/inst-1/consumers/u1/features/wires';

describe('merchant status', () => {
  it('is read from the status route', async () => {
    const fetchFn = vi.fn(() => json({ status: 'enrolled' }));
    expect(await loadNavExtras(withMerchant, 'u1', { fetchFn })).toEqual({ merchantStatus: 'enrolled' });
    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect((fetchFn.mock.calls[0] as any[])[0]).toBe(merchantUrl);
  });

  it('puts the user id in the path as a single encoded segment', async () => {
    const fetchFn = vi.fn(() => json({ status: 'enrolled' }));
    await loadNavExtras(withMerchant, 'a/b c', { fetchFn });
    expect((fetchFn.mock.calls[0] as any[])[0]).toBe(
      '/a/consumer/api/v1/users/a%2Fb%20c/merchant-acquisition/enrollment/status',
    );
  });

  it('leaves no timer behind once the answer is in', async () => {
    vi.useFakeTimers();
    try {
      const fetchFn = vi.fn(() => json({ status: 'enrolled' }));
      await loadNavExtras(withMerchant, 'u1', { fetchFn });
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('is not requested without the ability', async () => {
    const fetchFn = vi.fn(() => json({ status: 'enrolled' }));
    expect(await loadNavExtras(makeInstitution(), 'u1', { fetchFn })).toEqual({});
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it.each([401, 403, 404, 500])('quietly gives nothing on %s, whatever the body says', async (status) => {
    const fetchFn = vi.fn(() => json({ status: 'enrolled' }, status));
    expect(await loadNavExtras(withMerchant, 'u1', { fetchFn })).toEqual({});
  });

  it('gives nothing when the network fails', async () => {
    const fetchFn = vi.fn(() => Promise.reject(new TypeError('network')));
    expect(await loadNavExtras(withMerchant, 'u1', { fetchFn })).toEqual({});
  });

  it('gives nothing when the body is not json', async () => {
    const fetchFn = vi.fn(() =>
      Promise.resolve({ ok: true, status: 200, json: () => Promise.reject(new Error('bad')) } as Response),
    );
    expect(await loadNavExtras(withMerchant, 'u1', { fetchFn })).toEqual({});
  });

  it('gives nothing when the status is not text', async () => {
    const fetchFn = vi.fn(() => json({ status: 3 }));
    expect(await loadNavExtras(withMerchant, 'u1', { fetchFn })).toEqual({});
  });

  it('gives up after the timeout', async () => {
    vi.useFakeTimers();
    try {
      const fetchFn = vi.fn(
        (_url: string, init?: RequestInit) =>
          new Promise<Response>((_resolve, reject) => {
            init?.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')));
          }),
      );
      const pending = loadNavExtras(withMerchant, 'u1', { fetchFn: fetchFn as any, timeoutMs: 1000 });
      await vi.advanceTimersByTimeAsync(1001);
      expect(await pending).toEqual({});
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('wire transfers entitlement', () => {
  const entitlement = (value: unknown) => ({
    booleanEntitlements: [
      { entitlement: 'other', value: true },
      { entitlement: 'wires', value },
    ],
  });

  it('is not requested unless the app turned it on', async () => {
    const fetchFn = vi.fn(() => json(entitlement(true)));
    expect(await loadNavExtras(withGraph, 'u1', { fetchFn })).toEqual({});
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('is not requested without the ability', async () => {
    const fetchFn = vi.fn(() => json(entitlement(true)));
    expect(await loadNavExtras(makeInstitution(), 'u1', { fetchFn, wireTransfers: true })).toEqual({});
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('is true when the entitlement is true', async () => {
    const fetchFn = vi.fn(() => json(entitlement(true)));
    expect(await loadNavExtras(withGraph, 'u1', { fetchFn, wireTransfers: true })).toEqual({ hasWireTransfers: true });
    expect((fetchFn.mock.calls[0] as any[])[0]).toBe(wiresUrl);
  });

  it.each([false, 'true', 1, null])('is false for entitlement value %j', async (value) => {
    const fetchFn = vi.fn(() => json(entitlement(value)));
    expect(await loadNavExtras(withGraph, 'u1', { fetchFn, wireTransfers: true })).toEqual({ hasWireTransfers: false });
  });

  it('is false when the wires entitlement is missing', async () => {
    const fetchFn = vi.fn(() => json({ booleanEntitlements: [] }));
    expect(await loadNavExtras(withGraph, 'u1', { fetchFn, wireTransfers: true })).toEqual({ hasWireTransfers: false });
  });

  it('gives nothing for an unexpected body', async () => {
    const fetchFn = vi.fn(() => json({ something: 'else' }));
    expect(await loadNavExtras(withGraph, 'u1', { fetchFn, wireTransfers: true })).toEqual({});
  });

  it.each([401, 403, 404])('quietly gives nothing on %s, whatever the body says', async (status) => {
    const fetchFn = vi.fn(() => json({ booleanEntitlements: [{ entitlement: 'wires', value: true }] }, status));
    expect(await loadNavExtras(withGraph, 'u1', { fetchFn, wireTransfers: true })).toEqual({});
  });
});

describe('both sources', () => {
  it('load independently', async () => {
    const fetchFn = vi.fn((url: string) =>
      url === merchantUrl ? json({}, 403) : json({ booleanEntitlements: [{ entitlement: 'wires', value: true }] }),
    );
    expect(await loadNavExtras(withBoth, 'u1', { fetchFn, wireTransfers: true })).toEqual({ hasWireTransfers: true });
  });

  it('returns nothing without a user or institution', async () => {
    const fetchFn = vi.fn();
    expect(await loadNavExtras(withBoth, '', { fetchFn })).toEqual({});
    expect(await loadNavExtras(undefined as any, 'u1', { fetchFn })).toEqual({});
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('never throws', async () => {
    const fetchFn = vi.fn(() => {
      throw new Error('boom');
    });
    await expect(loadNavExtras(withBoth, 'u1', { fetchFn: fetchFn as any, wireTransfers: true })).resolves.toEqual({});
  });
});
