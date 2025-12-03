// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import { LitElement, html, css } from 'lit';
import { jhaStyles } from '../styles/jha-styles.js';

const styles = css`
  @keyframes spin {
    100% {
      transform: rotate(360deg);
    }
  }
  :host {
    display: inline-block;
    position: relative;
    width: var(--jha-progress-size, 16px);
    height: var(--jha-progress-size, 16px);
  }
  :host([inline]) {
    --jha-progress-size: 12px;
  }
  :host([card]) {
    --jha-progress-size: 28px;
    display: block;
    margin: 80px auto;
  }
  .circle {
    animation: spin 0.75s linear infinite;
    transform-origin: center;
    border-width: var(--jha-progress-card-border-width, 2px);
    border-style: solid;
    border-color: var(--jha-progress-color, var(--jha-border-color));
    border-right-color: transparent !important;
    border-radius: 50%;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
  }
  .under-circle {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    height: 100%;
    width: 100%;
    box-sizing: border-box;
    border: var(--jha-progress-card-border-width, 2px) solid var(--jha-progress-track-color, transparent);
  }
`;

/**
 * A JHA Design progress indicator
 * @element jha-progress
 * @attr {boolean} card - used when inside a card element
 *
 * @cssprop --jha-progress-color - color for the progress wheel
 * @cssprop --jha-progress-card-border-width - border width when placed inside a card
 */
export default class JhaProgress extends LitElement {
  static get is() {
    return 'jha-progress';
  }

  static get styles() {
    return [jhaStyles, styles];
  }

  render() {
    return html`
      <div class="under-circle"></div>
      <div class="circle"></div>
    `;
  }
}

export { styles as JhaProgressStyles };
