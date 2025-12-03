// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import { LitElement, html, css } from 'lit-element';
import { customElement, property } from 'lit/decorators.js';
@customElement('jh-consumer-card-header')
export class JhConsumerCardHeader extends LitElement {
  static styles = css`
    :host {
      display: block;
      color: var(--body-text-primary-color);
      fill: var(--body-text-primary-color);
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    h1 {
      font-size: 16px;
      margin: 0;
      font-weight: 500;
      width: 100%;
    }
    slot {
      display: flex;
      gap: 8px;
    }
    ::slotted(jh-button) {
      fill: var(--body-text-primary-color);
    }
  `;

  @property({ type: String }) heading = '';

  render() {
    return html`
      <header>
        <h1>${this.heading}</h1>
        <slot name="jh-card-header-right"></slot>
      </header>
    `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    'jh-consumer-card-header': JhConsumerCardHeader;
  }
}
