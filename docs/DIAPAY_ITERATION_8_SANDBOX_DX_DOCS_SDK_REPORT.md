# DIAPAY — Itération 8 : Sandbox, Developer Experience, Docs & SDK

Date: 2026-07-02

## Synthèse

Cette itération améliore l'expérience développeur Diapay autour d'un sandbox pédagogique, d'un scenario runner modulaire, d'un playground, d'une documentation structurée et de helpers SDK JS/Node. Toutes les simulations restent en mode test/mock; aucun paiement réel ni opérateur Mobile Money réel n'est connecté.

## Sandbox pages

Pages ajoutées: `/sandbox`, `/sandbox/checkout`, `/sandbox/payments`, `/sandbox/mobile-money`, `/sandbox/refunds`, `/sandbox/webhooks`, `/sandbox/ledger`, `/sandbox/scenarios`, `/sandbox/logs` et `/playground`.

## Scenario runner

`apps/diapay-sandbox/src/lib/scenarios/` contient des scénarios checkout success/failed, payments success/failed/pending, Mobile Money OTP/timeout, refund full/partial, webhooks success/duplicate/failed signature, ledger impact et marketplace split placeholder. Chaque scénario expose `id`, `title`, `description`, `category`, `payload`, `run()` et `expectedResult`.

## Playground

Le playground permet de choisir un endpoint, modifier le payload, choisir test/live, choisir le provider mock, envoyer une requête simulée et copier curl/JS/Node.

## Docs pages et quickstart

Les pages docs recommandées ont été créées avec exemples curl, JavaScript et Node, erreurs, pièges fréquents et liens sandbox. Le quickstart couvre création application, clé API test, checkout session, redirection, webhook `payment.paid`, vérification signature et affichage commande payée avec exemples Express et Next.js.

## SDK JS changes

Le SDK conserve les exports existants et ajoute l'alias `webhooks.verifySignature()` en plus de `verify()`/`constructEvent()`. Les ressources essentielles restent exposées: checkout, payments, refunds, webhooks, wallets, ledger, reports, applications et API keys.

## SDK Node changes

Le package Node conserve le middleware raw-body historique et ajoute un mode `expressWebhookMiddleware({ secret, handler })`, `nextWebhookHandler()` et `verifyWebhookSignature()` sans logger les secrets.

## Webhook testing

Endpoints ajoutés/stabilisés: `POST /api/v1/webhook-endpoints/:id/test` et `POST /api/v1/webhook-events/:id/retry` avec réponses sandbox 202. Les docs/sandbox couvrent success, duplicate, failed signature, expired timestamp et retry delivery.

## Mobile Money testing

La section Mobile Money Africa Testing documente Orange Money success/pending, Moov Money failed, Wave timeout, MTN OTP required et USSD placeholder. Les champs `phoneNumber`, `country`, `operator`, `currency`, `otp`, `ussdCode`, `providerReference` et webhook async sont explicités comme placeholders mock tant que les vrais opérateurs ne sont pas configurés.

## API logs

`GET /api/v1/logs` existait; `GET /api/v1/logs/:id` renvoie une vue sanitize avec `requestId`, `endpoint`, `method`, `status`, `duration`, `environment`, `applicationId`, `errorCode` et `createdAt`, sans secret, Authorization complet, webhook secret, token, raw card data, OTP ni private key.

## OpenAPI updates

La spécification `apps/diapay-api/openapi/diapay.v1.yaml` mentionne checkout, payments, refunds, webhooks, API keys, applications, wallets, ledger, reports, logs, errors et idempotency et ajoute les routes de test/retry webhooks et logs.

## Limites restantes

- Persistance toujours in-memory.
- Les endpoints webhook test/retry sont pédagogiques et non un worker durable.
- La documentation est structurée mais gagnera à être branchée sur OpenAPI généré.
- Les scénarios Mobile Money restent des placeholders explicites.

## Prochaine itération recommandée

Générer SDK/types depuis OpenAPI, ajouter tests E2E Playwright docs/sandbox/dashboard, persister logs/webhook deliveries, et brancher un vrai portail d'applications/API keys avec RBAC complet.
