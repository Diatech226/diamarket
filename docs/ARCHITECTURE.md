# Diapay Architecture

Diapay follows a Stripe-like architecture: public developer portal, dashboard, hosted checkout, REST API, provider abstraction, webhooks and TypeScript SDKs.

## Applications

- `apps/diapay-api`: Express API, payment provider registry, checkout/session store and webhook delivery.
- `apps/diapay-dashboard`: merchant operations, API keys, analytics, webhook tester and developer onboarding.
- `apps/diapay-docs`: developer portal with searchable navigation, dark mode, API playground and code generator.
- `apps/diapay-sandbox`: hosted checkout and scenario simulator.
- `packages/diapay-sdk-js`: TypeScript-first JavaScript SDK.
- `packages/diapay-node`: Node.js helper SDK.

## Principles

1. Secret keys stay server-side; publishable keys are limited to client checkout flows.
2. Every mutating request supports idempotency keys.
3. Provider integrations are hidden behind payment, refund and cancellation interfaces.
4. Webhooks are signed with HMAC SHA-256 and retryable.
5. Sandbox scenarios mirror production object shapes.
