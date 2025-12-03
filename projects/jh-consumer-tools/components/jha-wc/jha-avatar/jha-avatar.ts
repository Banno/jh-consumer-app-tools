// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import JhaAvatar from './JhaAvatar';

customElements.define('jha-avatar', JhaAvatar);
/** @customElement jha-avatar */
export default JhaAvatar;

declare global {
  // eslint-disable-next-line no-unused-vars
  interface HTMLElementTagNameMap {
    'jha-avatar': JhaAvatar;
  }
}
