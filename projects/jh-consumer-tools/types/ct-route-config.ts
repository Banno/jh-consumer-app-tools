// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import { type RouteConfig } from '@jack-henry/web-component-router';
export type CTRouteConfig = Omit<RouteConfig, 'metaData' | 'beforeEnter' | 'params' | 'subRoutes'> & {
  metaData?: RouteConfig['metaData'];
  beforeEnter?: RouteConfig['beforeEnter'];
  params?: RouteConfig['params'];
  subRoutes?: CTRouteConfig[];
};
