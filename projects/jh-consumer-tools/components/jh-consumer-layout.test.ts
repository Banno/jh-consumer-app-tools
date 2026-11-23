// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { fixture } from '@open-wc/testing-helpers';
import './jh-consumer-layout.js';
import type JhConsumerLayout from './jh-consumer-layout.js';

type Handler = (url: string) => Response | Promise<Response>;
const reply = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const webConfig = { institutionId: 'inst-1', properties: { id: 'inst-1', name: 'Test', abilities: {}, links: [] } };
const userRecord = (userId: string, abilities: Record<string, unknown> = {}) => ({
  id: 'inst-1',
  abilities: { conversations: true, schedulableTransfers: true, ...abilities },
  links: [],
  smallBusinessSettings: {},
  isCashManagement: false,
  userId,
});

let calls: string[] = [];
const stubFetch = (routes: Record<string, Handler>) => {
  calls = [];
  vi.stubGlobal('fetch', async (input: RequestInfo | URL) => {
    const url = String(input);
    calls.push(url);
    const key = Object.keys(routes).find((prefix) => url.startsWith(prefix));
    return key ? routes[key](url) : reply({}, 404);
  });
};

const menuTitles = (el: JhConsumerLayout) => {
  const sidebar = el.shadowRoot!.querySelector('jh-consumer-sidebar') as any;
  const nav = sidebar?.shadowRoot?.querySelector('jh-consumer-nav') as any;
  return Array.from(nav?.shadowRoot?.querySelectorAll('nav > a, nav > jh-consumer-menu-group') ?? []).map(
    (node: any) => (node.tagName === 'A' ? node.textContent.trim() : node.menuTitle),
  );
};

const signIn = async (el: JhConsumerLayout, sub = 'u1') => {
  el.user = { state: 'authenticated', user: { sub } as any };
};

beforeEach(() => {
  sessionStorage.clear();
});
afterEach(async () => {
  vi.unstubAllGlobals();
  if (document.querySelector('dialog jh-consumer-sidebar')) {
    document.querySelector('dialog')?.dispatchEvent(new CustomEvent('cancel'));
    await vi.waitFor(() => expect(document.querySelector('dialog jh-consumer-sidebar')).toBeNull(), { timeout: 3000 });
  }
});

const mobileTitles = () => {
  const sidebar = document.querySelector('dialog jh-consumer-sidebar') as any;
  const nav = sidebar?.shadowRoot?.querySelector('jh-consumer-nav') as any;
  return Array.from(nav?.shadowRoot?.querySelectorAll('nav > a, nav > jh-consumer-menu-group') ?? []).map(
    (node: any) => (node.tagName === 'A' ? node.textContent.trim() : node.menuTitle),
  );
};

describe('jh-consumer-layout menu', () => {
  it('shows the short menu, not the baked one, in the mobile menu while loading', async () => {
    let release: () => void = () => {};
    const gate = new Promise<void>((resolve) => (release = resolve));
    stubFetch({
      '/api/config/': () => reply(webConfig),
      '/a/consumer/api/v0/users/u1/institutions/': async () => {
        await gate;
        return reply(userRecord('u1'));
      },
    });
    const el = await fixture<JhConsumerLayout>('<jh-consumer-layout institution-id="inst-1"></jh-consumer-layout>');
    await signIn(el);
    await vi.waitFor(() => expect(el.institution.state).toBe('loading'));
    (el as any)._openSidebar();
    await vi.waitFor(() => expect(mobileTitles()).toEqual(['Dashboard', 'Messages', 'Accounts', 'Support']));
    release();
    await vi.waitFor(() =>
      expect(mobileTitles()).toEqual(['Dashboard', 'Messages', 'Accounts', 'Transfers', 'Support']),
    );
  });

  it('does not use the baked record for the menu while loading', async () => {
    stubFetch({
      '/api/config/': () => reply(webConfig),
      '/a/consumer/api/v0/users/u1/institutions/': () => new Promise<Response>(() => {}),
    });
    const el = await fixture<JhConsumerLayout>('<jh-consumer-layout institution-id="inst-1"></jh-consumer-layout>');
    await signIn(el);
    await vi.waitFor(() => expect(menuTitles(el)).toEqual(['Dashboard', 'Messages', 'Accounts', 'Support']));
  });

  it('drops extras from an earlier load for the same user', async () => {
    let releaseFirst: () => void = () => {};
    const firstGate = new Promise<void>((resolve) => (releaseFirst = resolve));
    let statusCalls = 0;
    stubFetch({
      '/api/config/': () => reply(webConfig),
      '/a/consumer/api/v0/users/u1/institutions/': () => reply(userRecord('u1', { merchantAcquisition: true })),
      '/a/consumer/api/v1/users/u1/merchant-acquisition/enrollment/status': async () => {
        statusCalls++;
        if (statusCalls === 1) {
          await firstGate;
          return reply({ status: 'enrolled' });
        }
        return reply({ status: 'cannotEnroll' });
      },
    });
    const el = await fixture<JhConsumerLayout>('<jh-consumer-layout institution-id="inst-1"></jh-consumer-layout>');
    await signIn(el);
    await vi.waitFor(() => expect(statusCalls).toBe(1));
    await el.updateInstitution();
    await vi.waitFor(() => expect(statusCalls).toBe(2));
    await new Promise((resolve) => setTimeout(resolve, 100));
    releaseFirst();
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(menuTitles(el)).not.toContain('Merchant');
  });

  it('shows the short menu while loading, then the full menu', async () => {
    let release: () => void = () => {};
    const gate = new Promise<void>((resolve) => (release = resolve));
    stubFetch({
      '/api/config/': () => reply(webConfig),
      '/a/consumer/api/v0/users/u1/institutions/': async () => {
        await gate;
        return reply(userRecord('u1'));
      },
    });
    const el = await fixture<JhConsumerLayout>('<jh-consumer-layout institution-id="inst-1"></jh-consumer-layout>');
    await signIn(el);
    await vi.waitFor(() => expect(menuTitles(el)).toEqual(['Dashboard', 'Messages', 'Accounts', 'Support']));
    release();
    await vi.waitFor(() =>
      expect(menuTitles(el)).toEqual(['Dashboard', 'Messages', 'Accounts', 'Transfers', 'Support']),
    );
  });

  it('keeps the short menu when the institution cannot be read', async () => {
    stubFetch({
      '/api/config/': () => reply(webConfig),
      '/a/consumer/api/v0/users/u1/institutions/': () => reply({}, 500),
    });
    const el = await fixture<JhConsumerLayout>('<jh-consumer-layout institution-id="inst-1"></jh-consumer-layout>');
    await signIn(el);
    await vi.waitFor(() => expect(el.institution.state).toBe('error'));
    await el.updateComplete;
    expect(menuTitles(el)).toEqual(['Dashboard', 'Messages', 'Accounts', 'Support']);
  });

  it('inserts merchant when its status arrives', async () => {
    stubFetch({
      '/api/config/': () => reply(webConfig),
      '/a/consumer/api/v0/users/u1/institutions/': () => reply(userRecord('u1', { merchantAcquisition: true })),
      '/a/consumer/api/v1/users/u1/merchant-acquisition/enrollment/status': () => reply({ status: 'notEnrolled' }),
    });
    const el = await fixture<JhConsumerLayout>('<jh-consumer-layout institution-id="inst-1"></jh-consumer-layout>');
    await signIn(el);
    await vi.waitFor(() =>
      expect(menuTitles(el)).toEqual(['Dashboard', 'Messages', 'Accounts', 'Merchant', 'Transfers', 'Support']),
    );
  });

  it('leaves merchant out and stays quiet when the status is refused', async () => {
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    stubFetch({
      '/api/config/': () => reply(webConfig),
      '/a/consumer/api/v0/users/u1/institutions/': () => reply(userRecord('u1', { merchantAcquisition: true })),
      '/a/consumer/api/v1/users/u1/merchant-acquisition/enrollment/status': () => reply({ errorCode: 40 }, 403),
    });
    const el = await fixture<JhConsumerLayout>('<jh-consumer-layout institution-id="inst-1"></jh-consumer-layout>');
    await signIn(el);
    await vi.waitFor(() => expect(menuTitles(el)).toContain('Transfers'));
    await vi.waitFor(() => expect(calls.some((url) => url.includes('enrollment/status'))).toBe(true));
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(menuTitles(el)).toEqual(['Dashboard', 'Messages', 'Accounts', 'Transfers', 'Support']);
    expect(errors).not.toHaveBeenCalled();
    errors.mockRestore();
  });

  it('does not ask for wire transfers unless the app turned it on', async () => {
    stubFetch({
      '/api/config/': () => reply(webConfig),
      '/a/consumer/api/v0/users/u1/institutions/': () => reply(userRecord('u1', { graphEnabled: true, wires: true })),
      '/a/graph/api/': () => reply({ booleanEntitlements: [{ entitlement: 'wires', value: true }] }),
    });
    const el = await fixture<JhConsumerLayout>('<jh-consumer-layout institution-id="inst-1"></jh-consumer-layout>');
    await signIn(el);
    await vi.waitFor(() => expect(menuTitles(el)).toContain('Payments'));
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(calls.some((url) => url.startsWith('/a/graph/api'))).toBe(false);
  });

  it('asks for wire transfers when the app turned it on', async () => {
    stubFetch({
      '/api/config/': () => reply(webConfig),
      '/a/consumer/api/v0/users/u1/institutions/': () => reply(userRecord('u1', { graphEnabled: true })),
      '/a/graph/api/': () => reply({ booleanEntitlements: [{ entitlement: 'wires', value: true }] }),
    });
    const el = await fixture<JhConsumerLayout>(
      '<jh-consumer-layout institution-id="inst-1" wire-transfers></jh-consumer-layout>',
    );
    await signIn(el);
    await vi.waitFor(() => expect(menuTitles(el)).toContain('Payments'));
    expect(calls.some((url) => url.includes('/a/graph/api/v0/institutions/inst-1/consumers/u1/features/wires'))).toBe(
      true,
    );
  });

  it('drops extras that arrive for a previous user', async () => {
    let releaseFirst: () => void = () => {};
    const firstGate = new Promise<void>((resolve) => (releaseFirst = resolve));
    let releaseSecond: () => void = () => {};
    const secondGate = new Promise<void>((resolve) => (releaseSecond = resolve));
    stubFetch({
      '/api/config/': () => reply(webConfig),
      '/a/consumer/api/v0/users/u1/institutions/': () => reply(userRecord('u1', { merchantAcquisition: true })),
      '/a/consumer/api/v0/users/u2/institutions/': () => reply(userRecord('u2', { merchantAcquisition: true })),
      '/a/consumer/api/v1/users/u2/merchant-acquisition/enrollment/status': async () => {
        await secondGate;
        return reply({}, 404);
      },
      '/a/consumer/api/v1/users/u1/merchant-acquisition/enrollment/status': async () => {
        await firstGate;
        return reply({ status: 'enrolled' });
      },
    });
    const el = await fixture<JhConsumerLayout>('<jh-consumer-layout institution-id="inst-1"></jh-consumer-layout>');
    await signIn(el, 'u1');
    await vi.waitFor(() => expect(calls.some((url) => url.includes('users/u1/merchant-acquisition'))).toBe(true));
    await signIn(el, 'u2');
    await vi.waitFor(() => expect(calls.some((url) => url.includes('users/u2/institutions'))).toBe(true));
    releaseFirst();
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(menuTitles(el)).toEqual(['Dashboard', 'Messages', 'Accounts', 'Transfers', 'Support']);
    releaseSecond();
  });

  it('shows the full menu, including merchant, in the mobile menu', async () => {
    stubFetch({
      '/api/config/': () => reply(webConfig),
      '/a/consumer/api/v0/users/u1/institutions/': () => reply(userRecord('u1', { merchantAcquisition: true })),
      '/a/consumer/api/v1/users/u1/merchant-acquisition/enrollment/status': () => reply({ status: 'enrolled' }),
    });
    const el = await fixture<JhConsumerLayout>('<jh-consumer-layout institution-id="inst-1"></jh-consumer-layout>');
    await signIn(el);
    await vi.waitFor(() => expect(menuTitles(el)).toContain('Merchant'));
    (el as any)._openSidebar();
    await vi.waitFor(() =>
      expect(mobileTitles()).toEqual(['Dashboard', 'Messages', 'Accounts', 'Merchant', 'Transfers', 'Support']),
    );
  });

  it('updates an open mobile menu when merchant arrives later', async () => {
    let release: () => void = () => {};
    const gate = new Promise<void>((resolve) => (release = resolve));
    stubFetch({
      '/api/config/': () => reply(webConfig),
      '/a/consumer/api/v0/users/u1/institutions/': () => reply(userRecord('u1', { merchantAcquisition: true })),
      '/a/consumer/api/v1/users/u1/merchant-acquisition/enrollment/status': async () => {
        await gate;
        return reply({ status: 'enrolled' });
      },
    });
    const el = await fixture<JhConsumerLayout>('<jh-consumer-layout institution-id="inst-1"></jh-consumer-layout>');
    await signIn(el);
    await vi.waitFor(() => expect(menuTitles(el)).toContain('Transfers'));
    (el as any)._openSidebar();
    await vi.waitFor(() =>
      expect(mobileTitles()).toEqual(['Dashboard', 'Messages', 'Accounts', 'Transfers', 'Support']),
    );
    release();
    await vi.waitFor(() =>
      expect(mobileTitles()).toEqual(['Dashboard', 'Messages', 'Accounts', 'Merchant', 'Transfers', 'Support']),
    );
  });

  it("clears the previous user's extras while the next user loads", async () => {
    let releaseSecond: () => void = () => {};
    const secondGate = new Promise<void>((resolve) => (releaseSecond = resolve));
    stubFetch({
      '/api/config/': () => reply(webConfig),
      '/a/consumer/api/v0/users/u1/institutions/': () => reply(userRecord('u1', { merchantAcquisition: true })),
      '/a/consumer/api/v0/users/u2/institutions/': () => reply(userRecord('u2', { merchantAcquisition: true })),
      '/a/consumer/api/v1/users/u1/merchant-acquisition/enrollment/status': () => reply({ status: 'enrolled' }),
      '/a/consumer/api/v1/users/u2/merchant-acquisition/enrollment/status': async () => {
        await secondGate;
        return reply({}, 403);
      },
    });
    const el = await fixture<JhConsumerLayout>('<jh-consumer-layout institution-id="inst-1"></jh-consumer-layout>');
    await signIn(el, 'u1');
    await vi.waitFor(() => expect(menuTitles(el)).toContain('Merchant'));
    await signIn(el, 'u2');
    await vi.waitFor(() => expect(calls.some((url) => url.includes('users/u2/merchant-acquisition'))).toBe(true));
    expect(menuTitles(el)).not.toContain('Merchant');
    releaseSecond();
  });

  it('ignores an institution answer for a user who has since been replaced', async () => {
    let releaseFirst: () => void = () => {};
    const firstGate = new Promise<void>((resolve) => (releaseFirst = resolve));
    stubFetch({
      '/api/config/': () => reply(webConfig),
      '/a/consumer/api/v0/users/u1/institutions/': async () => {
        await firstGate;
        return reply(userRecord('u1', { rdc: true }));
      },
      '/a/consumer/api/v0/users/u2/institutions/': () => reply(userRecord('u2', {})),
    });
    const el = await fixture<JhConsumerLayout>('<jh-consumer-layout institution-id="inst-1"></jh-consumer-layout>');
    await signIn(el, 'u1');
    await vi.waitFor(() => expect(calls.some((url) => url.includes('users/u1/institutions'))).toBe(true));
    await signIn(el, 'u2');
    await vi.waitFor(() =>
      expect(menuTitles(el)).toEqual(['Dashboard', 'Messages', 'Accounts', 'Transfers', 'Support']),
    );
    await vi.waitFor(() => expect(el.institution.state).toBe('ready'));
    releaseFirst();
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(menuTitles(el)).toEqual(['Dashboard', 'Messages', 'Accounts', 'Transfers', 'Support']);
    expect((el.institution.institution as any).abilities.rdc).toBeUndefined();
  });

  it('does not leave an unhandled rejection when the mobile menu is closed', async () => {
    stubFetch({
      '/api/config/': () => reply(webConfig),
      '/a/consumer/api/v0/users/u1/institutions/': () => reply(userRecord('u1')),
    });
    const rejections: unknown[] = [];
    const record = (event: PromiseRejectionEvent) => {
      rejections.push(event.reason);
      event.preventDefault();
    };
    window.addEventListener('unhandledrejection', record);
    try {
      const el = await fixture<JhConsumerLayout>('<jh-consumer-layout institution-id="inst-1"></jh-consumer-layout>');
      await signIn(el);
      await vi.waitFor(() => expect(menuTitles(el)).toContain('Transfers'));
      (el as any)._openSidebar();
      await vi.waitFor(() => expect(mobileTitles().length).toBeGreaterThan(0));
      document.querySelector('dialog')!.dispatchEvent(new CustomEvent('cancel'));
      await vi.waitFor(() => expect(document.querySelector('dialog jh-consumer-sidebar')).toBeNull(), {
        timeout: 3000,
      });
      await vi.waitFor(() => expect((el as any).mobileSidebar).toBeNull());
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(rejections).toEqual([]);
    } finally {
      window.removeEventListener('unhandledrejection', record);
    }
  });

  it('updates an open mobile menu when only the institution changes', async () => {
    stubFetch({
      '/api/config/': () => reply(webConfig),
      '/a/consumer/api/v0/users/u1/institutions/': () => reply(userRecord('u1')),
    });
    const el = await fixture<JhConsumerLayout>('<jh-consumer-layout institution-id="inst-1"></jh-consumer-layout>');
    await signIn(el);
    await vi.waitFor(() => expect(menuTitles(el)).toContain('Transfers'));
    (el as any)._openSidebar();
    await vi.waitFor(() =>
      expect(mobileTitles()).toEqual(['Dashboard', 'Messages', 'Accounts', 'Transfers', 'Support']),
    );
    el.institution = { ...el.institution, institution: userRecord('u1', { rdc: true }) as any };
    await vi.waitFor(() =>
      expect(mobileTitles()).toEqual(['Dashboard', 'Messages', 'Accounts', 'Transfers', 'Remote deposits', 'Support']),
    );
  });

  it('keeps the newer institution when an older request fails late', async () => {
    let failFirst: () => void = () => {};
    const firstGate = new Promise<void>((resolve) => (failFirst = resolve));
    stubFetch({
      '/api/config/': () => reply(webConfig),
      '/a/consumer/api/v0/users/u1/institutions/': async () => {
        await firstGate;
        return reply({}, 500);
      },
      '/a/consumer/api/v0/users/u2/institutions/': () => reply(userRecord('u2', { rdc: true })),
    });
    const el = await fixture<JhConsumerLayout>('<jh-consumer-layout institution-id="inst-1"></jh-consumer-layout>');
    await signIn(el, 'u1');
    await vi.waitFor(() => expect(calls.some((url) => url.includes('users/u1/institutions'))).toBe(true));
    await signIn(el, 'u2');
    await vi.waitFor(() => expect(el.institution.state).toBe('ready'));
    failFirst();
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(el.institution.state).toBe('ready');
    expect(menuTitles(el)).toContain('Remote deposits');
  });

  it('forgets an in-flight extras answer when the same user reloads', async () => {
    let releaseFirst: () => void = () => {};
    const firstGate = new Promise<void>((resolve) => (releaseFirst = resolve));
    let releaseInstitution: () => void = () => {};
    const institutionGate = new Promise<void>((resolve) => (releaseInstitution = resolve));
    let institutionCalls = 0;
    stubFetch({
      '/api/config/': () => reply(webConfig),
      '/a/consumer/api/v0/users/u1/institutions/': async () => {
        institutionCalls++;
        if (institutionCalls === 2) await institutionGate;
        return reply(userRecord('u1', { merchantAcquisition: true }));
      },
      '/a/consumer/api/v1/users/u1/merchant-acquisition/enrollment/status': async () => {
        await firstGate;
        return reply({ status: 'enrolled' });
      },
    });
    const el = await fixture<JhConsumerLayout>('<jh-consumer-layout institution-id="inst-1"></jh-consumer-layout>');
    await signIn(el);
    await vi.waitFor(() => expect(calls.some((url) => url.includes('merchant-acquisition'))).toBe(true));
    const reload = el.updateInstitution();
    await vi.waitFor(() => expect(institutionCalls).toBe(2));
    releaseFirst();
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(el.navExtras).toEqual({});
    releaseInstitution();
    await reload;
  });

  it('forgets an in-flight extras answer after the user signs out', async () => {
    let releaseFirst: () => void = () => {};
    const firstGate = new Promise<void>((resolve) => (releaseFirst = resolve));
    stubFetch({
      '/api/config/': () => reply(webConfig),
      '/a/consumer/api/v0/users/u1/institutions/': () => reply(userRecord('u1', { merchantAcquisition: true })),
      '/a/consumer/api/v1/users/u1/merchant-acquisition/enrollment/status': async () => {
        await firstGate;
        return reply({ status: 'enrolled' });
      },
    });
    const el = await fixture<JhConsumerLayout>('<jh-consumer-layout institution-id="inst-1"></jh-consumer-layout>');
    await signIn(el);
    await vi.waitFor(() => expect(calls.some((url) => url.includes('merchant-acquisition'))).toBe(true));
    el.user = { state: 'unauthenticated', user: null as any };
    releaseFirst();
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(el.navExtras).toEqual({});
  });

  it('updates an open mobile menu when only the user record changes', async () => {
    stubFetch({
      '/api/config/': () => reply(webConfig),
      '/a/consumer/api/v0/users/u1/institutions/': () => reply(userRecord('u1')),
    });
    const el = await fixture<JhConsumerLayout>('<jh-consumer-layout institution-id="inst-1"></jh-consumer-layout>');
    await signIn(el);
    await vi.waitFor(() => expect(menuTitles(el)).toContain('Transfers'));
    (el as any)._openSidebar();
    await vi.waitFor(() => expect(mobileTitles().length).toBeGreaterThan(0));
    const sidebar = document.querySelector('dialog jh-consumer-sidebar') as any;
    el.user = { state: 'authenticated', user: { sub: 'u1', profile: { firstName: 'Pat' } } as any };
    await vi.waitFor(() => expect(sidebar.user.profile?.firstName).toBe('Pat'));
  });
});
