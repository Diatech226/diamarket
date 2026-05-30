# Diapay Node.js SDK

Server-side helper package for Diapay payments, checkout sessions, refunds and webhooks.

```ts
import { createClient, createPayment, verifyWebhook } from 'diapay-node';

createClient({ secretKey: process.env.DIAPAY_SECRET_KEY! });

const payment = await createPayment({
  amount: 125000,
  currency: 'XOF',
  method: 'mobile-money',
  phone: '70000000',
});

const valid = verifyWebhook(rawBody, req.headers['diapay-signature'] as string, 'whsec_test_xxx');
```
