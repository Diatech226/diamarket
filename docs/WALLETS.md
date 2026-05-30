# Diapay Wallets

Diapay utilise des wallets internes par propriétaire et par devise pour isoler les fonds marketplace.

## Types

- `merchant_wallet` — solde marchand direct.
- `vendor_wallet` — solde vendeur marketplace.
- `platform_wallet` — commissions marketplace.
- `escrow_wallet` — fonds bloqués avant livraison/release.
- `reserve_wallet` — réserves risque, chargebacks et rolling reserve.

## Champs

Chaque wallet expose `balance`, `availableBalance`, `pendingBalance`, `currency`, `status`, `owner` et `ledgerEntries`.

## Règle de cohérence

Le wallet est une projection du ledger: le solde courant peut être recalculé depuis les écritures immutables. Les updates de balance doivent être transactionnels avec l'ajout d'une écriture ledger et d'un `balance_snapshot`.
