// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import { html, css, LitElement, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('jh-background-hero')
export class JhBackgroundHero extends LitElement {
  @property({ type: Boolean, attribute: 'full-page' })
  fullPage = false;

  static styles = css`
    :host {
      transition: all ease 0.2s;
      height: 200px;
      display: block;
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
    }
    .background {
      display: block;
      background-size: cover;
      background-position: top;
      position: absolute;
      top: 0;
      bottom: 0;
      left: var(--jh-consumer-menu-width);
      right: 0;
      background-image: url(${unsafeCSS(ASSETS.light.backgroundLandscape)});
    }

    :host([full-page]) {
      height: 100%;
    }
    :host([full-page]) .background {
      position: relative;
      width: 100%;
      height: 100%;
    }

    @media (prefers-color-scheme: dark) {
      .background {
        background-image: url(${unsafeCSS(ASSETS.dark.backgroundLandscape)});
      }
    }

    @media (max-width: 768px) {
      :host {
        height: 280px;
      }
    }

    .filter {
      position: absolute;
      content: '';
      background: var(--hero-gradient-colors);
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
    }
  `;

  render() {
    return html` <div class="background">${!this.fullPage ? html` <div class="filter"></div> ` : html``}</div> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'jh-background-hero': JhBackgroundHero;
  }
}
