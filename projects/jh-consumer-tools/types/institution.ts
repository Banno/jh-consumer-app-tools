// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

export interface BalanceDisplaySetting {
  type: string;
  label: string;
  visible: boolean;
  primary: boolean;
}

export interface InstitutionLink {
  id: string;
  linkType: string;
  title: string;
  description: string;
  name: string;
  fdicNotice: string;
}

export interface StaticLink {
  linkType: string;
  label: string;
  url: string;
}

export type Abilities = {
  accountToAccount: boolean;
  account_jx_meta: boolean;
  account_pscu_meta: boolean;
  account_rewards: boolean;
  account_symx_meta: boolean;
  ach: boolean;
  achApprovalsRequireInitiate?: boolean;
  achBatchDownload: boolean;
  achDisplayBulkInitiate?: boolean;
  achDisplayResetRecords?: boolean;
  achDisplayResetRecordsWhenCopyingBatch?: boolean;
  achEntitlementModel?: string;
  additionalMessage: string;
  adsEnabled: boolean;
  advancedCardControls: boolean;
  alertsEnabled: boolean;
  allowInternationalUsdWires: boolean;
  allowSSNSignup: boolean;
  alternateAccountTransferFlow: boolean;
  approveUsers: boolean;
  billPay: boolean;
  billPayEnrollment: boolean;
  billPaySync: boolean;
  canEditMFAQuestions: boolean;
  cardHubMobileSDK: boolean;
  cashManagementReports: boolean;
  changeAccountName: boolean;
  changeAddress: string;
  changeEmail: boolean;
  changeOrganizationEmail: boolean;
  changeOrganizationPhone: boolean;
  changePhone: boolean;
  changeUisEmail: boolean;
  changeUisPhone: boolean;
  changeUsername: boolean;
  checkImagesEnabled: boolean;
  clientSideRDCProvider?: string | null;
  conversations: boolean;
  coreOfflineSupport: boolean;
  creditCardControls: boolean;
  creditCardPayments: boolean;
  cutOffTime: string;
  default2FaEnabled: boolean;
  displayCutoffTimes?: boolean;
  distinctBusinessProfiles: boolean;
  documentAbilities: {
    documents: boolean;
    enrollment: boolean;
  };
  documents: boolean;
  ediTransactionDetails: boolean;
  eesAlertsEnabled: boolean;
  enableAchHolds: boolean;
  enableAchPrenotes: boolean;
  enableAchRecurringBatches: boolean;
  enableAchTaxPayments: boolean;
  enableCopyBatch: boolean;
  enableCopyHistoricalBatch: boolean;
  enforceBSLEntitlements: boolean;
  exportTransactionsEnabled: boolean;
  externalAccounts: boolean;
  externalTransferInbound: boolean;
  externalTransferOutbound: boolean;
  fullServiceCreditCardPayments?: boolean;
  geezeoInsights: boolean;
  geezeoTrx: boolean;
  geezeoWheel: boolean;
  hraDeviceUnblockingFromAnchorDevice?: boolean;
  liveUserValidation: boolean;
  loanPaymentBreakdown?: boolean;
  memberToMemberTransfers: boolean;
  merchantAcquisition: boolean;
  mobileAdsEnabled: boolean;
  moovPullFromCard: boolean;
  moovPushToCard: boolean;
  newTransactionsSync: boolean;
  p2pEnabled: boolean;
  passwordManagement: boolean;
  payAnIndividualBillPay: boolean;
  payReturnAllExceptions: boolean;
  payeeCreation: boolean;
  payeeDeletion: boolean;
  payeeEdit: boolean;
  payeeEditP2PSMS: boolean;
  paymentCardManagement: boolean;
  positivePay: boolean;
  pospayExceptionCorrection: boolean;
  rdc: boolean;
  rdcDisclaimer: string;
  rdcOnboardingByAccountsEnabled: boolean;
  rdcOnboardingEnabled: boolean;
  recurringTransactions: boolean;
  requiresUserProfile: boolean;
  retailOrganizations: boolean;
  runningBalance: string;
  schedulableTransfers: boolean;
  selfEnrollRetailOrgs?: boolean;
  selfEnrollment: boolean;
  selfRecovery: boolean;
  separateBillPayAccounts: boolean;
  sessionExpirationTimeoutMinutes: number;
  sessionResumptionMethod: string;
  stopPayments: boolean;
  switchUserEnabled: boolean;
  thirdPartyAccounts: boolean;
  transactionEnrichment: boolean;
  transferHoursMessage: string;
  travelNotices: boolean;
  twoFAEnabled: boolean;
  twoFAPhoneValidation: boolean;
  userManagement: boolean;
  videoChat: boolean;
  wires: boolean;
  wiresInitiateWithJHW?: boolean;
  zelle: string;
  zelleReadyContact: boolean;
};

export type ThemeSet = {
  default: {
    light: Record<string, string>;
    dark: Record<string, string>;
  };
  [key: string]: {
    light: Record<string, string>;
    dark: Record<string, string>;
  };
};

export type InstitutionCommonProperties = {
  abilities: Abilities;
  accountNameCharLimit: number;
  accountTypes: string[];
  aggregationType: string;
  availableTransferFrequencies: string[];
  balanceDisplaySettings: Array<{
    label: string;
    primary: boolean;
    type: string;
    visible: boolean;
  }>;
  cardManagementAbilities: string[];
  contactEmail: string;
  contactHtml: string | null;
  cutOffTimeMessage: string;
  displayStrings: Record<string, string>;
  eula: {
    date: string;
    id: string;
    text: string | null;
  };
  externalTransferSettings: Record<string, any>;
  id: string;
  links: any[];
  localTimezone: string;
  minimumVersions: Record<string, string | number>;
  name: string;
  phoneNumber: string;
  privacyPolicyUrl: string;
  regDSettings: Record<string, any>;
  routingNumber: string;
  smallBusinessSettings: Record<string, any>;
  staticLinks: any[];
  status: string;
  stopPaymentsSettings: Record<string, any>;
  supportEmail: string;
  transferFee: string | null;
  transferMemos: Record<string, boolean>;
  travelNoticeCharLimit: number;
  url: string;
};

export type WebserverConfigProperties = InstitutionCommonProperties & {
  billPayFee: string | null;
  billPayP2PFee: string | null;
  welcomeHtml: string | null;
  zipCode: string;
  zoneId: string;
  appleId: string;
  appleTeamId: string;
  appName: string;
  bundleIdentifier: string;
  usernameInputFieldHint: string;
  androidSha256CertFingerprints: string[];
  eulaConfirmation: Record<string, string>;
  additionalSupportedLanguages: string[];
  quickActions: Array<{
    deepLink: string;
    type: string;
    text: string;
    icon: string;
  }>;
  showFdicDisclaimer: boolean;
  displayName: string;
  themes: ThemeSet;
  ndsConfig: {
    enabled: boolean;
    clientId: string;
  };
  images: Record<string, any>;
};

export type WebserverConfigResponse = {
  institutionId: string;
  hosts: string[];
  mixpanel: boolean;
  ndsConfig: {
    enabled: boolean;
    clientId: string;
  };
  brandProtection: Array<{ type: string }>;
  key: string;
  properties: WebserverConfigProperties;
};

export type UserInstitutionResponse = InstitutionCommonProperties & {
  isCashManagement: boolean;
  theme: Record<string, string | number>;
};

export type Institution = Omit<WebserverConfigProperties, 'properties' | 'mixpanel' | 'ndsConfig' | 'brandProtection'> &
  UserInstitutionResponse;
