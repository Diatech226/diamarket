# DIAPAY — Iteration 3 Provider Adapter Architecture Report

## Summary

Iteration 3 introduces a provider adapter architecture under `apps/diapay-api/src/modules/providers` while preserving existing `/api/v1` contracts.

## Providers created

- `mock`: functional sandbox/test provider.
- `orange_money`, `moov_money`, `wave`, `mtn_mobile_money`: Mobile Money placeholders returning explicit not-configured behavior.
- `stripe`: bank-card placeholder with no Stripe secret or live integration.
- `manual_bank_transfer`: bank-transfer placeholder.
- `stablecoin`: crypto/stablecoin placeholder returning `CRYPTO_PROVIDER_NOT_CONFIGURED` when used.
- `manual`: manual-provider placeholder.

## Interfaces created

- `ProviderAdapter`
- `ProviderCapabilities`
- `ProviderCreatePaymentInput`
- `ProviderPaymentResult`
- `ProviderRefundResult`
- `ProviderWebhookEvent`
- `ProviderRegistry`

## Provider mock

The mock provider supports explicit scenarios: `payment_success`, `payment_failed`, `payment_pending`, `payment_requires_action`, `payment_cancelled`, `payment_expired`, `provider_timeout`, `insufficient_funds`, `otp_required`, `otp_expired`, `refund_success`, and `refund_failed`.

## Capabilities

Providers declare countries, currencies, methods, min/max amount, refund/cancel/webhook/async support, phone/email/redirect requirements, sandbox/live mode, and configured status.

## Provider status mapping

Provider statuses are normalized as follows:

- `pending` → `pending`
- `processing` → `processing`
- `action_needed` → `requires_action`
- `success` → `paid`
- `failed` → `failed`
- `cancelled` → `cancelled`
- `expired` → `expired`
- `refunded` → `refunded`

Unknown statuses map to `processing` to avoid incorrectly failing recoverable asynchronous payments before reconciliation.

## PaymentAttempt integration

Provider calls now return normalized results. Payment attempts include provider, method, normalized status, amount, currency, provider reference/status, error code/message, and sanitized raw provider response.

## Routes added

- `GET /api/v1/providers`
- `GET /api/v1/providers/:provider/capabilities`
- `POST /api/v1/providers/simulate`
- `POST /api/v1/webhooks/providers/:provider`

## Dashboard updated

A simple providers page lists provider, type, status, countries, currencies, methods, sandbox/live state, configured/not-configured state, and capabilities.

## Sandbox updated

Sandbox scenarios now include mock provider success, failed, pending, requires action, provider timeout, insufficient funds, refund success, and refund failure. Results display the provider, provider reference, attempt status, final payment status, and simulated webhook metadata.

## SDK updated

SDKs retain existing exports and add provider helpers for listing providers, fetching capabilities, and simulating sandbox provider scenarios.

## Security notes

- Raw provider responses are sanitized for secret, token, OTP, private-key, and card-number-like fields.
- There is no silent mock fallback in production mode.
- Live provider placeholders do not include real credentials or fake live payments.
- Provider webhook architecture is prepared without implementing merchant webhook retry orchestration.

## Remaining risks

- Real provider configuration loading and credential validation are not implemented.
- Provider webhook signature verification is provider-specific and still pending.
- Persistent database-backed attempts are still future work for production durability.
- Rate limiting is documented as a placeholder and should be enforced at the gateway/middleware layer.

## Recommended next iteration

Implement provider configuration via secure env/secret storage, provider-specific webhook verification, persistent payment attempts, and a controlled first real Mobile Money adapter behind sandbox/live feature flags.
