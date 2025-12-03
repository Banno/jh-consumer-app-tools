// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('jh-single-column-layout')
export class JhSingleColumnLayout extends LitElement {
  static styles = css`
    :host {
      display: flex;
      justify-content: center;
      margin: 42px 0;
    }
    .center-column {
      max-width: 600px;
      width: 100%;
    }
    slot {
      display: block;
    }
  `;

  render() {
    return html`
      <div class="center-column">
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'jh-single-column-layout': JhSingleColumnLayout;
  }
}
