# Diapay Marketplace

Diapay Marketplace provides Stripe Connect-like primitives for African and global marketplaces: vendor accounts, wallets, split payments, escrow, commissions, payouts, ledger, timeline and analytics.

## Endpoints

- `POST /api/v1/marketplace/split-payment`
- `POST /api/v1/marketplace/vendors`
- `GET /api/v1/marketplace/vendors/:id/wallet`
- `POST /api/v1/marketplace/payouts`
- `POST /api/v1/marketplace/escrow/release`
- `POST /api/v1/marketplace/escrow/refund`
- `GET /api/v1/marketplace/ledger`
- `GET /api/v1/marketplace`

## VendorAccount

Vendor accounts include `businessName`, `country`, `currencies`, `payoutMethods`, `wallet`, `kycStatus`, `commissions` and `capabilities`.

## Analytics

The dashboard tracks total volume, generated commissions, completed payouts, vendor balances, escrow balances and platform revenue.

## Sandbox scenarios

The sandbox includes simple payment, multi-vendor split, escrow release, automatic payout and vendor refund flows for integration testing.
