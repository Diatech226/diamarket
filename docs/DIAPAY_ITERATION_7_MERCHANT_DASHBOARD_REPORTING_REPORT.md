# DIAPAY — Itération 7 : Merchant Dashboard Pro, Reporting & Operational Control

Date: 2026-07-02

## Synthèse

Cette itération renforce Diapay autour du dashboard marchand professionnel, du reporting opérationnel et des exports CSV. Les données restent explicitement sandbox/in-memory lorsque la persistance durable n'est pas encore branchée.

## Pages dashboard créées/améliorées

Les routes dashboard existantes couvrent `/dashboard`, `/payments`, `/payments/[id]`, `/refunds`, `/transactions`, `/ledger`, `/wallets`, `/revenue`, `/webhooks`, `/webhooks/[id]`, `/events`, `/logs`, `/api-keys`, `/apps`, `/developers` et `/settings` avec shell, navigation, états vides/chargement/erreur et données masquées.

## Endpoints reporting

Ajout de `GET /api/v1/reports/overview`, `/revenue`, `/payments`, `/providers`, `/webhooks`, `/export/payments.csv` et `/export/ledger.csv`.

Les endpoints acceptent `merchantId`, `environment`, `applicationId`, `currency`, `from`/`to`, `startDate`/`endDate`, `page` et `limit`. Les réponses JSON utilisent l'enveloppe `{ success, data, message }`; les exports CSV excluent secrets, hashes et payloads bruts.

## Composants dashboard

Les composants existants couvrent cartes métriques, badges de statut, montants, tableaux, empty/error/loading states et actions. Les pages utilisent des patterns professionnels pour filtres, recherche, test/live et liens rapides.

## Exports

- `GET /api/v1/reports/export/payments.csv`: paiements filtrés sans secrets.
- `GET /api/v1/reports/export/ledger.csv`: transactions ledger sans metadata sensible.

## Sécurité UI et permissions

Les clés API restent masquées hors création/rotation; les secrets webhook ne sont pas affichés en clair. Les rôles attendus restent: `viewer`, `developer`, `finance`, `support`, `owner`, `admin`. Le dashboard doit continuer à masquer les actions non autorisées selon les permissions exposées par `DashboardAuthContext`.

## Sandbox updates

Les rapports documentent clairement la source `sandbox_in_memory`. Le sandbox peut créer des paiements, refunds et webhooks puis ouvrir les objets correspondants dans le dashboard via leurs IDs.

## SDK updates

`packages/diapay-sdk-js` et `packages/diapay-node` exposent `getReportOverview()`, `getRevenueReport()`, `listPaymentsReport()`, `exportPaymentsCsv()`, `exportLedgerCsv()`, `listEvents()` et `listLogs()` sans retirer les exports existants.

## Limites restantes

- Persistance toujours en mémoire.
- Isolation marchande basée sur contexte API key/merchant sandbox, à remplacer par auth durable.
- Certaines pages dashboard utilisent encore fixtures démonstratives clairement non production.
- Les retries webhooks durables, rate limits et audit log persistant restent à finaliser.

## Prochaine itération recommandée

Brancher une base transactionnelle, appliquer scopes sur tous les endpoints sensibles, remplacer les fixtures dashboard par API live paginée, ajouter tests E2E Playwright RBAC/export et générer SDK depuis OpenAPI.
