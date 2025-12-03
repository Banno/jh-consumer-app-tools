// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import { LitElement, html, css } from 'lit';
import { jhaStyles } from '../../styles/jha-styles.js';

/*
 * A JHA Design dropdown component.
 * @element jha-dropdown
 *
 * @example
 *
 *    <body>
 *      <jha-dropdown>
 *        <jha-dropdown-toggle slot="toggle">
 *          ...
 *        </jha-dropdown-toggle>
 *        <jha-dropdown-menu>
 *          <jha-dropdown-menu-item>
 *            ...
 *          </jha-dropdown-menu-item>
 *        </jha-dropdown-menu>
 *      </jha-dropdown>
 *
 */

const styles = css`
  :host {
    display: block;
    position: relative;
  }
`;

export default class JhaDropdown extends LitElement {
  static get styles() {
    return [jhaStyles, styles];
  }

  static get properties() {
    return {
      open: {
        type: Boolean,
        notify: true,
      },
      hovered: {
        type: Boolean,
      },
      disabled: {
        type: Boolean,
      },
      disableItemMenuClose: {
        type: Boolean,
      },
      disableOutsideClickClose: {
        type: Boolean,
      },
      focusMatchingItem: {
        type: Boolean,
      },
      adjustToPageBottom: {
        type: Boolean,
        reflect: true,
      },
    };
  }

  constructor() {
    super();
    this.open = false;
    this.hovered = false;
    this.disabled = false;
    this.disableItemMenuClose = false;
    this.disableOutsideClickClose = false;
    this.focusMatchingItem = false;
    this.adjustToPageBottom = false;
    /** @type {import('../jha-dropdown-toggle/JhaDropdownToggle').default} */
    this.toggle = null;
    /** @type {import('../jha-dropdown-menu/JhaDropdownMenu').default} */
    this.menu = null;
    this.boundOnHovered_ = null;
    this.boundOnUnHovered_ = null;
    this.boundInteractMenu_ = null;
    this.boundToggleMenu_ = null;
    this.boundKeyHandler_ = null;
    this.boundBlurMenu_ = null;
    this.boundClickDocument_ = null;
  }

  connectedCallback() {
    super.connectedCallback();
    this.boundOnHovered_ = this.onHovered.bind(this);
    this.boundOnUnHovered_ = this.onUnhovered.bind(this);
    this.boundInteractMenu_ = this.interactMenu.bind(this);
    this.boundToggleMenu_ = this.toggleMenu.bind(this);
    this.boundKeyHandler_ = this.keyHandler.bind(this);
    this.boundBlurMenu_ = this.blurMenu.bind(this);
    this.boundClickDocument_ = this.onClickDocument_.bind(this);
    this.addEventListener('mouseover', this.boundOnHovered_);
    this.addEventListener('mouseout', this.boundOnUnHovered_);
  }

  disconnectedCallback() {
    this.removeEventListener('mouseover', this.boundOnHovered_);
    this.removeEventListener('mouseout', this.boundOnUnHovered_);
    this.removeEventListener('keydown', this.boundKeyHandler_);
    document.removeEventListener('click', this.boundClickDocument_);
    if (this.toggle) {
      this.toggle.removeEventListener('focus', this.boundInteractMenu_);
      this.toggle.removeEventListener('click', this.boundToggleMenu_);
    }
    super.disconnectedCallback();
  }

  firstUpdated() {
    this.toggle = this.querySelector('jha-dropdown-toggle');
    if (this.toggle) {
      this.toggle.tabIndex = 0;
      this.toggle.setAttribute('aria-expanded', 'false');
      this.toggle.setAttribute('aria-haspopup', 'true');
      this.toggle.setAttribute('role', 'button');
      this.toggle.addEventListener('focus', this.boundInteractMenu_);
      this.toggle.addEventListener('click', this.boundToggleMenu_);
    }
  }

  render() {
    return html`
      <slot name="toggle"></slot>
      ${this.open ? html` <slot></slot> ` : ''}
    `;
  }

  interactMenu(e) {
    e.preventDefault();
    this.addEventListener('keydown', this.boundKeyHandler_);
  }

  keyHandler(e) {
    const TABKEY = 'Tab';
    const UPARROW = 'ArrowUp';
    const DOWNARROW = 'ArrowDown';
    const ENTER = 'NumpadEnter';
    const SPACE = 'Space';
    const ESC = 'Escape';
    switch (e.code) {
      case TABKEY: {
        if (this.open && !e.shiftKey) {
          e.preventDefault();
          this.goDownOrOpenMenu();
        } else if (this.open && e.shiftKey) {
          e.preventDefault();
          this.goUpOrOpenMenu();
        }
        break;
      }
      case DOWNARROW: {
        e.preventDefault();
        this.goDownOrOpenMenu();
        break;
      }
      case UPARROW: {
        e.preventDefault();
        this.goUpOrOpenMenu();
        break;
      }
      case ENTER: {
        if (!this.open) {
          this.openMenu();
        } else if (this.open && this.menu) {
          /** @type {import('../jha-dropdown-menu-item/JhaDropdownMenuItem').default} */
          const el = this.menu.querySelector('jha-dropdown-menu-item[tabIndex="0"]');
          if (el) {
            // if our item contains an anchor, checkbox, or button, click that. otherwise
            // click the item.
            const clickable =
              el.querySelector('a') ||
              el.querySelector('input[type="checkbox"]') ||
              el.querySelector('button') ||
              el.querySelector('jha-button');
            if (clickable) {
              clickable.click();
            } else {
              el.click();
            }
          }
        }
        break;
      }
      case SPACE: {
        if (!this.open) {
          e.preventDefault();
          this.toggleMenu();
        } else {
          // if the currently focused element contains a button, click it.
          const el = this.menu.querySelector('jha-dropdown-menu-item[tabIndex="0"]');
          if (el) {
            const clickable = el.querySelector('button') || el.querySelector('jha-button');
            if (clickable) {
              e.preventDefault();
              clickable.click();
            }
          }
        }
        break;
      }
      case ESC: {
        this.closeMenu();
        break;
      }
      default:
        break;
    }
  }

  goDownOrOpenMenu() {
    if (this.open && this.menu) {
      const currentEl = this.menu.querySelector('jha-dropdown-menu-item[tabIndex="0"]');
      const items = this.menu.querySelectorAll('jha-dropdown-menu-item');
      if (currentEl) {
        const index = Array.from(items).indexOf(currentEl);
        this.blurItem(index);
        this.focusItem(index + 1 < items.length ? index + 1 : 0);
      } else {
        this.focusItem(0);
      }
    } else {
      this.openMenu();
    }
  }

  goUpOrOpenMenu() {
    if (this.open && this.menu) {
      const currentEl = this.menu.querySelector('jha-dropdown-menu-item[tabIndex="0"]');
      const items = this.menu.querySelectorAll('jha-dropdown-menu-item');
      if (currentEl) {
        const index = Array.from(items).indexOf(currentEl);
        this.blurItem(index);
        this.focusItem(index - 1 >= 0 ? index - 1 : items.length - 1);
      } else {
        this.focusItem(items.length);
      }
    } else {
      this.openMenu();
    }
  }

  toggleMenu() {
    if (this.open) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  /** @param {number} index */
  focusItem(index) {
    /** @type {NodeListOf<import('../jha-dropdown-menu-item/JhaDropdownMenuItem').default>} */
    const items = this.menu.querySelectorAll('jha-dropdown-menu-item');
    if (items[index]) {
      items[index].tabIndex = 0;
      items[index].focus();
      items[index].addEventListener('blur', this.boundBlurMenu_);
    }
  }

  /** @param {number} index */
  blurItem(index) {
    const items = this.menu.querySelectorAll('jha-dropdown-menu-item');
    if (items[index]) {
      items[index].removeEventListener('blur', this.boundBlurMenu_);
      items[index].removeAttribute('tabIndex');
    }
  }

  openMenu() {
    if (this.disabled) {
      return;
    }
    this.toggle.setAttribute('is-active', 'is-active');
    this.toggle.setAttribute('aria-expanded', 'true');
    setTimeout(() => {
      this.menu = this.querySelector('jha-dropdown-menu');
      this.toggle = this.querySelector('jha-dropdown-toggle');
      if (this.menu && this.toggle) {
        let focusIndex = 0;
        if (this.focusMatchingItem) {
          /** @type {Array<import('../jha-dropdown-menu-item/JhaDropdownMenuItem').default>} */
          const children = Array.from(this.menu.querySelectorAll('JHA-DROPDOWN-MENU-ITEM'));
          const matchIndex = children.findIndex((item) => item.innerText.indexOf(this.toggle.innerText.trim()) > -1);
          focusIndex = matchIndex < 0 ? 0 : matchIndex;

          this.focusItem(focusIndex);
        }
        document.addEventListener('click', this.boundClickDocument_);
        this.addEventListener('keydown', this.boundKeyHandler_);
        this.dispatchEvent(
          new CustomEvent('openDropdown', {
            bubbles: true,
            composed: true,
            detail: {
              duration: '.2s',
            },
          }),
        );

        this.open = true;
        window.requestAnimationFrame(() => {
          if (this.adjustToPageBottom) {
            this.adjustMenuBottom();
          }

          const menuContents = this.menu.querySelectorAll('*');
          menuContents.forEach((el) => {
            const elm = /** @type {HTMLElement} */ (el);
            elm.style.transition = 'none';
            elm.style.opacity = '0';
          });
          this.menu.style.transition = 'none';
          if (this.menu.openUp) {
            this.menu.style.transformOrigin = 'bottom';
          } else {
            this.menu.style.transformOrigin = 'top';
          }
          this.menu.style.transform = 'scaleY(0)';
          window.requestAnimationFrame(() => {
            menuContents.forEach((el) => {
              const elm = /** @type {HTMLElement} */ (el);
              elm.style.transition = 'opacity .15s ease-in-out .1s';

              elm.style.opacity = '1';
            });
            this.menu.style.transition = 'transform .2s ease-in-out';
            this.menu.style.transform = 'none';
          });
        });
      }
    }, 0);
  }

  adjustMenuBottom() {
    const pageBottom = document.querySelector('body').getBoundingClientRect().height;

    if (!pageBottom) {
      return;
    }

    // Reset the menu to original position
    this.menu.style.top = '';
    const menuBottom = this.toggle.getBoundingClientRect().bottom + this.menu.getBoundingClientRect().height;
    const menuYOffset = menuBottom - pageBottom;
    this.menu.openUp = menuYOffset > 0;
  }

  blurMenu() {
    if (!this.hovered && ((this.shadowRoot.activeElement || {}).tagName || '') !== 'jha-dropdown-menu-item') {
      this.removeEventListener('keydown', this.boundKeyHandler_);
    }
  }

  onHovered() {
    this.hovered = true;
  }

  onUnhovered() {
    this.hovered = false;
  }

  /** @param {!Event} evt */
  onClickDocument_(evt) {
    // clicking outside should always close the menu,
    // but clicking inside the menu should not, if disableItemMenuClose is true.
    let shouldClose = true;
    if (this.disableItemMenuClose) {
      // test for the click to be outside the menu.
      shouldClose = !this.disableOutsideClickClose && !(evt.composedPath() || []).includes(this);
    }
    if (shouldClose) {
      evt.preventDefault();
      this.closeMenu();
    }
  }

  closeMenu() {
    document.removeEventListener('click', this.boundClickDocument_);
    /** @type {Array<import('../jha-dropdown-menu-item/JhaDropdownMenuItem').default>} */
    const children = Array.from(this.menu.querySelectorAll('JHA-DROPDOWN-MENU-ITEM'));
    children.forEach((el) => el.blur());
    this.toggle.focus();
    this.toggle.setAttribute('aria-expanded', 'false');

    setTimeout(() => {
      this.menu = this.querySelector('jha-dropdown-menu');
      if (this.menu && this.toggle) {
        this.menu.removeAttribute('tabIndex');
        this.menu.removeEventListener('blur', this.boundBlurMenu_);
        const el = this.menu.querySelector('jha-dropdown-menu-item[tabIndex="0"]');
        if (el) {
          el.removeAttribute('tabIndex');
        }
        window.requestAnimationFrame(() => {
          /** @type {NodeListOf<HTMLElement>} */
          const menuContents = this.menu.querySelectorAll('*');
          menuContents.forEach((element) => {
            element.style.transition = 'opacity .2s ease-in-out';

            element.style.opacity = '0';
          });
          this.menu.style.transition = 'transform .1s ease-in-out .1s';
          this.menu.style.transform = 'scaleY(0)';
        });
        this.dispatchEvent(
          new CustomEvent('closeDropdown', {
            bubbles: true,
            composed: true,
            detail: {
              duration: '.1s',
            },
          }),
        );
        setTimeout(() => {
          this.open = false;
          this.menu.style.transform = '';
        }, 200);
        this.toggle.removeAttribute('is-active');
      }
    }, 0);
  }
}

export { styles as JhaDropdownStyles };
