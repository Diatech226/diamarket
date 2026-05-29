# Tests webhooks Diapay Sandbox

## Événements émis

- `checkout.session.completed`
- `payment.succeeded`
- `payment.failed`
- `payment.cancelled`
- `payment.expired`

## Enregistrer un endpoint sandbox

```bash
curl -X POST http://localhost:5100/api/v1/webhooks \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer sk_test_sandbox_merchant' \
  -d '{"url":"http://localhost:3102/api/sandbox-webhook","events":["checkout.session.completed","payment.succeeded","payment.failed","payment.cancelled","payment.expired"]}'
```

## Signature

Chaque tentative de livraison inclut `Diapay-Signature`, un HMAC SHA-256 du corps JSON avec le secret de l’endpoint (`whsec_test_*`). Les événements et tentatives sont conservés en mémoire pendant l’exécution de l’API.

## Inspection

- `GET /api/v1/webhook-events` liste les événements créés et les tentatives.
- `GET http://localhost:3102/api/sandbox-webhook` liste les webhooks reçus par la fausse boutique.
