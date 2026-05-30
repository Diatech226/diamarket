# Escrow Marketplace

Les fonds vendeur peuvent être bloqués dans `escrow_wallet` jusqu'à confirmation de livraison.

## Flux

1. paiement reçu;
2. split traité;
3. allocation vendeur créditée dans escrow;
4. livraison confirmée;
5. release total ou partiel vers `vendor_wallet`.

## Statuts

- `held`
- `released`
- `refunded`
- `disputed`

## Endpoints

- `POST /api/v1/marketplace/escrow/release`
- `POST /api/v1/marketplace/escrow/refund`

Le release et le refund ajoutent des écritures ledger. Ils ne réécrivent jamais le hold initial.
