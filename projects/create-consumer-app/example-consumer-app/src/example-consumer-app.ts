// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { RoutingMixin } from '@jack-henry/web-component-router/lib/routing.mixin.js';

// apps must import the layout component to ensure it's registered and included in the build
import '@jack-henry/consumer-tools/components/jh-consumer-layout';

@customElement('example-consumer-app')
export default class ExampleConsumerApp extends RoutingMixin(LitElement) {
  // all apps get passed the institutionId via the `institution-id' attribute
  @property({ type: String, attribute: 'institution-id' })
  institutionId: string = '';

  render() {
    return html` <slot></slot>`;
  }
}
