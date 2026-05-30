# API Reference

Base URL: `https://api.diapay.com/api/v1`.

Authentication: `Authorization: Bearer sk_test_xxx` or `Authorization: Bearer sk_live_xxx`.

## Endpoints

- `POST /checkout/sessions` creates hosted checkout sessions.
- `GET /checkout/sessions/:id` retrieves a session.
- `POST /payments` creates a direct payment.
- `GET /payments/:id` retrieves a payment.
- `POST /payments/:id/refund` creates a refund.
- `POST /payouts` creates a payout.
- `POST /webhooks` registers a webhook endpoint.
- `GET /payment-methods` lists supported methods.
- `GET /providers` lists provider descriptors.

The OpenAPI source lives at `apps/diapay-api/openapi/diapay.openapi.yaml` for future type and reference generation.
