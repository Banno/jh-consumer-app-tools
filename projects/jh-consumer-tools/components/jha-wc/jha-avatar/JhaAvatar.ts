// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { jhaStyles } from '../styles/jha-styles.js';

const styles = css`
  :host {
    display: inline-block;
    width: var(--jha-avatar-width, 48px);
    height: var(--jha-avatar-height, 48px);
    border-radius: 50%;
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
    background-color: transparent;
    vertical-align: middle;
    margin-right: 5px;
    position: relative;
    font-size: var(--jha-avatar-font-size, 1.5em);
  }
  ::slotted([slot='icon']),
  .org-icon,
  div.badge {
    position: absolute;
    width: var(--jha-avatar-slotted-icon-size, 20px);
    height: var(--jha-avatar-slotted-icon-size, 20px);
    border-radius: var(--jha-avatar-badge-border-radius, 50%);
    background-color: var(--jha-avatar-badge-background, var(--jha-component-background-color, #ffffff));
    padding: var(--jha-avatar-badge-padding, 2px);
    bottom: var(--jha-avatar-badge-position-bottom, -6px);
    right: var(--jha-avatar-badge-position-right, -6px);
    box-sizing: border-box;
  }
  .org-icon {
    fill: var(--jha-button-text, var(--jha-text-white, #ffffff));
    background: var(--jha-color-primary, #3aaeda);
    border-radius: 4px;
    border: 1px solid var(--jha-button-text, var(--jha-text-white, #ffffff));
    padding: 0;
  }
  ::slotted([slot='icon']) {
    height: var(--jha-avatar-slotted-icon-size, 24px);
    width: var(--jha-avatar-slotted-icon-size, 24px);
    padding: var(--jha-avatar-slotted-icon-padding, 3px);
  }

  div.badge > img {
    max-width: 100%;
    height: auto;
    border-radius: 50%;
  }
  :host([x-small]) {
    --jha-avatar-width: 24px;
    --jha-avatar-height: 24px;
    --jha-avatar-font-size: 0.75em;
    --jha-avatar-slotted-icon-size: 14px;
    --jha-avatar-slotted-icon-padding: 1px;
  }
  :host([x-small]) div.badge {
    width: 12px;
    height: 12px;
    padding: 1px;
    bottom: -2px;
  }
  :host([x-small]) div.badge > img {
    position: relative;
    top: -3px;
  }
  :host([small]) {
    --jha-avatar-width: 36px;
    --jha-avatar-height: 36px;
    --jha-avatar-font-size: 1em;
    --jha-avatar-slotted-icon-size: 18px;
    --jha-avatar-slotted-icon-padding: 2px;
  }
  :host([small]) div.badge {
    width: 16px;
    height: 16px;
    padding: 1px;
    bottom: -3px;
  }
  :host([large]) {
    --jha-avatar-width: 72px;
    --jha-avatar-height: 72px;
    --jha-avatar-font-size: 2em;
    --jha-avatar-slotted-icon-size: 34px;
    --jha-avatar-slotted-icon-padding: 6px;
  }
  :host([large]) div.badge {
    width: 30px;
    height: 30px;
    bottom: -4px;
  }
  :host([x-large]) {
    --jha-avatar-width: 96px;
    --jha-avatar-height: 96px;
    --jha-avatar-font-size: 2.5em;
    --jha-avatar-slotted-icon-size: 40px;
    --jha-avatar-slotted-icon-padding: 6px;
  }
  :host([x-large]) div.badge {
    width: 36px;
    height: 36px;
    bottom: -4px;
  }
  :host([profile]) {
    --jha-avatar-border: 2px solid #fff;
    box-shadow: 0 2px 3px rgba(0, 0, 0, 0.16);
  }
  div.initials {
    border-radius: 50%;
    overflow: hidden;
    box-sizing: border-box;
    height: 100%;
    width: 100%;
  }
  svg {
    fill: var(--jha-avatar-initials-text-color, var(--body-text-secondary-color, var(--jha-color-gray-medium)));
    width: 100%;
    height: 100%;
  }
  svg rect {
    fill: var(
      --jha-avatar-initials-background-color,
      var(--secondary-content-background-color, var(--jha-color-light))
    );
    width: var(--jha-avatar-width);
    height: var(--jha-avatar-height);
  }
  svg text {
    font-size: var(--jha-avatar-font-size, 1.75em);
    letter-spacing: var(--jha-avatar-letter-spacing, 0);
    text-anchor: middle;
    text-transform: uppercase;
  }
`;

/**
 *  A JHA Design avatar component.
 * @element jha-avatar
 *
 * @prop {string} avatar - Sets the avatar image
 * @prop {string} badgeurl - Changes out the ibadge image
 * @prop {string} initials - displays a graphic of the users initials when they don't have an avatar image
 *
 * @attr {boolean} x-small - Sets width and height to 24px
 * @attr {boolean} small - Sets width and height to 36px
 * @attr {bolean} large - Sets width and height to 72px
 * @attr {boolean} x-large - Sets width and height to 96px
 * @attr {boolean} profile - Adds a white border and box-shadow to the avatar
 * @attr {boolean} badge - Adds a small badge in the lower right corner, usually with the FI's logo, defined using the `badgeurl` prop
 *
 * @cssprop --jha-avatar-width - width of the component, controlled through the size attributes
 * @cssprop --jha-avatar-height - height of the component, controlled through the size attributes
 * @cssprop --jha-avatar-font-size - text size of the initials
 * @cssprop --jha-avatar-initials-text-color - text color of the initials
 * @cssprop --jha-avatar-initials-background-color - background color behind initials
 * @cssprop --jha-avatar-letter-spacing - letter spacing of initials
 *
 */
export default class JhaAvatar extends LitElement {
  static get styles() {
    return [jhaStyles, styles];
  }

  @property({ type: String })
  avatar: string = '';

  @property({ type: String })
  badgeurl: string = '';

  @property({ type: String })
  initials: string = '';

  @property({ type: Boolean, attribute: 'is-org-user' })
  isOrgUser: boolean = false;

  constructor() {
    super();
    import('@jack-henry/jh-icons/icons-wc/icon-building.js');
  }

  updated(changedProperties) {
    if (changedProperties.has('avatar')) {
      this.updateBackgroundImage();
    }
  }

  updateBackgroundImage() {
    if (this.avatar) {
      this.style.backgroundImage = `url(${this.avatar})`;
      return;
    }
  }

  renderInitials() {
    if (!this.initials) return '';
    return html`
      <div class="initials">
        <svg>
          <rect
            x="0"
            y="0" />
          <text
            x="50%"
            y="50%"
            text-anchor="middle"
            dy=".4em">
            ${this.initials.slice(0, 2)}
          </text>
        </svg>
      </div>
    `;
  }

  render() {
    return html`
      <slot></slot>
      ${this.renderInitials()}
        <slot name="icon">
          ${
            this.badgeurl
              ? html`
                  <div class="badge">
                    <img
                      src="${ifDefined(this.badgeurl)}"
                      alt="" />
                  </div>
                `
              : ''
          }
          ${this.isOrgUser ? html` <jha-icon-business class="org-icon"></jha-icon-business> ` : ''}
          </div>
        </slot>
      </div>
    `;
  }
}

export { styles as JhaAvatarStyles };
