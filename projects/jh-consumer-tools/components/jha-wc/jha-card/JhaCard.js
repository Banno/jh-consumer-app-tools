// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import { LitElement, html, css } from 'lit';
import '../jha-progress/jha-progress.js';
import '../jha-error-message/jha-error-message.js';

const styles = css`
  :host {
    display: block;
    background-color: var(--jha-card-background-color, var(--jha-component-background-color, #ffffff));
    box-shadow: var(--jha-card-shadow, 0 1px 1px 0 rgba(0, 0, 0, 0.24), 0 1px 4px rgba(0, 0, 0, 0.12));
    border-radius: var(--jha-card-border-radius, 2px);
    margin-bottom: 16px;
    margin-left: auto;
    margin-right: auto;
    color: var(--jha-text-base);
    font-size: var(--jha-text-size-base, 14px);
  }
  :host header,
  :host ::slotted(header),
  :host ::slotted(*[slot='header']) {
    font-size: var(--jha-card-header-font-size, 16px);
    color: var(--jha-card-header-color, var(--jha-text-dark, #455564));
    padding: var(--jha-card-header-padding-top, 18px) var(--jha-card-header-padding-right, 24px)
      var(--jha-card-header-padding-bottom, 18px) var(--jha-card-header-padding-left, 0);
    margin-left: var(--jha-card-header-margin-left, 24px);
    line-height: 21px;
    border-bottom: 1px solid var(--jha-border-color, #e4e7ea);
    font-weight: var(--jha-card-header-font-weight, 500);
  }
  :host([borderless]) header,
  :host([borderless]) ::slotted(header),
  :host([borderless]) ::slotted(*[slot='header']) {
    border-bottom: none;
  }
  :host header {
    display: flex;
    justify-content: space-between;
  }
  :host header:empty {
    display: none;
  }
  :host header span {
    min-width: 24px;
  }
  :host ::slotted(h1),
  :host ::slotted(h2),
  :host ::slotted(h3),
  :host ::slotted(h4) {
    margin: 0;
    font-size: var(--jha-card-header-font-size, 16px);
    color: var(--jha-card-header-color, var(--jha-text-dark, #455564));
    line-height: 21px;
    font-weight: var(--jha-card-header-font-weight, 500);
  }
  :host article,
  :host ::slotted(article) {
    margin-left: var(--jha-card-article-margin-left, 24px);
    padding-top: var(--jha-card-article-padding-top, 18px);
    padding-right: var(--jha-card-article-padding-right, 24px);
    margin-bottom: var(--jha-card-article-margin-bottom, 18px);
    padding-bottom: var(--jha-card-article-padding-bottom, 18px);
  }
  :host ::slotted(button) {
    touch-action: manipulation;
    background: none;
    border: none;
    color: var(--jha-text-dark);
    cursor: pointer;
    display: flex;
    margin: 0;
    padding: 0;
    text-align: left;
    -webkit-appearance: none;
    justify-content: space-between;
    align-items: center;
  }
  :host .no-content-text {
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    color: var(--jha-text-neutral, #8d99a0);
    height: 220px;
  }
  :host ::slotted(footer) {
    margin-left: var(--jha-card-footer-margin-left, 24px);
    --jha-card-footer-padding: var(--jha-card-footer-padding-top, 18px) var(--jha-card-footer-padding-right, 24px)
      var(--jha-card-footer-padding-bottom, 18px) 0;
    padding: var(--jha-card-footer-padding);
    font-size: var(--jha-card-footer-size, 14px);
    text-align: var(--jha-card-footer-text-align, right);
  }
  jha-error-message {
    padding: 20px;
    margin-top: 20px;
  }
  .progress {
    padding: 50px 0;
  }
  @media (min-width: 736px) and (max-width: 991px) {
    :host([single-column]) ::slotted(article),
    :host([single-column]) ::slotted(footer),
    :host([single-column]) ::slotted(jha-list-item) {
      margin-left: 24px;
      padding-right: 24px;
    }
  }
  @media (max-width: 739px) {
    :host([reset]) {
      max-width: none;
      border-radius: 0;
      margin-left: -16px;
      margin-right: -16px;
      box-shadow: none;
      position: relative;
    }

    :host header,
    :host ::slotted(header),
    :host ::slotted(*[slot='header']) {
      padding-right: 16px;
      margin-left: 16px;
    }

    :host article,
    :host ::slotted(article) {
      margin-left: 16px;
      padding-right: 16px;
    }
    :host ::slotted(footer) {
      padding-right: 16px;
    }
  }
  @media (max-width: 735px) {
    :host {
      max-width: 550px;
    }
    :host([wide]) {
      max-width: none;
    }
  }
  @media print {
    :host {
      padding: 0;
      margin: 0;
      box-shadow: none;
      background-color: transparent;
    }
    :host article,
    :host ::slotted(article) {
      margin: 0;
    }
  }
`;

/**
 * A JHA Design card component
 *
 * @element jha-card
 *
 * @prop {boolean} loading - Adds jha-progress spinner to the body of the card.
 * @prop {boolean} hasData - Determines display of content or no-content slots.
 * @prop {string} errorMessage - Message to display when there is an error.
 * @prop {string} noDataMessage - Message to display when there is no data.
 *
 * @slot header - Used for header content.
 * @slot unnamed Used for the card content.
 * @slot no-content - Used for 'empty card' content.
 *
 * @attr {boolean} singleColumn - Maintains left margin and right padding at 24px at the middle viewport when card is the only one on the page.
 *
 * @cssprop --jha-border-color - Border color for header section
 * @cssprop --jha-card-article-margin-left - Left margin on the article element
 * @cssprop --jha-card-article-padding-right - Right padding on the article element
 * @cssprop --jha-card-article-margin-bottom - Bottom margin on the article element
 * @cssprop --jha-card-article-padding-bottom - Bottom padding on the article element
 * @cssprop --jha-card-footer-margin-left - Left margin on the footer element
 * @cssprop --jha-card-footer-padding-top - Top padding on the footer element
 * @cssprop --jha-card-footer-padding-right - Right padding on the footer element
 * @cssprop --jha-card-footer-padding-bottom - Bottom padding on the footer element
 * @cssprop --jha-card-footer-size - Font size on the footer element
 */

export default class JhaCard extends LitElement {
  static get properties() {
    return {
      loading: {
        type: Boolean,
      },
      hasData: {
        type: Boolean,
        reflect: true,
      },
      errorMessage: {
        type: String,
      },
      noDataMessage: {
        type: String,
      },
    };
  }

  static get styles() {
    return styles;
  }

  constructor() {
    super();
    this.loading = false;
    this.hasData = true;
    this.noDataMessage = 'No data';
    this.errorMessage = '';
  }

  get hasSlottedHeaderContent() {
    return this.querySelectorAll(`[slot=header-left], [slot=header-center], [slot=header-right]`).length > 0;
  }

  render() {
    return html`
      <slot name="header">
        ${this.hasSlottedHeaderContent
          ? html`
              <header>
                <span>
                  <slot name="header-left"></slot>
                </span>
                <slot name="header-center"></slot>
                <span>
                  <slot name="header-right"></slot>
                </span>
              </header>
            `
          : ''}
      </slot>

      ${this.errorMessage
        ? html`
            <article>
              <jha-error-message>${this.errorMessage}</jha-error-message>
            </article>
          `
        : ''}
      ${this.hasData ? html` <slot></slot> ` : ''}
      ${this.loading && !this.hasData
        ? html`
            <div class="progress">
              <jha-progress card></jha-progress>
            </div>
          `
        : ''}
      ${!this.loading && !this.hasData
        ? html`
            <div class="no-content-text">
              <slot name="no-content">
                <p>${this.noDataMessage}</p>
              </slot>
            </div>
          `
        : ''}
    `;
  }
}

export { styles as jhaCardStyles };
