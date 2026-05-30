# SDK Guide

## JavaScript

```ts
import Diapay from 'diapay-sdk-js';

const diapay = new Diapay({ secretKey: 'sk_test_xxx' });
await diapay.payments.create({ amount: 125000, currency: 'XOF', method: 'mobile-money' });
```

Modules: `checkout`, `payments`, `refunds`, `payouts`, `customers` and `webhooks`.

## Node.js

```ts
import { createClient, createPayment, verifyWebhook } from 'diapay-node';

createClient({ secretKey: process.env.DIAPAY_SECRET_KEY! });
await createPayment({ amount: 125000, currency: 'XOF', method: 'mobile-money' });
verifyWebhook(rawBody, signature, process.env.DIAPAY_WEBHOOK_SECRET!);
```

Both SDKs include automatic retries, typed errors, TypeScript declarations and payload validation.
