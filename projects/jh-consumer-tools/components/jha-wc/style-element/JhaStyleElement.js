// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

/**
 * base class for style-only wrapper elements
 *
 * @slot unnamed slot for content
 */
import { LitElement, html } from 'lit';

export default class JhaStyleElement extends LitElement {
  render() {
    return html` <slot></slot> `;
  }
}
