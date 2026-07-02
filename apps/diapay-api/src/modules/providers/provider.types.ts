import type { PaymentMethod } from '../../models/Payment';
import type { NormalizedPaymentStatus } from '../payments/payment-status';

export type ProviderType = 'mock' | 'mobile_money' | 'bank_card' | 'bank_transfer' | 'crypto' | 'manual';
export type ProviderRawStatus = 'pending' | 'processing' | 'action_needed' | 'success' | 'failed' | 'cancelled' | 'expired' | 'refunded' | 'unknown';
export type ProviderMode = 'sandbox' | 'test' | 'development' | 'production';

export interface ProviderCapabilityInput { amount: number; currency: string; method: PaymentMethod; country?: string; provider?: string; mode?: ProviderMode; }
export interface ProviderCapabilities { provider: string; type: ProviderType; countries: string[]; currencies: string[]; methods: PaymentMethod[]; minAmount?: number; maxAmount?: number; supportsRefund: boolean; supportsPartialRefund: boolean; supportsCancel: boolean; supportsWebhook: boolean; supportsAsyncPayment: boolean; requiresPhone?: boolean; requiresEmail?: boolean; requiresRedirect?: boolean; configured: boolean; mode: 'sandbox' | 'live'; status: 'configured' | 'not_configured' | 'ready'; }
export interface ProviderCreatePaymentInput extends ProviderCapabilityInput { merchant: string; customer?: Record<string, unknown>; metadata?: Record<string, unknown>; details?: Record<string, unknown>; sessionId?: string; scenario?: string; }
export interface ProviderCancelPaymentInput { providerReference: string; amount?: number; currency?: string; metadata?: Record<string, unknown>; }
export interface ProviderRefundInput { providerReference: string; amount: number; currency: string; reason?: string; metadata?: Record<string, unknown>; scenario?: string; }
export interface ProviderWebhookInput { headers: Record<string, string | string[] | undefined>; body: unknown; rawBody?: string | Buffer; }
export interface ProviderPaymentResult { provider: string; method: PaymentMethod; status: NormalizedPaymentStatus; providerStatus: string; providerReference: string; actionRequired?: { type: 'redirect' | 'otp' | 'bank_instructions' | 'wallet_address'; url?: string; message?: string; expiresAt?: string }; errorCode?: string; errorMessage?: string; rawProviderResponse?: Record<string, unknown>; }
export interface ProviderCancelResult extends ProviderPaymentResult {}
export interface ProviderRefundResult { provider: string; status: NormalizedPaymentStatus; providerStatus: string; providerReference: string; errorCode?: string; errorMessage?: string; rawProviderResponse?: Record<string, unknown>; }
export interface ProviderWebhookEvent { provider: string; providerReference?: string; providerStatus: string; status: NormalizedPaymentStatus; eventType: string; rawProviderResponse?: Record<string, unknown>; }
export interface NormalizedProviderEvent { provider: string; providerReference?: string; providerStatus: string; status: NormalizedPaymentStatus; errorCode?: string; errorMessage?: string; rawProviderResponse?: Record<string, unknown>; }
