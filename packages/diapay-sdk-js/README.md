# Diapay SDK JavaScript

SDK serveur pour créer des paiements sandbox et des sessions Checkout hébergées Diapay.

> N’utilisez jamais `secretKey` côté navigateur. Créez la session depuis votre backend puis renvoyez uniquement `checkoutUrl` au frontend.

## Installation

```bash
pnpm add diapay-sdk-js
```

## Checkout hébergé

```ts
import Diapay from 'diapay-sdk-js';

const diapay = new Diapay({
  secretKey: 'sk_test_xxx',
  baseUrl: 'http://localhost:5100',
});

const session = await diapay.checkout.sessions.create({
  amount: 25000,
  currency: 'XOF',
  successUrl: 'https://example.com/success',
  cancelUrl: 'https://example.com/cancel',
}, { idempotencyKey: 'cart_123' });

console.log(session.checkoutUrl);
```

## API disponible

- `diapay.checkout.sessions.create(params, { idempotencyKey })`
- `diapay.checkout.sessions.retrieve(id)`
- `diapay.redirectToCheckout(sessionOrId)`
- `diapay.createPayment(params)`
- `diapay.retrievePayment(id)`
- `diapay.refundPayment(id)`
- `diapay.cancelPayment(id)`
