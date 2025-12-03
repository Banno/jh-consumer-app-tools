// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import { createContext } from '@lit/context';
import Router, { type RouteConfig } from '@jack-henry/web-component-router';

export interface RouterContext {
  router: Router;
  config: RouteConfig;
}

export const defaultRouterContext: RouterContext = {
  router: null,
  config: null,
};

export const routerContext = createContext<RouterContext>(Symbol.for('router'));
