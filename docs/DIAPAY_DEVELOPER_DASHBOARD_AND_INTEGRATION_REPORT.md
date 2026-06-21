# DIAPAY — Developer Dashboard and Merchant Integration Foundation

Date: 2026-06-21

## Source audit used

This iteration uses `docs/DIAPAY_INTERNAL_AUDIT_AND_AFRICAN_PAYMENT_ROADMAP.md` as the mandatory baseline. The audit classifies Diapay as a sandbox/prototype and calls out the P0 gaps addressed here: merchant model, hashed API keys, application allowlists, signed webhooks with timestamp, dashboard pages, sandbox clarity, SDK helpers, and crypto currency formatting.

## Pages created or improved

- `/dashboard`: merchant overview with operational KPIs and recent activity.
- `/payments`: payment list and detail routes.
- `/transactions`: transaction table.
- `/wallets`: wallet balances with available and pending amounts.
- `/revenue`: sandbox revenue view with available balance, pending balance, gross revenue, Diapay fees, net revenue, refunds, and CSV-readiness copy.
- `/api-keys`: publishable/secret key UX, scopes, rotation/revocation guidance.
- `/webhooks`: endpoint configuration, event history, retry/test UX baseline.
- `/developers`: developer quickstarts.
- `/apps`: merchant applications for Diamarket, DiaExpress, ecommerce, mobile, and sandbox.
- `/sandbox`: scenario simulator catalog for successful payment, failed payment, timeout, expired OTP, insufficient balance, provider down, repeated webhook, and refund test.
- `/logs`: audit log view with security-sensitive redaction messaging.
- `/settings`: provider/method settings.
- `/docs`: integrated developer documentation with checkout cURL and webhook verification examples.

## Models and in-memory stores

Implemented a non-production in-memory developer platform foundation:

- `Merchant`: `name`, `businessName`, `country`, `currency`, `status`, `ownerId`, `createdAt`.
- `MerchantAdmin`: `merchantId`, `name`, `email`, `role`, `status`, `lastLoginAt`.
- Roles: `owner`, `admin`, `developer`, `finance`, `support`, `viewer`.
- `Application`: `merchantId`, `name`, `environment`, `allowedOrigins`, `successUrl`, `cancelUrl`, `webhookUrl`, `status`.
- `ApiKey`: `pk_*`/`sk_*`, `test`/`live`, scopes, hash-only storage, status, last-used-ready metadata.
- Marketplace model compatibility fixes for wallets, payouts, escrow holds, split allocations, and crypto currencies.

## Endpoints

Added or fixed:

- `GET /api/v1/merchants`
- `POST /api/v1/merchants`
- `GET /api/v1/merchant-admins`
- `POST /api/v1/merchant-admins`
- `GET /api/v1/apps`
- `POST /api/v1/apps`
- `GET /api/v1/api-keys`
- `POST /api/v1/api-keys`
- `DELETE /api/v1/api-keys/:id`
- `POST /api/v1/api-keys/:id/rotate`
- `GET /api/v1/logs`
- Existing checkout remains at `POST /api/v1/checkout/sessions` with idempotency-key support.

## Security work

- Secret API keys are generated once and only their SHA-256 hash is retained in state.
- Publishable and secret key prefixes are normalized as `pk_test_`, `sk_test_`, `pk_live_`, `sk_live_`.
- Key scopes are represented explicitly.
- Rotation revokes the old key and returns the new secret once.
- Revocation marks keys as `revoked`.
- Application records include allowed origins for future CORS allowlisting.
- Webhook signatures now include timestamped HMAC payloads using `t=timestamp,v1=signature`.
- Dashboard copy clearly marks revenue and ledger data as sandbox when not backed by real reconciliation.
- Crypto currencies such as `USDT` render as crypto units instead of crashing `Intl.NumberFormat` prerendering.

## Dashboard and UX

The dashboard navigation now exposes revenue, apps, sandbox, logs, and docs alongside existing payments, wallets, transactions, API keys, webhooks, developers, and settings. The UX stays XOF/mobile-money-first and avoids presenting sandbox balances as live funds.

## Sandbox

The dashboard sandbox page enumerates the required scenarios. Existing API/sandbox builds remain mock-only; no real providers are connected. The next iteration should wire each dashboard scenario to API endpoints that create a payment, event, webhook attempt, and log record atomically.

## SDK JS

The local SDK remains dependency-local and now exposes direct helper functions:

- `createCheckoutSession()`
- `getCheckoutSession()`
- `getPayment()`
- `refundPayment()`
- `verifyWebhookSignature()` with timestamped header support.

## Limits remaining

- State is still in memory; it is suitable for demos and local tests only.
- Dashboard auth is not production-grade RBAC yet.
- CORS allowlisting is modeled but not fully enforced per application.
- Rate limiting and schema validation are still minimal.
- Ledger is not a production immutable ledger.
- Provider webhooks and real payment providers are intentionally not connected.
- Webhook delivery history is not durable.
- No real settlement, KYB/KYC, reconciliation, chargeback, or compliance module exists.

## Next iterations

1. Persist merchants, admins, API keys, applications, webhooks, payments, ledger entries, and logs.
2. Add API-key authentication middleware with scope checks per route.
3. Enforce CORS per application allowed origins.
4. Add request IDs, rate limiting, and validation schemas.
5. Build durable webhook retry and dead-letter queues.
6. Create provider webhook ingress contracts for Orange Money, Moov, Wave, cards, and permitted stablecoins.
7. Replace demo revenue with ledger-derived balances only.
8. Add end-to-end Playwright/API tests for the 13 required merchant/developer scenarios.
