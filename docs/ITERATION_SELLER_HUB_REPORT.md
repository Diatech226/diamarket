# Iteration 5 — Seller Hub (Vendeurs)

## Références Stitch utilisées

Analyse des écrans Stitch liés à `vendor`, `seller`, `merchant`, `shop`, `store`, `storefront`, `messaging`, `wallet`, `payout`, `analytics`, `dashboard` :

- `stich-reference/05_vendors/gestion_des_vendeurs_desktop*` : liste vendeurs, statuts, actions administrateur.
- `stich-reference/05_vendors/gestion_des_virements_desktop*` : payouts, frais, statuts et historique.
- `stich-reference/05_vendors/messagerie_vendeurs_desktop*` : conversations, lu/non lu, support vendeur.
- `stich-reference/06_storefront/*` : builder storefront, domaine, brand kit.
- `stich-reference/14_payments/configuration_compte_bancaire_vendeur_desktop*` : banque, IBAN et préparation Diapay.
- `stich-reference/15_analytics/rapports_de_ventes_desktop` : graphiques, KPI et reporting.

Le HTML Stitch n'a pas été copié. Les idées visuelles ont été recomposées en composants React/Next.js avec les tokens locaux existants.

## Composants créés

- `VendorOverviewCard`
- `VendorProfileCard`
- `VendorStatCard`
- `VendorAnalyticsChart`
- `VendorWalletCard`
- `VendorPayoutTable`
- `VendorDocumentGrid`
- `VendorMessageCenter`
- `VendorTimeline`
- `VendorOrdersTable`
- `VendorCatalogTable`
- `VendorCustomerTable`

## Pages créées

- `/vendors/[id]`
- `/vendors/[id]/overview`
- `/vendors/[id]/profile`
- `/vendors/[id]/catalog`
- `/vendors/[id]/orders`
- `/vendors/[id]/customers`
- `/vendors/[id]/analytics`
- `/vendors/[id]/payouts`
- `/vendors/[id]/wallet`
- `/vendors/[id]/messaging`
- `/vendors/[id]/documents`
- `/vendors/[id]/settings`

La page `/vendors` existante reste la porte d'entrée de gestion et conserve les demandes vendeur, la liste, les filtres et les actions statut/commission.

## Endpoints connectés ou complétés

- `GET /vendors`
- `GET /vendors/:id`
- `PATCH /vendors/:id`
- `GET /vendors/:id/payouts`
- `POST /vendors/:id/payouts`
- `GET /vendors/:id/messaging`
- `POST /vendors/:id/messages`
- `GET /vendors/:id/analytics`
- `GET /vendors/:id/catalog`
- `GET /vendors/:id/orders`
- `GET /vendors/:id/customers`
- `GET /vendors/:id/documents`

Les endpoints non persistés retournent un contrat propre avec `success`, `data` et/ou `meta` au lieu de simuler une intégration réelle.

## Architecture Wallet

Le wallet vendeur est une couche d'interface et de contrat uniquement. Il expose :

- solde disponible estimé depuis les revenus moins commissions ;
- solde bloqué estimé depuis les commandes en attente ;
- commissions ;
- paiements en attente ;
- timeline d'événements.

Aucun paiement réel n'est déclenché. La future intégration Diapay pourra remplacer les estimations par des ledgers, holds et mouvements audités.

## Architecture Payout

Les payouts couvrent :

- virement bancaire ;
- Mobile Money ;
- Crypto ;
- banque ;
- statut ;
- frais ;
- historique.

`POST /vendors/:id/payouts` reste une fondation contractuelle. Les validations KYC, le scoring risque, les preuves de retrait et la synchronisation Diapay restent à implémenter.

## Limites restantes

- Pas de websocket réel pour la messagerie.
- Pas de stockage sécurisé réel pour les documents vendeur.
- Pas de ledger financier persistant pour wallet/payouts.
- Pas de statistiques IA calculées.
- Les actions catalogue avancées redirigent encore vers les endpoints produits existants.

## Prochaines itérations

1. Ajouter modèles persistants `VendorDocument`, `VendorConversation`, `VendorWalletLedger` et `VendorPayout`.
2. Brancher Diapay sur un environnement sandbox sans toucher aux flux existants.
3. Ajouter websocket/SSE pour notifications admin ↔ vendeur.
4. Ajouter exports CSV/XLSX vendeur-scopés.
5. Ajouter insights IA sur produits populaires, risque de churn et recommandations de stock.
