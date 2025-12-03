// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import { css } from 'lit';
import { jhaStyles } from '../../styles/jha-styles.js';
import JhaStyleElement from '../../style-element/JhaStyleElement.js';

/*
 * A JHA Design dropdown menu component used inside
 * the jha-dropdown component, providing styling for the dropdown menu that
 * is displayed when the jha-dropdown-toggle is clicked.
 *
 *   @element jha-dropdown-menu
 */
const styles = css`
  :host {
    display: block;
    margin: 4px 0 0;
    list-style: none;
    position: absolute;
    top: 100%;
    right: 0;
    background-color: var(--jha-dropdown-menu-background-color, var(--jha-component-background-color, #ffffff));
    border-radius: var(--jha-dropdown-menu-border-radius, 3px);
    min-width: 200px;
    max-width: 300px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    max-height: var(--jha-dropdown-max-height, calc(100vh - 200px));
    min-height: 40px;
    background-clip: padding-box;
    box-shadow: var(
      --jha-dropdown-menu-box-shadow,
      0 1px 4px 0 rgba(37, 49, 62, 0.24),
      0 1px 3px rgba(37, 49, 62, 0.12)
    );
    z-index: 1010;
    text-align: left;
  }
  :host([open-left]) {
    right: auto;
    left: var(--jha-dropdown-menu-left-position, -50%);
  }
  :host([open-up]) {
    bottom: 100%;
    top: auto;
    box-shadow: 0 -3px 4px -2px rgb(0 0 0 / 20%);
  }
  :host ::slotted(hr) {
    border: none;
    height: 1px;
    background-color: var(--jha-dropdown-menu-hr-background, var(--jha-border-color, #e4e7ea));
    margin: 0;
  }
  @media (max-height: 400px) {
    :host {
      max-height: var(--jha-dropdown-max-height, calc(100vh - 20px));
    }
  }
`;

export default class JhaDropdownMenu extends JhaStyleElement {
  static get styles() {
    return [jhaStyles, styles];
  }

  static get properties() {
    return {
      openUp: {
        type: Boolean,
        reflect: true,
        attribute: 'open-up',
      },
      openLeft: {
        type: Boolean,
        reflect: true,
        attribute: 'open-left',
      },
    };
  }

  constructor() {
    super();
    this.openUp = false;
    this.openLeft = false;
  }
}

export { styles as JhaDropdownMenuStyles };
