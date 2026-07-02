export class ProviderError extends Error { status: number; code: string; details?: unknown; constructor(message: string, code: string, status = 400, details?: unknown) { super(message); this.code = code; this.status = status; this.details = details; } }
export const providerNotAvailable = () => new ProviderError('No compatible payment provider found', 'PROVIDER_NOT_AVAILABLE', 400);
export const providerNotConfigured = (code = 'PROVIDER_NOT_CONFIGURED') => new ProviderError('Payment provider is not configured', code, 400);
export const providerWebhookNotConfigured = () => new ProviderError('Provider webhook not configured', 'PROVIDER_WEBHOOK_NOT_CONFIGURED', 400);
