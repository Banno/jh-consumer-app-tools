// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import getNavigationLinks from '../../controllers/navigation';
import { type Institution } from '../../types/institution';
import { type User } from '../../controllers/login-controller';
import './jh-consumer-nav';
import './jh-consumer-user-menu';

@customElement('jh-consumer-sidebar')
export default class JhConsumerSidebar extends LitElement {
  // sidebar can't use contexts because it's opened in a dialog on mobile
  @property({ type: Object })
  institution: Institution = {} as Institution;

  @property({ type: Object })
  user: User = {} as User;

  @property({ type: Object })
  routeConfig: any = {};

  static get styles() {
    return [
      css`
        :host {
          display: block;
          touch-action: manipulation;
          -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
          border-right: 1px solid var(--menu-divider-color, #b3bfc9);
          color: var(--menu-text-color);
          width: 272px;
          top: 0;
          bottom: 0;
          left: 0;
          z-index: 2;
          height: 100vh;
        }
        .fi-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          border-bottom: 1px solid var(--menu-divider-color);
          padding: 8px 0;
        }
        div#content {
          position: relative;
          box-sizing: border-box;
          height: 100%;
          background-color: var(--menu-background-color);
          display: flex;
          flex-direction: column;
        }
        jh-consumer-nav {
          margin-top: 12px;
          flex-grow: 1;
          flex-shrink: 1;
          overflow-y: auto;
          margin-bottom: 64px;
          padding-bottom: 16px;
        }
        img {
          height: 60px;
        }
      `,
    ];
  }

  getNavigationLinks() {
    return getNavigationLinks(this.institution, this.user.sub, this.routeConfig);
  }

  render() {
    return html`
      <div id="content">
        <div class="fi-logo">
          <a href="/">
            <picture>
              <source
                media="(prefers-color-scheme: dark)"
                srcset=${ASSETS.dark.menuLogo} />
              <img
                src=${ASSETS.light.menuLogo}
                alt="logo" />
            </picture>
          </a>
        </div>
        <jh-consumer-nav .links=${this.getNavigationLinks()}></jh-consumer-nav>
        <jh-consumer-user-menu
          .institution=${this.institution}
          .user=${this.user}></jh-consumer-user-menu>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'jh-consumer-sidebar': JhConsumerSidebar;
  }
}
