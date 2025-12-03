// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { RoutingMixin } from '@jack-henry/web-component-router/lib/routing.mixin.js';

import '@jack-henry/jh-elements/components/card/card';
import '@jack-henry/jh-elements/components/button/button';
@customElement('jh-consumer-login')
export class JhConsumerLogin extends RoutingMixin(LitElement) {
  static styles = css`
    :host {
      display: block;
    }
    picture {
      margin: 0px 82px;
    }
    img {
      height: 80px;
    }
    article {
      align-items: center;
      justify-content: center;
      display: flex;
      padding: 24px;
  `;

  render() {
    return html`
      <jh-card>
        <picture slot="jh-card-header">
          <source
            media="(prefers-color-scheme: dark)"
            srcset=${ASSETS.dark.logo} />
          <img
            src=${ASSETS.light.logo}
            alt="logo" />
        </picture>
        <article>
          <jh-button
            href="/auth"
            label="Login with ${banno.web.config.displayName}"></jh-button>
        </article>
      </jh-card>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'jh-consumer-login': JhConsumerLogin;
  }
}
