# DIAPAY — Itération 5 : Ledger, Wallets & Money Movement Foundation

Date: 2026-07-02

## Synthèse

Cette itération ajoute le socle financier interne Diapay sans settlements bancaires ni payouts réels. La persistance reste volontairement en mémoire et n'est pas production-ready.

## Ledger module

`apps/diapay-api/src/modules/ledger` introduit les modèles `LedgerAccount`, `LedgerEntry` et `LedgerTransaction`, un repository in-memory, un service de posting et les endpoints `GET /api/v1/ledger/accounts`, `GET /api/v1/ledger/transactions`, `GET /api/v1/ledger/transactions/:id`.

## Double-entry design

Chaque transaction postée contient au moins deux écritures. `assertBalancedLedgerTransaction()` impose `totalDebit === totalCredit` et retourne `LEDGER_NOT_BALANCED` en cas d'écart. Les écritures postées sont immutables; les corrections passent par `reverseLedgerTransaction()`.

## Comptes créés

Types supportés: `platform_cash`, `platform_revenue`, `platform_fees`, `merchant_pending`, `merchant_available`, `merchant_reserved`, `merchant_refunds`, `provider_clearing`, `customer_cash`, `escrow`, `chargebacks`, `adjustments`.

## Payment → ledger flow

Quand un paiement atteint `paid`, Diapay poste une transaction `payment_capture`: débit `provider_clearing`, crédit `merchant_pending`, crédit `platform_fees`. La commission temporaire est configurée par `DIAPAY_DEFAULT_FEE_PERCENT` avec défaut explicite `2.5`.

## Refund → ledger flow

Quand un refund devient `succeeded`, Diapay poste une transaction `refund` append-only pour le montant remboursé. Les refunds partiels utilisent uniquement le montant partiel. Les refunds supérieurs au payé restent refusés par le service refunds.

## Balance calculation

`BalanceService` expose `GET /api/v1/balances` avec merchant pending, merchant available, platform fees, provider clearing balance et refund liabilities. Les valeurs sont des vues calculées depuis le ledger in-memory.

## Wallet module

`apps/diapay-api/src/modules/wallets` expose `GET /api/v1/wallets` et `GET /api/v1/wallets/:id`. Le wallet est une vue dashboard; le ledger reste la source de vérité.

## Dashboard updates

Les pages `/wallets`, `/transactions`, `/revenue` et `/ledger` sont conservées et annotées comme vues sandbox/in-memory non production-ready.

## Sandbox scenarios

Le sandbox liste les scénarios payment paid creates ledger entries, partial/full refund reversal entries, fee calculated, unbalanced transaction rejected et duplicate webhook idempotent.

## SDK updates

`packages/diapay-sdk-js` et `packages/diapay-node` ajoutent `listWallets()`, `getWallet()`, `listLedgerTransactions()`, `getLedgerTransaction()` et `getBalances()` sans retirer les exports existants.

## Sécurité et audit

Les metadata ledger sont filtrées contre secrets, tokens, OTP, private keys et champs carte. Les logs financiers attendus doivent inclure requestId, referenceId, transactionId, merchantId, amount, currency et status sans secrets.

## Limites restantes

- Persistance in-memory volatile.
- Auth/scopes merchant encore partiels pour les routes financières.
- Pas de settlement bancaire ni payout réel.
- Pas de base transactionnelle ni verrouillage concurrent.
- Dashboard encore principalement alimenté par fixtures.

## Prochaine itération recommandée

Migrer ledger, wallets, payments et refunds vers une base transactionnelle avec contraintes d'unicité idempotentes, scopes merchant stricts, tests contractuels OpenAPI générés et jobs de reconciliation provider.
