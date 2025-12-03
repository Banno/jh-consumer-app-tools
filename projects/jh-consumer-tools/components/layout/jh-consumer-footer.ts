// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { type InstitutionContext, institutionContext } from '../../contexts/institution';

@customElement('jh-consumer-footer')
export default class JhConsumerFooter extends LitElement {
  @consume({ context: institutionContext, subscribe: true })
  @property({ type: Object })
  institutionContext: InstitutionContext | undefined;

  @property({ type: String, attribute: 'footer-text' })
  footerText: string = 'Equal Housing Lender';

  @property({ type: String, attribute: 'insurance-agency' })
  insuranceAgency: string = 'Member FDIC';

  @property({ type: Boolean, attribute: 'show-phone' })
  showPhone: boolean = false;

  @state()
  private currentYear: number = new Date().getFullYear();

  get institution() {
    return this.institutionContext?.institution;
  }

  get privacyPolicyText() {
    //TODO: Replace with a localization solution
    return this.institution?.privacyPolicyUrl ? 'Privacy Policy' : 'User Agreement';
  }

  get privacyPolicyUrl() {
    return this.institution?.privacyPolicyUrl || '/eula.html';
  }

  static styles = css`
    :host {
      display: block;
      background-color: var(--footer-background-color, #f8f8f8);
      color: var(--footer-text-color, #666);
      text-align: center;
      font-size: 12px;
      padding: 17px 20px;
      box-shadow: 0 -1px 0 rgba(0, 0, 0, 0.1);
      z-index: 1;
      line-height: 1.5;
    }
    span {
      margin: 0px 7px;
    }
    .ehl-icon {
      display: inline-block;
      fill: var(--footer-text-color, #666);
    }
    a {
      color: var(--footer-link-text-color, #006a9e);
      display: inline-block;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    br {
      display: none;
    }
    @media (max-width: 490px) {
      :host {
        padding: 20px;
      }
      br {
        display: block;
      }
      /* hide • at end of line when <br> is present */
      .end-of-line {
        display: none;
      }
    }
  `;

  renderPhone() {
    if (!this.showPhone || !this.institution?.phoneNumber) return '';
    // TODO: phone number formatting was done by PhoneUtil in banno-online
    return html`
      ${this.institution.phoneNumber}
      <span class="end-of-line">•</span>
      <br />
    `;
  }

  renderInsuranceAgency() {
    if (!this.insuranceAgency) return '';
    return html`
      <span class=${this.showPhone ? '' : 'end-of-line'}>•</span>
      ${this.showPhone ? '' : html` <br /> `} ${this.insuranceAgency}
    `;
  }

  renderFooterText() {
    if (!this.footerText) return '';
    return html`
      <span class="end-of-line">•</span>
      <br />
      <svg
        width="16"
        height="11"
        viewBox="0 0 10 7"
        class="ehl-icon"
        aria-hidden="true">
        <path
          d="M4.96.222L.337 2.588v.962l.511.007v3.448h8.186L9.03 3.55h.55v-.962L4.959.222zm3.163 5.872H1.76V3.028l3.2-1.65 3.163 1.65v3.066zm-4.677-2.26h2.999v-.828H3.446v.828zm0 1.489h2.985v-.828H3.446v.828z"></path>
      </svg>
      ${this.footerText}
    `;
  }

  render() {
    if (this.institutionContext.state !== 'ready') {
      return html``;
    }
    return html`
      © ${this.currentYear} ${this.institution.displayName}
      <span>•</span>
      ${this.renderPhone()}
      <a href=${this.privacyPolicyUrl}>${this.privacyPolicyText}</a>
      ${this.renderInsuranceAgency()} ${this.renderFooterText()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'jh-consumer-footer': JhConsumerFooter;
  }
}
