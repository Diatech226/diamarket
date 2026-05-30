# Diapay Wallets

Diapay Marketplace uses internal wallets to isolate balances by owner, currency and settlement state.

## Wallet types

- `merchant_wallet`: temporary collection wallet for the merchant or marketplace receiving a payment.
- `vendor_wallet`: seller balance used for available, pending and payout-ready funds.
- `platform_wallet`: marketplace and Diapay revenue wallet for commissions and fees.
- `escrow_wallet`: mirrored held funds while delivery, dispute or release conditions are pending.
- `reserve_wallet`: rolling reserve, failed payout return and refund protection wallet.

## Balance fields

Every wallet stores `balance`, `availableBalance`, `pendingBalance`, `currency`, `status`, `owner` and append-only `ledgerEntries`. `balance = availableBalance + pendingBalance`; operational code must update balances only by posting ledger entries and balance snapshots.

## Supported currencies

`FCFA`, `XOF`, `USD`, `EUR` and `USDT` are accepted. Settlement currency and FX rates are modeled as future conversion metadata so cross-currency settlement can be introduced without changing wallet semantics.
