# Payouts

Endpoint: `POST /api/v1/marketplace/payouts`.

Le payout engine reverse le `availableBalance` d'un wallet vendeur vers mobile money, virement bancaire ou crypto.

## Méthodes

- `mobile_money`
- `bank_transfer`
- `crypto`

## Statuts

`pending`, `processing`, `completed`, `failed`, `reversed`.

## Modes

- manuel depuis dashboard;
- automatique à intervalle;
- planifié avec `threshold` minimum.

Le débit du wallet vendeur est enregistré dans le ledger avec type `payout` avant l'appel provider. Une compensation `reversal` doit être ajoutée si le provider confirme un échec irréversible après débit.
