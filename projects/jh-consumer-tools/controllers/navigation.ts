// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import { SSO_LINK_TYPES } from '../constants/sso-types';
import { type Institution, type InstitutionLink } from '../types/institution';
import { type RouteConfig } from '@jack-henry/web-component-router';
import { getIframeRoute } from './navigation-routes';

export interface DisplayLink {
  id: string;
  url: string;
  title: string;
  icon?: string;
  links?: DisplayLink[];
  fdicNotice?: string;
}

export interface NavigationExtras {
  merchantStatus?: string | null;
  hasWireTransfers?: boolean;
}

type LinkAbility = (inst: Institution, extras: NavigationExtras) => boolean | undefined;

type BaseLink = {
  id?: string;
  icon?: string;
  title?: string;
  ability?: LinkAbility;
};

type SSOLink = BaseLink & {
  type: 'sso';
  sso: string;
  route?: string; // route passed to sso to deeplink into sso
};

type PlainLink = BaseLink & {
  type: 'link';
  id: string;
  title: string;
  url?: string;
  links?: NavigationLink[];
};

type NavigationLink = PlainLink | SSOLink;

const BASE_URL = `https://${ONLINE_DOMAIN}`;
const MOBILE_MEDIA_QUERY = '(max-width: 768px)';
const MERCHANT_VISIBLE_STATUSES = [
  'enrolled',
  'enrolling',
  'ineligible',
  'initializing',
  'notEnrolled',
  'pendingReview',
  'enabled',
  'pendingFinalization',
  'errorsExist',
];
const MERCHANT_INSERT_INDEX = 3;

const sso = (type: string, icon: string, extra: Partial<SSOLink> = {}): SSOLink => ({
  type: 'sso',
  sso: type,
  icon,
  ...extra,
});

const hasZelle = (inst: Institution) => ['Send', 'Request', 'Split'].includes(inst.abilities?.zelle);

const BASE_LINKS: NavigationLink[] = [
  { type: 'link', id: 'dashboard', url: `${BASE_URL}/`, title: 'Dashboard', icon: 'dashboard' },
  { type: 'link', id: 'messages', url: `${BASE_URL}/messages`, title: 'Messages', icon: 'envelope' },
  { type: 'link', id: 'accounts', url: `${BASE_URL}/accounts/`, title: 'Accounts', icon: 'wallet' },
  {
    type: 'link',
    id: 'transfers',
    url: `${BASE_URL}/transfers`,
    title: 'Transfers',
    icon: 'arrow-right-arrow-left',
    ability: (inst) => inst.abilities?.schedulableTransfers,
  },
  {
    type: 'link',
    id: 'rapid-transfers',
    url: `${BASE_URL}/rapid-transfers`,
    title: 'Transfers',
    icon: 'arrow-right-arrow-left',
    ability: (inst) => {
      const hasRapidTransfers = inst.abilities?.moovPullFromCard || inst.abilities?.moovPushToCard;
      return Boolean(hasRapidTransfers) && !inst.abilities?.schedulableTransfers;
    },
  },
  sso(SSO_LINK_TYPES.POWER_M2M_TRANSFERS, 'building-columns'),
  {
    type: 'link',
    id: 'remote-deposits',
    url: `${BASE_URL}/remote-deposits`,
    title: 'Remote deposits',
    icon: 'arrow-turn-down-to-bracket',
    ability: (inst) => inst.abilities?.rdc && inst.abilities?.clientSideRDCProvider !== 'Ensenta',
  },
  {
    type: 'link',
    id: 'ensenta-remote-deposits',
    url: `${BASE_URL}/ensenta-remote-deposits`,
    title: 'Deposit checks',
    icon: 'arrow-turn-down-to-bracket',
    ability: (inst) => inst.abilities?.rdc && inst.abilities?.clientSideRDCProvider === 'Ensenta',
  },
  {
    type: 'link',
    id: 'business-remote-deposits',
    url: `${BASE_URL}/business-remote-deposits`,
    title: 'Deposit checks',
    icon: 'arrow-turn-down-to-bracket',
    ability: (inst) => inst.abilities?.rdc && inst.abilities?.businessRdc,
  },
  {
    type: 'link',
    id: 'payments-menu',
    title: 'Payments',
    icon: 'receipt-bill',
    links: [
      {
        type: 'link',
        id: 'bill-pay',
        url: `${BASE_URL}/bill-pay`,
        title: 'Bill pay',
        ability: (inst) => inst.abilities?.billPay,
      },
      sso(SSO_LINK_TYPES.RESPONSIVE_BILL_PAY, 'receipt-bill'),
      {
        type: 'link',
        id: 'zelle',
        url: `${BASE_URL}/zelle`,
        title: 'Send money with Zelle®',
        ability: hasZelle,
      },
      sso(SSO_LINK_TYPES.POSITIVE_PAY, 'shield-dollar-sign'),
      sso(SSO_LINK_TYPES.POWER_SKIP_PAYMENT, 'circle-chevrons-right'),
      {
        type: 'link',
        id: 'positive-pay',
        url: `${BASE_URL}/positive-pay`,
        title: 'Positive pay',
        ability: (inst) => inst.abilities?.positivePay,
      },
      {
        type: 'link',
        id: 'ach-payments',
        url: `${BASE_URL}/payments/ach`,
        title: 'ACH',
        ability: (inst) => inst.abilities?.ach,
      },
      {
        type: 'link',
        id: 'wire-transfers',
        url: `${BASE_URL}/payments/wire-transfers`,
        title: 'Wires',
        ability: (_inst, extras) => extras.hasWireTransfers,
      },
      {
        type: 'link',
        id: 'wires-payments',
        url: `${BASE_URL}/payments/wires`,
        title: 'Wires',
        ability: (inst) => inst.abilities?.wires,
      },
      {
        type: 'link',
        id: 'ach',
        url: `${BASE_URL}/ach`,
        title: 'Approve ACH',
        ability: (inst) => inst.smallBusinessSettings?.ach,
      },
      {
        type: 'link',
        id: 'wires',
        url: `${BASE_URL}/wires`,
        title: 'Approve wires',
        ability: (inst) => ['single', 'dual'].includes(inst.smallBusinessSettings?.wire),
      },
    ],
  },
  sso(SSO_LINK_TYPES.POWER_FULL_VIEW, 'receipt'),
  sso(SSO_LINK_TYPES.CASH_MANAGEMENT, 'building'),
  sso(SSO_LINK_TYPES.INVOICES, 'document-invoice'),
  sso(SSO_LINK_TYPES.DEBT_RELIEF, 'life-preserver'),
  sso(SSO_LINK_TYPES.POWER_MAIN_LOAN_APPLICATION, 'document'),
  sso(SSO_LINK_TYPES.POWER_SECONDARY_LOAN_APPLICATION, 'document-invoice'),
  sso(SSO_LINK_TYPES.PAYROLL_PROTECTION_PROGRAM, 'shield-dollar-sign'),
  sso(SSO_LINK_TYPES.FOREIGN_CURRENCY, 'globe'),
  sso(SSO_LINK_TYPES.BROKERAGE_TOOLS, 'arrow-trend-up'),
  sso(SSO_LINK_TYPES.BROKERAGE_TOOLS_2, 'arrow-trend-up'),
  sso(SSO_LINK_TYPES.PORTFOLIO_MANAGEMENT, 'briefcase'),
  {
    type: 'link',
    id: 'insights-menu',
    title: 'Insights',
    icon: 'lightbulb',
    ability: (inst) => inst.abilities?.geezeoInsights && Boolean(getLinkBySSO(SSO_LINK_TYPES.BUDGET_TOOLS, inst)),
    links: [
      { type: 'link', id: 'insights', title: 'Overview', url: `${BASE_URL}/insights` },
      sso(SSO_LINK_TYPES.BUDGET_TOOLS, 'chart-bar', { id: 'budgets', title: 'Budgets', route: '/m2#/budgets' }),
      sso(SSO_LINK_TYPES.BUDGET_TOOLS, 'chart-bar', { id: 'cashflow', title: 'Cashflow', route: '/m2#/cashflow' }),
      sso(SSO_LINK_TYPES.BUDGET_TOOLS, 'chart-bar', { id: 'goals', title: 'Goals', route: '/m2#/goals' }),
      sso(SSO_LINK_TYPES.BUDGET_TOOLS, 'chart-bar', { id: 'networth', title: 'Net worth', route: '/m2#/networth' }),
      sso(SSO_LINK_TYPES.BUDGET_TOOLS, 'chart-bar', {
        id: 'analyzer',
        title: 'Spending by category',
        route: '/m2#/analyzer',
      }),
    ],
  },
  {
    type: 'link',
    id: 'reports-menu',
    url: `${BASE_URL}/reports/prior-day`,
    title: 'Reports',
    icon: 'document-invoice',
    ability: (inst) => inst.abilities?.cashManagementReports,
  },
  sso(SSO_LINK_TYPES.CARD_CONTROLS_PP_MAIN, 'credit-card'),
  sso(SSO_LINK_TYPES.REWARDS_MAIN, 'star'),
  sso(SSO_LINK_TYPES.CARD_CONTROLS_ONLINE, 'credit-card'),
  sso(SSO_LINK_TYPES.POWER_CARD_CONTROLS, 'credit-card'),
  sso(SSO_LINK_TYPES.POWER_MAIN_REWARDS, 'star'),
  sso(SSO_LINK_TYPES.CREDIT_SCORE, 'gauge'),
  sso(SSO_LINK_TYPES.CHARITABLE_GIVING, 'money-bill-heart'),
  sso(SSO_LINK_TYPES.FORMS, 'document-pen'),
  sso(SSO_LINK_TYPES.POWER_FORMS, 'document-pen'),
  {
    type: 'link',
    id: 'forms',
    url: `${BASE_URL}/forms`,
    title: 'Forms',
    icon: 'document-pen',
    ability: (inst) => inst.abilities?.selfServiceForms,
  },
  sso(SSO_LINK_TYPES.CHECK_PROCESSING, 'money-check'),
  sso(SSO_LINK_TYPES.INSTITUTION_DEFINED_1, 'building-columns'),
  sso(SSO_LINK_TYPES.INSTITUTION_DEFINED_2, 'building-columns'),
  sso(SSO_LINK_TYPES.INSTITUTION_DEFINED_3, 'building-columns'),
  sso(SSO_LINK_TYPES.INSTITUTION_DEFINED_4, 'building-columns'),
  sso(SSO_LINK_TYPES.INSTITUTION_DEFINED_5, 'building-columns'),
  { type: 'link', id: 'support', url: `${BASE_URL}/support`, title: 'Support', icon: 'circle-question-mark' },
];

const MERCHANT_LINK: PlainLink = {
  type: 'link',
  id: 'merchant',
  url: `${BASE_URL}/merchant`,
  title: 'Merchant',
  icon: 'store',
};

const FALLBACK_LINKS: DisplayLink[] = [
  { id: 'dashboard', url: `${BASE_URL}/`, title: 'Dashboard', icon: 'dashboard' },
  { id: 'messages', url: `${BASE_URL}/messages`, title: 'Messages', icon: 'envelope' },
  { id: 'accounts', url: `${BASE_URL}/accounts/`, title: 'Accounts', icon: 'wallet' },
  { id: 'support', url: `${BASE_URL}/support`, title: 'Support', icon: 'circle-question-mark' },
];

export function getFallbackLinks(): DisplayLink[] {
  return FALLBACK_LINKS.map((link) => ({ ...link }));
}

export function getLinkBySSO(linkType: string, institution: Institution): InstitutionLink | undefined {
  if (linkType === SSO_LINK_TYPES.CASH_MANAGEMENT && !institution.isCashManagement) {
    return;
  }
  const ACCOUNT_LEVEL_LINK_TYPES: string[] = [
    SSO_LINK_TYPES.CHECK_REORDERING_BY_ACCOUNT,
    SSO_LINK_TYPES.CREDIT_CARD_CONTROLS,
    SSO_LINK_TYPES.ESTATUS_CONNECT,
    SSO_LINK_TYPES.LOAN_PAYMENT,
    SSO_LINK_TYPES.MORTGAGE_SERVICES,
    SSO_LINK_TYPES.REWARDS,
  ];
  if (ACCOUNT_LEVEL_LINK_TYPES.includes(linkType)) {
    return;
  }
  return (institution.links || []).find((link) => link.linkType === linkType);
}

function hasNavigationData(institution: Institution | null | undefined): institution is Institution {
  if (!institution || typeof institution !== 'object') return false;
  const abilities = institution.abilities as unknown;
  return Boolean(abilities) && typeof abilities === 'object' && Object.keys(abilities as object).length > 0;
}

function isMobile(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(MOBILE_MEDIA_QUERY).matches
    : false;
}

function ownClientId(): string | undefined {
  return typeof CLIENT_ID === 'undefined' ? undefined : CLIENT_ID;
}

function ssoUrl(ssoItem: InstitutionLink, userId: string, route?: string): string {
  const iframeRoute = getIframeRoute(ssoItem.name, ssoItem.linkType);
  if (iframeRoute) {
    return `${BASE_URL}${iframeRoute}`;
  }
  const displayType = isMobile() ? 'mobile' : 'desktop';
  const routeParam = route ? `&route=${route}` : '';
  const redirectUrl = `${BASE_URL}/a/consumer/api/users/${userId}/links/${ssoItem.id}/${displayType}?redirect=true${routeParam}`;
  return `${BASE_URL}/login?returnUrl=${encodeURIComponent(redirectUrl)}`;
}

function passes(link: NavigationLink, institution: Institution, extras: NavigationExtras): boolean {
  return !link.ability || link.ability(institution, extras) === true;
}

export default function getNavigationLinks(
  institution: Institution,
  userId: string,
  routeConfig: RouteConfig[],
  extras: NavigationExtras = {},
): DisplayLink[] {
  if (!hasNavigationData(institution)) {
    return getFallbackLinks();
  }

  function getSsoLink(link: SSOLink): DisplayLink | null {
    const ssoItem = getLinkBySSO(link.sso, institution);
    if (!ssoItem) return null;
    const id = link.id || ssoItem.linkType;
    const title = link.title || ssoItem.title;
    // if the sso matches our client id, this is the link to get to our sso.
    // add child menu links using our apps routeConfig's top level route's subRoutes
    const clientId = ownClientId();
    const top = routeConfig?.[0];
    if (clientId && ssoItem.id === clientId && top?.subRoutes) {
      const links = top.subRoutes.map((route: RouteConfig) => ({
        id: route.id,
        title: route.metaData.title,
        icon: route.metaData.icon,
        url: route.path, // TODO: paths in the routeConfig are router paths.. at the top level, these should all be regular urls. Need to convey/document this
      }));
      return { id, title, icon: link.icon, url: '/', links }; // or use routeConfig[0].path?
    }
    return { id, title, icon: link.icon, url: ssoUrl(ssoItem, userId, link.route), fdicNotice: ssoItem.fdicNotice };
  }

  function getLink(link: NavigationLink): DisplayLink | null {
    if (link.type === 'sso') return getSsoLink(link);
    if (link.links && link.links.length > 0) {
      const links = displayLinks(link.links);
      return { id: link.id, url: link.url || '', title: link.title, icon: link.icon, links };
    }
    return { id: link.id, url: link.url || '', title: link.title, icon: link.icon };
  }

  function linkFilter(link: NavigationLink): boolean {
    const hasAbility = passes(link, institution, extras);
    if (link.type === 'sso') {
      return hasAbility && Boolean(getLinkBySSO(link.sso, institution));
    }
    if (link.links && displayLinks(link.links).length === 0) {
      return false;
    }
    return hasAbility;
  }

  function displayLinks(navLinks: NavigationLink[]): DisplayLink[] {
    return navLinks.filter(linkFilter).map(getLink).filter(Boolean) as DisplayLink[];
  }

  const links = displayLinks(BASE_LINKS);
  if (
    institution.abilities?.merchantAcquisition === true &&
    extras.merchantStatus &&
    MERCHANT_VISIBLE_STATUSES.includes(extras.merchantStatus)
  ) {
    const merchant = getLink(MERCHANT_LINK);
    if (merchant) links.splice(MERCHANT_INSERT_INDEX, 0, merchant);
  }
  return links;
}
