// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { RoutingMixin } from '@jack-henry/web-component-router/lib/routing.mixin.js';
import { userContext, type UserContext } from '@jack-henry/consumer-tools/contexts/user';

import '@jack-henry/consumer-tools/components/layout/jh-card-columns-layout.js';
import '@jack-henry/jh-elements/components/card/card';
import '@jack-henry/jh-elements/components/button/button';
import '@jack-henry/jh-elements/components/list-group/list-group';
import '@jack-henry/jh-elements/components/list-item/list-item';
import '@jack-henry/consumer-tools/components/layout/jh-consumer-card-header';
import DialogUtil from '@jack-henry/consumer-tools/utils/dialog-util';
import { showToast } from '@jack-henry/consumer-tools/utils/toast-util.js';

@customElement('example-consumer-app-dashboard')
export class ExampleConsumerAppDashboard extends RoutingMixin(LitElement) {
  static styles = css`
    :host {
      display: block;
    }
    footer {
      display: flex;
      gap: 8px;
      justify-content: right;
    }
  `;

  @consume({ context: userContext, subscribe: true })
  user!: UserContext;

  constructor() {
    super();
    // import icons dynamically
    import('@jack-henry/jh-icons/icons-wc/icon-user.js');
    import('@jack-henry/jh-icons/icons-wc/icon-magnifying-glass.js');
  }

  async openSearchDialog() {
    const el = document.createElement('div');
    el.innerHTML = 'search goes here';
    try {
      await DialogUtil.awaitDialog({ title: 'Search', el });
    } catch (e) {
      // nothing to do here, dialog was closed/canceled
    }
  }

  async openWarningDialog() {
    try {
      await DialogUtil.awaitDialog({
        title: 'Warning',
        messageHeader: 'This is a warning dialog',
        messageBody: 'Are you really sure?',
        icon: 'warning',
        cancelLabel: 'No, go back',
        confirmLabel: 'Yes, I am sure',
        confirmCallback: async () => {
          showToast({ message: 'Confirmed!', duration: 3000, role: 'success' });
        },
      });
    } catch (error) {
      showToast({ message: 'Canceled!', duration: 3000, role: 'danger' });
    }
  }

  render() {
    return html` <jh-card-columns-layout>
      <jh-card
        slot="left-column"
        show-header-divider
        show-footer-divider
        footer-divider-inset="24"
        header-divider-inset="24"
        padding="medium">
        <jh-consumer-card-header
          heading="Welcome to a dashboard, ${this.user?.user?.given_name}!"
          slot="jh-card-header">
          <jh-button
            appearance="tertiary"
            slot="jh-card-header-right"
            size="small"
            accessible-label="search users"
            @click=${this.openSearchDialog}>
            <jh-icon-magnifying-glass slot="jh-button-icon"></jh-icon-magnifying-glass>
          </jh-button>
        </jh-consumer-card-header>
        <article>
          <jh-list-group>
            <jh-list-item
              show-divider
              divider-inset="24"
              ><jh-icon-user slot="jh-list-item-left"></jh-icon-user>
              <div slot="jh-list-item-content">Jack Johnson</div></jh-list-item
            >
            <jh-list-item
              show-divider
              divider-inset="24"
              ><jh-icon-user slot="jh-list-item-left"></jh-icon-user>
              <div slot="jh-list-item-content">Fred Flintstone</div></jh-list-item
            >
            <jh-list-item
              show-divider
              divider-inset="24"
              ><jh-icon-user slot="jh-list-item-left"></jh-icon-user>
              <div slot="jh-list-item-content">Barney Rubble</div></jh-list-item
            >
          </jh-list-group>
        </article>
        <footer slot="jh-card-footer">
          <jh-button
            appearance="primary"
            size="small"
            label="Primary"></jh-button>
          <jh-button
            appearance="secondary"
            size="small"
            label="Open Dialog"
            @click=${this.openWarningDialog}></jh-button>
        </footer>
      </jh-card>
      <jh-card
        slot="right-column"
        show-header-divider
        header-divider-inset="24"
        padding="medium">
        <jh-consumer-card-header
          heading="Additional Information"
          slot="jh-card-header">
        </jh-consumer-card-header>
        <article>Here is some additional information.</article>
      </jh-card>
    </jh-card-columns-layout>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'example-consumer-app-dashboard': ExampleConsumerAppDashboard;
  }
}
