import { LitElement, html, css, unsafeCSS } from 'lit';
import { customElement } from 'lit/decorators.js';
import '@jack-henry/jh-elements/components/card/card.js';
import '@jack-henry/jh-elements/components/list-item/list-item.js';
import '@jack-henry/jh-elements/components/button/button.js';

@customElement('example-app')
export class ExampleApp extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 16px;
      width: 600px;
      max-width: 100%;
    }
    jh-card {
      width: 100%;
    }
    div[slot='jh-card-media'] {
      background-image: url(${unsafeCSS(ASSETS.light.backgroundLandscape)});
      background-size: cover;
      background-position: center;
      height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    div[slot='jh-card-media'] img {
      height: 100px;
      object-fit: contain;
    }

    img[dark] {
      display: none;
    }

    footer {
      margin-top: 16px;
      display: flex;
      justify-content: flex-end;
    }
    @media (prefers-color-scheme: dark) {
      div[slot='jh-card-media'] {
        background-image: url(${unsafeCSS(ASSETS.dark.backgroundLandscape)});
      }
      img[light] {
        display: none;
      }
      img[dark] {
        display: block;
      }
    }
  `;

  render() {
    return html`
      <jh-card show-header-divider header-title="My Application" header-subtitle="Welcome to the JH Design System Development Sandbox">
        <div slot="jh-card-media">
          <img light src="${ASSETS.light.logo}" alt="Institution Logo" />
          <img dark src="${ASSETS.dark.logo}" alt="Institution Logo" />
        </div>
        <div>
          <p>Click an account to see details</p>
          <jh-list-item
            tabindex="0"
            show-divider
            primary-text="Doug's Checking Account"
            secondary-text="Account ending in 1234"
            primary-metadata="$1,234.56 available"
            secondary-metadata="balance">
          </jh-list-item>
          <jh-list-item
            tabindex="0"
            show-divider
            primary-text="Benito's Savings Account"
            secondary-text="Account ending in 5678"
            primary-metadata="$5,678.90 available"
            secondary-metadata="balance">
          </jh-list-item>
          <jh-list-item
            tabindex="0"
            primary-text="Sara's Credit Card"
            secondary-text="Account ending in 9012"
            primary-metadata="$3,210.00 available"
            secondary-metadata="credit limit">
          </jh-list-item>
          <footer>
            <jh-button slot="jh-card-footer" label="Select account" appearance="primary"></jh-button>
          </footer>
        </div>
      </jh-card>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'example-app': ExampleApp;
  }
}