// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import { html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import './jh-background-hero';
import './jh-consumer-footer';

@customElement('jh-page-container')
export class JhPageContainer extends LitElement {
  @property({ type: String })
  heading: string | null = null;

  @property({ type: String })
  heroHeight: string | null = null;

  getHeroStyle() {
    if (!this.heroHeight) {
      return '';
    }
    return `height: ${this.heroHeight}`;
  }

  static styles = css`
    :host {
      display: block;
      max-width: 1040px;
      padding: 0 32px 32px;
      margin: 0 auto;
    }

    :host ::slotted(*) {
      position: relative;
    }

    :host ::slotted(jh-background-hero) {
      position: absolute;
    }

    jh-background-hero {
      position: var(--jh-background-hero-position, absolute);
    }

    header h1 {
      font-weight: 700;
      font-size: 34px;
      color: var(--hero-text-color);
      margin-top: var(--jh-page-container-header-top-margin, 48px);
    }

    header {
      margin-top: var(--jh-page-container-header-top-margin, 48px);
      position: relative;
    }

    @media (max-width: 1200px) {
      :host {
        padding: 0 24px 32px;
      }
    }

    @media (max-width: 1024px) {
      :host {
        padding: 0 32px 32px;
      }
      header {
        margin-top: calc(var(--jh-page-container-header-top-margin, 48px) + 16px);
        margin-bottom: 0;
      }
    }

    @media (max-width: 834px) {
      :host {
        padding: 0 16px 32px;
      }
    }

    @media (max-width: 768px) {
      :host {
        max-width: 512px;
        padding: 0 24px 32px;
      }
      header {
        max-width: 512px;
      }
      jh-background-hero {
        height: var(--hero-height, 280px);
      }
    }

    @media (max-width: 470px) {
      :host {
        padding: 0 16px 16px;
      }
    }

    @supports (width: max(0px, 1px)) {
      :host {
        padding-right: max(32px, env(safe-area-inset-left));
        padding-left: max(32px, env(safe-area-inset-right));
      }

      @media (max-width: 1200px) {
        :host {
          padding-right: max(24px, env(safe-area-inset-left));
          padding-left: max(24px, env(safe-area-inset-right));
        }
      }

      @media (max-width: 1024px) {
        :host {
          padding-right: max(32px, env(safe-area-inset-left));
          padding-left: max(32px, env(safe-area-inset-right));
        }
      }

      @media (max-width: 834px) {
        :host {
          padding-right: max(16px, env(safe-area-inset-left));
          padding-left: max(16px, env(safe-area-inset-right));
        }
      }

      @media (max-width: 768px) {
        :host {
          padding-right: max(24px, env(safe-area-inset-left));
          padding-left: max(24px, env(safe-area-inset-right));
        }
      }

      @media (max-width: 470px) {
        :host {
          padding-right: max(16px, env(safe-area-inset-left));
          padding-left: max(16px, env(safe-area-inset-right));
        }
      }
    }
    @media print {
      :host {
        max-width: none;
        padding: 0;
      }
    }

    jh-consumer-footer {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
    }
  `;

  render() {
    return html`
      <jh-background-hero style="${this.getHeroStyle()}"></jh-background-hero>
      <header>
        <slot name="above-header"></slot>
        ${this.heading ? html`<h1>${this.heading}</h1>` : ''}
        <slot name="header"></slot>
      </header>
      <slot></slot>
      <jh-consumer-footer></jh-consumer-footer>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'jh-page-container': JhPageContainer;
  }
}
