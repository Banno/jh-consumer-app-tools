// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import LoginController from '../../controllers/login-controller';
import { type Institution } from '../../types/institution';
import { type User } from '../../controllers/login-controller';

import '../jha-wc/dropdowns/jha-dropdown/jha-dropdown.js';
import '../jha-wc/dropdowns/jha-dropdown-menu/jha-dropdown-menu.js';
import '../jha-wc/dropdowns/jha-dropdown-menu-item/jha-dropdown-menu-item.js';
import '../jha-wc/dropdowns/jha-dropdown-toggle/jha-dropdown-toggle.js';
import '../jha-wc/jha-avatar/jha-avatar.js';

const BASE_URL = `https://${ONLINE_DOMAIN}`;
@customElement('jh-consumer-user-menu')
export class JhConsumerUserMenu extends LitElement {
  // user-menu can't use contexts because it's in a dialog on mobile
  @property({ type: Object })
  user: User = {} as User;

  @property({ type: Object })
  institution: Institution = {} as Institution;

  getInitials() {
    if (this.user.picture) {
      return null;
    }
    if (this.user.given_name && this.user.family_name) {
      return `${this.user.given_name[0]}${this.user.family_name[0]}`;
    }
    return '';
  }

  constructor() {
    super();
    this.importIcons();
  }

  importIcons() {
    import('@jack-henry/jh-icons/icons-wc/icon-circle-plus.js');
    import('@jack-henry/jh-icons/icons-wc/icon-circle-user.js');
    import('@jack-henry/jh-icons/icons-wc/icon-building.js');
    import('@jack-henry/jh-icons/icons-wc/icon-gear.js');
    import('@jack-henry/jh-icons/icons-wc/icon-arrow-left-from-square.js');
    import('@jack-henry/jh-icons/icons-wc/icon-chevron-up-small.js');
  }

  static styles = css`
    :host {
      display: block;
      --jha-dropdown-menu-item-background-color: var(--menu-background-color);
    }
    jha-dropdown button,
    jha-dropdown a {
      box-sizing: border-box;
      width: 100%;
      height: 48px;
      border-width: 0;
      cursor: pointer;
      padding: 0px 16px;
      font-size: 16px;
      text-align: left;
      text-decoration: none;
      touch-action: manipulation;
      background-color: transparent;
      display: flex;
      align-items: center;
      color: var(--menu-text-color);
    }
    .icon {
      margin-right: 10px;
      flex-shrink: 0;
      width: 24px;
      height: 24px;
      padding: 6px;
      border-radius: 50%;
      background-color: var(--menu-icon-background-color);
      fill: var(--menu-icon-color);
    }
    .sidebar-user-menu {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      border-top: 1px solid var(--menu-divider-color);
      background: var(--menu-background-color);
    }
    .sidebar-user-menu-toggle {
      height: 64px;
    }
    jha-dropdown-menu {
      background: var(--menu-background-color);
      bottom: 63px;
      left: 0;
      top: auto;
      border-radius: 0;
      box-shadow: 0px -3px 4px -2px rgba(0, 0, 0, 0.2);
    }
    jha-avatar {
      width: 36px;
      height: 36px;
      margin-right: 12px;
    }
    jha-dropdown-toggle jh-icon-chevron-up-small {
      transition: transform 0.2s ease-in-out;
      fill: var(--menu-text-color);
      margin-left: auto;
      --icon-size: 24px;
    }
    jha-dropdown-toggle[is-active] jh-icon-chevron-up-small {
      transform: rotate(180deg);
    }
    jha-dropdown-menu-item:hover {
      --menu-icon-color: var(--menu-icon-pressed-color);
    }

    jha-dropdown-toggle {
      outline: none;
    }
    jha-dropdown-menu-item:hover a,
    jha-dropdown-menu-item:hover button,
    jha-dropdown-toggle button:hover,
    jha-dropdown-toggle:focus {
      color: var(--menu-text-pressed-color);
      background-color: var(--menu-item-pressed-color);
    }
    /* Keep this separate, because Edge and IE don't like focus-within (they'll just ignore it) */
    jha-dropdown-toggle:focus-within {
      color: var(--menu-text-pressed-color);
      background-color: var(--menu-item-pressed-color);
    }
  `;

  render() {
    return html`
      <jha-dropdown
        class="sidebar-user-menu"
        disableItemMenuClose>
        <jha-dropdown-toggle slot="toggle">
          <button
            type="button"
            aria-label="User Menu"
            class="sidebar-user-menu-toggle toggle-button">
            <jha-avatar
              profile
              .initials=${this.getInitials()}
              .avatar=${this.user.picture}></jha-avatar>
            <span>${this.user.profile?.preferredName || 'My Profile'}</span>
            <jh-icon-chevron-up-small></jh-icon-chevron-up-small>
          </button>
        </jha-dropdown-toggle>

        <jha-dropdown-menu
          dropup
          class="sidebar-user-menu-dropup">
          <jha-dropdown-menu-item>
            <a href="https://${ONLINE_DOMAIN}/settings">
              <jh-icon-circle-user class="icon"></jh-icon-circle-user>
              <div>Personal Settings</div>
            </a>
          </jha-dropdown-menu-item>

          ${this.institution.abilities?.userManagement && this.user.profile?.organization?.adminLevel !== 'User'
            ? html` <jha-dropdown-menu-item>
                <a href="${BASE_URL}/settings/manage-users">
                  <jh-icon-building class="icon"></jh-icon-building>
                  <div>Business Management</div>
                </a>
              </jha-dropdown-menu-item>`
            : ''}

          <jha-dropdown-menu-item>
            <a href=${`${BASE_URL}/settings/institution/${this.institution.id}`}>
              <jh-icon-gear class="icon"></jh-icon-gear>
              <div>Account Settings</div>
            </a>
          </jha-dropdown-menu-item>

          <jha-dropdown-menu-item>
            <a
              href="/logout"
              @click=${this.logout}>
              <jh-icon-arrow-left-from-square class="icon"></jh-icon-arrow-left-from-square>
              <div>Sign Out</div>
            </a>
          </jha-dropdown-menu-item>
        </jha-dropdown-menu>
      </jha-dropdown>
    `;
  }

  openAccountMenu() {
    // Dispatch an event to open the account menu
  }

  logout(e: Event) {
    LoginController.logout();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'jh-consumer-user-menu': JhConsumerUserMenu;
  }
}
