// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import { LitElement, html, css } from 'lit';
import { jhaStyles } from '../../styles/jha-styles.js';

/*
 * `<jha-dropdown-menu-item>` A JHA Design dropdown menu item component used inside the jha-dropdown component.
 *
 * The following custom properties and mixins are also available for styling:
 *
 * Custom property | Description | Default
 * ----------------|-------------|----------
 * `--jha-dropdown-menu-item-background-hover` | Sets background color of the item on hover | `{}`
 * `--jha-text-base` | Sets text color to the theme's base text color | `{}`
 * `--jha-color-danger` | Sets text color to the theme's danger color | `{}`
 *
 * The following attribute is also available for styling:
 *
 * Attribute | Description
 * ----------------|-------------|----------
 * `([danger])` | Sets the text color to the theme's danger color
 *
 * @element jha-dropdown-menu-item
 */

const styles = css`
  :host {
    display: block;
    background-color: var(--jha-dropdown-menu-item-background-color, var(--jha-component-background-color, #ffffff));
    color: var(--jha-dropdown-menu-item-color, var(--jha-text-base, #6b757b));
    font-size: 13px;
    cursor: pointer;
    contain: layout;
  }
  :host(:focus),
  :host(:focus-within),
  :host(:hover) {
    outline: none;
    background-color: var(
      --jha-dropdown-menu-item-background-hover,
      var(--jha-focus-highlight-color, rgba(153, 153, 153, 0.12))
    );
  }
  @supports (-ms-ime-align: auto) {
    :host(:focus) {
      outline: thin dotted;
    }
  }
  @media all and (-ms-high-contrast: none) {
    :host(:focus) {
      outline: thin dotted;
    }
  }
  :host ::slotted(*) {
    /*
    * padding must be on the slotted item so that anchor tags
    * can be clicked anywhere - not just on the text content
    */
    padding: 16px;
  }
  :host ::slotted(a) {
    color: var(--jha-dropdown-menu-item-anchor-color, var(--jha-text-base, #6b757b));
    display: block;
  }
  :host ::slotted(a) {
    outline: none;
  }
  :host([danger]) {
    --jha-dropdown-menu-item-color: var(--jha-color-danger, #f44336);
  }
  :host([danger]) ::slotted(a) {
    --jha-dropdown-menu-item-anchor-color: var(--jha-color-danger, #f44336);
  }
`;

export default class JhaDropdownMenuItem extends LitElement {
  static get styles() {
    return [jhaStyles, styles];
  }

  static get properties() {
    return {};
  }

  constructor() {
    super();
    this.boundFocus_ = this.onFocus_.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('focus', this.boundFocus_);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('focus', this.boundFocus_);
  }

  firstUpdated() {
    const link = this.querySelector('a');
    const checkbox = this.querySelector('input[type="checkbox"]');
    const button = this.querySelector('jha-button') || this.querySelector('button');
    if (link) {
      this.setAttribute('role', 'link');
    } else if (checkbox) {
      this.setAttribute('role', 'checkbox');
    } else if (button) {
      this.setAttribute('role', 'button');
    } else if (this.getAttribute('role') === null) {
      this.setAttribute('role', 'button');
    }
  }

  render() {
    return html` <slot></slot> `;
  }

  onFocus_() {
    /** @type {HTMLElement} */
    const focusable =
      this.querySelector('input[type="checkbox"]') || this.querySelector('jha-button') || this.querySelector('button');
    if (focusable) {
      focusable.focus();
    }
  }
}

export { styles as JhaDropdownMenuItemStyles };
