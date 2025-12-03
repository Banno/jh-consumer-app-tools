// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import { type CTRouteConfig } from '@jack-henry/consumer-tools/types/ct-route-config';

const routeConfig: CTRouteConfig[] = [
  {
    id: 'example-consumer-app',
    tagName: 'example-consumer-app',
    authenticated: true,
    path: '',
    subRoutes: [
      {
        id: 'dashboard',
        tagName: 'example-consumer-app-dashboard',
        path: '/',
        subRoutes: [],
        authenticated: true,
        beforeEnter: async () => {
          import('../components/example-consumer-app-dashboard');
        },
        metaData: { title: 'Dashboard', icon: 'dashboard' },
      },
      {
        id: 'accounts',
        tagName: 'example-consumer-app-accounts',
        path: '/accounts',
        subRoutes: [],
        authenticated: true,
        beforeEnter: async () => {
          import('../components/example-consumer-app-accounts');
        },
        metaData: { title: 'Accounts', icon: 'wallet' },
      },
      {
        id: 'transactions',
        tagName: 'example-consumer-app-transactions',
        path: '/transactions',
        subRoutes: [],
        authenticated: true,
        beforeEnter: async () => {
          import('../components/example-consumer-app-transactions');
        },
        metaData: { title: 'Transactions', icon: 'briefcase' },
      },
    ],
  },
];

export default routeConfig;
