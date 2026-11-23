// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, elementUpdated } from '@open-wc/testing-helpers';
import './jh-consumer-sidebar.js';
import type JhConsumerSidebar from './jh-consumer-sidebar.js';

const institution = (abilities: Record<string, unknown> = {}, links: unknown[] = []) =>
  ({
    id: 'inst-1',
    abilities: { conversations: true, ...abilities },
    smallBusinessSettings: {},
    links,
    name: 'Test',
  }) as any;

const titles = (el: JhConsumerSidebar) => {
  const nav = el.shadowRoot!.querySelector('jh-consumer-nav') as any;
  return Array.from(nav.shadowRoot.querySelectorAll('nav > a, nav > jh-consumer-menu-group')).map((node: any) =>
    node.tagName === 'A' ? node.textContent.trim() : node.menuTitle,
  );
};

const makeSidebar = async (props: Partial<JhConsumerSidebar> = {}) => {
  const el = await fixture<JhConsumerSidebar>('<jh-consumer-sidebar></jh-consumer-sidebar>');
  Object.assign(el, { user: { sub: 'u1' }, ...props });
  await elementUpdated(el);
  const nav = el.shadowRoot!.querySelector('jh-consumer-nav') as any;
  await nav.updateComplete;
  return el;
};

afterEach(async () => {
  if (document.querySelector('dialog jha-dialog')) {
    document.querySelector('dialog')?.dispatchEvent(new CustomEvent('cancel'));
    await vi.waitFor(() => expect(document.querySelector('dialog jha-dialog')).toBeNull(), { timeout: 3000 });
  }
});

describe('jh-consumer-sidebar menu', () => {
  it('shows the short menu until the user record is ready', async () => {
    const el = await makeSidebar({ institution: institution({ rdc: true }), navReady: false });
    expect(titles(el)).toEqual(['Dashboard', 'Messages', 'Accounts', 'Support']);
  });

  it('shows the full menu from the user record once ready', async () => {
    const el = await makeSidebar({
      institution: institution({ rdc: true, schedulableTransfers: true }),
      navReady: true,
    });
    expect(titles(el)).toEqual(['Dashboard', 'Messages', 'Accounts', 'Transfers', 'Remote deposits', 'Support']);
  });

  it('shows the short menu when the record is empty', async () => {
    const el = await makeSidebar({ institution: { abilities: {}, links: [] } as any, navReady: true });
    expect(titles(el)).toEqual(['Dashboard', 'Messages', 'Accounts', 'Support']);
  });

  it('shows the short menu and does not break when building the menu throws', async () => {
    const broken = institution({ rdc: true });
    Object.defineProperty(broken, 'links', {
      get() {
        throw new Error('boom');
      },
    });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const el = await makeSidebar({ institution: broken, navReady: true });
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
    expect(titles(el)).toEqual(['Dashboard', 'Messages', 'Accounts', 'Support']);
  });

  it('adds merchant as the fourth item when its status arrives', async () => {
    const el = await makeSidebar({
      institution: institution({ merchantAcquisition: true, schedulableTransfers: true }),
      navReady: true,
    });
    const nav = el.shadowRoot!.querySelector('jh-consumer-nav') as any;
    expect(titles(el)).toEqual(['Dashboard', 'Messages', 'Accounts', 'Transfers', 'Support']);
    el.navExtras = { merchantStatus: 'enrolled' };
    await elementUpdated(el);
    await nav.updateComplete;
    expect(titles(el)).toEqual(['Dashboard', 'Messages', 'Accounts', 'Merchant', 'Transfers', 'Support']);
  });

  it('puts wire transfers in the payments group', async () => {
    const el = await makeSidebar({ institution: institution({ wires: true }), navReady: true });
    el.navExtras = { hasWireTransfers: true };
    await elementUpdated(el);
    const nav = el.shadowRoot!.querySelector('jh-consumer-nav') as any;
    await nav.updateComplete;
    const group = nav.shadowRoot.querySelector('jh-consumer-menu-group#payments-menu');
    const labels = Array.from(group.querySelectorAll('a')).map((a: any) => a.textContent.trim());
    expect(labels).toEqual(['Wires', 'Wires']);
  });
});

describe('jh-consumer-sidebar on its own', () => {
  it('shows the menu from the institution without being told it is ready', async () => {
    const el = await fixture<JhConsumerSidebar>('<jh-consumer-sidebar></jh-consumer-sidebar>');
    el.user = { sub: 'u1' } as any;
    el.institution = institution({ rdc: true, schedulableTransfers: true });
    await elementUpdated(el);
    const nav = el.shadowRoot!.querySelector('jh-consumer-nav') as any;
    await nav.updateComplete;
    expect(titles(el)).toEqual(['Dashboard', 'Messages', 'Accounts', 'Transfers', 'Remote deposits', 'Support']);
  });

  it('rebuilds the menu when only the ready state changes', async () => {
    const el = await makeSidebar({ institution: institution({ rdc: true }), navReady: false });
    expect(titles(el)).toEqual(['Dashboard', 'Messages', 'Accounts', 'Support']);
    el.navReady = true;
    await elementUpdated(el);
    const nav = el.shadowRoot!.querySelector('jh-consumer-nav') as any;
    await nav.updateComplete;
    expect(titles(el)).toEqual(['Dashboard', 'Messages', 'Accounts', 'Remote deposits', 'Support']);
    el.navReady = false;
    await elementUpdated(el);
    await nav.updateComplete;
    expect(titles(el)).toEqual(['Dashboard', 'Messages', 'Accounts', 'Support']);
  });
});

describe('links with a notice', () => {
  const noticed = () =>
    institution({}, [
      {
        id: 'abc',
        linkType: 'DebtRelief',
        name: 'x',
        title: 'Get help',
        description: '',
        fdicNotice: 'You are leaving the bank.',
      },
    ]);

  let navigated: string[] = [];
  const click = async (el: JhConsumerSidebar) => {
    const nav = el.shadowRoot!.querySelector('jh-consumer-nav') as any;
    navigated = [];
    nav.navigate = (url: string) => navigated.push(url);
    const anchor = Array.from(nav.shadowRoot.querySelectorAll('a')).find((a: any) =>
      a.textContent.includes('Get help'),
    ) as HTMLAnchorElement;
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, composed: true });
    let prevented = false;
    // runs after the menu's own handler; stops the test page from following the link
    anchor.addEventListener('click', (e) => {
      prevented = e.defaultPrevented;
      e.preventDefault();
    });
    anchor.dispatchEvent(event);
    return { defaultPrevented: prevented };
  };

  it('does not follow the link before the user agrees', async () => {
    const el = await makeSidebar({ institution: noticed(), navReady: true });
    const event = await click(el);
    expect(event.defaultPrevented).toBe(true);
    await new Promise((resolve) => setTimeout(resolve, 50));
    const dialog = document.querySelector('dialog')!.querySelector('jha-dialog') as any;
    expect(dialog).toBeTruthy();
    expect(dialog.messageBody).toBe('You are leaving the bank.');
    expect(navigated).toEqual([]);
  });

  it('follows the link after the user agrees', async () => {
    const el = await makeSidebar({ institution: noticed(), navReady: true });
    await click(el);
    await new Promise((resolve) => setTimeout(resolve, 50));
    (document.querySelector('dialog')!.querySelector('jha-dialog') as HTMLElement).dispatchEvent(
      new CustomEvent('confirm', { bubbles: true, composed: true }),
    );
    await vi.waitFor(() => expect(navigated.length).toBe(1), { timeout: 3000 });
    expect(navigated[0]).toContain('/login?returnUrl=');
  });

  it('stays put when the user cancels', async () => {
    const el = await makeSidebar({ institution: noticed(), navReady: true });
    await click(el);
    await new Promise((resolve) => setTimeout(resolve, 50));
    document.querySelector('dialog')!.dispatchEvent(new CustomEvent('cancel'));
    await vi.waitFor(() => expect(document.querySelector('dialog jha-dialog')).toBeNull(), { timeout: 3000 });
    expect(navigated).toEqual([]);
  });

  it('follows normal links without a dialog', async () => {
    const el = await makeSidebar({ institution: institution({}, []), navReady: true });
    const nav = el.shadowRoot!.querySelector('jh-consumer-nav') as any;
    const anchor = nav.shadowRoot.querySelector('a');
    let prevented = true;
    anchor.addEventListener('click', (event: Event) => {
      prevented = event.defaultPrevented;
      event.preventDefault();
    });
    anchor.click();
    expect(prevented).toBe(false);
    expect(document.querySelector('dialog')?.querySelector('jha-dialog') ?? null).toBeNull();
  });
});
