# Diapay Ledger

The marketplace ledger is double-entry and append-only. Historical entries are never mutated; corrections are represented by new `reversal`, `refund` or `payout` entries.

## Collections

- `ledger_accounts`: accounting accounts mapped to wallets and owners.
- `ledger_entries`: immutable debit/credit lines with `transactionId`, direction, amount, currency and metadata.
- `balance_snapshots`: point-in-time wallet balances after each ledger entry.

## Entry types

`debit`, `credit`, `fee`, `reserve`, `refund`, `payout` and `reversal` cover the core payment lifecycle. For each transaction, debit totals must equal credit totals in the same currency.

## Integrity controls

- Reject negative available or pending balances.
- Use idempotency keys for externally retried operations.
- Reconcile provider settlements against ledger totals, not mutable payment status alone.
