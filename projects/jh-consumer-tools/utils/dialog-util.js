// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

// @ts-nocheck
import JhaDialog from '../components/jha-wc/jha-dialog/jha-dialog.js';
import DialogCss from './dialog-styling.js';
/**
 * @typedef {Object} DialogConfig
 * @property {string=} title
 * @property {string=} messageHeader
 * @property {string=} messageBody
 * @property {string=} cancelLabel
 * @property {string=} confirmLabel
 * @property {string=} icon
 * @property {boolean=} hideHeader
 * @property {boolean=} hideCancel
 * @property {boolean=} hideConfirm
 * @property {boolean=} drawer
 * @property {string=} drawerSize
 * @property {Element=} el
 * @property {Element=} iconEl
 * @property {Element=} dialog
 * @property {() => Promise<void>=} confirmCallback
 * @property {'success'|'danger'=} confirmAppearance
 */
class DialogUtil {
  constructor() {
    /** @type {JhaDialog|import('lit').LitElement} */
    this.dialogElement = null;
    /** @type {HTMLElement} */
    this.dialog_ = null;
    /** @private */
    this.cancel_ = undefined;
    /** @private */
    this.confirm_ = undefined;
  }
  /** @private */
  buildDialog_() {
    this.dialog_ = document.querySelector('dialog');
    if (!this.dialog_) {
      const dialog = document.createElement('dialog');
      document.querySelector('body').appendChild(dialog);
      this.dialog_ = document.querySelector('dialog');
    }
    let dialogStyles = document.getElementById('dialog-styles');
    if (!dialogStyles) {
      dialogStyles = document.createElement('style');
      dialogStyles.id = 'dialog-styles';
      document.head.append(dialogStyles);
    }
    dialogStyles.innerHTML = DialogCss;
    // make sure we cleanup when dismissing the dialog with the esc key
    // eslint-disable-next-line @jack-henry/ux/prefer-arrow-event-handler
    this.dialog_.addEventListener('close', () => {
      this.cleanupDialog_();
    });
    // ensure only one background click listener
    // eslint-disable-next-line @jack-henry/ux/prefer-arrow-event-handler
    this.dialog_.addEventListener('mousedown', (event) => {
      this.handleBackgroundClick(event);
    });
  }
  /** @private */
  cleanupDialog_() {
    if (!this.dialog_) return;
    // remove all children
    while (this.dialog_.firstChild) {
      this.dialog_.removeChild(this.dialog_.firstChild);
    }
    // remove any existing attributes
    while (this.dialog_.attributes.length) {
      this.dialog_.removeAttribute(this.dialog_.attributes[0].name);
    }
  }
  /** @param {Event=}  event */
  handleBackgroundClick(event) {
    if (!this.dialog_ || (this.dialogElement || {}).hideCancel) return;
    const path = (event && event.composedPath && event.composedPath()) || [];
    if (!path.includes(this.dialogElement)) {
      this.cancel_();
    }
  }
  /** @param {DialogConfig} config */
  awaitDialog(config) {
    if (!this.dialog_) {
      this.buildDialog_();
    }
    return new Promise((resolve, reject) => {
      if (config.dialog) {
        this.dialogElement = config.dialog;
      } else {
        this.dialogElement = new JhaDialog();
        if (config.el) {
          config.el.slot = 'dialog-content';
          this.dialogElement.appendChild(config.el);
        }
        if (config.iconEl) {
          config.iconEl.slot = 'icon';
          this.dialogElement.appendChild(config.iconEl);
        }
        this.dialogElement.title = config.title;
        this.dialogElement.messageHeader = config.messageHeader;
        this.dialogElement.messageBody = config.messageBody;
        this.dialogElement.cancelLabel = config.cancelLabel;
        this.dialogElement.confirmLabel = config.confirmLabel;
        this.dialogElement.icon = config.icon;
        this.dialogElement.hideHeader = config.hideHeader;
        this.dialogElement.hideCancel = config.hideCancel;
        this.dialogElement.hideConfirm = config.hideConfirm;
        this.dialogElement.async = Boolean(config.confirmCallback);
        this.dialogElement.confirmAppearance = config.confirmAppearance;
      }
      this.cancel_ = async (evt) => {
        if (evt) {
          evt.preventDefault();
        }
        await this.closeModal();
        reject(new Error('Dialog cancel event'));
      };
      this.confirm_ = async (evt) => {
        if (config.confirmCallback) {
          await config.confirmCallback();
        }
        await this.closeModal();
        resolve(evt.detail);
      };
      this.dialogElement.addEventListener(JhaDialog.events.CONFIRM, this.confirm_, { once: true });
      if (!config.hideCancel) {
        this.dialog_.addEventListener(JhaDialog.events.CANCEL, this.cancel_, {
          once: true,
        });
      }
      this.openModal();
      this._handleDrawerStyle(config.drawer, config.drawerSize);
    });
  }
  _handleDrawerStyle(isDrawer = false, drawerSize = 'small') {
    if (!this.dialog_) return;
    if (isDrawer) {
      this.dialog_.setAttribute('drawer', '');
      this.dialog_.setAttribute('drawer-size', drawerSize);
      this.dialogElement.setAttribute('drawer', '');
    } else {
      this.dialog_.removeAttribute('drawer');
      this.dialog_.removeAttribute('drawer-size');
    }
  }
  openModal() {
    if (!this.dialog_) return;
    this.cleanupDialog_();
    this.dialog_.appendChild(this.dialogElement);
    if (this.dialog_.showModal) {
      this.dialog_.showModal();
    }
    document.body.classList.add('has-dialog');
  }
  closeModal() {
    return new Promise((resolve) => {
      document.body.classList.remove('has-dialog');
      if (!this.dialog_) return;
      this.dialog_.classList.add('hide');
      const removeAfterFade_ = () => {
        if (!this.dialog_) return;
        this.dialog_.removeEventListener('animationend', removeAfterFade_, false);
        this.dialog_.classList.remove('hide');
        this.dialog_.close();
        this.cleanupDialog_();
        this.dialogElement = null;
        resolve();
      };
      this.dialog_.addEventListener('animationend', removeAfterFade_, {
        capture: false,
        once: true,
      });
    });
  }
}
const dialogUtil = new DialogUtil();
export default dialogUtil;
