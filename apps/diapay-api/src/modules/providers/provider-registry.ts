import type { ProviderAdapter } from './provider-adapter';
import type { ProviderCapabilityInput, ProviderMode } from './provider.types';
import { providerNotAvailable } from './provider-errors';
const providers = new Map<string, ProviderAdapter>();
export function providerMode(): ProviderMode { const env = (process.env.DIAPAY_PROVIDER_MODE ?? process.env.NODE_ENV ?? 'development').toLowerCase(); return env === 'production' ? 'production' : env === 'test' ? 'test' : env === 'sandbox' ? 'sandbox' : 'development'; }
export function registerProviderAdapter(provider: ProviderAdapter) { providers.set(provider.id, provider); return provider; }
export function getProviderAdapter(id: string) { return providers.get(id); }
export function listProviderAdapters() { return Array.from(providers.values()); }
export function listProviderCapabilities() { return listProviderAdapters().map((p) => p.capabilities); }
export function selectProvider(input: ProviderCapabilityInput) { if (input.provider) { const exact = providers.get(input.provider); if (exact?.supports(input)) return exact; } const compatible = listProviderAdapters().find((p) => p.id !== 'mock' && p.supports(input)); if (compatible) return compatible; const mode = input.mode ?? providerMode(); if (mode !== 'production') { const mock = providers.get('mock'); if (mock?.supports({ ...input, method: 'mock' })) return mock; } throw providerNotAvailable(); }
