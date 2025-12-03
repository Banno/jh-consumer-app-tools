// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { RoutingMixin } from '@jack-henry/web-component-router/lib/routing.mixin.js';
import { userContext, type UserContext } from '@jack-henry/consumer-tools/contexts/user';
import '@jack-henry/consumer-tools/components/layout/jh-single-column-layout.js';
import '@jack-henry/consumer-tools/components/layout/jh-consumer-card-header';
import '@jack-henry/jh-elements/components/card/card';

@customElement('example-consumer-app-transactions')
export class ExampleConsumerAppTransactions extends RoutingMixin(LitElement) {
  static styles = css`
    :host {
      display: block;
    }
  `;

  @consume({ context: userContext, subscribe: true })
  user!: UserContext;

  render() {
    return html` <jh-single-column-layout>
      <jh-card
        show-header-divider
        header-divider-inset="24"
        padding="medium">
        <jh-consumer-card-header
          heading="Welcome to the transactions page, ${this.user.user.given_name}!"
          slot="jh-card-header">
        </jh-consumer-card-header>
      </jh-card>
    </jh-single-column-layout>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'example-consumer-app-transactions': ExampleConsumerAppTransactions;
  }
}
