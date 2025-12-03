// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import { LitElement, html, css } from 'lit';
import { jhaStyles } from '../styles/jha-styles.js';
import '../jha-card/jha-card.js';
import '../jha-button/jha-button.js';

const ICONS = {
  warning: 'warning',
  success: 'success',
};

const styles = css`
  :host {
    font-family: -apple-system, system-ui, 'Segoe UI', Roboto, 'Helvetica Neue';
    display: block;
    margin: 0;
    width: var(--jha-dialog-width, 600px);
    max-width: 100%;
  }

  :host([drawer]) {
    width: 100%;
  }

  :host([disable-scrolling]) article {
    overflow: hidden;
  }

  :host jha-card {
    max-height: calc(100vh - 90px);
    min-height: var(--jha-dialog-min-height, unset);
  }

  :host([drawer]) jha-card {
    height: 100vh;
    max-height: unset;
    --jha-card-border-radius: 0;
  }
  h1 {
    color: var(--jha-text-base, var(--body-text-primary-color));
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    text-align: var(--jha-dialog-header-align, center);
    margin: var(--jha-dialog-header-margin, 0);
    flex: 1;
  }
  header {
    margin-left: var(--jha-card-header-margin-left, 24px);
  }
  .jha-card-header {
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }
  .jha-card-header button {
    flex: 0;
  }
  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .footer {
    display: flex;
    justify-content: center;
  }
  .footer jha-button {
    margin-right: 8px;
  }
  :host ::slotted(*[slot='icon']),
  jh-icon-circle-checkmark,
  jh-icon-circle-exclamation {
    width: 120px;
    height: 120px;
  }
  jh-icon-circle-checkmark {
    fill: var(--jha-color-success, #4caf50);
  }
  jh-icon-circle-exclamation {
    fill: var(--jha-color-warning, #fca902);
  }
  :host ::slotted(*[slot='dialog-content']) {
    width: 100%;
  }
  jha-card {
    --jha-card-border-radius: 8px;
    margin: 0;
    display: flex;
    flex-direction: column;
    max-width: unset !important;
  }

  jha-card h1 {
    color: var(--jha-text-dark, #455564);
    font-weight: 500;
    font-size: var(--jha-dialog-header-font-size, 16px);
    line-height: 24px;
    text-align: var(--jha-dialog-header-align, center);
  }

  :host(:not([drawer])) jha-card header {
    --jha-border-color: transparent;
  }

  :host([drawer]) jha-card h1 {
    text-align: left;
    margin: 0;
  }

  jha-card article {
    --jha-card-article-padding-top: 0;
    flex: 1;
    overflow: auto;
    margin-bottom: 16px;
  }
  .dialog-content {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  h2 {
    color: var(--jha-text-dark, #455564);
    font-size: 18px;
    margin: 0;
    font-weight: 500;
    width: 100%;
    margin-top: 24px;
    margin-bottom: 10px;
    text-align: center;
  }
  p {
    text-align: center;
    max-width: 400px;
    margin: 0 auto 33px;
    font-size: 14px;
    line-height: 1.4em;
    color: var(--jha-text-light, #8c989f);
    padding: 0 8px;
  }
  @media (max-height: 480px) {
    :host jha-card {
      max-height: 100vh;
      --jha-card-border-radius: 0;
    }
  }

  @media (max-width: 480px), (max-height: 480px) {
    :host {
      width: 100%;
    }
  }
`;

/**@element jha-dialog */
class JhaDialog extends LitElement {
  static get styles() {
    return [jhaStyles, styles];
  }

  static get properties() {
    return {
      heading: {
        type: String,
      },
      title: {
        type: String,
      },
      messageHeader: {
        type: String,
      },
      messageBody: {
        type: String,
      },
      cancelLabel: {
        type: String,
      },
      confirmLabel: {
        type: String,
      },
      icon: {
        type: String,
      },
      hideHeader: {
        type: Boolean,
      },
      hideCancel: {
        type: Boolean,
        reflect: true,
        attribute: 'hide-cancel',
      },
      hideConfirm: {
        type: Boolean,
        reflect: true,
        attribute: 'hide-confirm',
      },
      async: {
        type: Boolean,
      },
      confirmAppearance: {
        type: String,
      },
      disableScrolling: {
        type: Boolean,
        reflect: true,
        attribute: 'disable-scrolling',
      },
    };
  }

  constructor() {
    super();
    import('@jack-henry/jh-icons/icons-wc/icon-xmark.js');
    import('@jack-henry/jh-icons/icons-wc/icon-circle-exclamation.js');
    import('@jack-henry/jh-icons/icons-wc/icon-circle-checkmark.js');

    this.heading = null;
    /** @deprecated  use "heading" instead */
    // eslint-disable-next-line wc/no-constructor-attributes
    this.title = null;
    this.messageHeader = null;
    this.messageBody = null;
    this.cancelLabel = null;
    this.confirmLabel = 'OK';
    this.icon = null;
    this.hideHeader = false;
    this.hideCancel = false;
    this.hideConfirm = false;
    this.async = false;
    this.confirmAppearance = '';
    this.disableScrolling = false;
    this.boundToggleDisableDialogScrolling_ = this.toggleDisableDialogScrolling.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('popover-open', this.boundToggleDisableDialogScrolling_);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('popover-open', this.boundToggleDisableDialogScrolling_);
  }

  toggleDisableDialogScrolling(evt) {
    const { detail } = evt;
    this.disableScrolling = detail;
  }

  /**
   * @param {!string} event
   * @param {*=} detail
   */
  dispatchDialogEvent(event, detail = null) {
    this.dispatchEvent(
      new CustomEvent(event, {
        bubbles: true,
        composed: true,
        detail,
      }),
    );
  }

  /** @param {*=} detail */
  dispatchDialogConfirm(detail = null) {
    this.dispatchDialogEvent(JhaDialog.events.CONFIRM, detail);
  }

  renderIcon() {
    if (this.icon === ICONS.success) {
      return html` <jh-icon-circle-checkmark></jh-icon-circle-checkmark> `;
    }

    if (this.icon === ICONS.warning) {
      return html` <jh-icon-circle-exclamation></jh-icon-circle-exclamation> `;
    }

    return html` <slot name="icon"></slot> `;
  }

  renderMessage() {
    return html`
      ${this.messageHeader ? html` <h2>${this.messageHeader}</h2> ` : ''}
      ${this.messageBody ? html` <p>${this.messageBody}</p> ` : ''}
    `;
  }

  render() {
    return html`
      <jha-card>
        ${this.hideHeader
          ? ''
          : html`
              <header slot="header">
                <div class="jha-card-header">
                  <slot name="header-left"></slot>
                  ${this.heading || this.title ? html` <h1>${this.heading || this.title}</h1> ` : ''}
                  ${this.hideCancel
                    ? ''
                    : html`
                        <button
                          type="button"
                          @click=${() => this.dispatchDialogEvent(JhaDialog.events.CANCEL)}
                          button-reset>
                          <jh-icon-xmark></jh-icon-xmark>
                        </button>
                      `}
                </div>
                <slot
                  slot="header"
                  name="header-bottom"></slot>
              </header>
            `}
        <article>
          <slot name="dialog-content">
            <div class="dialog-content">${this.renderIcon()} ${this.renderMessage()}</div>
          </slot>
          <div class="footer">
            ${this.cancelLabel && !this.hideCancel
              ? html`
                  <jha-button
                    wide
                    outline
                    sync
                    @click=${() => this.dispatchDialogEvent(JhaDialog.events.CANCEL)}>
                    ${this.cancelLabel}
                  </jha-button>
                `
              : ''}
            ${this.confirmLabel && !this.hideConfirm
              ? html`
                  <jha-button
                    wide
                    primary
                    ?danger=${this.confirmAppearance === 'danger'}
                    ?success=${this.confirmAppearance === 'success'}
                    ?sync=${!this.async}
                    @click=${() => this.dispatchDialogEvent(JhaDialog.events.CONFIRM)}>
                    ${this.confirmLabel}
                  </jha-button>
                `
              : ''}
          </div>
        </article>
      </jha-card>
    `;
  }
}
JhaDialog.events = {
  CANCEL: 'cancel',
  CONFIRM: 'confirm',
};

export default JhaDialog;
export { styles as JhaDialogStyles };
