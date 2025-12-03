// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { type DisplayLink } from '../../controllers/navigation';

import './jh-consumer-menu-group';

const iconMap = {
  dashboard: () => import('@jack-henry/jh-icons/icons-wc/icon-dashboard.js'),
  envelope: () => import('@jack-henry/jh-icons/icons-wc/icon-envelope.js'),
  wallet: () => import('@jack-henry/jh-icons/icons-wc/icon-wallet.js'),
  'arrow-right-arrow-left': () => import('@jack-henry/jh-icons/icons-wc/icon-arrow-right-arrow-left.js'),
  'arrow-turn-down-to-bracket': () => import('@jack-henry/jh-icons/icons-wc/icon-arrow-turn-down-to-bracket.js'),
  'receipt-bill': () => import('@jack-henry/jh-icons/icons-wc/icon-receipt-bill.js'),
  'circle-dollar': () => import('@jack-henry/jh-icons/icons-wc/icon-circle-dollar.js'),
  'arrow-from-w': () => import('@jack-henry/jh-icons/icons-wc/icon-arrow-from-w.js'),
  'arrow-from-a': () => import('@jack-henry/jh-icons/icons-wc/icon-arrow-from-a.js'),
  lightbulb: () => import('@jack-henry/jh-icons/icons-wc/icon-lightbulb.js'),
  'document-invoice': () => import('@jack-henry/jh-icons/icons-wc/icon-document-invoice.js'),
  'document-pen': () => import('@jack-henry/jh-icons/icons-wc/icon-document-pen.js'),
  question: () => import('@jack-henry/jh-icons/icons-wc/icon-question.js'),
  'circle-plus': () => import('@jack-henry/jh-icons/icons-wc/icon-circle-plus.js'),
  'arrow-left-from-square': () => import('@jack-henry/jh-icons/icons-wc/icon-arrow-left-from-square.js'),
  gear: () => import('@jack-henry/jh-icons/icons-wc/icon-gear.js'),
  'chevron-up-small': () => import('@jack-henry/jh-icons/icons-wc/icon-chevron-up-small.js'),
  'chevron-down-small': () => import('@jack-henry/jh-icons/icons-wc/icon-chevron-down-small.js'),
  'circle-user': () => import('@jack-henry/jh-icons/icons-wc/icon-circle-user.js'),
  building: () => import('@jack-henry/jh-icons/icons-wc/icon-building.js'),
  'screwdriver-wrench': () => import('@jack-henry/jh-icons/icons-wc/icon-screwdriver-wrench.js'),
  'arrow-trend-up': () => import('@jack-henry/jh-icons/icons-wc/icon-arrow-trend-up.js'),
  'icon-shield-dollar-sign': () => import('@jack-henry/jh-icons/icons-wc/icon-shield-dollar-sign.js'),
  globe: () => import('@jack-henry/jh-icons/icons-wc/icon-globe.js'),
  briefcase: () => import('@jack-henry/jh-icons/icons-wc/icon-briefcase.js'),
  'building-column': () => import('@jack-henry/jh-icons/icons-wc/icon-building-columns.js'),
  'circle-chevrons-right': () => import('@jack-henry/jh-icons/icons-wc/icon-circle-chevrons-right.js'),
  'life-preserver': () => import('@jack-henry/jh-icons/icons-wc/icon-life-preserver.js'),
  document: () => import('@jack-henry/jh-icons/icons-wc/icon-document.js'),
  'chart-bar': () => import('@jack-henry/jh-icons/icons-wc/icon-chart-bar.js'),
  star: () => import('@jack-henry/jh-icons/icons-wc/icon-star.js'),
  'credit-card': () => import('@jack-henry/jh-icons/icons-wc/icon-credit-card.js'),
  gauge: () => import('@jack-henry/jh-icons/icons-wc/icon-gauge.js'),
  'money-bill-heart': () => import('@jack-henry/jh-icons/icons-wc/icon-money-bill-heart.js'),
  'money-check': () => import('@jack-henry/jh-icons/icons-wc/icon-money-check.js'),
};

@customElement('jh-consumer-nav')
export default class JhConsumerNav extends LitElement {
  @property({ type: Array })
  links: DisplayLink[] = [];

  @property({ type: String })
  activeLink = '';

  static get styles() {
    return [
      css`
        a {
          box-sizing: border-box;
          width: 100%;
          height: 48px;
          border-width: 0;
          cursor: pointer;
          padding: 0px 16px;
          font-size: 16px;
          text-align: left;
          display: flex;
          align-items: center;
          position: relative;
          outline: none;
          color: var(--menu-text-color);
          text-decoration: none;
        }

        .label {
          flex-grow: 1;
        }

        .icon {
          margin-right: 10px;
          flex-shrink: 0;
          width: 24px;
          height: 24px;
          padding: 6px;
          border-radius: 50%;
          background-color: var(--menu-icon-background-color);
          --jh-icon-color-fill: var(--menu-icon-color);
        }
        a:hover,
        a:focus-visible {
          color: var(--menu-text-pressed-color);
          background-color: var(--menu-item-pressed-color);
        }

        a[is-active],
        a:active {
          background-color: var(--menu-item-selected-color);
          color: var(--menu-text-selected-color);
          font-weight: 500;
          fill: var(--menu-text-selected-color);
        }
        a[is-active] .icons {
          background-color: var(--menu-icon-background-selected-color);
          fill: var(--menu-icon-selected-color);
        }

        a[is-active]:before {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          width: 4px;
          background: var(--menu-item-selected-accent-color);
        }

        a:hover .icon {
          background-color: var(--menu-icon-background-pressed-color);
          fill: var(--menu-icon-pressed-color);
        }
      `,
    ];
  }

  get activeMenu() {
    const activeMenuItem = this.links.find((link) => (link.links || []).some((subLink) => this.isActiveLink(subLink)));
    return activeMenuItem ? activeMenuItem.id : '';
  }

  isActiveLink(link: DisplayLink) {
    const active =
      // link.id === this.activeLink ||
      window.location.pathname === link.url;
    // ||
    // (link.associatedRoutes || []).includes(this.activeLink); // TODO: need to implement associated routes?

    return active;
  }

  renderLink(link: DisplayLink, sub: boolean = false) {
    let icon;
    if (!sub) {
      iconMap[link.icon]?.();
      icon = unsafeHTML(`<jh-icon-${link.icon} class="icon"></jh-icon-${link.icon}>`);
    }

    return html`
      <a
        href=${link.url}
        aria-current=${this.isActiveLink(link)}
        ?is-active=${this.isActiveLink(link)}>
        ${!sub ? icon : ''}
        <div class="label">${link.title}</div>
      </a>
    `;
  }

  renderMenuGroup(link: DisplayLink) {
    if (iconMap[link.icon]) {
      // ensure icon is imported
      iconMap[link.icon]();
    }
    return html`
      <jh-consumer-menu-group
        .menuTitle=${link.title}
        id=${link.id}
        ?active=${link.id === this.activeMenu}>
        ${link.icon ? unsafeHTML(`<jh-icon-${link.icon} class="icon" slot="icon"></jh-icon-${link.icon}>`) : ''}
        ${link.links.map((subLink) => this.renderLink(subLink, true))}
      </jh-consumer-menu-group>
    `;
  }

  render() {
    return html`
      <nav>
        ${this.links.map((link) =>
          link.links && link.links.length ? this.renderMenuGroup(link) : this.renderLink(link),
        )}
      </nav>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'jh-consumer-nav': JhConsumerNav;
  }
}
