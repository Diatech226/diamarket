# DIAPAY — Iteration 4: Webhooks, Idempotence & Event Reliability

Date: 2026-07-02

## Routes added

- `POST /api/v1/webhooks/providers/:provider`
- `GET|POST /api/v1/webhook-endpoints`
- `GET|PATCH|DELETE /api/v1/webhook-endpoints/:id`
- `GET /api/v1/webhook-events`
- `GET /api/v1/webhook-deliveries`

## Idempotence

`Idempotency-Key` is applied to checkout session creation, payment creation, refund creation, and payment cancellation. The key scope is merchant + endpoint + key. Same payload replays the stored response; different payload returns `IDEMPOTENCY_KEY_CONFLICT`. Storage remains in-memory with a configurable TTL.

## Signature webhook

Merchant webhooks use `DiaPay-Signature: t=<timestamp>,v1=<hmac_sha256>`, computed from `timestamp + "." + rawBody`. SDK helpers verify signatures and reject stale timestamps using a 5 minute default tolerance.

## Provider webhook flow

The API identifies the provider, rejects unknown providers, delegates parsing to `ProviderAdapter.parseWebhook`, deduplicates provider event ids, updates matching sandbox payments when possible, and records a sanitized audit event.

## Merchant webhook flow

Internal events are represented with `id`, `type`, `createdAt`, `livemode`, `data`, `merchantId`, and `applicationId`. Enabled merchant endpoints receive signed JSON payloads.

## Event log and retry

Webhook events and deliveries are logged with sanitized payload/response bodies. Retryable 5xx and timeout failures are marked `retrying` with simple backoff; non-retryable exhausted deliveries become `dead`. A retry job placeholder exists at `apps/diapay-api/src/jobs/webhook-retry.job.ts`.

## Dashboard

Dashboard pages for `/webhooks`, `/webhooks/[id]`, `/events`, and `/logs` document configured endpoints, event logs, delivery attempts, status codes, retries, and masked secrets.

## Sandbox

Sandbox documentation now lists provider success, duplicate, failed-signature, merchant success, timeout, retry, refund, and payment-paid webhook scenarios.

## SDK

`packages/diapay-sdk-js` and `packages/diapay-node` expose signature verification, event construction, endpoint CRUD/list helpers, event list helpers, and a Node Express raw-body middleware helper.

## Remaining limits

Persistence is still in-memory. Auth is API-key/merchant-context compatible but not a full merchant RBAC system. Retry workers are placeholders until durable endpoint-secret lookup and background execution are introduced. Provider-specific signature validation remains adapter-specific.

## Recommended next iteration

Add persistent repositories, background workers, provider-specific signature verifiers, delivery replay APIs, rate limiting middleware, and contract tests generated from OpenAPI.
