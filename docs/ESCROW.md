# Marketplace Escrow

Escrow holds vendor allocations until delivery, dispute resolution or a marketplace operator action.

## Flow

1. Payment is received.
2. Vendor allocation is marked pending and mirrored in the escrow wallet.
3. Delivery is confirmed.
4. `POST /api/v1/marketplace/escrow/release` releases all or part of the held amount.

## Statuses

- `held`
- `released`
- `refunded`
- `disputed`

Escrow supports automatic release, manual release and partial release. Refunds are posted as new ledger entries instead of editing the original hold.
