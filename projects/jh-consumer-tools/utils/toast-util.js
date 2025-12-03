// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import JhaToastContainer from '../components/jha-wc/jha-toast-container/jha-toast-container.js';
/**
 * Show a toast message or element in the corner of the page
 * @param {import('../components/jha-wc/jha-toast-container/JhaToastContainer.js').ToastObject} toastObject
 */
const showToast = (toastObject) => {
  const pageBody = document.querySelector('body');
  let toastContainer = /** @type{?JhaToastContainer} */ (pageBody.querySelector('jha-toast-container'));
  if (!toastContainer) {
    toastContainer = new JhaToastContainer();
    pageBody.appendChild(toastContainer);
  }
  toastContainer.addToast(toastObject);
};
export { showToast };
