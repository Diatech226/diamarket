export enum PaymentStatus {
  CREATED = "created",
  PENDING = "pending",
  PROCESSING = "processing",
  REQUIRES_ACTION = "requires_action",
  PAID = "paid",
  FAILED = "failed",
  CANCELLED = "cancelled",
  EXPIRED = "expired",
  REFUNDED = "refunded",
  PARTIALLY_REFUNDED = "partially_refunded",
  DISPUTED = "disputed",
  CHARGEBACK = "chargeback"
}

export enum CheckoutSessionStatus {
  CREATED = "created",
  OPEN = "open",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  EXPIRED = "expired"
}

export enum PaymentMethod {
  MOBILE_MONEY = "mobile_money",
  BANK_CARD = "bank_card",
  CRYPTO = "crypto"
}

export enum MobileOperator {
  ORANGE = "orange",
  MOOV = "moov",
  WAVE = "wave",
  MTN = "mtn"
}

export interface Merchant {
  id: string;
  name: string;
  country: string;
  currency: string;
  status: "active" | "pending_kyb" | "suspended";
}

export interface Application {
  id: string;
  name: string;
  allowedOrigins: string[];
}

export interface ApiKeySet {
  publishableKey: string;
  secretKey: string;
  secretKeyHash: string;
  lastRotated: string;
}

export interface CheckoutSession {
  id: string;
  orderId: string;
  itemName: string;
  amount: number;
  currency: string;
  status: CheckoutSessionStatus;
  successUrl: string;
  cancelUrl: string;
  customerPhone?: string;
  customerEmail?: string;
  paymentMethod?: PaymentMethod;
  mobileOperator?: MobileOperator;
  countryCode?: string;
  createdAt: string;
  expiresAt: string;
  developerMerchantName?: string;
  developerSupportEmail?: string;
  developerSupportPhone?: string;
  payerName?: string;
  logoUrl?: string;
  brandColor?: string;
  metadata?: Record<string, any>;
}

export interface PaymentIntent {
  id: string;
  sessionId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  customerIdentifier: string; // phone or email
  createdAt: string;
  fees: number;
}

export interface PaymentAttempt {
  id: string;
  paymentId: string;
  provider: string;
  status: string;
  phone?: string;
  errorCode?: string;
  errorMessage?: string;
  timestamp: string;
}

export interface WebhookEndpoint {
  id: string;
  url: string;
  events: string[];
  status: "active" | "inactive";
  signingSecret: string;
  createdAt: string;
}

export interface WebhookDeliveryLog {
  id: string;
  endpointId: string;
  url: string;
  event: string;
  payload: any;
  headers: Record<string, string>;
  responseStatus?: number;
  responseBody?: string;
  success: boolean;
  timestamp: string;
}

export interface LedgerEntry {
  id: string;
  date: string;
  reference: string; // e.g., TRX-8924A
  account: string; // e.g., Platform Master Clearing, Vendor A Payable, etc.
  type: "Asset" | "Liability" | "Revenue" | "Expense";
  debit: number; // DR
  credit: number; // CR
}

export interface VendorWallet {
  id: string;
  name: string;
  balance: number;
  status: "verified" | "pending_kyb";
}

export interface Refund {
  id: string;
  paymentId: string;
  amount: number;
  currency: string;
  reason: string;
  status: "succeeded" | "failed" | "processing";
  createdAt: string;
}

export interface Dispute {
  id: string;
  paymentId: string;
  customerIdentifier: string;
  amount: number;
  currency: string;
  reason: string;
  status: "needs_response" | "under_review" | "resolved";
  deadline: string;
  createdAt: string;
  evidenceFiles: string[];
  timeline: { date: string; title: string; description: string; type: "alert" | "neutral" }[];
}

export interface MonthlyStatement {
  month: string;
  grossVolume: number;
  totalFees: number;
  netPayouts: number;
  successfulTransactions: number;
  successRate: number;
  effectiveRate: number;
}

export interface SettlementBatch {
  id: string;
  createdAt: string;
  vendorId: string;
  vendorName: string;
  payoutAmount: number;
  reserveHold: number;
  currency: string;
  status: "pending" | "exported" | "settled";
  bankName: string;
  accountNumber: string;
  reconciliationReference: string;
}

export interface ApiKeyPair {
  id: string;
  name: string;
  publishableKey: string;
  secretKey: string;
  status: "active" | "deprecated" | "expired";
  createdAt: string;
  lastRotated: string;
  deprecatedAt?: string;
  deprecationGracePeriodMinutes?: number;
  expiresAt?: string;
}
