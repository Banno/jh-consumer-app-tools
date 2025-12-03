// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import { LitElement, html, css, unsafeCSS } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { provide } from '@lit/context';
import Router from '@jack-henry/web-component-router';
import { RoutingMixin } from '@jack-henry/web-component-router/lib/routing.mixin.js';
import LoginController, { type User } from '../controllers/login-controller';
import { loadInstitution } from '../controllers/institution-controller';
import { type Institution } from '../types/institution';
import { userContext, defaultUserContext, type UserContext } from '../contexts/user';
import { institutionContext, defaultInstitutionContext, type InstitutionContext } from '../contexts/institution';
import { routerContext, defaultRouterContext, type RouterContext } from '../contexts/router';
import DialogUtil from '../utils/dialog-util.js';
import { buttonReset } from '../styles/consumer-styles.js';

import '@jack-henry/jh-elements/components/progress/progress';
import './nav/jh-consumer-sidebar';

// import class explicitly to use it when creating the mobile menu dialog
import JHConsumerSidebar from './nav/jh-consumer-sidebar';
import './layout/jh-page-container';
import './layout/jh-background-hero';

const baseRouterConfig = {
  id: 'root',
  tagName: 'jh-consumer-nav',
  authenticated: false,
  params: [],
  path: '',
  subRoutes: [
    {
      id: 'login',
      tagName: 'jh-consumer-login',
      authenticated: false,
      params: [],
      path: '/login',
      beforeEnter: async () => import('./login/jh-consumer-login'),
    },
  ], // add app's routes as subRoutes at runtime when routeConfig is set.
};

@customElement('jh-consumer-layout')
export default class JhConsumerLayout extends RoutingMixin(LitElement) {
  @property({ type: String, attribute: 'institution-id' })
  institutionId: string = '';

  @property({ attribute: 'authenticated', type: Boolean, reflect: true })
  authenticated = false;

  @state()
  _routeConfig = null;

  @provide({ context: userContext })
  @property({ type: Object })
  _user: UserContext = {
    ...defaultUserContext,
    ...{ user: LoginController.user, state: LoginController.user ? 'authenticated' : 'unauthenticated' },
  };

  // provide institution context
  @provide({ context: institutionContext })
  @property({ type: Object })
  institution: InstitutionContext = { ...defaultInstitutionContext };

  @property({ type: String })
  heading: string = '';

  @provide({ context: routerContext })
  routerContext: RouterContext = { ...defaultRouterContext };

  private router!: Router;

  constructor() {
    super();
    // import icons
    import('@jack-henry/jh-icons/icons-wc/icon-bars.js');
  }

  set routeConfig(appRouteConfig) {
    if (!this._routeConfig) {
      const subRoutes = [...baseRouterConfig.subRoutes, ...appRouteConfig];
      this._routeConfig = { ...baseRouterConfig, ...{ subRoutes } };
      this.router = new Router(this._routeConfig);
      this.router.routeTree.getValue().element = this;
      this.router.start();
      // expose router and appRouteConfig (not complete route config)
      this.routerContext = { router: this.router, config: appRouteConfig };
    }
  }

  set user(newValue: UserContext) {
    const existingId = this._user.user?.sub;
    this._user = newValue;

    if ((this.user.user?.sub && this.user.user.sub !== existingId) || this.institution.state === 'initial') {
      // only try to load institution if user id is different
      this.updateInstitution();
    }
  }

  get user(): UserContext {
    return this._user;
  }

  async updateInstitution() {
    this.institution = { ...this.institution, ...{ state: 'loading' } };
    let institution: Institution;
    try {
      institution = await loadInstitution(this.institutionId, this._user.user.sub);
    } catch (e) {
      this.institution = { ...this.institution, ...{ state: 'error' } };
      return;
    }
    this.institution = { ...this.institution, ...{ institution: institution, state: 'ready' } };
  }

  async routeEnter(currentNode, nextNodeIfExists, routeId, context) {
    const destinationNode = this.router.routeTree.getNodeByKey(routeId);
    this.heading = destinationNode.getValue().metaData.title || '';
    if (!destinationNode.requiresAuthentication()) {
      // route doesn't require authentication
      return super.routeEnter(currentNode, nextNodeIfExists, routeId, context);
    }
    // route does require authentication. check for validity
    const nextState = this.user.state === 'authenticated' ? 'checking' : 'loading';
    this.user = { state: nextState, ...{ user: LoginController.user } };
    // hard block before moving to the route
    // const isAuthenticated = await LoginController.isAuthenticated();
    // if (!isAuthenticated) {
    //   this.user = { state: 'unauthenticated', ...{ user: LoginController.user } };
    //   return;
    // }
    // this.user = { state: 'authenticated', ...{ user: LoginController.user } };

    // don't wait for auth validation, but logout if unauthenticated
    LoginController.isAuthenticated().then((isAuthenticated) => {
      if (!isAuthenticated) {
        this.user = { state: 'unauthenticated', ...{ user: LoginController.user } };
        this.authenticated = false;

        if (routeId !== 'login') {
          LoginController.logout();
          this.router.go('/login'); // could skip login screen and go to the /auth route directly?
        }
        return;
      }
      this.authenticated = true;
      this.user = { state: 'authenticated', ...{ user: LoginController.user } };
    });
    // allow the router to continue even if unauthenticated
    return super.routeEnter(currentNode, nextNodeIfExists, routeId, context);
  }

  private async _openSidebar() {
    const el = new JHConsumerSidebar();
    el.institution = this.institution.institution;
    el.user = this.user.user;
    el.routeConfig = this.routerContext.config;
    try {
      DialogUtil.awaitDialog({ title: 'Menu', dialog: el });
      // hack, set mobile-menu attribute on dialog
      const dialogEl = document.querySelector('dialog');
      if (dialogEl) {
        console.log('setting mobile-menu attribute on dialog');
        dialogEl.setAttribute('mobile-menu', '');
      }
    } catch (error) {
      // nothing to do here, the dialog was closed
    }
  }

  static styles = [
    buttonReset,
    css`
      :host {
        display: flex;
        flex-direction: row;
        position: relative;
        scroll-behavior: smooth;
        align-items: center;
        justify-content: center;
        background: var(--dashboard-page-background-color);
        min-height: 100vh;
        background-image: url(${unsafeCSS(ASSETS.light.backgroundLandscape)});
        background-size: cover;
        background-position: top;
      }
      button.reset {
        width: auto; /* needed to override buttonReset */
      }
      :host([authenticated]) {
        /** make room for the nav */
        --jh-consumer-menu-width: 272px;
        background-image: none;
        align-items: initial;
        justify-content: initial;
      }

      .hamburger-menu {
        display: none;
        position: absolute;
        top: 16px;
        left: 16px;
        z-index: 1;
      }

      jh-page-container {
        flex: 1;
      }
      @media (prefers-color-scheme: dark) {
        :host {
          background-image: url(${unsafeCSS(ASSETS.dark.backgroundLandscape)});
        }
      }

      @media (max-width: 1024px) {
        :host([authenticated]) {
          --jh-consumer-menu-width: 0;
        }

        jh-consumer-sidebar {
          display: none;
        }

        .hamburger-menu {
          display: block;
        }
      }
    `,
  ];

  render() {
    switch (this.user.state) {
      case 'unauthenticated':
        return html` <slot></slot> `;
      case 'checking':
      case 'authenticated':
        return html`
          <button
            class="reset hamburger-menu"
            @click=${this._openSidebar}>
            <jh-icon-bars slot="jh-button-icon"></jh-icon-bars>
          </button>
          <jh-consumer-sidebar
            .institution=${this.institution.institution}
            .user=${this.user.user}
            .routeConfig=${this.routerContext.config}></jh-consumer-sidebar>
          <jh-page-container heading=${this.heading}>
            <slot></slot>
          </jh-page-container>
        `;
      case 'loading':
        return html`
          <jh-progress
            type="circular"
            size="large"
            indeterminate></jh-progress>
        `;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'jh-consumer-layout': JhConsumerLayout;
  }
}
