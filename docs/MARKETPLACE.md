# Diapay Marketplace

Diapay fournit une architecture Stripe Connect-like pour marketplaces africaines et globales.

## APIs

- `POST /api/v1/marketplace/split-payment`
- `POST /api/v1/marketplace/vendors`
- `GET /api/v1/marketplace/vendors/:id/wallet`
- `POST /api/v1/marketplace/payouts`
- `POST /api/v1/marketplace/escrow/release`
- `POST /api/v1/marketplace/escrow/refund`
- `GET /api/v1/marketplace/ledger`
- `GET /api/v1/marketplace/wallets`
- `GET /api/v1/marketplace/analytics`

## VendorAccount

Champs: `businessName`, `country`, `currencies`, `payoutMethods`, `wallet`, `kycStatus`, `commissions`, `capabilities`.

## Multi-devise

Devises initiales: FCFA (`XOF`), `USD`, `EUR`, `USDT`. Les modèles conservent `currency` par wallet et ledger entry pour préparer conversion FX, settlement currency et comptes de clearing.

## Dashboard

Pages ajoutées: Wallets, Balances, Vendor Accounts, Escrow, Payouts, Ledger, Commissions, Marketplace Analytics.

## Tests recommandés

- split payments mono/multi-vendeur;
- intégrité ledger et balances;
- payout manuel/auto/seuil;
- escrow release/refund partiel;
- commissions par vendeur/pays/catégorie;
- multi-devise et settlement.
