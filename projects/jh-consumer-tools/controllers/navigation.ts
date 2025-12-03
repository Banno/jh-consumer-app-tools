// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import { SSO_LINK_TYPES } from '../constants/sso-types';
import { type Institution, type InstitutionLink } from '../types/institution';
import { type RouteConfig } from '@jack-henry/web-component-router';
export interface DisplayLink {
  id: string;
  url: string;
  title: string;
  icon?: string;
  links?: DisplayLink[];
}

type BaseLink = {
  type: 'link' | 'sso';
  id: string;
  icon?: string;
  title?: string;
};

type SSOLink = BaseLink & {
  type: 'sso';
  sso: string;
  route?: string; // route passed to sso to deeplink into sso
};

type NavigationLink = BaseLink &
  (
    | {
        type: 'link';
        url?: string;
        title: string;
        abilityCheck?: (inst: Institution) => boolean;
        links?: NavigationLink[];
      }
    | SSOLink
  );

const BASE_URL = `https://${ONLINE_DOMAIN}`;

const BASE_LINKS: NavigationLink[] = [
  {
    type: 'link',
    id: 'dashboard',
    url: `${BASE_URL}/`,
    title: 'Dashboard',
    icon: 'dashboard',
  },
  {
    type: 'link',
    id: 'messages',
    url: `${BASE_URL}/messages`,
    title: 'Messages',
    icon: 'envelope',
    abilityCheck: (inst) => inst.abilities.conversations,
  },
  {
    type: 'link',
    id: 'accounts',
    url: `${BASE_URL}/accounts`,
    title: 'Accounts',
    icon: 'wallet',
  },
  {
    type: 'link',
    id: 'transfers',
    url: `${BASE_URL}/transfers`,
    title: 'Transfers',
    icon: 'arrow-right-arrow-left',
    abilityCheck: (inst) => inst.abilities.schedulableTransfers,
  },
  {
    id: 'PowerM2MTransfers',
    type: 'sso',
    sso: 'PowerM2MTransfers',
    icon: 'circle-chevrons-right',
  },
  {
    type: 'link',
    id: 'remote-deposits',
    url: `${BASE_URL}/remote-deposits`,
    title: 'Remote deposits',
    icon: 'arrow-turn-down-to-bracket',
    abilityCheck: (inst) => inst.abilities.rdc && inst.abilities.clientSideRDCProvider !== 'Ensenta',
  },
  {
    type: 'link',
    id: 'ensenta-remote-deposits',
    url: `${BASE_URL}/ensenta-remote-deposits`,
    title: 'Deposit checks',
    icon: 'receipt-bill',
    abilityCheck: (inst) => inst.abilities.rdc && inst.abilities.clientSideRDCProvider === 'Ensenta',
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
        icon: 'bill',
        abilityCheck: (inst) => inst.abilities.billPay,
      },
      {
        type: 'sso',
        id: 'ResponsiveBillPay',
        sso: 'ResponsiveBillPay',
        icon: 'bill',
      },
      {
        type: 'link',
        id: 'zelle',
        url: `${BASE_URL}/zelle`,
        title: 'Send money with Zelle',
        icon: 'circle-dollar',
        abilityCheck: (inst) => ['Send', 'Request', 'Split'].includes(inst.abilities.zelle),
      },
      {
        type: 'sso',
        sso: 'PositivePay',
        id: 'PositivePay',
        icon: 'icon-shield-dollar-sign',
      },
      {
        type: 'sso',
        id: 'PowerSkipPayment',
        sso: 'PowerSkipPayment',
        icon: 'circle-plus',
      },
      {
        type: 'link',
        id: 'positive-pay',
        url: `${BASE_URL}/positive-pay`,
        title: 'Positive pay',
        icon: 'icon-shield-dollar-sign',
        abilityCheck: (inst) => inst.abilities.positivePay,
      },
      {
        type: 'link',
        id: 'ach-payments',
        url: `${BASE_URL}/payments/ach`,
        title: 'ACH',
        icon: 'arrow-from-a',
        abilityCheck: (inst) => inst.abilities.ach,
      },
      {
        type: 'link',
        id: 'wires-payments',
        url: `${BASE_URL}/payments/wires`,
        title: 'Wires',
        icon: 'arrow-from-w',
        abilityCheck: (inst) => inst.abilities.wires,
      },
      {
        type: 'link',
        id: 'ach',
        url: `${BASE_URL}/ach`,
        title: 'Approve ACH',
        icon: 'arrow-from-a',
        abilityCheck: (inst) => inst.smallBusinessSettings.ach,
      },
      {
        type: 'link',
        id: 'wires',
        url: `${BASE_URL}/wires`,
        title: 'Approve wires',
        icon: 'arrow-from-w',
        abilityCheck: (inst) => ['Single', 'Dual'].includes(inst.smallBusinessSettings.wire),
      },
    ],
  },
  {
    type: 'sso',
    id: 'CashManagement',
    sso: 'CashManagement',
    icon: 'building',
  },
  {
    type: 'sso',
    id: 'Invoices',
    sso: 'Invoices',
    icon: 'document-invoice',
  },
  {
    type: 'sso',
    id: 'DebtRelief',
    sso: 'DebtRelief',
    icon: 'life-preserver',
  },
  {
    type: 'sso',
    id: 'PowerMainLoanApplication',
    sso: 'PowerMainLoanApplication',
    icon: 'document',
  },
  {
    type: 'sso',
    id: 'PowerSecondaryLoanApplication',
    sso: 'PowerSecondaryLoanApplication',
    icon: 'document-invoice',
  },
  {
    type: 'sso',
    id: 'PayrollProtectionProgram',
    sso: 'PayrollProtectionProgram',
    icon: 'icon-shield-dollar-sign',
  },
  {
    type: 'sso',
    id: 'ForeignCurrency',
    sso: 'ForeignCurrency',
    icon: 'globe',
  },
  {
    type: 'sso',
    id: 'BrokerageTools',
    sso: 'BrokerageTools',
    icon: 'arrow-trend-up',
  },
  {
    type: 'sso',
    id: 'BrokerageTools2',
    sso: 'BrokerageTools2',
    icon: 'arrow-trend-up',
  },
  {
    type: 'sso',
    id: 'PortfolioManagement',
    sso: 'PortfolioManagement',
    icon: 'briefcase',
  },
  {
    type: 'link',
    id: 'insights-menu',
    title: 'Insights',
    icon: 'lightbulb',
    abilityCheck: (inst) => inst.abilities.geezeoInsights && Boolean(getLinkBySSO('BudgetTools', inst)),
    links: [
      {
        type: 'link',
        id: 'insights',
        title: 'Overview',
        url: `${BASE_URL}/insights`,
        icon: 'lightbulb',
      },
      {
        type: 'sso',
        id: 'budgets',
        title: 'Budgets',
        sso: 'BudgetTools',
        route: '/m2#/budgets',
        icon: 'chart-bar',
      },
      {
        type: 'sso',
        id: 'cashflow',
        title: 'Cashflow',
        sso: 'BudgetTools',
        route: '/m2#/cashflow',
        icon: 'chart-bar',
      },
      {
        type: 'sso',
        id: 'goals',
        title: 'Goals',
        sso: 'BudgetTools',
        route: '/m2#/goals',
        icon: 'chart-bar',
      },
      {
        type: 'sso',
        id: 'networth',
        title: 'Net Worth',
        sso: 'BudgetTools',
        route: '/m2#/networth',
        icon: 'chart-bar',
      },
      {
        type: 'sso',
        id: 'spending-by-category',
        title: 'Spending by category',
        sso: 'BudgetTools',
        route: '/m2#/analyzer',
        icon: 'chart-bar',
      },
    ],
  },
  {
    type: 'link',
    id: 'reports-menu',
    url: `${BASE_URL}/reports/prior-day`,
    title: 'Reports',
    icon: 'document-invoice',
    abilityCheck: (inst) => inst.abilities.cashManagementReports,
  },
  {
    type: 'sso',
    id: 'RewardsMain',
    sso: 'RewardsMain',
    icon: 'star',
  },
  {
    type: 'sso',
    id: 'CardControlsOnline',
    sso: 'CardControlsOnline',
    icon: 'credit-card',
  },
  {
    type: 'sso',
    id: 'PowerCardControls',
    sso: 'PowerCardControls',
    icon: 'credit-card',
  },
  {
    type: 'sso',
    id: 'PowerMainRewards',
    sso: 'PowerMainRewards',
    icon: 'star',
  },
  {
    type: 'sso',
    id: 'CreditScore',
    sso: 'CreditScore',
    icon: 'gauge',
  },
  {
    type: 'sso',
    id: 'CharitableGiving',
    sso: 'CharitableGiving',
    icon: 'money-bill-heart',
  },
  {
    type: 'sso',
    id: 'Forms',
    sso: 'Forms',
    icon: 'document-pen',
  },
  {
    type: 'sso',
    id: 'PowerForms',
    sso: 'PowerForms',
    icon: 'document-pen',
  },
  {
    type: 'link',
    id: 'forms',
    url: `${BASE_URL}/forms`,
    title: 'Forms',
    icon: 'document-pen',
    // @ts-expect-error this property isn't documented
    abilityCheck: (inst) => inst.abilities.selfServiceForms,
  },
  {
    type: 'sso',
    id: 'CheckProcessing',
    sso: 'CheckProcessing',
    icon: 'money-check',
  },
  {
    type: 'link',
    id: 'support',
    url: `${BASE_URL}/support`,
    title: 'Support',
    icon: 'question',
  },
];

export function getLinkBySSO(linkType: string, institution: Institution): InstitutionLink | undefined {
  if (linkType === SSO_LINK_TYPES.CASH_MANAGEMENT && !institution.isCashManagement) {
    return;
  }
  const ACCOUNT_LEVEL_LINK_TYPES = [
    SSO_LINK_TYPES.CHECK_REORDERING_BY_ACCOUNT,
    SSO_LINK_TYPES.CREDIT_CARD_CONTROLS,
    SSO_LINK_TYPES.ESTATUS_CONNECT,
    SSO_LINK_TYPES.LOAN_PAYMENT,
    SSO_LINK_TYPES.MORTGAGE_SERVICES,
    SSO_LINK_TYPES.REWARDS,
  ];
  if (ACCOUNT_LEVEL_LINK_TYPES.includes(linkType as any)) {
    return;
  }
  return (institution.links || []).find((link) => link.linkType === linkType);
}

export default function getNavigationLinks(
  institution: Institution,
  userId: string,
  routeConfig: RouteConfig[],
): DisplayLink[] {
  function getSsoLink(link: SSOLink): DisplayLink | null {
    const ssoItem = getLinkBySSO(link.sso, institution);
    if (!ssoItem) return null;
    const redirectUrl = `${BASE_URL}/a/consumer/api/users/${userId}/links/${ssoItem.id}/desktop?redirect=true`;
    // if the sso matches our client id, this is the link to get to our sso.
    // add child menu links using our apps routeConfig's top level route's subRoutes
    if (ssoItem.id === CLIENT_ID) {
      const top = routeConfig[0] as RouteConfig;
      const links = top.subRoutes.map((route: RouteConfig) => ({
        id: route.id,
        title: route.metaData.title,
        icon: route.metaData.icon,
        url: route.path, // TODO: paths in the routeConfig are router paths.. at the top level, these should all be regular urls. Need to convey/document this
      }));
      return {
        id: link.id || ssoItem.linkType,
        title: link.title || ssoItem.title,
        icon: link.icon,
        url: `/`, // or use routeConfig[0].path?
        links,
      };
    }
    return {
      id: link.id || ssoItem.linkType,
      title: link.title || ssoItem.title,
      icon: link.icon,
      url: `${BASE_URL}/login?returnUrl=${redirectUrl}`,
    };
  }

  function getLink(link: NavigationLink): DisplayLink | null {
    if (link.type === 'sso') {
      return getSsoLink(link as SSOLink);
    } else if (link.type === 'link') {
      if (link.links && link.links.length > 0) {
        const links = displayLinks(link.links);
        if (links.length === 0) {
          return null;
        }
        // Ensure url is present for DisplayLink
        return {
          id: link.id,
          url: link.url || '',
          title: link.title,
          icon: link.icon,
          links,
        };
      }
      if ('abilityCheck' in link && link.abilityCheck && !link.abilityCheck(institution)) {
        return null;
      }
      // Ensure url is present for DisplayLink
      return {
        id: link.id,
        url: link.url || '',
        title: link.title,
        icon: link.icon,
      };
    }
    return null;
  }

  function linkFilter(link: NavigationLink): boolean {
    let hasAbility = true;
    if ('abilityCheck' in link && link.abilityCheck) {
      hasAbility = link.abilityCheck(institution) === true;
    }
    if (link.type === 'sso' && 'sso' in link) {
      return hasAbility && Boolean(getLinkBySSO(link.sso, institution));
    }
    if (link.type === 'link' && 'links' in link && link.links && displayLinks(link.links).length === 0) {
      return false;
    }
    return hasAbility;
  }

  function displayLinks(navLinks: NavigationLink[]): DisplayLink[] {
    return navLinks.filter(linkFilter).map(getLink).filter(Boolean) as DisplayLink[];
  }

  return displayLinks(BASE_LINKS);
}
