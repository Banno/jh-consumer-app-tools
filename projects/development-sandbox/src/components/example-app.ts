import { LitElement, html, css, unsafeCSS } from 'lit';
import { customElement } from 'lit/decorators.js';
import '@jack-henry/jh-elements/components/card/card.js';
import '@jack-henry/jh-elements/components/list-item/list-item.js';
import '@jack-henry/jh-elements/components/button/button.js';
import '@jack-henry/jh-elements/components/progress/progress.js';
import '@jack-henry/jh-elements/components/input-textarea/input-textarea.js';
import '@jack-henry/jh-elements/components/radio/radio.js';
import '@jack-henry/jh-elements/components/radio-group/radio-group.js';
import '@jack-henry/jh-elements/components/tag/tag.js';
import '@jack-henry/jh-icons/icons-wc/icon-chevron-left.js';
import '@jack-henry/jh-elements/components/toast-controller/toast-controller.js';

const DISPLAY_STATES = {
  LIST: 'list',
  DETAIL: 'detail',
  CHALLENGE: 'challenge',
  LOADING: 'loading',
};

const ACCOUNTS = [
  {
    id: '1',
    name: "Doug's Checking Account",
    number: '1234',
    available: '$1,234.56',
    balance: '$1,500.00',
  },
  {
    id: '2',
    name: "Benito's Savings Account",
    number: '5678',
    available: '$5,678.90',
    balance: '$10,000.00',
  },
  {
    id: '3',
    name: "Sara's Credit Card",
    number: '9012',
    available: '$3,210.00',
    creditLimit: '$5,000.00',
  },
];

const TRANSACTIONS = [
  {
    id: 't1',
    description: 'Grocery Store',
    amount: '-$123.45',
    date: '2024-01-01',
  },
  {
    id: 't2',
    description: 'Salary Deposit',
    amount: '+$2,000.00',
    date: '2024-01-02',
  },
  {
    id: 't3',
    description: 'Electric Bill',
    amount: '-$150.00',
    date: '2024-01-03',
  },
];

const CHALLENGE_REASONS = [
  { value: 'fraud', label: "I didn't make this transaction (fraud)" },
  { value: 'duplicate', label: 'This transaction was duplicated' },
  { value: 'amount', label: 'The amount is incorrect' },
  { value: 'other', label: 'Other' },
];

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
      background-color: var(--jh-color-container-primary-enabled);
      border-radius: 8px;
    }

    img[dark] {
      display: none;
    }

    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 250px;
    }

    header {
      display: flex;
      align-items: flex-start;
      justify-content: flex-start;
      gap: 16px;
      margin-bottom: 16px;
      background-color: var(--jh-color-container-secondary-enabled);
      padding: 16px;
      border-radius: 8px;
    }

    header h2 {
      margin: 0 0 8px 0;
    }
    header p {
      margin: 0;
    }

    jh-radio-group {
      margin: 16px 0 32px;
    }

    jh-radio {
      margin-left: 16px;
    }

    footer {
      margin-top: 16px;
      display: flex;
      justify-content: center;
      gap: 8px;
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

  static get properties() {
    return {
      displayState: {
        type: String,
      },
      selectedAccountId: {
        type: String,
      },
      selectedTransactionId: {
        type: String,
      },
      challengeReason: {
        type: String,
      },
      accounts: {
        type: Array,
      },
      transactions: {
        type: Array,
      },
    };
  }

  constructor() {
    super();
    this.displayState = DISPLAY_STATES.LIST;
    this.selectedAccountId = null;
    this.selectedTransactionId = null;
    this.accounts = ACCOUNTS;
    this.transactions = TRANSACTIONS;
    this.challengeReason = null;
  }

  selectAccount(accountId) {
    this.selectedAccountId = accountId;
    this.displayState = DISPLAY_STATES.DETAIL;
  }

  selectTransaction(transactionId) {
    this.selectedTransactionId = transactionId;
    this.displayState = DISPLAY_STATES.CHALLENGE;
  }

  challengeTransactions(evt) {
    const createToast = new CustomEvent('jh-create-toast', {
      detail: {
        appearance: 'positive',
        stacked: false,
        text: 'Transaction challenged successfully',
        timeout: 1000,
      },
      bubbles: true,
      composed: true,
    });

    evt.target.dispatchEvent(createToast);
    this.transactions = this.transactions.map((item) => {
      if (item.id === this.selectedTransactionId) {
        return { ...item, ...{pendingChallenge: true} };
      }
      return item;
    });
    this.displayState = DISPLAY_STATES.DETAIL;
    this.selectedTransactionId = null;
    this.challengeReason = null;
  }


  renderAccountDetails() {
    const account = this.accounts.find(acc => acc.id === this.selectedAccountId);

    return html`
      <header>
        <jh-button
          size="small"
          appearance="tertiary"
          accessible-label="Back to account list"
          @click=${() => {
            this.displayState = DISPLAY_STATES.LIST;
            this.selectedAccountId = null;
          }}>
          <jh-icon-chevron-left slot="jh-button-icon"></jh-icon-chevron-left>
        </jh-button>
        <div>
          <h2>${account.name}</h2>
          <p>Account Number: ${account.number}</p>
          <p>Available Balance: ${account.available}</p>
          ${account.creditLimit ? html`<p>Credit Limit: ${account.creditLimit}</p>` : html`<p>Total Balance: ${account.balance}</p>`}
        </div>
      </header>

      <div>
        <h3>Recent Transactions</h3>
        <p>Something fishy? Select a transaction to report it.</p>
        ${this.transactions.map((tx, index) => html`
          <jh-list-item
            tabindex="0"
            ?show-divider=${index < this.transactions.length - 1}
            secondary-text="${tx.date}"
            primary-metadata="${tx.amount}"
            @click=${() => {
              this.selectTransaction(tx.id);
            }}>
            <div slot="jh-list-item-left">
              <span>${tx.description}</span>
              ${tx.pendingChallenge ? html`<jh-tag size="small" appearance="warning" label="Challenge Pending"></jh-tag>` : ''}
            </div>
          </jh-list-item>
        `)}
      </div>
    `;
  }

  renderChallengeTransaction() {
    const transaction = this.transactions.find(tx => tx.id === this.selectedTransactionId);
    return html`
      <header>
        <jh-button
          size="small"
          appearance="tertiary"
          accessible-label="Back to account details"
          @click=${() => {
            this.displayState = DISPLAY_STATES.DETAIL;
            this.selectedTransactionId = null;
          }}>
          <jh-icon-chevron-left slot="jh-button-icon"></jh-icon-chevron-left>
        </jh-button>
        <div>
          <h2>Challenge Transaction</h2>
          <p>Transaction ID: ${this.selectedTransactionId}</p>
          <p>Description: ${transaction.description}</p>
          <p>Amount: ${transaction.amount}</p>
        </div>
      </header>
      <form>
          <jh-radio-group label="What's wrong with this transaction?" name="challenge-reason">
            ${CHALLENGE_REASONS.map((item) => html`
              <jh-radio
                value="${item.value}"
                label="${item.label}"
                @jh-change=${(evt) => {
                  this.challengeReason = evt.target.value;
                }}></jh-radio>`
            )}
          </jh-radio-group>
          <jh-input-textarea label="Additional details (optional)"></jh-input-textarea>
          <footer>
            <jh-button
              appearance="tertiary"
              label="cancel"
              size="small"
              @click=${() => {
              this.displayState = DISPLAY_STATES.DETAIL;
              this.selectedTransactionId = null;
            }}></jh-button>
            <jh-button
              ?disabled=${!this.challengeReason}
              appearance="primary"
              size="small"
              label="challenge"
              @click=${this.challengeTransactions}></jh-button>
          </footer>
          </jh-radio-group>
      </form>
    `;
  }

  renderCardContent() {
    switch (this.displayState) {
      case DISPLAY_STATES.LOADING:
        return html`
          <div class="loading">
            <jh-progress
              indeterminate
              type="circular"
              size="large"></jh-progress>
          </div>
        `;
      case DISPLAY_STATES.LIST:
        return html`
          <div>
            <p>Click an account to see details</p>
            ${this.accounts.map((account, index) => html`
              <jh-list-item
                tabindex="0"
                ?show-divider=${index < this.accounts.length - 1}
                primary-text="${account.name}"
                secondary-text="Account ending in ${account.number}"
                primary-metadata="${account.available} available"
                @click=${() => {
                  this.selectAccount(account.id);
                }}
                secondary-metadata="balance">
              </jh-list-item>
            `)
            }
          </div>
        `;
      case DISPLAY_STATES.DETAIL:
        return this.renderAccountDetails()
      case DISPLAY_STATES.CHALLENGE:
        return this.renderChallengeTransaction();
      default:
        return '';
    }
  }

  render() {
    return html`
      <jh-card show-header-divider header-title="My Application" header-subtitle="Welcome to the JH Design System Development Sandbox">
        <div slot="jh-card-media">
          <img light src="${ASSETS.light.logo}" alt="Institution Logo" />
          <img dark src="${ASSETS.dark.logo}" alt="Institution Logo" />
        </div>

        ${this.renderCardContent()}
      </jh-card>

      <jh-toast-controller></jh-toast-controller>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'example-app': ExampleApp;
  }
}