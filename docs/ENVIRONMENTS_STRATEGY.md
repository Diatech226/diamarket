# Stratégie d’environnements — Diamarket

## Environnements cibles

```txt
development
staging
production
```

## Objectifs
- **development**: vélocité locale, feedback rapide, données non critiques.
- **staging**: miroir fonctionnel de prod pour validation release.
- **production**: disponibilité, sécurité, observabilité, scalabilité.

## Règles globales
1. **Configuration immutable** par variable d’environnement (12-factor app).
2. **Secrets** stockés dans un secret manager (jamais dans Git).
3. **Parité staging/prod** (mêmes versions runtime, dépendances, topology proche).
4. **Promotion par artefact** (même image/container promu dev -> staging -> prod).

## Matrice minimale par service

### diamarket-api
- `NODE_ENV`, `PORT`
- `MONGODB_URI`
- `CLERK_ISSUER_URL`, `CLERK_SECRET_KEY`
- `CORS_ALLOWED_ORIGINS`
- `PAYMENT_PROVIDER`, `DIAPAY_*`
- `SHIPPING_PROVIDER`, `SHIPPING_*`

### diamarket-web / diamarket-cms
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- Variables métier publiques minimales (`NEXT_PUBLIC_DEFAULT_*`).

## Politique de données
- **development**: DB locale ou sandbox partagée.
- **staging**: DB dédiée, anonymisée, reset contrôlé.
- **production**: DB dédiée, backup automatique, chiffrement at-rest + in-transit.

## Pipeline de promotion recommandé
1. PR -> CI (lint/build/tests).
2. Merge main -> déploiement auto en staging.
3. Validation QA + smoke tests + webhooks sandbox.
4. Promotion manuelle contrôlée vers production.
5. Vérifications post-déploiement (SLO, erreurs, latence, checkout).

## Gates de sécurité
- Scan dépendances (SCA) + secret scanning.
- Signature webhook obligatoire en staging/prod.
- Rotation des clés (Clerk, Diapay, providers shipping) trimestrielle.

## Observabilité
- Logs JSON corrélés (`request_id`, `user_id`, `order_id`).
- Metrics: RPS, p95 latency, error rate, timeout externe Diapay/shipping.
- Alertes: 5xx > seuil, dégradation checkout, saturation DB.

## SLO initiaux
- API availability: **99.9%**
- p95 `/orders`: **< 400 ms** (hors provider externe)
- Taux d’échec paiement: **< 1%** (hors refus client)
