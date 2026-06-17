# Audit stabilité Diamarket

Date: 2026-06-17

## Synthèse

Stack auditée: API Express/MongoDB, web Next.js, CMS Next.js, scripts npm. Les corrections sûres ont été appliquées sur l'authentification, les routes API manquantes/incohérentes et les clients API front/CMS.

## Erreurs trouvées et corrections appliquées

| Gravité | Zone | Fichiers | Problème | Correction |
|---|---|---|---|---|
| Haute | API/CMS | `src/routes/index.ts` | Le CMS référence `/admin/slides` mais seul POST/PUT/DELETE existait côté admin; un GET CMS pouvait tomber en 404 ou méthode absente. | Ajout de `GET /api/admin/slides` réutilisant le contrôleur slides. |
| Haute | API | `src/routes/index.ts` | Familles demandées `/api/users/*`, `/api/vendors/*`, `/api/settings/*` incomplètes ou absentes. | Ajout de `GET /api/users/me`, `GET /api/users` protégé admin, `GET /api/vendors`, `GET /api/settings`. |
| Haute | Web/CMS | `src/lib/api.ts` | Les clients métiers n'ajoutaient pas le bearer token stocké après login; si le cookie cross-origin échouait, les appels suivants pouvaient retourner 401. | Ajout de `Authorization: Bearer <token>` depuis `localStorage` pour web et CMS. |
| Moyenne | Web/CMS | `src/lib/api.ts` | Les clients supposaient toujours un JSON valide; réponse vide/non JSON pouvait produire un parsing ambigu et alimenter le symptôme “Réponse API invalide”. | Parsing JSON centralisé avec message explicite et conservation des messages API. |
| Moyenne | Auth | `src/routes/auth.routes.ts`, `src/controllers/auth.controller.ts` | Aucune route de reset password n'était enregistrée. | Ajout de `POST /api/auth/forgot-password` et `POST /api/auth/reset-password` avec réponses JSON cohérentes et non-divulgation d'existence du compte. |
| Faible | Auth | `src/controllers/auth.controller.ts` | Logout ne signalait pas explicitement `authenticated: false`. | Réponse logout normalisée. |
| Faible | Cookies | `src/utils/session.ts` | Parsing cookie fragile si un segment sans `=` était présent. | Segment invalide ignoré. |

## Audit Auth

- Login admin/utilisateur: même endpoint `/api/auth/login`, vérification bcrypt et blocage des comptes désactivés en place.
- Register: crée toujours un rôle `user`, ignore toute tentative d'auto-attribution admin.
- Logout: cookie supprimé et JSON cohérent.
- Reset password: routes ajoutées; la réinitialisation réelle reste à brancher sur un provider e-mail/token persistant.
- Middleware auth/admin: validation JWT + chargement utilisateur courant + refus des comptes désactivés; admin strictement limité au rôle `admin`.
- JWT/cookies/sessions: cookie HttpOnly `diamarket_session`, bearer support, secret obligatoire au démarrage serveur.
- `/auth/me`: route protégée existante et réponse JSON normalisée.

## Audit API routes

Routes présentes/enregistrées après corrections:

- `/api/auth/register`, `/api/auth/login`, `/api/auth/me`, `/api/auth/session`, `/api/auth/logout`, `/api/auth/forgot-password`, `/api/auth/reset-password`, `/api/auth/oauth/providers`.
- `/api/users/me`, `/api/users`.
- `/api/products`, `/api/products/:slug` et mutations protégées.
- `/api/categories` et mutations protégées.
- `/api/vendors`.
- `/api/vendor-requests`.
- `/api/orders` et routes statut/paiement/livraison.
- `/api/payments/diapay/*`.
- `/api/media/*` protégé admin.
- `/api/slides`, `/api/slides/:id`, `/api/admin/slides` et mutations admin.
- `/api/settings`, `/api/admin/settings`.

Routes encore non implémentées mais référencées par certains endpoints CMS: `/api/admin/marketplace-focal-points`, `/api/admin/currencies`, `/api/admin/shipping`. Risque faible/moyen selon l'activation de ces pages.

## Audit Frontend Web

- Les appels catalogue, catégories, produits, slides et shipping correspondent à des routes API existantes.
- Les routes protégées commandes/vendor-request exigent auth; le client transmet désormais cookie + bearer token.
- Risque restant: build Next non vérifiable dans cet environnement car le package `next` n'est pas installé localement et `npm install` est bloqué par le registre sur `@types/react`.

## Audit CMS

- Login et gate admin s'appuient sur `/auth/me`.
- Dashboard/produits/catégories/vendors/settings ont des endpoints enregistrés.
- Slides: correction du GET admin manquant.
- Risque restant: pages focal-points/currencies/shipping peuvent encore échouer tant que les contrôleurs dédiés ne sont pas ajoutés.

## Audit MongoDB

- Email utilisateur unique+sparse, slug catégorie/produit unique, shipment par order unique et payment event unique provider/eventId présents.
- Recommandation: ajouter des validateurs plus stricts sur `Vendor.shopName`, `Setting.key` requis et index text utiles côté vendors si recherche prévue.

## Audit variables d'environnement

- Les `.env.example` Diamarket sont globalement alignés avec le code.
- Recommandation: documenter explicitement `AUTH_SESSION_TTL_HOURS`, `AUTH_SESSION_SECRET` comme alias de secours, `CORS_ALLOWED_ORIGINS` comme alias de `CORS_ORIGINS`, `PAYMENT_PROVIDER`, `DIAPAY_API_KEY`, `DIAPAY_PUBLIC_KEY`, `DIAPAY_WEBHOOK_TOLERANCE_SECONDS`, `SHIPPING_API_BASE_URL`, `SHIPPING_API_KEY`, `SHIPPING_API_TIMEOUT`, `SHIPPING_DEFAULT_ORIGIN_COUNTRY`, `SHIPPING_DEFAULT_ORIGIN_CITY` si utilisés en production.

## Audit build/déploiement

- API TypeScript: OK.
- Web/CMS: non vérifiable sans dépendances Next installées. `npm install` échoue avec HTTP 403 sur `@types/react` depuis le registre configuré.
- Aucune dépendance `pnpm`, `turbo` ou `workspace:*` trouvée dans les package.json Diamarket.
- Node 20 déclaré au root, API et web; recommander d'ajouter `engines.node` au CMS pour symétrie.

## Audit sécurité

- Points solides: JWT secret obligatoire au démarrage API, cookie HttpOnly/Secure en prod, CORS allowlist si configurée, rate limiting global et auth, rôles admin côté API.
- Risques restants: reset password réel absent, pas de CSRF dédié pour cookies cross-site, rate limit mémoire non distribué, messages d'erreur génériques à conserver en production.

## Recommandations prochaines itérations

1. Implémenter reset password complet avec collection token hashée, expiration courte et e-mail transactionnel.
2. Ajouter les endpoints admin focal-points/currencies/shipping ou masquer les pages CMS tant qu'ils ne sont pas prêts.
3. Ajouter tests d'intégration API sur auth/register/login/me/logout et routes admin protégées.
4. Ajouter CSRF token ou stratégie SameSite/domain stricte si le CMS/web restent cross-origin.
5. Réparer l'accès registry npm CI puis relancer les builds Next.
