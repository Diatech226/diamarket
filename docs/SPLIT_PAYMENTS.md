# Split Payments

Endpoint: `POST /api/v1/marketplace/split-payment`.

Diapay répartit automatiquement un paiement capturé entre vendeurs, marketplace, frais Diapay, réserve et fallback.

## Exemple 100 000 FCFA

```json
{
  "amount": 100000,
  "currency": "XOF",
  "splits": [{ "vendorId": "vnd_...", "percentage": 85, "holdInEscrow": true }],
  "commission": { "percentage": 10 },
  "diapayFee": { "percentage": 5 },
  "escrow": { "enabled": true }
}
```

Résultat: vendeur 85 000, commission marketplace 10 000, frais Diapay 5 000.

## Support

- split fixe (`amount`), pourcentage (`percentage`), multi-vendeurs;
- priorité (`priority`) et fallback du reste;
- escrow par allocation vendeur;
- timeline: `payment_created`, `payment_authorized`, `payment_captured`, `split_processed`, `wallet_updated`, `escrow_held`.
