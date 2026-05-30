export type MarketplaceCurrency = 'FCFA' | 'XOF' | 'USD' | 'EUR' | 'USDT';
export type WalletType = 'merchant_wallet' | 'vendor_wallet' | 'platform_wallet' | 'escrow_wallet' | 'reserve_wallet';
export type WalletStatus = 'active' | 'frozen' | 'closed';
export type LedgerEntryType = 'debit' | 'credit' | 'fee' | 'reserve' | 'refund' | 'payout' | 'reversal';
export type LedgerAccountType = 'asset' | 'liability' | 'revenue' | 'expense' | 'reserve' | 'escrow';
export type SplitRuleType = 'fixed' | 'percentage' | 'fallback';
export type EscrowStatus = 'held' | 'released' | 'refunded' | 'disputed';
export type PayoutMethodType = 'mobile_money' | 'bank_transfer' | 'crypto';
export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'reversed';
export type KycStatus = 'not_started' | 'pending' | 'verified' | 'rejected';

export interface LedgerAccount {
  id: string;
  walletId: string;
  ownerId: string;
  ownerType: 'merchant' | 'vendor' | 'platform' | 'escrow' | 'reserve';
  type: LedgerAccountType;
  currency: MarketplaceCurrency;
  status: WalletStatus;
  createdAt: string;
}

export interface LedgerEntry {
  id: string;
  transactionId: string;
  accountId: string;
  walletId: string;
  type: LedgerEntryType;
  direction: 'debit' | 'credit';
  amount: number;
  currency: MarketplaceCurrency;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface BalanceSnapshot {
  id: string;
  walletId: string;
  currency: MarketplaceCurrency;
  balance: number;
  availableBalance: number;
  pendingBalance: number;
  ledgerEntryId: string;
  createdAt: string;
}

export interface MarketplaceWallet {
  id: string;
  type: WalletType;
  owner: { id: string; type: 'merchant' | 'vendor' | 'platform' | 'escrow' | 'reserve'; name?: string };
  balance: number;
  availableBalance: number;
  pendingBalance: number;
  currency: MarketplaceCurrency;
  status: WalletStatus;
  ledgerEntries: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CommissionRule {
  id: string;
  name: string;
  fixedAmount?: number;
  percentage?: number;
  category?: string;
  vendorId?: string;
  country?: string;
  priority: number;
  active: boolean;
}

export interface PayoutMethod {
  id: string;
  type: PayoutMethodType;
  label: string;
  country?: string;
  currency: MarketplaceCurrency;
  details: Record<string, unknown>;
  active: boolean;
}

export interface VendorAccount {
  id: string;
  businessName: string;
  country: string;
  currencies: MarketplaceCurrency[];
  payoutMethods: PayoutMethod[];
  wallet: string;
  kycStatus: KycStatus;
  commissions: CommissionRule[];
  capabilities: Array<'payments' | 'payouts' | 'refunds' | 'escrow' | 'crypto'>;
  createdAt: string;
  updatedAt: string;
}

export interface SplitRule {
  id: string;
  vendorId?: string;
  walletId?: string;
  type: SplitRuleType;
  amount?: number;
  percentage?: number;
  priority: number;
  category?: string;
  description?: string;
}

export interface SplitAllocation {
  id: string;
  destinationType: 'vendor' | 'platform' | 'diapay_fee' | 'reserve' | 'escrow_funding';
  vendorId?: string;
  walletId: string;
  amount: number;
  currency: MarketplaceCurrency;
  status: 'pending' | 'held' | 'available' | 'paid_out' | 'refunded' | 'reversed';
  ruleId?: string;
}

export interface MarketplacePayment {
  id: string;
  paymentId: string;
  merchant: string;
  amount: number;
  currency: MarketplaceCurrency;
  splitRules: SplitRule[];
  allocations: SplitAllocation[];
  escrowId?: string;
  timeline: Array<{ type: string; at: string; data?: Record<string, unknown> }>;
  createdAt: string;
  updatedAt: string;
}

export interface EscrowHold {
  id: string;
  marketplacePaymentId: string;
  walletId: string;
  amount: number;
  releasedAmount: number;
  refundedAmount: number;
  currency: MarketplaceCurrency;
  status: EscrowStatus;
  releaseMode: 'auto' | 'manual';
  autoReleaseAt?: string;
  allocations: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MarketplacePayout {
  id: string;
  vendorId: string;
  walletId: string;
  amount: number;
  currency: MarketplaceCurrency;
  method: PayoutMethodType;
  status: PayoutStatus;
  scheduledFor?: string;
  minimumThreshold?: number;
  destination: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}
