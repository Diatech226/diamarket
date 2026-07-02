# DIAPAY — Itération 1 : contrat public et structure progressive

Date: 2026-07-02

## Endpoints publics listés

Tous les endpoints publics actuellement montés sous `/api/v1` sont listés dans `docs/DIAPAY_PUBLIC_API_CONTRACT.md`, avec `/health` hors préfixe pour Render/runtime.

## Endpoints stables

- `/health`
- `/api/v1/config`
- `/api/v1/checkout/sessions` création et lecture par id
- `/api/v1/payments` création et lecture par id
- `/api/v1/refunds` création et lecture par id
- `/api/v1/payment-methods`
- `/api/v1/providers`

## Endpoints partiels

- Listing checkout sessions, webhooks, webhook-events, transactions.
- Developer platform: merchants, merchant-admins, apps, logs.
- Marketplace: vendors, timeline, analytics.

## Endpoints dangereux

- Balance, payouts, marketplace payouts, escrow, ledger, wallets, API keys: ils restent des endpoints sandbox/in-memory sans garanties financières production-grade ni auth/scopes suffisants.

## Tests ajoutés

- `apps/diapay-api/tests/contract.test.ts` couvre `/health`, `/api/v1/config`, checkout sessions, payments, refunds, enveloppes success/error, statuts de paiement valides, et une erreur 404.

## Nouvelle structure créée

- `apps/diapay-api/src/app.ts` sépare la configuration Express.
- `apps/diapay-api/src/server.ts` ne démarre plus que le serveur.
- `config/`, `shared/errors/`, `shared/middleware/`, `shared/utils/`, `shared/types/` ajoutés.
- `modules/checkout`, `payments`, `refunds`, `webhooks`, `providers`, `merchants`, `api-keys`, `ledger`, `wallets`, `sandbox` ajoutés comme placeholders propres.

## Legacy conservé

Les routes publiques restent dans `src/routes/index.ts` et sont marquées comme legacy temporaire: `Legacy route kept for compatibility during Diapay restructuring.` Aucun endpoint public existant n'a été supprimé.

## OpenAPI

`apps/diapay-api/openapi/diapay.v1.yaml` a été créé comme base minimale alignée sur les ressources publiques principales: health/config, checkout sessions, payments, refunds, webhooks, api keys, wallets, transactions.

## Dashboard et SDK

Aucun refactor dashboard/SDK n'a été effectué. La couche de compatibilité API conserve les URLs actuelles, mais l'enveloppe de réponse standardisée peut nécessiter une adaptation progressive des clients si des écrans consomment encore directement les objets racine legacy.

## Validation

- `npm --prefix apps/diapay-api run build`: succès.
- `npm --prefix apps/diapay-api test`: succès.
- `npm --prefix apps/diapay-dashboard run build`: succès; avertissement existant Next indiquant qu’ESLint n’est pas installé pour le build.
- `npm --prefix apps/diapay-sandbox run build`: succès.
- `npm --prefix apps/diapay-docs run build`: succès.
- `npm --prefix packages/diapay-sdk-js run build`: succès.
- `npm --prefix packages/diapay-node run build`: succès.

Note npm commune: `npm warn Unknown env config "http-proxy". This will stop working in the next major version of npm.`

## Risques restants

- Stores en mémoire non durables.
- Auth/scopes insuffisants pour des endpoints sensibles.
- Ledger, wallets et payouts non production-grade.
- Webhooks sans persistance/retry durable.
- Contrat OpenAPI minimal non encore utilisé pour générer SDK/tests.

## Prochaine itération recommandée

Migrer progressivement les modules `checkout`, `payments` et `refunds` derrière le routeur legacy, introduire validation DTO runtime, repositories persistants, et adapter explicitement SDK/dashboard à l'enveloppe contractuelle.
