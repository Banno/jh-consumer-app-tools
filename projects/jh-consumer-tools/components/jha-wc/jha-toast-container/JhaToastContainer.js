// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import { LitElement, html, css } from 'lit';
import { jhaStyles } from '../styles/jha-styles.js';
import JhaToast from '../jha-toast/jha-toast.js';

const styles = css`
  :host {
    display: block;
    position: fixed;
    bottom: 0;
    left: 0;
    z-index: 1060;
    pointer-events: none;
  }
  @media (min-width: 740px) {
    :host {
      bottom: 32px;
      left: 32px;
    }
  }
  @media (min-width: 415px) {
    :host {
      min-width: var(--jha-toast-min-width, 288px);
      max-width: var(--jha-toast-max-width, 568px);
      bottom: 24px;
      left: 16px;
    }
  }
`;

/** @typedef {Object} ToastObject
 * @property {string=} message
 * @property {'danger'|'success'|''} role
 * @property {Node=} el
 * @property {number} [duration=5000]
 */

/**
 * A JHA Design toast container component.
 *
 * @element jha-toast-container
 *
 * Typical usage:
 *
 *  <body>
 *    <jha-toast-container>
 *      <jha-toast>...</jha-toast>
 *    </jha-toast-container>
 *
 * The jha-toast element _can_ be used without the container,
 * but only one toast will display at a time.
 * Appending the toasts to the container allows them to stack nicely.
 *
 * @slot unnamed slot, typically used for the button label or icon
 *
 */

export default class JhaToastContainer extends LitElement {
  static get styles() {
    return [jhaStyles, styles];
  }

  /** @param {ToastObject} toast */
  addToast(toast) {
    const el = new JhaToast();
    el.duration = toast.duration;
    el.setAttribute('id', `toast-${crypto.randomUUID()}`);

    if (toast.el) {
      el.appendChild(toast.el);
    }
    if (toast.message) {
      const node = new Text();
      node.textContent = toast.message;
      el.appendChild(node);
    }
    if (toast.role) {
      el.role = toast.role;
    }
    // eslint-disable-next-line @jack-henry/ux/prefer-arrow-event-handler
    el.addEventListener('hide', (event) => {
      // @ts-ignore
      this.removeToast(event.target.id);
    });
    this.shadowRoot.appendChild(el);
  }

  /** @param {string} toastId */
  removeToast(toastId) {
    const el = this.shadowRoot.querySelector(`#${toastId}`);
    if (el) {
      el.remove();
    }
  }

  render() {
    return html` <slot></slot> `;
  }
}

export { styles as JhaToastContainerStyles };
