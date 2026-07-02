# DIAPAY — Audit de structure interne et proposition de restructuration

Date: 2026-07-02  
Périmètre: `apps/diapay-api`, `apps/diapay-dashboard`, `apps/diapay-sandbox`, `apps/diapay-docs`, `packages/diapay-sdk-js`, `packages/diapay-node`.

## 0. Réponse claire

```txt
Faut-il conserver la structure actuelle ou proposer une nouvelle structure ?
```

Il faut **proposer une nouvelle structure**.

La structure actuelle ne doit pas être conservée telle quelle pour une application de paiement. Elle est acceptable comme POC/sandbox local, mais elle est trop plate, trop couplée, majoritairement en mémoire, insuffisamment authentifiée, et ne sépare pas clairement les domaines critiques: paiement, checkout, refunds, webhooks, ledger, wallets, providers, payouts, merchants et API keys.

Décision synthétique:

```txt
Structure actuelle : à restructurer fortement

Recommandation :
- refactor profond, mais progressif
```

La restructuration ne doit pas être brutale. Les endpoints publics existants doivent être figés, documentés et couverts par tests avant migration interne.

## 1. Audit de structure actuelle

### 1.1 Constats transverses

- `diapay-api` mélange le bootstrap Express, le routage public, les controllers, la logique métier, la validation et l'état sandbox dans quelques fichiers centraux.
- Les stores utilisent des `Map` en mémoire; cela empêche toute reprise après redémarrage, audit financier, réconciliation et scalabilité horizontale.
- La séparation `routes/controllers/services/providers/models` existe visuellement, mais elle n'est pas encore une séparation métier robuste.
- Les validations sont manuelles et dispersées dans les services.
- Les erreurs sont gérées localement par controller au lieu d'un middleware global.
- Les webhooks sortants existent, mais pas comme sous-système fiable avec signature standardisée, retry durable, DLQ et audit.
- Le ledger marketplace est une simulation utile, mais pas un ledger double-entry production-grade atomique.
- Le dashboard mélange appels API et gros jeux de données mockés dans `lib/api.ts`.
- Le sandbox Next appelle directement l'API avec une clé de test et encode beaucoup de scénarios dans une route unique.
- Le SDK JS et le wrapper Node sont utiles, mais trop monolithiques et pas assez alignés sur un contrat OpenAPI versionné.
- La documentation est trop légère pour servir de source de vérité contractuelle.

### 1.2 Tableau d'audit demandé

| Dossier/Fichier | Rôle actuel | Problème | Garder | Déplacer | Supprimer | Recommandation |
|---|---|---|---:|---:|---:|---|
| `apps/diapay-api/src/server.ts` | Bootstrap Express, middlewares globaux, healthcheck, mount `/api/v1`. | Tout est dans le serveur; pas de `app.ts`, config CORS ouverte, pas de request id, pas de middleware erreur central. | Oui | Oui | Non | Séparer `app.ts` et `server.ts`; déplacer CORS/security/env dans `config/`; ajouter error handler global. |
| `apps/diapay-api/src/routes/index.ts` | Routeur unique de tous les domaines. | Fichier central trop couplé: checkout, payments, webhooks, marketplace, merchants, api keys, logs. | Partiel | Oui | Non | Remplacer par routeurs par module: `modules/payments/payment.routes.ts`, `modules/checkout/checkout.routes.ts`, etc. |
| `apps/diapay-api/src/controllers/checkout.ts` | Controllers checkout. | Controllers fins mais dépendants du store global; validations et auth indirectes. | Partiel | Oui | Non | Déplacer vers `modules/checkout/checkout.controller.ts`; injecter service + auth context. |
| `apps/diapay-api/src/controllers/payments.ts` | Paiements directs, refunds, webhooks, balance, payouts, methods, providers. | Controller fourre-tout; mélange ressources financières distinctes; `refund` mute le paiement; balance/payouts sont faux. | Partiel | Oui | Non | Scinder en modules `payments`, `refunds`, `webhooks`, `wallets`, `payouts`, `providers`. |
| `apps/diapay-api/src/controllers/developer-platform.ts` | Marchands, admins, apps, api keys, logs pour dashboard développeur. | Domaine large sans vraie auth/scopes; risque de devenir back-office monolithique. | Partiel | Oui | Non | Scinder `merchants`, `applications`, `api-keys`, `audit-logs`, `auth`. |
| `apps/diapay-api/src/controllers/marketplace.ts` | Expose split, vendors, escrow, payouts, ledger, analytics. | Marketplace couplée aux wallets/ledger/payouts; endpoints sensibles sans vraie barrière métier. | Partiel | Oui | Non | Garder comme façade marketplace, mais extraire `ledger`, `wallets`, `escrow`, `payouts`. |
| `apps/diapay-api/src/services/checkout-store.ts` | Store en mémoire pour sessions, paiements, idempotence, webhooks. | Fichier critique trop chargé; état global volatile; idempotence globale; validation dispersée; webhooks non durables. | Non tel quel | Oui | À terme | Remplacer progressivement par services modulaires + repositories persistants. |
| `apps/diapay-api/src/services/developer-platform-store.ts` | Store dashboard/dev platform. | Même problème de mémoire; pas de hashing de clés; données sensibles. | Non tel quel | Oui | À terme | Créer repositories persistants pour merchants/apps/api keys/audit logs. |
| `apps/diapay-api/src/services/marketplace-store.ts` | Store/facade marketplace historique. | Risque de doublon avec `marketplace.service.ts`. | Non | Oui | Oui si remplacé | Fusionner dans module marketplace ou supprimer après migration. |
| `apps/diapay-api/src/services/marketplace.service.ts` | Simulation marketplace avec wallets, escrow, ledger, payouts. | Bonne base conceptuelle mais pas transactionnelle, pas persistée, pas double-entry strict, seed automatique. | Partiel | Oui | Non | Transformer en modules `ledger`, `wallets`, `escrow`, `marketplace`; retirer seed hors production. |
| `apps/diapay-api/src/providers/*` | Adapters mock par méthode et registre provider. | Bonne amorce d'abstraction; manque inbound webhooks, retries, secrets, capabilities par pays/devise/opérateur. | Oui | Oui | Non | Déplacer vers `modules/providers`; définir contrat `ProviderAdapter`, `ProviderEvent`, `ProviderCapability`. |
| `apps/diapay-api/src/models/*` | Types TypeScript pour Payment, CheckoutSession, Wallet, Refund, Provider, etc. | Pas de schémas DB; modèles parfois découplés des endpoints; pas de validation runtime. | Oui | Oui | Non | Déplacer les types par module et ajouter DTO/schema validation + entities persistantes. |
| `apps/diapay-api/openapi/*` | Contrat API potentiel. | Pas manifestement utilisé comme source de génération SDK/tests. | Oui | Partiel | Non | En faire la source de vérité; générer types SDK et tests contractuels. |
| `apps/diapay-dashboard/src/app/(dashboard)/*` | Pages dashboard paiement, wallets, webhooks, sandbox, settings, etc. | Couverture UI large, mais routes dépendantes de mocks et endpoints partiels. | Oui | Partiel | Non | Conserver les routes; aligner progressivement chaque page sur service API réel. |
| `apps/diapay-dashboard/src/components/app-shell.tsx` | Shell et navigation dashboard. | Centralisation acceptable; composants non encore organisés par domaine. | Oui | Oui | Non | Déplacer dans `components/layout/`; créer composants métier dédiés. |
| `apps/diapay-dashboard/src/components/tables.tsx` | Tables partagées. | Risque de composant générique trop chargé. | Partiel | Oui | Non | Scinder par domaine: `payments`, `wallets`, `webhooks`, `merchants`. |
| `apps/diapay-dashboard/src/components/ui.tsx` | Primitives UI locales. | Peut dupliquer le design system monorepo. | Partiel | Oui | Non | Déplacer vers `components/ui/` ou remplacer par `packages/design-system`. |
| `apps/diapay-dashboard/src/lib/api.ts` | Client API + données mockées + fixtures dashboard. | Très couplé; mélange transport, fixtures, métriques, secrets de démonstration et types métiers. | Non tel quel | Oui | À terme | Créer `services/api.ts` et services par domaine; déplacer fixtures dans `mocks/` explicite. |
| `apps/diapay-dashboard/src/lib/types.ts` | Types UI/dashboard. | Utile, mais peut diverger de l'API/SDK. | Oui | Oui | Non | Générer ou partager les types depuis contrat OpenAPI/packages. |
| `apps/diapay-dashboard/src/middleware.ts` | Middleware Next. | Auth dashboard à auditer; séparation correcte. | Oui | Non | Non | Garder, mais brancher sur vraie auth session/role. |
| `apps/diapay-sandbox/src/app/api/scenario/route.ts` | Orchestration de scénarios sandbox. | Route unique très chargée; mélange scénarios, appels API, payloads marketplace, secrets. | Partiel | Oui | Non | Déplacer scénarios dans `lib/scenarios/`; créer simulateurs provider dédiés. |
| `apps/diapay-sandbox/src/app/api/checkout-session/route.ts` | Proxy création session checkout. | Utile pour démo; vérifier alignement contrat API. | Oui | Partiel | Non | Garder comme façade sandbox, mais réduire la logique métier. |
| `apps/diapay-sandbox/src/app/api/sandbox-webhook/route.ts` | Réception webhook sandbox. | Utile mais doit vérifier signature/timestamp quand API le supporte. | Oui | Partiel | Non | En faire un receveur pédagogique conforme au contrat webhook. |
| `apps/diapay-sandbox/src/app/checkout/[sessionId]/page.tsx` | Checkout UI sandbox. | Démo utile, mais dépend des statuts et payloads actuels. | Oui | Non | Non | Garder; adapter aux nouveaux statuts checkout/payment. |
| `apps/diapay-docs/src/app/page.tsx` | Documentation publique Next. | Trop monolithique/légère pour API paiement. | Oui | Oui | Non | Structurer docs par guides, API reference, webhooks, SDKs, sandbox, changelog. |
| `packages/diapay-sdk-js/src/index.ts` | SDK JS complet mais monolithique: types, client HTTP, ressources, webhooks. | Trop gros; certains endpoints SDK n'existent pas ou sont partiels; types peuvent diverger. | Oui | Oui | Non | Scinder par ressources; générer types depuis OpenAPI; tests contractuels. |
| `packages/diapay-sdk-js/dist/*` | Build distribué. | Risque de drift si dist commité sans process clair. | Partiel | Non | Selon stratégie | Garder seulement si publication npm exige dist; sinon générer en CI. |
| `packages/diapay-node/src/index.ts` | Wrapper Node autour du SDK JS. | Simple et utile; dépend fortement de `diapay-sdk-js`. | Oui | Partiel | Non | Garder comme façade Node; ajouter helpers webhook/raw body et config env. |
| `packages/diapay-node/README.md` | Documentation wrapper Node. | À synchroniser avec API/SDK. | Oui | Non | Non | Mettre à jour après stabilisation contrat. |

## 2. Structure cible recommandée

### 2.1 `apps/diapay-api` cible

```txt
apps/diapay-api/
  src/
    app.ts
    server.ts

    config/
      env.ts
      database.ts
      cors.ts
      security.ts
      swagger.ts
      logger.ts

    modules/
      auth/
        auth.middleware.ts
        api-key-auth.service.ts
        scopes.ts
      merchants/
        merchant.model.ts
        merchant.repository.ts
        merchant.service.ts
        merchant.controller.ts
        merchant.routes.ts
        merchant.validation.ts
      applications/
      api-keys/
      checkout/
        checkout.model.ts
        checkout.repository.ts
        checkout.service.ts
        checkout.controller.ts
        checkout.routes.ts
        checkout.validation.ts
      payments/
        payment.model.ts
        payment-attempt.model.ts
        payment.repository.ts
        payment.service.ts
        payment.controller.ts
        payment.routes.ts
        payment.validation.ts
      refunds/
      providers/
        provider-adapter.ts
        provider-registry.ts
        provider-event.mapper.ts
        mobile-money/
        bank-card/
        bank-transfer/
        crypto/
        mock/
      webhooks/
        webhook-endpoint.model.ts
        webhook-event.model.ts
        webhook-signature.ts
        webhook-dispatcher.service.ts
        webhook-retry.service.ts
        provider-webhook.controller.ts
        merchant-webhook.controller.ts
        webhook.routes.ts
      ledger/
        ledger-account.model.ts
        ledger-entry.model.ts
        ledger-transaction.service.ts
        ledger.repository.ts
        ledger.routes.ts
      wallets/
      payouts/
      settlements/
      audit-logs/
      sandbox/
        sandbox-scenario.service.ts
        sandbox-provider.service.ts

    shared/
      errors/
        AppError.ts
        error.middleware.ts
      middleware/
        request-id.middleware.ts
        rate-limit.middleware.ts
      validators/
      utils/
      types/
      constants/

    jobs/
      webhook-retry.job.ts
      settlement.job.ts
      reconciliation.job.ts
      expired-checkout.job.ts

    scripts/
      seed.ts
      migrate.ts
      backfill-ledger.ts
```

Principes:

- un module = une responsabilité métier;
- les endpoints publics restent sous `/api/v1` pendant la migration;
- les repositories isolent la future persistance;
- les DTO/validations sont proches des routes;
- les providers ne mutent jamais directement les paiements: ils retournent des événements normalisés;
- le ledger devient le système d'enregistrement financier, pas une dérivation UI.

### 2.2 `apps/diapay-dashboard` cible

```txt
apps/diapay-dashboard/
  src/
    app/
      dashboard/
      payments/
      transactions/
      wallets/
      revenue/
      api-keys/
      webhooks/
      developers/
      apps/
      sandbox/
      logs/
      settings/

    components/
      layout/
      ui/
      payments/
      wallets/
      webhooks/
      merchants/
      sandbox/
      ledger/
      api-keys/

    services/
      api.ts
      payments.service.ts
      refunds.service.ts
      webhooks.service.ts
      wallets.service.ts
      ledger.service.ts
      merchants.service.ts
      api-keys.service.ts
      sandbox.service.ts

    mocks/
      dashboard.fixtures.ts
      payments.fixtures.ts
      marketplace.fixtures.ts

    types/
      api.ts
      dashboard.ts
    design/
```

Principes:

- `services/` ne contient que le transport/API;
- `mocks/` est explicitement séparé et désactivable;
- les pages ne connaissent pas les URLs brutes;
- les secrets ne sont jamais exposés comme données UI réalistes;
- les types viennent du contrat API ou d'un package partagé.

### 2.3 `apps/diapay-sandbox` cible

```txt
apps/diapay-sandbox/
  src/
    app/
      checkout/[sessionId]/page.tsx
      success/page.tsx
      cancel/page.tsx
      api/
        checkout-session/route.ts
        sandbox-webhook/route.ts
        scenario/route.ts
    components/
      checkout/
      scenario-runner/
      webhook-log/
    lib/
      api-client.ts
      scenarios/
        payment-success.ts
        payment-failed.ts
        mobile-money.ts
        marketplace-split.ts
        escrow-release.ts
        webhook.ts
      webhook-verifier.ts
    types/
```

Principes:

- sandbox = simulateur pédagogique, pas backdoor métier;
- chaque scénario est testable isolément;
- les payloads attendus sont alignés sur OpenAPI;
- la réception webhook montre la vérification signature/timestamp.

### 2.4 `apps/diapay-docs` cible

```txt
apps/diapay-docs/
  src/
    app/
      getting-started/
      api-reference/
      checkout/
      payments/
      refunds/
      webhooks/
      marketplace/
      sandbox/
      sdks/
      changelog/
    components/
      code-block/
      endpoint-card/
      webhook-event-card/
    content/
      guides/
      examples/
      changelog/
```

Principes:

- docs pilotées par le contrat API;
- guides séparés de la référence;
- exemples SDK testés dans CI;
- changelog obligatoire à chaque changement public.

### 2.5 `packages/diapay-sdk-js` cible

```txt
packages/diapay-sdk-js/
  src/
    client.ts
    errors.ts
    webhook.ts
    resources/
      checkout.ts
      payments.ts
      refunds.ts
      webhooks.ts
      wallets.ts
      payouts.ts
      marketplace.ts
    types/
      generated.ts
      public.ts
    index.ts
  tests/
    contract/
    webhook.test.ts
```

### 2.6 `packages/diapay-node` cible

```txt
packages/diapay-node/
  src/
    index.ts
    express.ts
    next.ts
    webhook.ts
  tests/
```

Objectif: rester un wrapper ergonomique Node, sans dupliquer toute la logique du SDK JS.

## 3. Migration progressive

| Étape | Objectif | Fichiers concernés | Risque | Tests | Rollback possible |
|---|---|---|---|---|---|
| Étape 1 — figer les endpoints publics | Documenter et stabiliser `/api/v1`; interdire les changements de réponse non versionnés. | `apps/diapay-api/src/routes/index.ts`, `apps/diapay-api/openapi/*`, `packages/diapay-sdk-js/src/index.ts`, docs. | Faible; surtout documentaire. | Tests contractuels HTTP sur health, checkout, payment, refund, webhook endpoint. | Oui: revenir au routeur actuel. |
| Étape 2 — créer `app.ts`, `config/`, `shared/` et squelette `modules/` | Poser la structure sans déplacer toute la logique. | `apps/diapay-api/src/server.ts`, nouveaux `app.ts`, `config/*`, `shared/errors/*`, `modules/*`. | Moyen: bootstrap Express peut changer. | `npm run build`; smoke test `/health` et `/api/v1/config`. | Oui: remonter ancien `server.ts`. |
| Étape 3 — déplacer checkout/payment/refund | Sortir le coeur paiement de `checkout-store.ts` vers modules. | `controllers/checkout.ts`, `controllers/payments.ts`, `services/checkout-store.ts`, `models/Payment.ts`, `models/CheckoutSession.ts`, `models/Refund.ts`. | Élevé: endpoints les plus utilisés. | Tests création session, idempotence, complete, payment direct, cancel, refund. | Oui si les routes gardent une façade vers l'ancien store. |
| Étape 4 — déplacer providers | Isoler adapters et normaliser les événements provider. | `src/providers/*`, `modules/providers/*`, `modules/payments/*`, `modules/webhooks/provider-webhook.controller.ts`. | Élevé: statuts provider et actionRequired. | Tests par provider mock; test mapping provider event -> payment attempt. | Oui: garder registry actuel comme adapter legacy. |
| Étape 5 — déplacer ledger/wallet/marketplace | Faire du ledger/wallet un noyau séparé, marketplace comme consommateur. | `services/marketplace.service.ts`, `models/Marketplace.ts`, nouveaux `modules/ledger`, `modules/wallets`, `modules/marketplace`. | Très élevé: logique financière. | Tests double-entry, invariants débit/crédit, escrow release/refund, payout insuffisant. | Partiel: garder marketplace legacy en mode sandbox uniquement. |
| Étape 6 — adapter dashboard, sandbox et SDK | Brancher les clients sur la nouvelle structure sans changer le contrat public. | `apps/diapay-dashboard/src/lib/api.ts`, `apps/diapay-sandbox/src/app/api/scenario/route.ts`, `packages/diapay-sdk-js/src/index.ts`, `packages/diapay-node/src/index.ts`. | Moyen: UI et SDK peuvent révéler endpoints manquants. | Builds Next/TS, tests SDK contractuels, scénarios sandbox. | Oui: feature flag `NEXT_PUBLIC_USE_LEGACY_FIXTURES`. |
| Étape 7 — supprimer legacy | Retirer stores monolithiques et fixtures dangereuses. | `services/checkout-store.ts`, `services/marketplace-store.ts`, mocks déplacés, anciennes routes/controller wrappers. | Moyen à élevé selon couverture. | Suite complète + tests migration + audit secrets. | Non recommandé sans tag release; rollback via branche/tag. |

## 4. Priorités techniques par domaine

### 4.1 API

Priorité P0:

- API key auth réelle: hash, scopes, environnement test/live, rotation;
- idempotence par marchand + endpoint + clé;
- validation runtime uniforme;
- middleware d'erreurs global;
- logs structurés avec request id;
- stockage persistant avant toute donnée financière réelle.

Priorité P1:

- provider inbound webhooks;
- dispatcher webhook durable;
- ressources Refund/Payout/Settlement séparées;
- OpenAPI source de vérité.

### 4.2 Ledger et wallets

Le ledger doit être restructuré avant toute production. Il doit garantir:

- transactions équilibrées débit/crédit;
- immutabilité des entrées;
- correction par reversal, jamais mutation silencieuse;
- lien entre Payment, Refund, Payout, Settlement et LedgerTransaction;
- audit exportable.

### 4.3 Dashboard

Le dashboard doit afficher clairement ce qui est mocké. La priorité est de séparer:

- client API réel;
- fixtures de démonstration;
- types partagés;
- pages métier.

### 4.4 Sandbox

La sandbox doit rester, mais comme simulateur contrôlé. Elle doit permettre de tester:

- succès;
- échec;
- pending/timeout;
- OTP/redirect;
- webhook signé;
- refund;
- split marketplace;
- escrow release/refund.

### 4.5 SDK

Le SDK doit devenir contractuel:

- types générés ou synchronisés;
- ressources séparées;
- retry/timeouts testés;
- vérification webhook documentée;
- compatibilité Node/browser clarifiée.

## 5. Arguments techniques et business

### Arguments techniques

- Une application de paiement ne peut pas dépendre de stores en mémoire pour des paiements, remboursements, wallets, webhooks et soldes.
- Les responsabilités critiques sont actuellement trop imbriquées: un changement paiement peut casser webhooks, dashboard ou marketplace.
- Le ledger simulé ne suffit pas pour justifier des soldes marchands ou vendeurs.
- Les providers doivent être isolés pour gérer les différences mobile money, carte, virement et crypto.
- Le SDK et le dashboard doivent suivre un contrat stable, pas l'implémentation interne.

### Arguments business

- Le risque réputationnel est élevé si des écrans dashboard affichent des données mockées comme si elles étaient live.
- Sans ledger fiable, Diapay ne peut pas expliquer un solde, un payout ou un refund à un marchand.
- Sans webhooks fiables, les marchands ne peuvent pas automatiser leurs commandes.
- Sans architecture modulaire, l'ajout d'opérateurs africains réels sera lent et risqué.
- Une migration progressive protège les intégrations Diamarket/DiaExpress pendant que le noyau est renforcé.

## 6. Décision finale

```txt
Structure actuelle : à restructurer fortement

Recommandation :
- refactor profond
```

Nuance opérationnelle: le refactor doit être **profond dans la cible**, mais **progressif dans l'exécution**. Il ne faut pas restructurer immédiatement tout le dépôt. La prochaine itération doit d'abord figer le contrat public, ajouter des tests contractuels, puis introduire les modules internes derrière les mêmes endpoints `/api/v1`.

Base des prochaines itérations Diapay: la structure cible proposée dans ce document.
