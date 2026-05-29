# Diapay Checkout hébergé

Diapay Checkout crée une session de paiement hébergée, expire automatiquement et redirige vers `successUrl` ou `cancelUrl`.

## Créer une session

`POST /api/v1/checkout/sessions`

Headers recommandés:

- `Authorization: Bearer sk_test_xxx`
- `Idempotency-Key: cart_or_order_id`

```json
{
  "amount": 25000,
  "currency": "XOF",
  "successUrl": "https://example.com/success",
  "cancelUrl": "https://example.com/cancel",
  "customer": { "email": "client@example.com" },
  "items": [{ "name": "Produit test", "quantity": 1, "amount": 25000 }],
  "metadata": { "orderId": "ord_123" }
}
```

Réponse: `paymentSessionId`, `checkoutUrl`, `returnUrl`, `cancelUrl`, `expiresAt`, `status`.

## Endpoints

- `POST /api/v1/checkout/sessions`
- `GET /api/v1/checkout/sessions/:id`
- `POST /api/v1/checkout/sessions/:id/complete`
- `POST /api/v1/checkout/sessions/:id/cancel`

## Statuts

`created`, `open`, `completed`, `cancelled`, `expired`.

## Sécurité

- Montant entier positif dans la plus petite unité monétaire.
- Devise validée (`XOF`, `USD`, `EUR`, `GHS`, `NGN`, `USDC`).
- Idempotency key pour éviter les doubles créations.
- Double completion empêchée par refus des sessions déjà finales.
- Secret key uniquement côté serveur.
