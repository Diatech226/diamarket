# Diamarket — Go-live readiness report

**Date :** 2026-06-19  
**Périmètre :** `apps/diamarket-api`, `apps/diamarket-cms`, `apps/diamarket-web`  
**Objectif :** stabiliser, sécuriser, valider, documenter et préparer une première mise en production sans ajout fonctionnel.

## Rapports déjà générés utilisés

Tous les rapports existants liés à Diamarket ont été relus et consolidés dans cette validation :

- `docs/DIAMARKET_AUDIT_AND_ROADMAP.md`
- `docs/DIAMARKET_CMS_FLOW_AUDIT_AND_ITERATIONS.md`
- `docs/DIAMARKET_CMS_STABILIZATION_REPORT.md`
- `docs/DIAMARKET_STABILITY_AUDIT.md`
- `docs/ITERATION_PRODUCTS_REPORT.md`
- `docs/ITERATION_CATEGORIES_REPORT.md`
- `docs/ITERATION_ORDERS_REPORT.md`
- `docs/ITERATION_VENDORS_REPORT.md`
- `docs/ITERATION_MEDIA_LIBRARY_REPORT.md`
- `docs/ITERATION_SLIDES_REPORT.md`
- `docs/ITERATION_SETTINGS_REPORT.md`
- `docs/ITERATION_CURRENCIES_COMMISSIONS_REPORT.md`
- `docs/ITERATION_SHIPPING_DIAEXPRESS_REPORT.md`
- `docs/ITERATION_USERS_ROLES_REPORT.md`
- `docs/ITERATION_CMS_BUGFIX_REPORT.md`
- `docs/ITERATION9_PRODUCTION_AUDIT.md`

## Score global

**Ready with risks**

Score de maturité estimé : **72 / 100**.

Diamarket dispose d'un socle cohérent pour une première mise en production contrôlée : API TypeScript buildable, authentification JWT/cookie, RBAC de base, CORS par allowlist, modules CMS essentiels raccordés, catalogue public et workflows commandes/vendeurs/médias existants. Le projet n'est cependant pas totalement prêt pour un lancement public sans restrictions, car des vérifications fonctionnelles de bout en bout nécessitent encore une base MongoDB, des comptes de test, les dépendances Next installées et des secrets réels de paiement/livraison.

## 1. Audit complet de la stack

| Module | Etat | Bloquant | Important | Mineur | Action |
|---|---|---:|---:|---:|---|
| `apps/diamarket-api` | Stable avec risques opérationnels | 0 | 4 | 5 | Build OK ; finaliser secrets prod, MongoDB Atlas, CORS prod, webhooks paiement/livraison et rate limiting distribué. |
| `apps/diamarket-cms` | Fonctionnel partiel, build non validable dans ce conteneur | 1 | 5 | 4 | Installer dépendances en CI, valider navigation réelle, confirmer droits admin, tester médias/slides/settings sur données réelles. |
| `apps/diamarket-web` | Fonctionnel partiel, build non validable dans ce conteneur | 1 | 4 | 4 | Installer dépendances en CI, tester création compte/checkout/profil, valider SEO/homepage responsive et URLs Vercel. |

### Synthèse d'architecture

- API Express/MongoDB avec routes `/api/auth`, `/api/products`, `/api/categories`, `/api/orders`, `/api/media`, `/api/slides`, `/api/settings`, `/api/admin/*`, paiement Diapay et livraison DiaExpress.
- CMS Next.js App Router, protégé côté client par vérification `/auth/me` et côté API par `requireAuth` + `requireAdmin` sur les routes admin.
- Web Next.js App Router, storefront public avec compte, catalogue, panier, checkout, commandes et demande vendeur.

## 2. Vérification Authentification

### CMS

| Test | Résultat audit statique | Statut |
|---|---|---|
| Login admin | `/api/auth/login` vérifie e-mail/mot de passe, bloque compte désactivé et établit JWT + cookie. | OK statique |
| Logout | `/api/auth/logout` efface le cookie et retourne `authenticated:false`. | OK statique |
| Expiration session | `requireAuth` retourne 401 avec message `Token expired` si JWT expiré. | OK statique |
| Refresh session | Aucun endpoint refresh dédié identifié ; session renouvelée uniquement par nouveau login. | Risque majeur |
| Accès route protégée | CMS gate appelle `/auth/me`; API protège `/admin`, `/cms`, `/dashboard` par auth + admin. | OK statique |

### Web

| Test | Résultat audit statique | Statut |
|---|---|---|
| Création compte | `/api/auth/register` crée uniquement rôle `user`, hash le mot de passe et refuse auto-attribution admin. | OK statique |
| Connexion | `/api/auth/login` supporte cookie HttpOnly et bearer token retourné. | OK statique |
| Déconnexion | Logout disponible côté API ; clients stockent aussi le bearer token local. | OK statique, test navigateur requis |
| Récupération profil | `/api/auth/me` et `/api/users/me` disponibles sous auth. | OK statique |
| Protection routes privées | API applique `requireAuth` et permissions ; protection UI à confirmer en navigation. | OK statique, test navigateur requis |

### Codes d'erreur vérifiés

- **401** : absence de session, token expiré, token invalide, compte introuvable/désactivé.
- **403** : création compte désactivée, auth e-mail désactivée, compte désactivé au login, rôle/permission insuffisant.
- **Token expiré** : géré par `TokenExpiredError` puis réponse `Token expired`.
- **Token invalide** : géré comme `Unauthorized`.

## 3. Vérification Produits

| Test | Résultat | Risque |
|---|---|---|
| Création | API exige auth admin/vendor, permission `products:create`, champs requis, prix > 0, stock >= 0. | Faible |
| Modification | API valide currency/status/price/stock et relations catégorie/vendeur. | Faible |
| Suppression | API protégée par auth rôle + permission. | Faible |
| Désactivation | Statut `draft`/`archived` disponible ; désactivation métier par statut. | Moyen : convention à formaliser |
| Catégories | Catégories actives requises côté produits publics et CMS stabilisé. | Faible |
| Médias | Upload local image + MediaPicker CMS ; usage produits intégré. | Moyen : stockage local non optimal prod |
| Vendeur | Vendeur actif requis pour création/modification. | Faible |
| Recherche | Recherche produits/category côté contrôleurs ; indexation avancée à renforcer plus tard. | Moyen |

## 4. Vérification Commandes

| Test | Résultat | Risque |
|---|---|---|
| Création | API valide items, quantités, adresse, option livraison, mode paiement. | Faible |
| Détail | `/orders/:id` et `/admin/orders/:id` disponibles. | Faible |
| Changement statut | `/orders/:id/status` et `/admin/orders/:id/status` disponibles avec permissions. | Moyen : matrice transitions à verrouiller |
| Paiement | Endpoints Diapay checkout/session/webhook présents ; provider mock possible. | Majeur : secrets et webhooks prod à valider |
| Livraison | Shipment create/sync/tracking présents. | Majeur : provider réel à valider |
| Tracking | `/shipments/:trackingNumber` disponible sous auth. | Moyen |

## 5. Vérification Vendeurs

| Test | Résultat | Risque |
|---|---|---|
| Demande vendeur | `/vendor-requests` protégé auth. | Faible |
| Approbation | Routes admin approve/reject et création/liaison vendeur existantes. | Faible |
| Suspension | Route admin status vendor disponible. | Faible |
| Réactivation | Route admin status vendor disponible. | Faible |
| Commissions | Routes commissions default/category/vendor disponibles ; rapport dédié consolidé. | Moyen : tests financiers réels requis |

## 6. Vérification Médiathèque

| Test | Résultat | Risque |
|---|---|---|
| Upload | `/media/upload` protégé admin + permission, taille/type configurables. | Moyen : stockage local Render éphémère si non externalisé |
| Suppression | `/media/:id` delete protégé ; usageCount à respecter selon service. | Moyen |
| MediaPicker | Composant CMS présent et utilisé par modules stabilisés. | Faible |
| usageCount | Service `media-usage` présent. | Moyen : recalcul périodique recommandé |
| Produits | Intégration images produits faite. | Faible |
| Vendeurs | Intégration à valider fonctionnellement. | Moyen |
| Slides | Intégration slides via URL/media à valider. | Moyen |

## 7. Vérification Homepage

| Test | Résultat | Risque |
|---|---|---|
| Slides | API publique/admin et CMS slides stabilisés. | Faible |
| Contenu marketing | Settings homepage/marketing exposés via liste blanche settings. | Moyen : validation contenu faible |
| Catégories | Catégories actives publiques disponibles. | Faible |
| Produits vedettes | Catalogue public disponible ; règle featured à confirmer selon modèle. | Moyen |
| Responsive | Next/Tailwind ; test visuel réel non exécuté faute build Next. | Majeur jusqu'au build CI |

## 8. Vérification Paramètres

| Test | Résultat | Risque |
|---|---|---|
| Branding | Settings publics/admin avec liste blanche. | Faible |
| SEO | Clé `seo` publique prévue. | Moyen : validation/sitemap à tester |
| Contact | Support contact/e-mail/téléphone/adresse exposés. | Faible |
| Maintenance mode | Clés `maintenanceMode`, message, image exposées. | Moyen : comportement web à confirmer |

## 9. Vérification Permissions

| Rôle | Attendu | Résultat audit statique |
|---|---|---|
| User | Accès interdit à `admin/*`. | Routes admin protégées par `requireAuth` + `requireAdmin`. |
| Vendor | Accès uniquement à ses produits, commandes et statistiques. | Permissions et contexte `vendorId` présents ; ownership complet à retester sur produits/commandes. |
| Admin | Accès total. | Routes `/admin/*` et CMS réservés admin ; permissions admin étendues. |

## 10. Audit sécurité

### Critique

- Aucun secret réel ne doit être commité ; les fichiers `.env.example` ne contiennent que des placeholders.
- `JWT_SECRET`/`AUTH_SESSION_SECRET`, `DIAPAY_*`, `DIAEXPRESS_*`, MongoDB Atlas et CORS prod doivent être configurés avant lancement.
- Les webhooks paiement/livraison doivent être testés avec signatures réelles et anti-replay ; la conformité dépend des secrets prod.

### Majeur

- Rate limiting mémoire non adapté au multi-instance Render ; passer à Redis/upstash si trafic ou scaling horizontal.
- Stockage média local risqué sur Render ; utiliser objet storage persistant avant catalogue réel massif.
- Pas de refresh-token dédié : session longue (`7d` par défaut) sans rotation active.
- Builds CMS/Web non validables localement car `next` absent après `npm install` bloqué par le registre.
- Tests E2E auth/permissions non exécutés faute MongoDB + comptes de test.

### Mineur

- CSP API très stricte et utile côté API ; headers front Next à compléter si besoin.
- Validation input présente mais hétérogène selon endpoints historiques.
- Protection Mongo injection présente via sanitization body ; query params doivent rester validés endpoint par endpoint.
- XSS principalement côté React ; contenu marketing/settings doit être rendu sans HTML non maîtrisé.
- CSRF : cookie `SameSite=Lax`, mais les mutations cross-site avec cookie doivent rester surveillées ; bearer token local existe en fallback.

## 11. Audit performance

| Zone | Observation | Risque | Action recommandée |
|---|---|---|---|
| Homepage | Slides/categories/produits/settings peuvent générer plusieurs appels. | Moyen | Cache ISR/front ou agrégat homepage après go-live si métriques le justifient. |
| Produits | Recherche et pagination présentes ; images non transformées côté API. | Moyen | Optimiser images, tailles, CDN, index Mongo. |
| Commandes | Populations et listes admin à surveiller. | Moyen | Index `userId`, `vendorId/items.productId`, `status`, `createdAt`. |
| Médias | Payloads image potentiellement lourds ; limite upload 8 MB par défaut. | Moyen | Stockage objet + CDN + thumbnails. |
| N+1 | Risque sur listes admin avec populate/calculs usage/commissions. | Moyen | Profiler avec données réalistes avant campagne marketing. |

## 12. Vérification Build

| Commande | Résultat | Commentaire |
|---|---|---|
| `npm install` | Échec environnement | Registry renvoie `403 Forbidden` sur `@types/react`. |
| `npm --prefix apps/diamarket-api run build` | Succès | TypeScript API compile. |
| `npm --prefix apps/diamarket-cms run build` | Échec environnement | `next: not found` car dépendances non installées. |
| `npm --prefix apps/diamarket-web run build` | Échec environnement | `next: not found` car dépendances non installées. |

## 13. Vérification Déploiement

### Render API

Variables minimales à définir :

- `NODE_ENV=production`
- `PORT`
- `MONGODB_URI`
- `JWT_SECRET` ou `AUTH_SESSION_SECRET`
- `JWT_EXPIRES_IN`
- `AUTH_SESSION_TTL_HOURS`
- `CORS_ORIGINS`/`CORS_ALLOWED_ORIGINS=https://<web>,https://<cms>`
- `PAYMENT_PROVIDER`, `DIAPAY_API_BASE_URL`, `DIAPAY_API_KEY`, `DIAPAY_SECRET_KEY`, `DIAPAY_PUBLIC_KEY`, `DIAPAY_WEBHOOK_SECRET`
- `DIAEXPRESS_API_BASE_URL`, `DIAEXPRESS_API_KEY`, `DIAEXPRESS_WEBHOOK_SECRET` ou variables `SHIPPING_*`
- `DIAMARKET_SUCCESS_URL`, `DIAMARKET_CANCEL_URL`
- `MEDIA_*` ou bascule vers stockage persistant

Build command : `npm install && npm --prefix apps/diamarket-api run build`  
Start command : `npm --prefix apps/diamarket-api start`

### Vercel CMS

Variables minimales :

- `NEXT_PUBLIC_API_URL=https://<render-api>/api`
- `NEXT_PUBLIC_CMS_URL=https://<cms-vercel>`
- `NEXT_PUBLIC_SITE_URL=https://<web-vercel>`
- `NEXT_PUBLIC_DEMO_MODE=false`

Build command : `npm --prefix apps/diamarket-cms run build`

### Vercel Web

Variables minimales :

- `NEXT_PUBLIC_API_URL=https://<render-api>/api`
- `NEXT_PUBLIC_SITE_URL=https://<web-vercel>`
- `NEXT_PUBLIC_DEMO_MODE=false`

Build command : `npm --prefix apps/diamarket-web run build`

### URLs, CORS, cookies, auth

- CORS API doit contenir exactement les URLs Vercel CMS et Web.
- Cookies sont `HttpOnly`, `Secure` en production, `SameSite=Lax`.
- Le domaine API Render étant distinct de Vercel, conserver le bearer token côté clients est utile, mais impose de protéger strictement contre XSS.

## 14. Checklist production

| Domaine | Etat | Commentaire |
|---|---|---|
| Auth | Partiellement prêt | Pas de refresh dédié, E2E requis. |
| Produits | Prêt avec risques | CRUD et validation présents, médias/storage à sécuriser. |
| Commandes | Prêt avec risques | Workflow présent, transitions et E2E paiement/livraison à valider. |
| Vendeurs | Prêt avec risques | Approval/suspension/commissions présents, tests financiers requis. |
| Média | Risqué | Stockage local non recommandé en production. |
| Homepage | Partiellement prêt | Build/responsive non validés. |
| Paiement | Risqué | Secrets, webhooks, idempotence réelle à valider. |
| Livraison | Risqué | Provider réel à tester. |
| Permissions | Partiellement prêt | RBAC présent, ownership vendor à retester. |
| Sécurité | Prêt avec risques | Bases solides, rate limiting/webhooks/storage à durcir. |

## Bugs restants

### Critique

- Build CMS/Web impossible dans ce conteneur tant que `npm install` est bloqué par le registry ; aucun Go public sans build CI Vercel réussi.

### Majeur

- Webhooks Diapay/DiaExpress et secrets prod non validés en conditions réelles.
- Médias locaux non adaptés à Render pour fichiers persistants.
- Absence de tests E2E avec MongoDB, admin, user et vendor réels.
- Absence de refresh session/token dédié.

### Mineur

- Validations métier hétérogènes sur certains endpoints historiques.
- Observabilité limitée à Morgan ; logs structurés/metrics à ajouter après stabilisation.
- Performance homepage/catalogue à mesurer sur données réalistes.

## Recommandations

### Avant production

1. Obtenir un build vert sur Vercel CMS et Web avec `npm install` puis `next build`.
2. Provisionner MongoDB Atlas, Render API, Vercel CMS/Web et configurer toutes les variables d'environnement.
3. Remplacer ou externaliser le stockage média local si les médias doivent survivre aux redéploiements.
4. Tester E2E : admin login/logout, user register/login, vendor request/approval, product CRUD, order checkout, payment webhook, shipping tracking.
5. Restreindre CORS aux URLs finales et vérifier cookies/bearer sur domaines Render/Vercel.
6. Valider webhooks paiement/livraison avec secrets réels, horodatage et idempotence.

### Après production

1. Ajouter CI automatisée : typecheck, build API/CMS/Web, tests API et E2E Playwright.
2. Ajouter rate limiting distribué et logs structurés.
3. Ajouter monitoring Render/Vercel, alertes MongoDB Atlas, alertes paiement/livraison.
4. Optimiser images, thumbnails, CDN et index Mongo.
5. Formaliser transitions commandes et permissions vendor par tests de non-régression.

## 15. Livrable final

- **Score de maturité :** 72/100.
- **Bugs bloquants :** build CMS/Web non validable dans l'environnement actuel ; secrets/providers prod non testés ; stockage média local à risque si production réelle avec uploads.
- **Risques principaux :** webhooks paiement/livraison, ownership vendor non testé E2E, absence de refresh token, absence d'observabilité avancée, performance non mesurée avec données réalistes.
- **Plan de correction :** résoudre installation/build CI, configurer environnements, exécuter E2E, externaliser médias, valider CORS/cookies/webhooks, puis lancer avec monitoring.
- **Recommandation Go/No-Go :** **No-Go pour lancement public large aujourd'hui** ; **Go limité possible** uniquement pour une beta privée après build Vercel vert, env prod configurées, MongoDB/profil admin initialisés et tests E2E critiques passés.
