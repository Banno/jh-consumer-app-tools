// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import { html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { buttonReset } from '../../styles/consumer-styles.js';

@customElement('jh-consumer-menu-group')
export default class JHConsumerMenuGroup extends LitElement {
  @property({ type: Boolean, reflect: true })
  open = false;

  @property({ type: Boolean, reflect: true })
  active = false;

  @property({ type: Boolean, reflect: true })
  flattened = false;

  @property({ type: Boolean, reflect: true })
  empty = false;

  @property({ type: String })
  menuTitle = '';

  constructor() {
    super();
    import('@jack-henry/jh-icons/icons-wc/icon-chevron-down-small.js');
    /** @type {!string} */
    this.menuTitle = '';
    /** @type {!boolean} */
    this.open = false;
    /** @type {!boolean} */
    this.active = false;
    /** @type {!boolean} */
    this.flattened = false;
    /** @type {!boolean} */
    this.empty = false;
  }

  get _slottedChildren() {
    const slot = this.shadowRoot.querySelector<HTMLSlotElement>('#content slot');
    if (!slot) {
      return [];
    }
    const childNodes = slot.assignedNodes({ flatten: true });
    return childNodes.filter((node) => node.nodeType == Node.ELEMENT_NODE);
  }

  updateMenu(e) {
    if (this._slottedChildren.length < 3) {
      // if menu-group has less than 3 items
      // should be always open
      this.open = true;
      // flattened attribute removes the toggle button
      this.flattened = true;
    } else {
      this.flattened = false;
      this.open = this.active;
    }

    if (this._slottedChildren.length === 0) {
      // if menu-group has no children
      // empty attribute hides group completely
      this.empty = true;
    }
  }

  toggleOpen(evt) {
    evt.stopPropagation();
    this.open = !this.open;
  }

  static get styles() {
    return [
      buttonReset,
      css`
        :host {
          display: block;
          position: relative;
        }
        #toggle {
          box-sizing: border-box;
          cursor: pointer;
          padding: 0 16px 0 63px;
          height: 48px;
          width: 100%;
          border: 0;
          font-size: 16px;
          color: var(--menu-text-color);
          text-decoration: none;
          display: flex;
          align-items: center;
          touch-action: manipulation;
          background-color: transparent;
          -webkit-touch-callout: none;
          position: relative;
        }
        :host([empty]) {
          display: none;
        }
        :host([active]:not([open])) #toggle {
          background-color: var(--menu-item-selected-color);
          fill: var(--menu-text-selected-color);
        }
        :host([active]:not([open])) #toggle:before {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          width: 4px;
          background: var(--body-text-theme-color);
        }
        #toggle:hover {
          color: var(--menu-text-pressed-color);
          background: var(--menu-item-pressed-color);
        }
        :host([flattened]) #toggle {
          display: none;
        }
        button:hover ::slotted(*) {
          fill: var(--menu-icon-pressed-color) !important;
        }
        .contents {
          display: none;
        }
        :host([open]) .contents {
          display: block;
        }
        .contents ::slotted(*) {
          padding-left: 63px !important;
        }
        .contents[flat] ::slotted(*) {
          padding-left: max(16px, env(safe-area-inset-right)) !important;
        }

        jh-icon-chevron-down-small {
          margin-left: auto;
          transition: transform 0.2s ease-in-out;
          fill: var(--menu-text-color);
          --icon-size: 24px;
        }
        #toggle:hover jh-icon-chevron-down-small {
          fill: var(--menu-text-pressed-color);
        }
        :host([open]) jh-icon-chevron-down-small {
          transform: rotate(-180deg);
        }
        .icon {
          position: absolute;
          left: 16px;
          top: 8px;
        }
      `,
    ];
  }

  renderMenuButton() {
    if (this.flattened) return '';

    return html`
      <button
        type="button"
        id="toggle"
        class="reset"
        @click=${this.toggleOpen}>
        <div class="icon">
          <slot name="icon"></slot>
        </div>
        ${this.menuTitle}
        <jh-icon-chevron-down-small></jh-icon-chevron-down-small>
      </button>
    `;
  }

  render() {
    return html`
      ${this.renderMenuButton()}
      <div
        ?flat=${this.flattened}
        class="contents"
        id="content">
        <slot @slotchange=${this.updateMenu}></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'jh-consumer-menu-group': JHConsumerMenuGroup;
  }
}
