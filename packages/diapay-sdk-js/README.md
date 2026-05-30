# diapay-sdk-js

SDK JavaScript/Node.js pour Diapay Checkout et les paiements directs multi-providers.

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

## Providers de paiement

Diapay route les paiements via une interface commune côté API. Les providers livrés sont des mocks/test prêts à être remplacés par des connecteurs réels lorsque les credentials seront disponibles :

- `mobile-money` → `mock-mobile-money`
- `bank-card` → `mock-bank-card`
- `bank-transfer` → `mock-bank-transfer`
- `crypto` → `mock-crypto`
- `mock` → provider générique de fallback

```ts
const providers = await diapay.listProviders();
const methods = await diapay.listPaymentMethods();

const payment = await diapay.createPayment({
  amount: 125000,
  currency: 'XOF',
  method: 'mobile-money',
  phone: '70000000', // succès sandbox; 70000001 force un échec
  metadata: { orderId: 'ORD-123' },
});
```

Cartes sandbox : `4242424242424242` réussit, `4000000000000002` échoue.

## Exemple Diamarket

`diamarket-api` crée la session côté serveur, sauvegarde `session.id` et `session.checkoutUrl`, puis renvoie uniquement l’URL de checkout au frontend. Les webhooks entrants sont validés avec HMAC SHA-256 :

```ts
const valid = Diapay.verifyWebhookSignature(rawBody, signature, process.env.DIAPAY_WEBHOOK_SECRET!);
```

Ne jamais utiliser `secretKey` depuis `diamarket-web` ou `diamarket-cms`.
