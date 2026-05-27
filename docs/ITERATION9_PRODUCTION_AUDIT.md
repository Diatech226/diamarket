# Diamarket — Audit production (Iteration 9)

## 1) Architecture actuelle
- Monorepo avec 3 apps: `diamarket-web` (Next.js storefront), `diamarket-cms` (Next.js back-office), `diamarket-api` (Express + MongoDB).
- L’API centralise logique métier (catalogue, commandes, vendors, shipping, paiement).
- Authentification déléguée à Clerk (front + middleware/API).

## 2) Constat technique par domaine

### Variables d’environnement
**Observations**
- Incohérence historique `MONGODB_URI` vs `MONGO_URI` côté API.
- Absence d’allowlist CORS explicite pilotée par env.

**Actions appliquées**
- Normalisation de lecture Mongo (`MONGO_URI` prioritaire, fallback `MONGODB_URI`).
- Ajout `CORS_ALLOWED_ORIGINS` (liste CSV) pour contrôle strict par environnement.

### Sécurité
**Déjà en place**
- Headers défensifs de base (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`).
- Désactivation `x-powered-by`.
- Rate limiting mémoire simple.

**Gaps**
- Rate limiting en mémoire non adapté multi-instance.
- Pas de traçabilité corrélée des requêtes (request-id).
- Webhooks à renforcer avec anti-replay + horodatage tolérance.

### Performance
- API sans cache applicatif (OK pour début, limite en charge).
- Limite JSON à `1mb` (bonne base sécurité/perf).
- Morgan en `combined` en prod pour meilleure observabilité des accès.

### Logs & erreurs
- Gestion d’erreurs centralisée existante.
- Besoin cible: logs structurés JSON (pino/winston) + ingestion (Loki/Datadog/ELK).

### CORS
- Passage d’une regex permissive à une allowlist explicite via `CORS_ALLOWED_ORIGINS`.
- Fallback dev conservé pour compatibilité locale.

### Auth Clerk
- Variables `CLERK_ISSUER_URL` et `CLERK_SECRET_KEY` documentées côté API.
- Reco prod: rotation secrets + séparation des tenants/env Clerk.

### MongoDB
- URI standardisée, prête pour `mongodb+srv`.
- Reco prod: indexes critiques (orders, products, users), backups PITR, alerting latence.

### Paiement Diapay
- Secrets/webhook secret déjà prévus en env.
- Reco prod: idempotency key obligatoire sur création paiement + journal d’état transactionnel.

### API livraison modulaire
- `SHIPPING_PROVIDER` et config provider externalisée.
- Reco prod: circuit breaker + retry exponentiel + DLQ pour échecs persistants.

### Webhooks
- Secret présent (`DIAPAY_WEBHOOK_SECRET`), à compléter par:
  - vérification signature HMAC,
  - fenêtre temporelle anti-replay,
  - idempotence événement (`event_id`).

### Build Next.js
- Prêt pour pipeline CI avec `next build` sur web/cms.
- Reco: activer analyse bundle + monitoring Core Web Vitals en prod.

### Déploiement API
- Build TypeScript `tsc` + runtime `node dist/server.js`.
- Reco: healthcheck `/api/health`, readiness DB, rolling deploy, autoscaling horizontal.

## 3) Risques prioritaires (P1)
1. CORS trop permissif sans allowlist env stricte.
2. Variables Mongo incohérentes entre docs/code.
3. Absence de stratégie logs/metrics/traces unifiée.
4. Webhooks paiement à sécuriser davantage (anti-replay + idempotence).

## 4) Plan de remédiation court terme
- Semaine 1: finaliser env par environnement + CORS strict + health endpoints.
- Semaine 2: observabilité (logs JSON, metrics Prometheus, alerting).
- Semaine 3: hardening paiement/webhooks + tests charge + runbooks incidents.
