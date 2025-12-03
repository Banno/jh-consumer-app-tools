// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import { LitElement, html, css } from 'lit';
import { jhaStyles } from '../styles/jha-styles.js';

const styles = css`
  :host {
    display: flex;
    color: var(--jha-error-message-text-color, var(--error-text-color, #fff));
    background-color: var(--jha-message-background-danger, var(--jha-color-warning, #f44336));
    border-radius: 3px;
    padding: 16px 20px;
    text-align: left;
  }
  div {
    flex-grow: 1;
  }
  @media (max-width: 480px) {
    :host {
      padding: 10px;
    }
  }
`;

/**
 * A JHA Design component for a general error message.
 *
 * @element jha-error-message
 *
 * @slot unnamed slot used for content.
 *
 * @cssprop --jha-color-warning - Sets the background color to the theme's warning color.
 */

export default class JhaErrorMessage extends LitElement {
  static get styles() {
    return [jhaStyles, styles];
  }

  static get properties() {
    return {
      role: {
        type: String,
        reflect: true,
      },
    };
  }

  constructor() {
    super();
    this.role = 'alert';
  }

  render() {
    return html` <div><slot></slot></div> `;
  }
}

export { styles as jhaErrorMessageStyles };
