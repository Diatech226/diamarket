/**
 * Stripe Africa Admin - Type Definitions
 */

export type RailType = 'mobile_money' | 'bank_transfer' | 'card' | 'ussd';
export type RailStatus = 'operational' | 'degraded' | 'major_outage' | 'maintenance';
export type KYCStatus = 'approved' | 'pending_verification' | 'rejected' | 'documents_required';
export type MerchantTier = 'standard' | 'enterprise' | 'growth';
export type TransactionStatus = 'success' | 'failed' | 'pending' | 'reversed';
export type FloatStatus = 'healthy' | 'low_balance' | 'critical';
export type LogType = 'info' | 'warning' | 'error' | 'success';
export type LogCategory = 'rail' | 'merchant' | 'settlement' | 'routing';

export interface PaymentRail {
  id: string;
  name: string;
  type: RailType;
  country: string;
  currency: string;
  provider: string;
  status: RailStatus;
  latencyMs: number;
  successRate: number; // percentage
  volume24h: number; // in local currency
  volume24hUSD: number;
  autoRouteEnabled: boolean;
  isFallbackActive: boolean;
  fallbackRailId?: string;
}

export interface MerchantPricing {
  mobileMoneyFee: number; // percentage, e.g., 1.5
  cardFee: number; // percentage, e.g., 2.9
  bankTransferFee: number; // flat fee, in local currency
}

export interface Merchant {
  id: string;
  businessName: string;
  country: string;
  contactEmail: string;
  kycStatus: KYCStatus;
  tier: MerchantTier;
  volume30d: number; // in USD
  joinedDate: string;
  pricing: MerchantPricing;
  riskScore: number; // 0 to 100
  settlementAccount: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
}

export interface Transaction {
  id: string;
  merchantId: string;
  merchantName: string;
  amount: number;
  currency: string;
  amountUSD: number;
  paymentMethod: RailType;
  railId: string;
  status: TransactionStatus;
  timestamp: string;
  customerName: string;
  customerPhoneOrAccount: string;
  failureReason: string | null;
}

export interface TreasuryFloat {
  id: string;
  railId: string;
  railName: string;
  country: string;
  currency: string;
  balance: number;
  balanceUSD: number;
  minThreshold: number; // in local currency
  status: FloatStatus;
}

export interface ExchangeRate {
  currency: string;
  rateToUSD: number; // 1 USD = X Local
  symbol: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  type: LogType;
  category: LogCategory;
  message: string;
}

export interface SettlementBatch {
  id: string;
  merchantId: string;
  merchantName: string;
  amount: number;
  currency: string;
  amountUSD: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  initiatedAt: string;
  completedAt?: string;
  bankRef?: string;
}

export type AdminRole = 'super_admin' | 'treasury_manager' | 'compliance_officer' | 'support_specialist' | 'developer';
export type AdminStatus = 'active' | 'suspended' | 'pending_activation';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: AdminStatus;
  lastActive: string;
  mfaEnabled: boolean;
  teams: string[];
}

