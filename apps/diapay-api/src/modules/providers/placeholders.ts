import type { ProviderAdapter } from './provider-adapter';
import { capabilitySupports } from './provider-capabilities';
import { providerNotConfigured } from './provider-errors';
import type { PaymentMethod } from '../../models/Payment';
import type { ProviderType } from './provider.types';
function placeholder(id: string, name: string, type: ProviderType, method: PaymentMethod, currencies: string[], countries: string[], code='PROVIDER_NOT_CONFIGURED'): ProviderAdapter { return { id, name, type, capabilities: { provider: id, type, countries, currencies, methods: [method], minAmount: 1, supportsRefund: false, supportsPartialRefund: false, supportsCancel: false, supportsWebhook: true, supportsAsyncPayment: true, requiresPhone: type==='mobile_money', requiresEmail: type==='bank_card', requiresRedirect: type==='bank_card', configured: false, mode: 'live', status: 'not_configured' }, supports(input) { return capabilitySupports({ ...this.capabilities, configured: true }, input) && input.provider === id && this.capabilities.configured; }, async createPayment() { throw providerNotConfigured(code); }, async parseWebhook() { throw providerNotConfigured('PROVIDER_WEBHOOK_NOT_CONFIGURED'); } }; }
export const orangeMoneyProvider = placeholder('orange_money','Orange Money','mobile_money','mobile-money',['XOF'],['BF','CI','SN']);
export const moovMoneyProvider = placeholder('moov_money','Moov Money','mobile_money','mobile-money',['XOF'],['BF','CI','BJ','TG']);
export const waveProvider = placeholder('wave','Wave','mobile_money','mobile-money',['XOF'],['CI','SN']);
export const mtnProvider = placeholder('mtn_mobile_money','MTN Mobile Money','mobile_money','mobile-money',['XOF','GHS'],['CI','GH']);
export const stripeProvider = placeholder('stripe','Stripe','bank_card','bank-card',['USD','EUR','XOF'],['US','CI','SN']);
export const bankTransferProvider = placeholder('manual_bank_transfer','Manual Bank Transfer','bank_transfer','bank-transfer',['XOF','USD','EUR'],['CI','SN','US']);
export const stablecoinProvider = placeholder('stablecoin','Stablecoin','crypto','crypto',['USDC'],['US','CI','SN'],'CRYPTO_PROVIDER_NOT_CONFIGURED');
export const manualProvider = placeholder('manual','Manual Provider','manual','bank-transfer',['XOF','USD','EUR'],['CI','SN','US']);
