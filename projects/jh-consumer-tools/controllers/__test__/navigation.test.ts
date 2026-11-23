// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi, afterEach } from 'vitest';
import getNavigationLinks, { getFallbackLinks, getLinkBySSO } from '../navigation';
import { getIframeRoute } from '../navigation-routes';
import { ids, makeInstitution } from './fixtures';

const USER = 'user-1';
const BASE = 'https://online.example.com';
const build = (inst: ReturnType<typeof makeInstitution>, extras = {}, routeConfig: any = []) =>
  getNavigationLinks(inst, USER, routeConfig, extras);
const find = (links: any[], id: string) => links.find((link) => link.id === id);
const hasPayments = (links: any[]) => links.some((link) => link.id === 'payments-menu');

afterEach(() => vi.unstubAllGlobals());

describe('menu for a user with few abilities', () => {
  it('shows only the items that need nothing', () => {
    expect(ids(build(makeInstitution()))).toEqual(['dashboard', 'messages', 'accounts', 'support']);
  });

  it('always shows messages', () => {
    const links = build(makeInstitution({ conversations: false }));
    expect(find(links, 'messages')).toBeTruthy();
  });
});

describe('main items', () => {
  it('links to the standard pages', () => {
    const urls = Object.fromEntries(build(makeInstitution()).map((link) => [link.id, link.url]));
    expect(urls).toEqual({
      dashboard: `${BASE}/`,
      messages: `${BASE}/messages`,
      accounts: `${BASE}/accounts/`,
      support: `${BASE}/support`,
    });
  });
});

describe('transfers', () => {
  it('shows scheduled transfers when they are on', () => {
    const links = build(makeInstitution({ schedulableTransfers: true }));
    expect(ids(links)).toContain('transfers');
    expect(ids(links)).not.toContain('rapid-transfers');
  });

  it('shows rapid transfers only when scheduled transfers are off', () => {
    expect(ids(build(makeInstitution({ moovPullFromCard: true })))).toContain('rapid-transfers');
    expect(ids(build(makeInstitution({ moovPushToCard: true })))).toContain('rapid-transfers');
    expect(ids(build(makeInstitution({ moovPushToCard: true, schedulableTransfers: true })))).not.toContain(
      'rapid-transfers',
    );
    expect(ids(build(makeInstitution()))).not.toContain('rapid-transfers');
  });

  it('needs the ability to be exactly true', () => {
    expect(ids(build(makeInstitution({ schedulableTransfers: 'yes' })))).not.toContain('transfers');
  });

  it('labels rapid transfers like the scheduled item', () => {
    const link = find(build(makeInstitution({ moovPullFromCard: true })), 'rapid-transfers');
    expect(link.title).toBe('Transfers');
    expect(link.url).toBe(`${BASE}/rapid-transfers`);
  });
});

describe('remote deposits', () => {
  it('shows the standard item', () => {
    expect(ids(build(makeInstitution({ rdc: true })))).toContain('remote-deposits');
  });
  it('shows the Ensenta item instead for that provider', () => {
    const links = build(makeInstitution({ rdc: true, clientSideRDCProvider: 'Ensenta' }));
    expect(ids(links)).toContain('ensenta-remote-deposits');
    expect(ids(links)).not.toContain('remote-deposits');
  });
  it('shows the business item only with the business ability', () => {
    expect(ids(build(makeInstitution({ rdc: true })))).not.toContain('business-remote-deposits');
    expect(ids(build(makeInstitution({ businessRdc: true })))).not.toContain('business-remote-deposits');
    const link = find(build(makeInstitution({ rdc: true, businessRdc: true })), 'business-remote-deposits');
    expect(link.title).toBe('Deposit checks');
    expect(link.url).toBe(`${BASE}/business-remote-deposits`);
  });
});

describe('payments group', () => {
  it('is removed when it has no children', () => {
    expect(hasPayments(build(makeInstitution()))).toBe(false);
  });

  it.each(['Send', 'Request', 'Split'])('shows zelle at the %s level', (level) => {
    expect(hasPayments(build(makeInstitution({ zelle: level })))).toBe(true);
  });

  it('hides zelle when it is off', () => {
    expect(hasPayments(build(makeInstitution({ zelle: 'None' })))).toBe(false);
  });

  it.each([
    ['single', true],
    ['dual', true],
    ['none', false],
  ])('approve wires with wire setting %s -> %s', (wire, shown) => {
    const inst = makeInstitution({}, [], { smallBusinessSettings: { wire } });
    expect(hasPayments(build(inst))).toBe(shown);
  });
});

describe('wire transfers', () => {
  const inst = makeInstitution({ wires: true });
  it('is left out without the entitlement', () => {
    expect(find(build(inst), 'payments-menu').links.map((l: any) => l.id)).toEqual(['wires-payments']);
    expect(find(build(inst, { hasWireTransfers: false }), 'payments-menu').links.map((l: any) => l.id)).toEqual([
      'wires-payments',
    ]);
  });
  it('shows before business wires with the entitlement', () => {
    const group = find(build(inst, { hasWireTransfers: true }), 'payments-menu');
    expect(group.links.map((l: any) => l.id)).toEqual(['wire-transfers', 'wires-payments']);
    expect(group.links[0].url).toBe(`${BASE}/payments/wire-transfers`);
    expect(group.links[0].title).toBe('Wires');
  });
  it('can be the only child of the group', () => {
    expect(ids(build(makeInstitution(), { hasWireTransfers: true }))).toContain('payments-menu[wire-transfers]');
  });
});

describe('merchant', () => {
  const inst = makeInstitution({ merchantAcquisition: true, schedulableTransfers: true });
  it('is inserted as the fourth item', () => {
    const links = build(inst, { merchantStatus: 'enrolled' });
    expect(ids(links).slice(0, 5)).toEqual(['dashboard', 'messages', 'accounts', 'merchant', 'transfers']);
    expect(find(links, 'merchant')).toMatchObject({ title: 'Merchant', url: `${BASE}/merchant`, icon: 'store' });
  });
  it('goes after fewer than three items when there are fewer', () => {
    const links = getNavigationLinks(inst, USER, [], { merchantStatus: 'notEnrolled' });
    expect(ids(links).indexOf('merchant')).toBe(3);
  });
  it('is hidden without the ability', () => {
    expect(ids(build(makeInstitution(), { merchantStatus: 'enrolled' }))).not.toContain('merchant');
  });
  it('is hidden without a status', () => {
    expect(ids(build(inst))).not.toContain('merchant');
    expect(ids(build(inst, { merchantStatus: null }))).not.toContain('merchant');
  });
});

describe('links that open other products', () => {
  it('skips types the user does not have', () => {
    expect(ids(build(makeInstitution({}, [{ linkType: 'PowerFullView' }])))).toContain('PowerFullView');
    expect(ids(build(makeInstitution()))).not.toContain('PowerFullView');
  });

  it('puts institution defined links just above support', () => {
    const inst = makeInstitution(
      { selfServiceForms: true },
      ['InstitutionDefined5', 'InstitutionDefined2', 'InstitutionDefined1', 'InstitutionDefined4'].map((linkType) => ({
        linkType,
      })),
    );
    expect(ids(build(inst)).slice(-6)).toEqual([
      'forms',
      'InstitutionDefined1',
      'InstitutionDefined2',
      'InstitutionDefined4',
      'InstitutionDefined5',
      'support',
    ]);
  });

  it('uses the title and id from the institution link', () => {
    const link = find(
      build(makeInstitution({}, [{ linkType: 'DebtRelief', title: 'Get help', id: 'abc' }])),
      'DebtRelief',
    );
    expect(link.title).toBe('Get help');
  });

  it('needs the cash management setting for cash management', () => {
    const links = [{ linkType: 'CashManagement' }];
    expect(ids(build(makeInstitution({}, links)))).not.toContain('CashManagement');
    expect(ids(build(makeInstitution({}, links, { isCashManagement: true })))).toContain('CashManagement');
  });

  it('ignores account level link types', () => {
    expect(ids(build(makeInstitution({}, [{ linkType: 'Rewards' }, { linkType: 'LoanPayment' }])))).toEqual([
      'dashboard',
      'messages',
      'accounts',
      'support',
    ]);
  });
});

describe('where links go', () => {
  const stub = (matches: boolean) => vi.stubGlobal('window', { matchMedia: () => ({ matches }) });
  const inst = makeInstitution({}, [{ linkType: 'DebtRelief', id: 'link-9' }]);

  it('signs in and redirects for a regular link', () => {
    const url = new URL(find(build(inst), 'DebtRelief').url);
    expect(url.origin + url.pathname).toBe(`${BASE}/login`);
    expect(url.searchParams.get('returnUrl')).toBe(
      `${BASE}/a/consumer/api/users/${USER}/links/link-9/desktop?redirect=true`,
    );
  });

  it('asks for the mobile version on a small screen', () => {
    stub(true);
    const returnUrl = new URL(find(build(inst), 'DebtRelief').url).searchParams.get('returnUrl');
    expect(returnUrl).toContain('/link-9/mobile?redirect=true');
  });

  it('keeps the whole destination inside the return url', () => {
    const insights = makeInstitution({ geezeoInsights: true }, [{ linkType: 'BudgetTools', id: 'bt' }]);
    const group = find(build(insights), 'insights-menu');
    const budgets = find(group.links, 'budgets');
    const parsed = new URL(budgets.url);
    expect(parsed.hash).toBe('');
    expect(parsed.searchParams.get('returnUrl')).toBe(
      `${BASE}/a/consumer/api/users/${USER}/links/bt/desktop?redirect=true&route=/m2#/budgets`,
    );
    const routes = group.links
      .slice(1)
      .map((l: any) => new URL(l.url).searchParams.get('returnUrl')?.split('route=')[1]);
    expect(new Set(routes).size).toBe(5);
  });

  it('opens embedded links at the in-app route', () => {
    const embedded = makeInstitution({}, [{ linkType: 'PowerFullView' }, { linkType: 'PowerM2MTransfers' }]);
    const links = build(embedded);
    expect(find(links, 'PowerFullView').url).toBe(`${BASE}/power-full-view`);
    expect(find(links, 'PowerM2MTransfers').url).toBe(`${BASE}/m2m-transfers`);
  });

  it('opens bill pay in app only for known link names', () => {
    const known = makeInstitution({}, [{ linkType: 'ResponsiveBillPay', name: 'usa-epay' }]);
    const other = makeInstitution({}, [{ linkType: 'ResponsiveBillPay', name: 'something-else' }]);
    expect(find(find(build(known), 'payments-menu').links, 'ResponsiveBillPay').url).toBe(`${BASE}/usa-epay`);
    expect(find(find(build(other), 'payments-menu').links, 'ResponsiveBillPay').url).toContain('/login?returnUrl=');
  });

  it('passes the notice text along', () => {
    const noticed = makeInstitution({}, [{ linkType: 'DebtRelief', fdicNotice: 'You are leaving.' }]);
    expect(find(build(noticed), 'DebtRelief').fdicNotice).toBe('You are leaving.');
  });
});

describe('the app link', () => {
  const routeConfig = [
    {
      subRoutes: [
        { id: 'one', path: '/one', metaData: { title: 'One', icon: 'gear' } },
        { id: 'two', path: '/two', metaData: { title: 'Two' } },
      ],
    },
  ];

  it('shows the app routes under the link that belongs to the app, for any link type', () => {
    for (const linkType of ['DebtRelief', 'InstitutionDefined3', 'PortfolioManagement']) {
      const inst = makeInstitution({}, [{ linkType, id: 'own-client-id', title: 'My app' }]);
      const link = find(build(inst, {}, routeConfig), linkType);
      expect(link.title).toBe('My app');
      expect(link.url).toBe('/');
      expect(link.links.map((l: any) => [l.id, l.url, l.title])).toEqual([
        ['one', '/one', 'One'],
        ['two', '/two', 'Two'],
      ]);
    }
  });

  it('is a plain link without a route config', () => {
    const inst = makeInstitution({}, [{ linkType: 'DebtRelief', id: 'own-client-id' }]);
    expect(find(build(inst), 'DebtRelief').links).toBeUndefined();
  });
});

describe('merchant statuses', () => {
  const inst = makeInstitution({ merchantAcquisition: true });
  it.each([
    ['enrolled', true],
    ['enrolling', true],
    ['ineligible', true],
    ['initializing', true],
    ['notEnrolled', true],
    ['pendingReview', true],
    ['enabled', true],
    ['pendingFinalization', true],
    ['errorsExist', true],
    ['cannotEnroll', false],
    ['disabled', false],
    ['something-new', false],
    ['', false],
  ])('status %s shows merchant: %s', (status, shown) => {
    expect(ids(build(inst, { merchantStatus: status })).includes('merchant')).toBe(shown);
  });
});

describe('whole menu', () => {
  const everyType = [
    'PowerM2MTransfers',
    'ResponsiveBillPay',
    'PositivePay',
    'PowerSkipPayment',
    'PowerFullView',
    'CashManagement',
    'Invoices',
    'DebtRelief',
    'PowerMainLoanApplication',
    'PowerSecondaryLoanApplication',
    'PayrollProtectionProgram',
    'ForeignCurrency',
    'BrokerageTools',
    'BrokerageTools2',
    'PortfolioManagement',
    'BudgetTools',
    'CardControlsPPMain',
    'RewardsMain',
    'CardControlsOnline',
    'PowerCardControls',
    'PowerMainRewards',
    'CreditScore',
    'CharitableGiving',
    'Forms',
    'PowerForms',
    'CheckProcessing',
    'InstitutionDefined1',
    'InstitutionDefined2',
    'InstitutionDefined3',
    'InstitutionDefined4',
    'InstitutionDefined5',
  ];
  const full = () =>
    makeInstitution(
      {
        schedulableTransfers: true,
        rdc: true,
        businessRdc: true,
        billPay: true,
        zelle: 'Split',
        positivePay: true,
        ach: true,
        wires: true,
        geezeoInsights: true,
        cashManagementReports: true,
        selfServiceForms: true,
        merchantAcquisition: true,
        moovPullFromCard: true,
      },
      everyType.map((linkType) => ({ linkType, name: linkType === 'ResponsiveBillPay' ? 'usa-epay' : undefined })),
      { isCashManagement: true, smallBusinessSettings: { ach: true, wire: 'dual' } },
    );
  const extras = { merchantStatus: 'enrolled', hasWireTransfers: true };

  it('lists every item in order, with its title and icon', () => {
    const rows = build(full(), extras).map((link) => [
      link.id,
      link.title,
      link.icon,
      link.links?.map((c: any) => `${c.id}:${c.title}:${c.icon ?? ''}`),
    ]);
    expect(rows).toEqual([
      ['dashboard', 'Dashboard', 'dashboard', undefined],
      ['messages', 'Messages', 'envelope', undefined],
      ['accounts', 'Accounts', 'wallet', undefined],
      ['merchant', 'Merchant', 'store', undefined],
      ['transfers', 'Transfers', 'arrow-right-arrow-left', undefined],
      ['PowerM2MTransfers', 'PowerM2MTransfers title', 'building-columns', undefined],
      ['remote-deposits', 'Remote deposits', 'arrow-turn-down-to-bracket', undefined],
      ['business-remote-deposits', 'Deposit checks', 'arrow-turn-down-to-bracket', undefined],
      [
        'payments-menu',
        'Payments',
        'receipt-bill',
        [
          'bill-pay:Bill pay:',
          'ResponsiveBillPay:ResponsiveBillPay title:receipt-bill',
          'zelle:Send money with Zelle®:',
          'PositivePay:PositivePay title:shield-dollar-sign',
          'PowerSkipPayment:PowerSkipPayment title:circle-chevrons-right',
          'positive-pay:Positive pay:',
          'ach-payments:ACH:',
          'wire-transfers:Wires:',
          'wires-payments:Wires:',
          'ach:Approve ACH:',
          'wires:Approve wires:',
        ],
      ],
      ['PowerFullView', 'PowerFullView title', 'receipt', undefined],
      ['CashManagement', 'CashManagement title', 'building', undefined],
      ['Invoices', 'Invoices title', 'document-invoice', undefined],
      ['DebtRelief', 'DebtRelief title', 'life-preserver', undefined],
      ['PowerMainLoanApplication', 'PowerMainLoanApplication title', 'document', undefined],
      ['PowerSecondaryLoanApplication', 'PowerSecondaryLoanApplication title', 'document-invoice', undefined],
      ['PayrollProtectionProgram', 'PayrollProtectionProgram title', 'shield-dollar-sign', undefined],
      ['ForeignCurrency', 'ForeignCurrency title', 'globe', undefined],
      ['BrokerageTools', 'BrokerageTools title', 'arrow-trend-up', undefined],
      ['BrokerageTools2', 'BrokerageTools2 title', 'arrow-trend-up', undefined],
      ['PortfolioManagement', 'PortfolioManagement title', 'briefcase', undefined],
      [
        'insights-menu',
        'Insights',
        'lightbulb',
        [
          'insights:Overview:',
          'budgets:Budgets:chart-bar',
          'cashflow:Cashflow:chart-bar',
          'goals:Goals:chart-bar',
          'networth:Net worth:chart-bar',
          'analyzer:Spending by category:chart-bar',
        ],
      ],
      ['reports-menu', 'Reports', 'document-invoice', undefined],
      ['CardControlsPPMain', 'CardControlsPPMain title', 'credit-card', undefined],
      ['RewardsMain', 'RewardsMain title', 'star', undefined],
      ['CardControlsOnline', 'CardControlsOnline title', 'credit-card', undefined],
      ['PowerCardControls', 'PowerCardControls title', 'credit-card', undefined],
      ['PowerMainRewards', 'PowerMainRewards title', 'star', undefined],
      ['CreditScore', 'CreditScore title', 'gauge', undefined],
      ['CharitableGiving', 'CharitableGiving title', 'money-bill-heart', undefined],
      ['Forms', 'Forms title', 'document-pen', undefined],
      ['PowerForms', 'PowerForms title', 'document-pen', undefined],
      ['forms', 'Forms', 'document-pen', undefined],
      ['CheckProcessing', 'CheckProcessing title', 'money-check', undefined],
      ['InstitutionDefined1', 'InstitutionDefined1 title', 'building-columns', undefined],
      ['InstitutionDefined2', 'InstitutionDefined2 title', 'building-columns', undefined],
      ['InstitutionDefined3', 'InstitutionDefined3 title', 'building-columns', undefined],
      ['InstitutionDefined4', 'InstitutionDefined4 title', 'building-columns', undefined],
      ['InstitutionDefined5', 'InstitutionDefined5 title', 'building-columns', undefined],
      ['support', 'Support', 'circle-question-mark', undefined],
    ]);
  });

  it('opens every embedded type inside the app', () => {
    const urls = Object.fromEntries(
      build(full(), extras)
        .flatMap((link) => [link, ...(link.links ?? [])])
        .map((link: any) => [link.id, link.url]),
    );
    expect(urls).toMatchObject({
      PowerM2MTransfers: `${BASE}/m2m-transfers`,
      ResponsiveBillPay: `${BASE}/usa-epay`,
      PowerSkipPayment: `${BASE}/skip-a-pay`,
      PowerFullView: `${BASE}/power-full-view`,
      PowerMainLoanApplication: `${BASE}/power-main-loan-application`,
      PowerSecondaryLoanApplication: `${BASE}/power-secondary-loan-application`,
      CardControlsPPMain: `${BASE}/card-controls-pp-main`,
      PowerMainRewards: `${BASE}/power-main-rewards`,
      PowerCardControls: `${BASE}/power-card-controls`,
      PowerForms: `${BASE}/power-forms/`,
    });
    for (const id of [
      'CashManagement',
      'Invoices',
      'DebtRelief',
      'BrokerageTools',
      'RewardsMain',
      'InstitutionDefined1',
    ]) {
      expect(urls[id]).toContain('/login?returnUrl=');
    }
  });
});

describe('links handled elsewhere', () => {
  it.each([
    'CheckReorderingByAccount',
    'CreditCardControls',
    'EStatusConnect',
    'LoanPayment',
    'MortgageServices',
    'Rewards',
  ])('%s is never a menu link', (linkType) => {
    expect(getLinkBySSO(linkType, makeInstitution({}, [{ linkType }]))).toBeUndefined();
  });
  it('finds other link types', () => {
    expect(getLinkBySSO('DebtRelief', makeInstitution({}, [{ linkType: 'DebtRelief' }]))?.linkType).toBe('DebtRelief');
  });
});

describe('when the record is not usable', () => {
  it.each([undefined, null, {}, { abilities: {}, links: [] }, { abilities: {} }])(
    'shows the short menu for %j',
    (value) => {
      expect(getNavigationLinks(value as any, USER, [])).toEqual(getFallbackLinks());
    },
  );

  it('has only items that need nothing', () => {
    expect(ids(getFallbackLinks())).toEqual(['dashboard', 'messages', 'accounts', 'support']);
  });

  it('builds the menu from abilities when links are missing', () => {
    const noLinks = { abilities: { schedulableTransfers: true } } as any;
    expect(ids(build(noLinks))).toEqual(['dashboard', 'messages', 'accounts', 'transfers', 'support']);
  });

  it('does not throw on partial data', () => {
    const partial = { abilities: { rdc: true }, links: [], smallBusinessSettings: undefined } as any;
    expect(() => build(partial)).not.toThrow();
  });
});

describe('embedded link routes', () => {
  it.each([
    ['PowerSkipPayment', 'anything', '/skip-a-pay'],
    ['ResponsiveBillPay', 'ipay', '/usa-epay'],
    ['ResponsiveBillPay', 'IPAY', '/usa-epay'],
    ['ResponsiveBillPay', 'nothing', undefined],
    ['DebtRelief', 'ipay', undefined],
  ])('%s named %s -> %s', (type, name, expected) => {
    expect(getIframeRoute(name, type)).toBe(expected);
  });
});
