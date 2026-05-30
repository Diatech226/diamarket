# Webhooks

Register an endpoint and subscribe to events:

- `payment.succeeded`
- `payment.failed`
- `checkout.completed`
- `refund.succeeded`
- `payout.completed`

Diapay sends `Diapay-Signature`, an HMAC SHA-256 signature of the raw JSON body using the endpoint `whsec_` secret. Return any 2xx status for delivery success. Failed deliveries are marked `failed` or `retry` in the dashboard tester.
