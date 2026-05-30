# Marketplace Payouts

`POST /api/v1/marketplace/payouts` moves available vendor balance to an external destination.

## Methods

- `mobile_money`
- `bank_transfer`
- `crypto`

## Statuses

`pending`, `processing`, `completed`, `failed` and `reversed` are supported. Payouts can be manual, automatic or scheduled and may enforce a minimum payout threshold before funds leave the vendor wallet.
