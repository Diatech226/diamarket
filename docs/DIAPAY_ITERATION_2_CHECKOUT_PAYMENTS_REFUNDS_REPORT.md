# DIAPAY — Itération 2 : modularisation checkout, payments et refunds

Date: 2026-07-02

## Modules créés

- `apps/diapay-api/src/modules/checkout`: types, validation, repository adapter, service, controller et routes pour les checkout sessions.
- `apps/diapay-api/src/modules/payments`: modèle attempt, types, validation, repository adapter, service, controller, routes et normalisation centrale des statuts.
- `apps/diapay-api/src/modules/refunds`: types, validation, repository adapter, service, controller et routes pour les refunds.

## Endpoints conservés

Les URLs publiques suivantes restent disponibles sous `/api/v1`:

- `POST /api/v1/checkout/sessions`
- `GET /api/v1/checkout/sessions/:id`
- `POST /api/v1/payments`
- `GET /api/v1/payments/:id`
- `POST /api/v1/payments/:id/cancel`
- `POST /api/v1/refunds`
- `GET /api/v1/refunds/:id`

Les routes legacy hors périmètre restent dans `src/routes/index.ts`.

## Statuts normalisés

Le fichier `modules/payments/payment-status.ts` définit les statuts officiels, les statuts terminaux, les transitions autorisées, le mapping legacy et les helpers `isTerminalPaymentStatus` et `canTransitionPaymentStatus`.

## Ancienne logique conservée

La persistance reste volontairement legacy/en mémoire pour cette itération: les repositories adaptent `services/checkout-store.ts` au lieu d'introduire une base de données. Cela garde le contrat public stable tout en isolant les futurs remplacements de persistance.

## Parties legacy restantes

- Store en mémoire non durable.
- Completion/cancel checkout legacy encore conservés pour la compatibilité sandbox.
- Route legacy `POST /api/v1/payments/:id/refund` conservée.
- Webhooks, providers réels, ledger, wallets et payouts non restructurés dans cette itération.

## Tests ajoutés

Les tests contractuels couvrent maintenant les enveloppes success/error, création et lecture checkout, expiration checkout, création/lecture/cancel payments, attempts, transition interdite, création/lecture refunds, refund partiel, refund total, paiement inexistant, refund sur paiement non payé et validations payload.

## SDK, dashboard et sandbox

- `packages/diapay-sdk-js` expose les nouveaux statuts et `PaymentAttempt`, et `refunds.create` utilise `POST /api/v1/refunds`.
- `packages/diapay-node` expose les helpers `getPayment`, `cancelPayment`, `createRefund` et `getRefund` sans retirer les exports existants.
- Dashboard et sandbox conservent les endpoints `/api/v1`; aucune refonte UI n'a été réalisée.

## Risques restants

- Les données restent volatiles après redémarrage.
- Le modèle financier n'est pas encore un ledger double-entry.
- Les providers sont mockés; aucun paiement réel n'est effectué.
- Les webhooks avancés et retries durables restent à traiter.

## Prochaine itération recommandée

Migrer webhooks/provider events derrière des adapters durables, puis introduire une persistance transactionnelle pour payments/refunds avant de restructurer ledger, wallets et payouts.

## Validation exécutée

- `npm --prefix apps/diapay-api run build`: succès.
- `npm --prefix apps/diapay-api test`: succès.
- `npm --prefix apps/diapay-dashboard run build`: succès; avertissement existant Next indiquant qu'ESLint n'est pas installé pour le build.
- `npm --prefix apps/diapay-sandbox run build`: succès.
- `npm --prefix apps/diapay-docs run build`: succès.
- `npm --prefix packages/diapay-sdk-js run build`: succès.
- `npm --prefix packages/diapay-node run build`: succès.

Note npm commune: `npm warn Unknown env config "http-proxy". This will stop working in the next major version of npm.`
