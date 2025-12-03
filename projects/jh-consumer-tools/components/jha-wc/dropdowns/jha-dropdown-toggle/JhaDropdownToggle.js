// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import { css } from 'lit';
import { jhaStyles } from '../../styles/jha-styles.js';
import JhaStyleElement from '../../style-element/JhaStyleElement.js';

/*
 *  `<jha-dropdown-toggle>` A JHA Design component used inside the jha-dropdown component to toggle the visibility of the jha-dropdown-menu.
 *
 * The following custom properties and mixins are also available for styling:
 *
 * Custom property | Description | Default
 * ----------------|-------------|----------
 * `--jha-dropdown-toggle-icon-color` | Default fill color for the jha-icon-chevron-down or jh-icon-chevron-down-small element | `{}`
 *
 * Attribute | Description
 * ----------------|-------------|----------
 * `[slot="toggle"]` | Required if inside a jha-dropdown component
 * `([is-active])` | Set via JS when the user clicks the toggle
 *
 * @element jha-dropdown-toggle
 */

const styles = css`
  :host {
    cursor: pointer;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: var(--jha-dropdown-toggle-justify-content, center);
  }
  :host(:hover) + ::slotted(jha-dropdown-menu) {
    display: block;
  }
  :host ::slotted(jha-icon-chevron-down),
  :host ::slotted(jh-icon-chevron-down-small) {
    width: 18px;
    height: 18px;
    position: relative;
    transition: transform 0.3s;
    fill: var(--jha-dropdown-toggle-icon-color, var(--jha-text-light, #8c989f));
  }
  :host([is-active]) ::slotted(jha-icon-chevron-down),
  :host([is-active]) ::slotted(jh-icon-chevron-down-small) {
    transform: rotate(180deg);
  }
`;

export default class JhaDropdownToggle extends JhaStyleElement {
  static get styles() {
    return [jhaStyles, styles];
  }
}

export { styles as JhaDropdownToggleStyles };
