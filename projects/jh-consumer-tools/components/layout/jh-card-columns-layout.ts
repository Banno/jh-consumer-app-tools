// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('jh-card-columns-layout')
export class JhCardColumnsLayout extends LitElement {
  static styles = css`
    :host {
      margin: 42px 0;
      display: flex;
    }
    slot {
      display: block;
    }
    #left-column {
      margin-right: 16px;
      flex: 7 1 0px;
    }
    #right-column {
      flex: 5 0 0px;
    }
    @media (max-width: 768px) {
      :host {
        flex-direction: column;
      }
      #left-column {
        margin-right: 0;
        margin-bottom: 16px;
        flex: none;
      }
      #right-column {
        flex: none;
      }
    }
  `;

  render() {
    return html`
      <div id="left-column">
        <slot name="left-column"></slot>
      </div>
      <div id="right-column">
        <slot name="right-column"></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'jh-card-columns-layout': JhCardColumnsLayout;
  }
}
