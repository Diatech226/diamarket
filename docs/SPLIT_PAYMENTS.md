# Split Payments

`POST /api/v1/marketplace/split-payment` captures a marketplace payment, computes allocations and posts ledger entries.

## Example

For a `100000 FCFA` payment:

- vendor net: `85000 FCFA`
- marketplace commission: `10000 FCFA`
- Diapay fee: `5000 FCFA`

## Rules

Splits support fixed amounts, percentages, multiple vendors, priority ordering and fallback rules for unallocated remainder. Commission rules may be fixed, percentage-based, category-specific, vendor-specific, country-specific or dynamic.

## Timeline

Marketplace payments expose `payment_created`, `payment_authorized`, `payment_captured`, `split_processed`, `wallet_updated`, `escrow_held`, `payout_created`, `payout_completed` and `refund_processed` events.
