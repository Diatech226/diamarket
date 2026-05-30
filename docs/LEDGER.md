# Diapay Ledger

Le ledger Diapay est append-only et double entrée. On ne modifie jamais une écriture historique; on ajoute des écritures de correction (`reversal`, `refund`, `payout`).

## Collections

- `ledger_accounts` — comptes comptables par wallet/propriétaire/devise.
- `ledger_entries` — mouvements immutables debit/credit.
- `balance_snapshots` — projection horodatée après chaque écriture.

## Types d'entrées

`debit`, `credit`, `fee`, `reserve`, `refund`, `payout`, `reversal`.

## Invariants

1. Toute transaction a un `transactionId` traçable.
2. Somme des crédits et débits d'un flux métier doit être justifiable par le provider settlement.
3. Aucun delete/update destructif sur `ledger_entries`.
4. Les écritures multi-devise conservent la devise source et préparent `settlementCurrency`/FX.
