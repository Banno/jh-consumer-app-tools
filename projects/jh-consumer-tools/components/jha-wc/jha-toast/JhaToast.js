// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import { LitElement, html, css } from 'lit';
import { jhaStyles } from '../styles/jha-styles.js';

const styles = css`
  @keyframes fadeInUp {
    0% {
      opacity: 0;
      transform: translateY(105%);
    }

    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
  @keyframes fadeOutDown {
    0% {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
    100% {
      opacity: 0;
      transform: translate3d(0, 15%, 0);
    }
  }
  :host {
    display: flex;
    position: relative;
    contain: content;
    color: var(--jha-toast-text-color, #fff);
    background-color: var(--jha-toast-background, var(--jha-color-dark, #455564));
    border-radius: var(--jha-toast-border-radius, 0px);
    margin-bottom: 8px;
    padding: 12px 24px;
    opacity: 0;
    transform: translateY(105%);
    transition: all cubic-bezier(0.1, 0.5, 0.1, 1) 0.75s;
    will-change: opacity, transform;
  }
  :host([role='danger']),
  :host([danger]) {
    background-color: var(--jha-toast-background-danger, var(--jha-color-danger, #f44336));
  }
  :host([role='success']),
  :host([success]) {
    background-color: var(--jha-toast-background-success, var(--jha-color-success, #4caf50));
  }
  :host([is-visible]) {
    animation-name: fadeInUp;
    animation-duration: 0.75s;
    animation-timing-function: cubic-bezier(0.1, 0.5, 0.1, 1);
    animation-delay: initial;
    animation-iteration-count: 1;
    animation-direction: initial;
    animation-fill-mode: backwards;
    animation-play-state: initial;
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0);
    transition:
      opacity,
      transform cubic-bezier(0.1, 0.5, 0.1, 1) 0.75s;
    will-change: opacity, transform;
  }
  :host ::slotted(.icon) {
    fill: #fff;
    margin-right: 10px;
  }
  :host ::slotted(div) {
    --jha-button-background: #fff;
    --jha-button-link-font-weight: 700;
  }
  @media (min-width: 415px) {
    :host {
      border-radius: var(--jha-toast-border-radius, 2px);
    }
  }
`;
/**
 * A JHA Design toast component.
 *
 * @element jha-toast
 *
 * Typical usage:
 *
 *  <body>
 *    <jha-toast-container>
 *      <jha-toast>...</jha-toast>
 *    </jha-toast-container>
 *
 * Toasts should be placed inside a <jha-toast-container>,
 * which allows them to stack nicely on the page should there be more than one.
 * Without the container, multiple toasts displayed at once will show over top each other.
 *
 * @slot unnamed slot, typically used for the button label or icon
 *
 * @attr ([is-visible]) Set via JS, it causes the toast to animate-in and be visible
 * @cssprop --jha-toast-background - The default toast background color
 * @cssprop --jha-color-danger - The theme's danger color
 */

export default class JhaToast extends LitElement {
  static get styles() {
    return [jhaStyles, styles];
  }

  static get properties() {
    return {
      role: {
        type: String,
        reflect: true,
        attribute: 'role',
      },
      duration: {
        type: Number,
      },
      isVisible: {
        type: Boolean,
        reflect: true,
        attribute: 'is-visible',
      },
    };
  }

  constructor() {
    super();
    this.role = null;
    this.duration = 5000;
    this.isVisible = false;
  }

  connectedCallback() {
    super.connectedCallback();
    this.displayToast();
  }

  displayToast() {
    this.isVisible = true;
    this.addEventListener(
      'transitionend',
      // eslint-disable-next-line @jack-henry/ux/prefer-arrow-event-handler
      () => {
        this.dispatchEvent(new CustomEvent('hide'));
      },
      { once: true },
    );
    setTimeout(() => {
      this.isVisible = false;
    }, this.duration || 5000);
  }

  render() {
    return html` <slot></slot> `;
  }
}

export { styles as JhaToastStyles };
