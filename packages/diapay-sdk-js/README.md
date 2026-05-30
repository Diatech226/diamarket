# Diapay SDK JS

TypeScript-first SDK for Diapay Checkout, Payments, Refunds, Payouts, Customers and Webhooks.

```ts
import Diapay from 'diapay-sdk-js';

const diapay = new Diapay({
  secretKey: 'sk_test_xxx',
  maxRetries: 2,
});

const payment = await diapay.payments.create({
  amount: 125000,
  currency: 'XOF',
  method: 'mobile-money',
  phone: '70000000',
});
```

## Modules

- `diapay.checkout.sessions.create()` and `retrieve()`
- `diapay.payments.create()`, `retrieve()` and `cancel()`
- `diapay.refunds.create()`
- `diapay.payouts.create()`
- `diapay.customers.create()`
- `diapay.webhooks.verify()`

## Reliability

The SDK validates payloads before sending, raises `DiapayError` with status/code/request metadata and retries transient network or 5xx failures with exponential backoff.
