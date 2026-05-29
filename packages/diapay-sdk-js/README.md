# diapay-sdk-js

SDK JavaScript/Node.js pour Diapay Checkout.

## Installation workspace

```bash
pnpm add diapay-sdk-js@file:../../packages/diapay-sdk-js --filter diamarket-api
```

## Utilisation Node.js

```ts
import Diapay from 'diapay-sdk-js';

const diapay = new Diapay({
  baseUrl: process.env.DIAPAY_API_BASE_URL,
  secretKey: process.env.DIAPAY_SECRET_KEY!,
});

const session = await diapay.checkout.sessions.create({
  amount: 25000,
  currency: 'XOF',
  successUrl: 'http://localhost:3000/orders/success',
  cancelUrl: 'http://localhost:3000/orders/cancel',
  metadata: { source: 'diamarket', orderId: '...', customerId: '...', environment: 'test' },
});
```

## Exemple Diamarket

`diamarket-api` crée la session côté serveur, sauvegarde `session.id` et `session.checkoutUrl`, puis renvoie uniquement l’URL de checkout au frontend. Les webhooks entrants sont validés avec HMAC SHA-256 :

```ts
const valid = Diapay.verifyWebhookSignature(rawBody, signature, process.env.DIAPAY_WEBHOOK_SECRET!);
```

Ne jamais utiliser `secretKey` depuis `diamarket-web` ou `diamarket-cms`.
