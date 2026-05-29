# Intégration Diapay Checkout dans Diamarket

Cette itération connecte Diamarket à Diapay Checkout via `diamarket-api`. Le frontend ne manipule jamais `DIAPAY_SECRET_KEY` : il demande uniquement à l’API Diamarket de créer ou vérifier une session.

## Variables d’environnement `apps/diamarket-api`

```env
DIAPAY_API_BASE_URL=http://localhost:5100
DIAPAY_SECRET_KEY=sk_test_xxx
DIAPAY_PUBLIC_KEY=pk_test_xxx
DIAPAY_WEBHOOK_SECRET=whsec_xxx
DIAMARKET_SUCCESS_URL=http://localhost:3000/orders/success
DIAMARKET_CANCEL_URL=http://localhost:3000/orders/cancel
```

> Important : `DIAPAY_WEBHOOK_SECRET` doit correspondre au secret retourné par l’endpoint Diapay qui livre les webhooks vers `POST /api/payments/diapay/webhook`.

## Flux checkout

1. Le client crée une commande Diamarket avec `paymentStatus=unpaid`.
2. Le client clique sur **Payer avec Diapay**.
3. `diamarket-api` appelle Diapay Checkout avec le SDK Node.js.
4. Diamarket sauvegarde `diapaySessionId`, `checkoutUrl`, `paymentProvider=diapay` et `paymentStatus=pending`.
5. Le navigateur est redirigé vers `checkoutUrl`.
6. Diapay envoie un webhook signé à Diamarket.
7. Diamarket vérifie la signature, le montant, la devise et `metadata.orderId`.
8. Seul un webhook vérifié `checkout.session.completed` ou `payment.succeeded` marque la commande `paid` et la commande `confirmed`.

## Endpoints Diamarket

| Méthode | Endpoint | Usage |
| --- | --- | --- |
| `POST` | `/api/payments/diapay/checkout-session` | Crée une session Checkout Diapay pour une commande. Body: `{ "orderId": "..." }`. |
| `GET` | `/api/payments/diapay/session/:sessionId` | Récupère une session Checkout côté serveur. |
| `POST` | `/api/payments/diapay/webhook` | Reçoit les webhooks Diapay signés. |
| `GET` | `/api/orders/:id/payment-status` | Retourne le statut paiement exposable au frontend/CMS. |

## Metadata Diapay

Chaque session envoie :

```json
{
  "source": "diamarket",
  "orderId": "...",
  "customerId": "...",
  "environment": "test"
}
```

## Événements webhooks gérés

- `checkout.session.completed`
- `payment.succeeded`
- `payment.failed`
- `payment.cancelled`
- `payment.expired`
- `refund.succeeded`

## Tests sandbox recommandés

1. Démarrer `diapay-api`, `diapay-sandbox`, `diamarket-api`, `diamarket-web` et `diamarket-cms`.
2. Enregistrer dans Diapay un webhook pointant vers `http://localhost:5000/api/payments/diapay/webhook`.
3. Copier le secret retourné dans `DIAPAY_WEBHOOK_SECRET`.
4. Créer une commande Diamarket.
5. Cliquer sur **Payer avec Diapay**.
6. Tester succès sandbox (`4242424242424242` ou mobile money `70000000`).
7. Tester échec sandbox (`4000000000000002` ou mobile money `70000001`).
8. Vérifier dans le CMS les colonnes `paymentProvider`, `paymentStatus`, `diapaySessionId` et `diapayPaymentId`.
