# DiaExpress — audit interne complet et roadmap d’intégration Diamarket

_Date d’audit : 2026-06-19. Périmètre : `apps/diaexpress-api`, `apps/diaexpress-admin`, `apps/diaexpress-web`, documentation DiaExpress/Diamarket livraison/Diapay/environnements, `.env.example`, scripts build/dev/deploy._

## 1. Résumé exécutif

DiaExpress dispose déjà d’un socle conséquent : API Express/Mongoose, auth Clerk/JWT bridge, devis, pricing interne, expéditions, tracking public, adresses, réservations, schedules, opérations, paiements DiaPay, admin Next.js et portail web client. Le dépôt Diamarket contient aussi une première intégration livraison DiaExpress côté marketplace avec abstraction provider, webhook signé, statut normalisé et configuration CMS.

Le produit n’est toutefois pas encore prêt pour une interconnexion production Diamarket sans itérations ciblées :

1. **Contrat API non aligné** : Diamarket appelle actuellement des chemins provider historiques (`/api/quotes/estimate`, `/api/shipments`, `/api/shipments/tracking/:tracking`) alors que DiaExpress expose plutôt `/api/quotes/estimate`, `/api/shipments/from-quote`, `/api/tracking/:trackingCode` et n’expose pas encore de routes `/api/integrations/diamarket/*`.
2. **Création shipment depuis commande externe absente** : le modèle `Shipment` exige `quoteId`; l’API sait convertir un devis DiaExpress en expédition, mais pas créer une expédition idempotente depuis une commande Diamarket.
3. **External pricing incomplet côté API** : un modèle `ExternalPricing` et des vues web existent, mais aucune route `/api/external-pricing` n’est montée dans `server.js`.
4. **Admin moderne fonctionnel par blocs** : dashboard, devis, expéditions, pricing, opérations, référentiels et DiaPay sont présents, mais certaines pages sont des wrappers génériques dépendants de ressources et doivent être validées contre l’API réelle.
5. **Web client partiel** : accueil, demande de devis, tracking, compte, adresses, devis, expéditions et paiements sont câblés, avec coexistence de pages historiques et pages modernes.
6. **Sécurité à durcir** : auth client/admin et rate limit existent, mais l’API-to-API Diamarket, idempotency keys, ownership externe, validation complète des payloads et sécurité upload restent à cadrer.
7. **Build npm supporté** : les manifests sont alignés npm; l’API n’a pas de compilation réelle (`echo`), les frontends Next buildent via `next build` sous réserve de dépendances et variables.

### Trois priorités immédiates

1. **Stabiliser build/env/contrat runtime** : relancer les trois builds DiaExpress, compléter `.env.example` API avec variables Clerk/DiaPay/provider/intégration, valider health/readiness et publier les commandes officielles.
2. **Créer le contrat d’intégration Diamarket** : routes DiaExpress `/api/integrations/diamarket/shipping/estimate`, `/api/integrations/diamarket/shipments`, `/api/integrations/diamarket/shipments/:trackingNumber`, API key + idempotence + mapping statut.
3. **Aligner modèles et flows shipment** : permettre une expédition issue d’une commande externe sans devis DiaExpress obligatoire, tout en gardant conversion devis → shipment pour les clients DiaExpress.

## 2. Synthèse des documents existants

| Document | Sujet | Points clés | Décisions déjà prises | Ce qui reste à faire |
|---|---|---|---|---|
| `docs/ITERATION5_DIAEXPRESS.md` | Intégration livraison Diamarket ↔ DiaExpress | Adapter DiaExpress, estimation, création, tracking, annulation; routes Diamarket shipping; statuts normalisés | Provider DiaExpress explicite, mock uniquement via `SHIPPING_DEMO_MODE`, webhook HMAC, idempotence par Shipment.order | Valider chemins DiaExpress réels; ajouter retries/DLQ; tests intégration; notifications |
| `docs/ITERATION_SHIPPING_DIAEXPRESS_REPORT.md` | Rapport shipping Diamarket | Endpoints Diamarket shipping, CMS shipping, sécurité secrets, webhook | `POST /api/shipping/estimate`, `POST /api/orders/:id/shipment`, `GET /api/shipments/:trackingNumber`, `POST /api/shipping/diaexpress/webhook` | Contrat exact provider DiaExpress; tests e2e Mongo/DiaExpress; relancer builds front après install |
| `docs/DIAMARKET_AUDIT_AND_ROADMAP.md` | Audit Diamarket global | Livraison prototype/mock, parcours marketplace incomplet, risques secrets/ownership | Priorité à DiaExpress comme provider livraison; besoin d’un flow marketplace complet | Achever shipping production, corriger ownership/intégrité, CI/monitoring |
| `docs/ENVIRONMENTS_STRATEGY.md` | Environnements | 12-factor env, staging/prod, observabilité, secret scanning | Variables shipping/Diapay côté API, URL API côté front | Appliquer à DiaExpress; config staging/prod dédiée |
| `docs/NPM_MIGRATION.md` | Standard npm | npm workspaces, scripts `--prefix`, pas d’orchestrateur externe | npm uniquement; pas pnpm/turbo | Continuer à éviter pnpm/turbo; CI npm |
| `docs/diamarket/DIAPAY_INTEGRATION.md` | Paiement Diapay dans Diamarket | Front ne manipule pas secrets; API crée/vérifie sessions; webhook signé | Diapay côté Diamarket via backend | Lier paiement shipment DiaExpress uniquement si applicable |
| `apps/diaexpress-api/README.md` | API DiaExpress | Setup, MongoDB, auth, endpoints, scripts | API Express/Mongo, Clerk bridge, degraded mode contrôlé | Compléter intégration Diamarket et docs endpoint |
| `apps/diaexpress-api/docs/backend-mongodb-connection-audit.md` | Connexion Mongo | Atlas requis, fallback local explicite, degraded mode | `MONGODB_URI` requis; `ALLOW_DEGRADED_MODE=false` par défaut | Superviser readiness en prod |
| `apps/diaexpress-api/docs/security-audit.md` | Sécurité API | Auth, rôles, risques à corriger | Admin protégé, public séparé | API-to-API, uploads, logs, validation |
| `apps/diaexpress-api/docs/logistics_overview.md` | Domaine logistique | Pricing, quotes, shipments, schedules, reservations | Séparation devis/expédition/tracking | Finaliser contrat externe |
| `apps/diaexpress-api/docs/operations-domain*.md` | Opérations | Réservations, schedules, embarkments, exceptions | Domaine opérations identifié | Connecter admin opérationnel et critères |
| `apps/diaexpress-api/docs/admin-discovery.md` | Découverte admin API | Routes admin, ressources, patterns | Admin v1/v2 compat | Vérifier pages contre API |
| `apps/diaexpress-admin/docs/*.md`, `README_ADMINV2.md` | Admin v2 | Clerk auth bridge, API contract, boucles auth | Auth backend DB = source de vérité | Tester toutes pages avec comptes admin |
| `apps/diaexpress-web/README.md` | Web client | Quotes, tracking, paiements, dashboard, auth Clerk | Estimation ≠ soumission; shipment ≠ quote status | Nettoyer pages historiques; UX paiement et historique |
| `.env.example` DiaExpress/diamarket-api | Config | API base URLs, Mongo, Clerk, Diapay, shipping | Secrets côté API; front variables publiques uniquement | Ajouter clés intégration Diamarket côté DiaExpress API |

## 3. Architecture générale

### Applications

| Application | Stack | Rôle | Ports dev |
|---|---|---|---|
| `apps/diaexpress-api` | Express 5, Mongoose, Clerk/JWT, Node 20 | Backend logistique | `5000` |
| `apps/diaexpress-admin` | Next.js 14, React 18, Clerk | Back-office DiaExpress | `3001` |
| `apps/diaexpress-web` | Next.js 14, React 18, Clerk | Site public/client | `3000` |
| `apps/diamarket-api` | Express/TS/Mongoose | Marketplace consommant DiaExpress | `5000` selon env |

### Scripts racine pertinents

| Script | Commande | État |
|---|---|---|
| Dev DiaExpress | `npm run dev:diaexpress` | Supporté via `scripts/dev.mjs diaexpress` |
| Build DiaExpress global | `npm run build:diaexpress` | Web → admin → API |
| Build API | `npm --prefix apps/diaexpress-api run build` | Supporté, mais pas de compilation réelle |
| Build admin | `npm --prefix apps/diaexpress-admin run build` | Supporté Next |
| Build web | `npm --prefix apps/diaexpress-web run build` | Supporté Next |

## 4. Backend DiaExpress

### Structure

| Zone | Fichiers/dossiers | Rôle |
|---|---|---|
| Serveur | `server.js` | Express, CORS, JSON, request context, metrics, rate limit, health, routes, bootstrap DB |
| Config | `config/db.js`, `appConfig.js`, `startupValidation.js`, `diaexpressAuth.js`, providers | Env, Mongo, auth runtime, providers externes |
| Middleware | `auth.js`, `syncUser.js`, `validate.js`, `rateLimit.js`, `metrics.js`, `requestContext.js`, `errorHandler.js` | Auth, rôles, user sync, validation, observabilité |
| Models | `User`, `Quote`, `Pricing`, `ExternalPricing`, `Shipment`, `Reservation`, `Schedule`, `Payment`, `Address`, `Country`, `MarketPoint`, etc. | Persistance MongoDB |
| Controllers | Auth, quotes, pricing, shipments, tracking, schedules, reservations, payments, upload, admin | Logique HTTP |
| Services | pricing, quote domain, shipment, Diapay, carriers, CMA CGM/FedEx, admin bootstrap, notifications | Logique métier/intégrations |
| Routes | `routes/*.js`, `routes/v1/*.js` | API publique/admin |
| Tests | `tests/*.test.js` | Contrats auth, pricing, shipments, payments, providers |

### Configuration et MongoDB

- MongoDB est obligatoire par défaut via `MONGODB_URI`; fallback local seulement si `MONGODB_ALLOW_LOCAL_FALLBACK=true`.
- `ALLOW_DEGRADED_MODE=false` par défaut; si activé, l’API démarre mais `requireMongoConnection` renvoie `503 DB_UNAVAILABLE` sur les routes métier.
- Healthchecks : `/health`, `/api/health`, `/api/health/live`, `/api/health/ready`.

### Modèles clés

| Modèle | Champs clés | Observations |
|---|---|---|
| `User` | `clerkUserId`, `externalId`, `email`, `role` (`client/admin/delivery`) | Source de vérité rôle backend |
| `Quote` | origine, destination, transportType, status, pricing, contacts, historique | Cycle devis riche; statuses legacy inclus |
| `Pricing` | corridors, transportPrices, package/container pricing, conditions | Source de vérité estimation interne |
| `ExternalPricing` | origin/destination/transportType/container/price/source | Modèle présent; routes non montées |
| `Shipment` | `quoteId` requis, `trackingCode`, status, timeline, planning | Incompatible tel quel avec création depuis commande Diamarket sans quote |
| `Reservation` | user, quote/shipment, schedule/embarkment, documents, provider | Réservation transport |
| `Schedule` | corridor, transportType, dates, capacité, status | Planning public/admin |
| `Payment` | DiaPay/payment provider, quote, user, montants, crypto/compliance | Paiement devis/shipment côté DiaExpress |
| `Address` | user/principal, type, contact, géoloc, marketPoint | Carnet d’adresses et points logistiques |

### Auth, rôles et sécurité existante

- Auth via middleware `requireAuth`, `optionalAuth`, `requireRole`, avec sync utilisateur Mongo.
- Rôles : `client`, `admin`, `delivery` dans `User`; routes admin exigent surtout `admin`.
- Certaines routes publiques : tracking, estimation, pricing routes, package-types list.
- Rate limit : `/api/auth`, `/api/admin`, `/api/v1/admin`.
- CORS via `CORS_ORIGINS`/config.
- API-to-API Diamarket : non exposée comme contrat dédié côté DiaExpress.

### Erreurs potentielles / dépendances

| Sujet | Problème | Impact | Recommandation |
|---|---|---|---|
| External pricing | UI appelle `/api/external-pricing`, route absente | Page cassée | Ajouter route ou masquer fonctionnalité |
| Shipment externe | `Shipment.quoteId` requis | Impossible de créer depuis commande Diamarket directement | Rendre `quoteId` optionnel pour source externe + `externalReference` unique |
| Tracking path | Diamarket attend `/api/shipments/tracking/:tracking`; API expose `/api/tracking/:code` | 404 côté provider | Ajouter alias ou nouveau contrat intégration |
| Uploads | `/api/uploads` public sans auth apparente dans route | Risque d’abus | Auth/rate limit/type/size/storage |
| API build | `build` = echo | Pas de transpilation ni contrôle syntaxe profond | Ajouter test/typecheck/lint ultérieurement |
| Payment mine | Web appelle `GET /api/payments/mine`, route non vue | Historique paiement cassé possible | Ajouter endpoint ou adapter web |
| Legacy route `routes/api.js` | Non montée dans `server.js` et importe middlewares inexistants | Dette morte | Supprimer/archiver après vérification |
| Port conflit | DiaExpress API et Diamarket API exemples sur 5000 | Dev simultané conflictuel | Définir ports distincts en dev intégré |

## 5. Endpoints détaillés DiaExpress

> État : **OK** = route montée et cohérente statiquement; **Partiel** = contrat ou sécurité à compléter; **Absent** = demandé par flows mais non monté; **Legacy** = fichier existant non monté.

| Catégorie | Méthode | Endpoint | Auth | Rôle requis | Description | Body attendu | Réponse attendue | État | Problèmes |
|---|---:|---|---|---|---|---|---|---|---|
| Health | GET | `/health` | Non | - | Liveness simple | - | `{status:'ok'}` | OK | Ne valide pas DB |
| Health | GET | `/api/health` | Non | - | Health détaillé DB/auth/payments | - | `{data:{status,db,auth,payments}}` | OK | 503 si DB failed |
| Health | GET | `/api/health/live` | Non | - | Liveness k8s/render | - | healthy | OK | - |
| Health | GET | `/api/health/ready` | Non | - | Readiness | - | healthy/degraded/unavailable | OK | - |
| Health | GET | `/api/metrics` | Non | - | Metrics mémoire | - | summary | Partiel | Public; à protéger en prod |
| Auth | POST | `/api/auth/token` | Non | - | Exchange token | token/provider | token/session user | OK | Dépend Clerk/config |
| Auth | GET | `/api/auth/me` | Oui | tout | Profil auth | - | user | OK | - |
| Auth | POST | `/api/auth/sync` | Oui | tout | Sync user backend | profil Clerk | user | OK | - |
| Users | GET | `/api/users/me` | Oui | tout | Profil utilisateur | - | user | OK | - |
| Users | PUT/PATCH | `/api/users/me` | Oui | tout | Mise à jour profil | champs profil | user | OK | Validation à renforcer |
| Quotes | POST | `/api/quotes` | Optionnelle | client/admin | Créer demande devis | origine, destination, transportType, colis, contacts | quote | OK | Validation minimale |
| Quotes | POST | `/api/quotes/estimate`, `/api/quotes/estimateQuote` | Non | - | Estimation non persistée | poids/volume/corridor | montant/devis estimé | OK | Dépend pricing |
| Quotes | GET | `/api/quotes` | Oui | admin | Liste devis | query | quotes | OK | - |
| Quotes | GET | `/api/quotes/all` | Oui | admin | Alias liste | query | quotes | OK | Redondant |
| Quotes | GET | `/api/quotes/meta` | Non | - | Métadonnées devis | - | enums/meta | OK | À documenter |
| Quotes | GET | `/api/quotes/me` | Oui | client/admin | Mes devis | - | quotes | OK | Ownership important |
| Quotes | GET | `/api/quotes/:id` | Oui | tout | Détail devis | - | quote | Partiel | Vérifier ownership client |
| Quotes | PATCH | `/api/quotes/:id/status` | Oui | admin | Changer statut | `{status}` | quote | OK | Statuts nombreux/legacy |
| Quotes | PATCH | `/api/quotes/:id` | Oui | admin | Update admin | champs quote | quote | OK | - |
| Quotes | POST | `/api/quotes/:quoteId/confirm` | Oui | admin | Confirmer devis | -/note | quote | OK | Alias admin |
| Quotes | POST | `/api/quotes/:quoteId/reject` | Oui | admin | Rejeter devis | raison | quote | OK | - |
| Quotes | POST | `/api/quotes/:quoteId/dispatch` | Oui | admin | Dispatcher devis | tracking? | quote | OK | Transition legacy |
| Quotes | DELETE | `/api/quotes/:id` | Oui | admin | Supprimer devis | - | success | OK | - |
| Quotes | POST | `/api/quotes/:id/review` | Oui | admin | Mettre en review | note | quote | OK | - |
| Quotes | POST | `/api/quotes/:id/request-info` | Oui | admin | Demande info | message | quote | OK | - |
| Quotes | POST | `/api/quotes/:id/ready-for-shipment` | Oui | admin | Prêt expédition | - | quote | OK | - |
| Quotes | POST | `/api/quotes/:id/pay` | Oui | client | Payer devis | méthode | payment/session | Partiel | Diapay config requise |
| Admin quotes | GET/PATCH/POST | `/api/admin/quotes/*` | Oui | admin | Alias admin devis | selon action | quote(s) | OK | Redondance avec `/api/quotes` |
| Pricing | GET | `/api/pricing/public/routes` | Non | - | Routes publiques | - | routes | OK | - |
| Pricing | GET | `/api/pricing/routes` | Non | - | Routes pricing | - | routes | OK | Public malgré nom |
| Pricing | GET | `/api/pricing/locations` | Non | - | Locations | - | locations | OK | - |
| Pricing | GET | `/api/pricing/warehouses` | Non | - | Entrepôts | - | warehouses | OK | - |
| Pricing | GET | `/api/pricing/meta` | Oui | admin | Méta pricing | - | meta | OK | - |
| Pricing | GET | `/api/pricing` | Oui | admin | Liste tarifs | query | pricing[] | OK | - |
| Pricing | GET | `/api/pricing/:id` | Oui | admin | Détail tarif | - | pricing | OK | - |
| Pricing | POST | `/api/pricing` | Oui | admin | Créer tarif | origin,destination,... | pricing | OK | Validation partielle |
| Pricing | PUT | `/api/pricing/:id` | Oui | admin | Modifier tarif | champs | pricing | OK | - |
| Pricing | DELETE | `/api/pricing/:id` | Oui | admin | Supprimer tarif | - | success | OK | - |
| External Pricing | GET/POST | `/api/external-pricing*` | Oui attendu | admin | Pricing CMA CGM/FedEx | query/sync/credentials | external pricing | Absent | UI web l’appelle; pas monté |
| Package types | GET | `/api/package-types` | Non | - | Catalogue colis | - | packageTypes | OK | Public |
| Package types | POST/PUT/DELETE | `/api/package-types/:id?` | Oui | admin | CRUD colis | name, allowedTransportTypes | packageType | OK | - |
| Addresses | GET/POST | `/api/addresses` | Oui | client/admin | Carnet adresses | address | addresses/address | OK | Ownership via syncUser |
| Addresses | GET/PUT/DELETE | `/api/addresses/:id` | Oui | owner | Détail/MAJ/suppression | fields | address/success | OK | Vérifier ownership |
| Admin addresses | GET/POST/PATCH/DELETE | `/api/admin/addresses*` | Oui | admin | Référentiel adresses | fields | paginated | OK via logisticsAdmin | À confirmer routes complètes |
| Shipments | POST | `/api/shipments/from-quote` | Oui | admin | Créer shipment depuis devis | `{quoteId}` | shipment | OK | Pas pour commande externe |
| Shipments | POST | `/api/shipments/create-from-quote` | Oui | admin | Alias | `{quoteId}` | shipment | OK | Redondant |
| Shipments | GET | `/api/shipments/me` | Oui | client/admin | Mes expéditions | - | shipments | OK | - |
| Shipments | GET | `/api/shipments` | Oui | admin | Toutes expéditions | query | shipments | OK | - |
| Shipments | GET | `/api/shipments/:shipmentId` | Oui | owner/admin | Détail | - | shipment | Partiel | Vérifier ownership |
| Shipments | PATCH | `/api/shipments/:shipmentId/status` | Oui | admin | Statut | `{status}` | shipment | OK | Statuts pas identiques Diamarket |
| Shipments | POST | `/api/shipments/:shipmentId/history` | Oui | admin | Ajouter timeline | event/status/note | shipment | OK | - |
| Shipments | PATCH | `/api/shipments/:shipmentId/assign-embarkment` | Oui | admin | Affectation opération | embarkmentId | shipment | OK | Alias `/assign-operation` |
| Shipments | DELETE | `/api/shipments/:shipmentId` | Oui | admin | Supprimer | - | success | OK | À éviter prod sauf soft delete |
| Tracking | GET | `/api/tracking/:trackingCode` | Optionnelle/API key | - | Tracking public/API | - | status/timeline | OK | Tracking public doit limiter données |
| Tracking | GET | `/api/shipments/tracking/:tracking` | API key attendu | - | Chemin attendu par Diamarket historique | - | status | Absent | Ajouter alias/intégration |
| Schedules | GET | `/api/schedules`, `/api/schedules/public` | Non | - | Planning | query | schedules | OK | GET principal public |
| Schedules | GET | `/api/schedules/available/route` | Non | - | Disponibilités corridor | query | schedules | OK | - |
| Schedules | POST/PATCH/DELETE | `/api/schedules/:id?` | Oui | admin | CRUD planning | schedule fields | schedule/success | OK | - |
| Reservations | POST | `/api/reservations` | Oui | client | Créer réservation | type,corridor,date | reservation | OK | Documents pas multer |
| Reservations | GET | `/api/reservations/me` | Oui | client | Mes réservations | - | reservations | OK | - |
| Reservations | GET | `/api/reservations` | Oui | admin | Toutes réservations | query | reservations | OK | - |
| Reservations | PATCH | `/api/reservations/:id/status` | Oui | admin | Statut réservation | `{status}` | reservation | OK | - |
| Reservations | POST | `/api/reservations/:id/documents` | Oui | owner | Ajouter document | document | reservation | Partiel | Pas upload réel sécurisé |
| Media | POST | `/api/uploads` | Non apparent | - | Upload image | multipart | url | Partiel | Auth/rate/type à durcir |
| Media | GET | `/uploads/*` | Non | - | Servir fichiers | - | fichier | OK | Public |
| Payments | POST | `/api/payments/create` | Oui | client | Créer paiement DiaPay | quoteId, method | session/payment | Partiel | `ENABLE_DIAPAY` requis |
| Payments | GET | `/api/payments/mine` | Oui attendu | client | Mes paiements | - | payments | Absent probable | Web l’appelle |
| Admin payments | GET | `/api/v1/admin/payments*` ou `/api/admin/payments*` | Oui | admin | Liste, résumé, détail, events | query | payment(s) | OK | Peut proxy DiaPay/admin local |
| Admin jobs | GET | `/api/v1/admin/notifications/jobs*` | Oui | admin | Jobs notifications | query | jobs | OK | - |
| Admin providers | GET/POST/PATCH/DELETE | `/api/v1/admin/providers*` | Oui | admin | Providers/config/errors | fields | data | OK | - |
| Admin API keys | GET/POST/PATCH/DELETE | `/api/v1/admin/api-keys*` | Oui | admin | Clés API | key fields | key | OK | À utiliser pour Diamarket après durcissement |
| Admin users | GET/POST/PATCH/DELETE | `/api/v1/admin/users*` | Oui | admin | Users | fields | user(s) | OK | - |
| Admin countries | GET/POST/PATCH/DELETE | `/api/admin/countries*` | Oui | admin | Pays | code,name | country | OK | - |
| Admin market points | GET/POST/PATCH/DELETE | `/api/admin/market-points*` | Oui | admin | Hubs/agences | fields | point | OK | - |
| Admin expedition lines | GET/POST/PATCH/DELETE | `/api/admin/expedition-lines*` | Oui | admin | Lignes opération | fields | line | OK | - |
| Admin embarkments | GET/POST/PATCH/DELETE | `/api/admin/embarkments*` | Oui | admin | Embarquements | fields | embarkment | OK | Route présente dans logisticsAdmin |
| Expeditions | GET/POST/PUT/DELETE | `/api/expeditions*` | Oui | admin | Expéditions opérationnelles | fields | expedition | OK | - |
| Bookings | POST | `/api/bookings` | User/API key | - | Booking carrier | payload booking | booking | Partiel | Contrat externe à préciser |
| Integrations Diamarket | POST | `/api/integrations/diamarket/shipping/estimate` | API key | partner | Estimation provider Diamarket | voir contrat | estimate | Absent | À créer |
| Integrations Diamarket | POST | `/api/integrations/diamarket/shipments` | API key | partner | Création shipment commande | voir contrat | shipment | Absent | À créer |
| Integrations Diamarket | GET | `/api/integrations/diamarket/shipments/:trackingNumber` | API key | partner | Tracking | - | shipment/tracking | Absent | À créer |

## 6. Admin DiaExpress

### Structure et auth

- Next.js App Router sous `app/admin/*`.
- Login Clerk sous `app/sign-in/[[...sign-in]]/page.tsx`.
- Middleware Next protège l’admin; le backend reste source de vérité rôle via `/api/users/me` et routes admin.
- Client API centralisé dans `lib/api/client.ts` avec bases `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_ADMIN_API_BASE_URL`, `NEXT_PUBLIC_DIAPAY_ADMIN_API_BASE_URL`.
- États loading/error/empty récurrents via composants de ressources et hooks paginés.

### Tableau pages admin

| Page admin | Route frontend | API appelée | Fonctionnelle | Partielle | Cassée | Correctif recommandé |
|---|---|---|---:|---:|---:|---|
| Accueil admin | `/admin` | dashboard snapshot : quotes, shipments, payment summary | Oui |  |  | Valider avec DB réelle |
| Devis | `/admin/quotes` | `/api/quotes`, `/api/quotes/meta`, `/api/quotes/estimate`, `/api/shipments/from-quote` | Oui |  |  | Tester transitions et conversion |
| Devis détail | `/admin/quotes/[id]` | `/api/quotes/:id`, PATCH/actions | Oui |  |  | Vérifier ownership/admin errors |
| Devis pending | `/admin/quotes/pending` | `/api/quotes` filtré | Oui |  |  | S’assurer filtre côté API |
| Expéditions | `/admin/shipments` | `/api/shipments`, status/history/assign | Oui |  |  | Harmoniser statuts normalisés |
| Expédition détail | `/admin/shipments/[id]` | `/api/shipments/:id` | Oui |  |  | Ajouter timeline complète |
| Tracking | `/admin/tracking` | `/api/tracking/:code` | Oui |  |  | Distinguer public vs admin detail |
| Pricing | `/admin/pricing` | `/api/pricing`, `/api/package-types` | Oui |  |  | Ajouter validation UX |
| Package types | `/admin/package-types` | `/api/package-types` | Oui |  |  | OK |
| Countries | `/admin/countries` | `/api/admin/countries` | Oui |  |  | OK |
| Market points | `/admin/market-points` | `/api/admin/market-points`, countries | Oui |  |  | OK |
| Addresses | `/admin/addresses` | `/api/admin/addresses`, market-points | Oui |  |  | Vérifier route complète |
| Users | `/admin/users` | `/api/admin/users` | Oui |  |  | Clarifier différence admin-users |
| Admin users | `/admin/admin-users` | `/api/v1/admin/users` | Oui |  |  | Unifier avec Users si doublon |
| API keys | `/admin/api-keys` | `/api/v1/admin/api-keys` | Oui |  |  | Ajouter usage Diamarket |
| Payments | `/admin/payments` | `/api/v1/admin/payments` ou DiaPay target | Oui |  |  | Vérifier flags `NEXT_PUBLIC_ENABLE_DIAPAY` |
| Payment détail | `/admin/payments/[id]` | `/api/v1/admin/payments/:id/events` | Oui |  |  | OK |
| Jobs | `/admin/jobs` | `/api/v1/admin/notifications/jobs` | Oui |  |  | OK |
| Integrations | `/admin/integrations` | providers/configs/api keys |  | Oui |  | Connecter Diamarket provider contract |
| CMS | `/admin/cms` | probable statique/ressource |  | Oui |  | Clarifier périmètre contenu |
| Settings | `/admin/settings` | variable selon page |  | Oui |  | Définir endpoint settings DiaExpress |
| API health | `/admin/api-health` | `/api/health`, fallback public services | Oui |  |  | Dev-only ou admin-only |
| Expéditions lignes | `/admin/expeditions/lines` | `/api/expeditions/transport-lines`, market-points | Oui |  |  | Unifier avec expedition-lines admin |
| Expéditions embarquements | `/admin/expeditions/embarkments` | `/api/admin/embarkments` | Oui |  |  | OK |
| Expéditions history/upcoming/shipments | `/admin/expeditions/*` | expéditions/schedules/shipments |  | Oui |  | Vérifier pages statiques vs API |
| Auth error/access denied | `/admin/auth-error`, `/access-denied` | auth | Oui |  |  | OK |

### Points admin à corriger

- Réduire doublons `users`/`admin-users`, `expeditions transport-lines`/`admin expedition-lines`.
- Ajouter page/ressource External Pricing si l’API est réellement implémentée; sinon retirer liens.
- Ajouter un écran “Diamarket integration” : API keys, webhook URL Diamarket, derniers événements, tests de signature.

## 7. Web DiaExpress

### Structure

- Next Pages Router historique (`pages/*`) et pages React sous `src/pages/*`.
- Contenus marketing sous `src/content/public/*`.
- Quote flow moderne sous `src/modules/quote-flow` et composants `src/components/quote/*`.
- Clients API : `src/api/api.js`, `logistics.js`, `quotes.js`, `shipments.js`, `addresses.js`, `payment.js`, `externalPricing.js`.
- Auth : Clerk + `useBackendAuth`, fallback dev local.

### Tableau flows web

| Flow web | Pages | API appelée | Fonctionne | Manque | Problème | Priorité |
|---|---|---|---:|---|---|---|
| Accueil | `/`, contenus home, landing DiaExpress | public services/pricing parfois | Oui | A/B prod, SEO complet | Coexistence composants anciens/nouveaux | Moyenne |
| Demande devis | quote request/wizard, `QuoteWizard`, `QuoteFlowForms` | `POST /api/quotes/estimate`, `POST /api/quotes`, `/api/quotes/meta` | Oui | Tests e2e, validation complète | Estimation dépend pricing DB | Haute |
| Estimation | wizard étape estimate, `EstimateList` | `/api/quotes/estimate` | Oui | Explication tarif client/admin | Erreurs pricing à rendre actionnables | Haute |
| Création compte | Clerk sign-up/sign-in selon pages | Clerk + `/api/auth/sync`, `/api/users/me` | Partiel | Parcours signup client final | Config Clerk/template obligatoire | Haute |
| Connexion | Clerk | `/api/auth/sync`, `/api/users/me` | Partiel | UX session expirée | 401/403 doivent être clairs | Haute |
| Suivi colis | `/track-shipment`, `TrackShipment` | `GET /api/tracking/:code` | Oui | Limiter données sensibles | Public tracking brut si code connu | Haute |
| Historique expéditions | `/Shipments`, dashboard client | `GET /api/shipments/me` | Oui | Timeline riche | Nécessite auth stable | Haute |
| Adresses | profile addresses/dashboard | `GET/POST/PATCH/DELETE /api/addresses` | Oui | Géocodage/points relais | Ownership à vérifier | Moyenne |
| Paiement | `Payments`, quote pay | `POST /api/payments/create`, `GET /api/payments/mine` |  | Historique fiable | `GET /api/payments/mine` probablement absent | Haute |
| Support/contact | `/contact`, contenus publics | aucun/API contact éventuelle | Oui | Envoi formulaire réel | Pas de backend contact identifié | Basse |
| Réservations | `ClientReservations`, public reservations | `/api/schedules/public`, `/api/reservations` | Oui | Documents upload | Validation documents | Moyenne |
| Admin historique web | `Admin*` dans diaexpress-web | `/api/admin/*`, `/api/pricing`, `/api/external-pricing` |  | Migration vers admin v2 | Doublon admin; external-pricing absent | Basse |

## 8. Flows métier DiaExpress

1. **Estimation devis** : client ou public envoie corridor/colis → pricingService matche règles → réponse temporaire non persistée.
2. **Soumission devis** : client confirme infos contact/adresses → `Quote` créé en `requested`.
3. **Revue admin** : admin passe `under_review`, demande info, approuve/rejette, marque `ready_for_shipment`.
4. **Paiement** : si actif, quote pay crée paiement DiaPay; paiement doit synchroniser statut quote/shipment selon règles à finaliser.
5. **Conversion shipment** : admin crée shipment depuis quote; tracking code généré; timeline initialisée.
6. **Opérations** : shipment assigné à embarkment/schedule; réservations et capacités suivies.
7. **Tracking** : public par tracking code; client par historique protégé; admin par dashboard.
8. **Intégration Diamarket cible** : marketplace demande estimation, crée shipment depuis commande payée, reçoit webhook statut, affiche tracking client/admin.

## 9. Interconnexion Diamarket

### Côté Diamarket existant

- `apps/diamarket-api/src/services/diaexpress.service.ts` expose `estimateShipping`, `createShipment`, `getShipmentStatus`, `cancelShipment`.
- Statuts Diamarket normalisés : `pending`, `created`, `picked_up`, `in_transit`, `out_for_delivery`, `delivered`, `failed`, `returned`, `cancelled`.
- Endpoints Diamarket déjà documentés/implémentés :
  - `POST /api/shipping/estimate`
  - `GET /api/shipments`
  - `GET /api/shipments/:trackingNumber`
  - `GET /api/orders/:id/shipment`
  - `POST /api/orders/:id/shipment`
  - `POST /api/orders/:id/shipment/sync`
  - `POST /api/shipping/diaexpress/webhook`
  - `GET/PUT /api/admin/shipping`
- Diamarket protège ownership commandes, exige paiement Diapay `paid` avant création shipment et déduplique par index unique `Shipment.order`.

### Écarts côté DiaExpress

| Besoin Diamarket | État DiaExpress | Écart |
|---|---|---|
| Estimation livraison API-to-API | `/api/quotes/estimate` public | Pas de route dédiée + API key + payload order |
| Création expédition commande | `/api/shipments/from-quote` admin | Nécessite quote; pas idempotent par commande externe |
| Tracking provider | `/api/tracking/:code` | Chemin différent; auth API key optionnelle à préciser |
| Sync statut | tracking public | Pas de endpoint statut normalisé Diamarket |
| Webhook retour | Diamarket a endpoint | DiaExpress doit émettre webhook avec signature |
| API key | Admin API keys existe | Pas de middleware/contrat dédié Diamarket documenté |
| Modèle compatible Order | Shipment quote-centric | Ajouter `source`, `externalOrderId`, `partner`, `items`, recipient |

## 10. Contrat API DiaExpress ↔ Diamarket proposé

### Principes

- Base URL DiaExpress : `DIAEXPRESS_API_BASE_URL`.
- Auth API-to-API : `Authorization: Bearer <DIAEXPRESS_API_KEY>` ou `X-DiaExpress-Api-Key`; recommander Bearer.
- Signature webhook DiaExpress → Diamarket : `X-DiaExpress-Signature: <hex hmac sha256 rawBody>`, secret `DIAEXPRESS_WEBHOOK_SECRET` côté Diamarket.
- Idempotence : header `Idempotency-Key` obligatoire pour création shipment; DiaExpress stocke clé + `externalOrderId`.
- Corrélation : `X-Request-Id` propagé; réponses incluent `requestId` si possible.
- Formats date : ISO 8601 UTC.
- Devise : ISO 4217 (`XOF`, `EUR`, `USD`).

### Endpoint estimation

```txt
POST /api/integrations/diamarket/shipping/estimate
```

| Élément | Contrat |
|---|---|
| Auth | Bearer API key Diamarket avec scope `diamarket:shipping:estimate` |
| Headers | `Authorization`, `Content-Type: application/json`, `X-Request-Id` optionnel |
| Body | `{ externalCartId?, origin:{country,city,postalCode?}, destination:{country,city,postalCode?}, items:[{sku?,name,quantity,weightKg?,lengthCm?,widthCm?,heightCm?,declaredValue?}], totalWeightKg?, currency?, serviceLevel? }` |
| Réponse 200 | `{ provider:'diaexpress', amount, currency, estimatedDeliveryDays, estimatedDeliveryDaysMin?, serviceLevel, quoteReference?, expiresAt, breakdown?, warnings? }` |
| Erreurs | `400 VALIDATION_ERROR`, `401 UNAUTHORIZED`, `403 FORBIDDEN`, `422 UNSUPPORTED_ROUTE`, `503 PRICING_UNAVAILABLE` |
| Idempotence | Pas obligatoire; si `externalCartId` fourni, peut être loggé pour audit sans persistance shipment |
| Mapping interne | Réutilise `pricingService` / `quoteController.estimateQuote` sans créer `Quote` |

### Endpoint création expédition

```txt
POST /api/integrations/diamarket/shipments
```

| Élément | Contrat |
|---|---|
| Auth | Bearer API key scope `diamarket:shipments:create` |
| Headers | `Authorization`, `Content-Type`, `Idempotency-Key`, `X-Request-Id` |
| Body | `{ externalOrderId, orderNumber?, customer:{id?,email?,name?,phone?}, recipient:{name,phone,email?,address:{line1,line2?,city,country,postalCode?}}, origin?, items:[...], declaredValue, currency, paid:boolean, paymentProvider?, metadata? }` |
| Réponse 201 | `{ shipmentId, trackingNumber, status:'created', estimatedDeliveryDate?, provider:'diaexpress', externalOrderId, timeline:[{status:'created',timestamp,note}] }` |
| Réponse idempotente 200 | Même payload + `{ idempotent:true }` |
| Erreurs | `400 VALIDATION_ERROR`, `401`, `403`, `409 PAYMENT_REQUIRED_OR_NOT_CONFIRMED`, `409 IDEMPOTENCY_CONFLICT`, `422 UNSUPPORTED_ROUTE`, `503 DB_OR_PROVIDER_UNAVAILABLE` |
| Idempotence | Unique sur `(partner='diamarket', externalOrderId)` et/ou `Idempotency-Key`; même body renvoie existant; body différent → 409 |
| Modèle requis | `Shipment.quoteId` optionnel pour source `diamarket`; champs `externalReference`, `partner`, `recipient`, `items`, `idempotencyKey` |

### Endpoint tracking

```txt
GET /api/integrations/diamarket/shipments/:trackingNumber
```

| Élément | Contrat |
|---|---|
| Auth | Bearer API key scope `diamarket:shipments:read` |
| Headers | `Authorization`, `X-Request-Id` optionnel |
| Body | Aucun |
| Réponse 200 | `{ shipmentId, trackingNumber, externalOrderId?, status, currentLocation?, estimatedDeliveryDate?, deliveredAt?, timeline:[{status,timestamp,location?,note?,source?}] }` |
| Erreurs | `401`, `403`, `404 SHIPMENT_NOT_FOUND`, `410 TRACKING_EXPIRED`, `503 TRACKING_UNAVAILABLE` |
| Idempotence | GET naturel; cache court possible |
| Sécurité | Ne renvoie pas données personnelles complètes; seulement tracking nécessaire |

### Webhook retour statut DiaExpress → Diamarket

```txt
POST Diamarket /api/shipping/diaexpress/webhook
```

| Élément | Contrat |
|---|---|
| Auth | HMAC SHA-256 sur raw body avec `DIAEXPRESS_WEBHOOK_SECRET` |
| Headers | `Content-Type: application/json`, `X-DiaExpress-Signature`, `X-DiaExpress-Event-Id`, `X-Request-Id` |
| Body | `{ eventId, type:'shipment.status.updated', shipmentId, trackingNumber, externalOrderId, status, occurredAt, location?, message?, rawStatus?, metadata? }` |
| Réponse 200 | `{ success:true }` ou `{ success:true,idempotent:true }` |
| Erreurs | `401 INVALID_SIGNATURE`, `404 SHIPMENT_NOT_FOUND`, `422 UNKNOWN_STATUS`, `503 WEBHOOK_UNAVAILABLE` |
| Idempotence | Diamarket déduplique par `eventId`; DiaExpress doit réessayer 5xx avec backoff |
| Statuts | Utiliser mapping section 11 |

## 11. Statuts livraison normalisés

| Statut DiaExpress actuel | Statut Diamarket | Description | Action côté client | Action côté admin |
|---|---|---|---|---|
| `draft` | `pending` | Expédition préparée/non confirmée | Afficher “préparation” | Compléter données ou annuler |
| `created` | `created` | Shipment créé, tracking attribué | Afficher tracking | Planifier pickup/embarkment |
| `pending_dispatch` | `created` | En attente dispatch | Afficher préparation | Dispatcher/assigner |
| `scheduled` | `created` | Planifié sur schedule | Afficher date estimée | Suivre capacité |
| `picked_up` (à ajouter) | `picked_up` | Colis collecté | Afficher collecte | Confirmer hub suivant |
| `in_transit` | `in_transit` | En transport | Afficher timeline | Monitorer exceptions |
| `at_hub` | `in_transit` | Au hub | Afficher localisation générale | Planifier sortie |
| `out_for_delivery` | `out_for_delivery` | En livraison finale | Préparer réception | Suivre livraison |
| `delivered` | `delivered` | Livré | Afficher preuve/reçu | Clôturer |
| `failed_delivery` | `failed` | Échec livraison | Inviter à contacter support | Replanifier/ouvrir incident |
| `delayed` | `in_transit` ou `failed` selon gravité | Retard | Afficher retard | Ouvrir exception si SLA dépassé |
| `returned` | `returned` | Retour expéditeur | Afficher retour | Clôture retour/remboursement si applicable |
| `cancelled` | `cancelled` | Annulé | Afficher annulation | Auditer raison |
| Statut inconnu provider | `pending` ou `failed` | Statut non mappé | Message générique | Alerte intégration |

Recommandation : ajouter explicitement `picked_up` à `SHIPMENT_STATUSES` DiaExpress pour alignement complet.

## 12. Sécurité

### Risques classés

| Niveau | Risque | État observé | Mesure recommandée |
|---|---|---|---|
| Critique | Pas de contrat API-to-API Diamarket dédié | Absent | Middleware API key scoped, rotation, audit logs |
| Critique | Upload public potentiel | `/api/uploads` sans auth apparente | Auth, rate limit, MIME sniffing, antivirus/S3 privé |
| Critique | Secrets historiques ou env réels | `.env.example` OK; audit Diamarket signale secrets suivis auparavant | Secret scanning, rotation, ne jamais exposer frontend |
| Important | Shipment externe impossible sans quote | `quoteId` requis | Adapter modèle avec migration prudente |
| Important | Tracking public par code | Fonctionnel | Limiter PII, rate limit, réponse minimale |
| Important | Validation payload inégale | `validateBody` partiel | Schémas stricts pour intégration/pricing/shipment |
| Important | Ownership à revérifier | `getById` quotes/shipments doit être contrôlé | Tests contractuels client/admin |
| Important | CORS permissif si aucune origine | `origin:true` si liste vide | Exiger `CORS_ORIGINS` en staging/prod |
| Moyen | Metrics public | `/api/metrics` sans auth | Restreindre admin/internal |
| Moyen | Logs sensibles | logger structuré mais payloads à auditer | Redaction tokens, emails, phones, addresses |
| Moyen | Rate limit mémoire | Middleware simple probable | Redis/distribué en prod |
| Moyen | Redondance routes legacy | Multiples aliases | Nettoyage après stabilisation |
| Faible | Builds sans lint API | build echo | Ajouter lint/test minimal |

### Checklist sécurité intégration

- `DIAEXPRESS_DIAMARKET_API_KEY_HASH` côté DiaExpress, pas de clé en clair en DB.
- Scopes par clé : estimate/read/create/webhook-admin.
- `Idempotency-Key` obligatoire sur création.
- Audit log : actor `diamarket-api`, externalOrderId, requestId, IP, status.
- Signature webhook Diamarket conservée; DiaExpress doit fournir replay/retry contrôlé.

## 13. Déploiement et build

### Commandes officielles supportées

```bash
npm run dev:diaexpress
npm run build:diaexpress
npm --prefix apps/diaexpress-api run build
npm --prefix apps/diaexpress-admin run build
npm --prefix apps/diaexpress-web run build
npm --prefix apps/diaexpress-api run start
npm --prefix apps/diaexpress-admin run start
npm --prefix apps/diaexpress-web run start
```

### Analyse build/deploy

| Point | État |
|---|---|
| npm uniquement | Oui; racine workspaces npm; pas besoin pnpm/turbo |
| pnpm/turbo | Non requis; ne pas réintroduire |
| Node | Racine `node 20.x` |
| API build | `echo "No build step configured"`; acceptable temporairement mais faible validation |
| Admin build | `next build` |
| Web build | `next build` |
| Render API | `render.yaml` existe; vérifier service DiaExpress si présent selon cible |
| Vercel admin/web | Compatible Next; définir root app et env publiques |
| `.env.example` | Présents pour API/admin/web/Diamarket API |
| Healthchecks | API : `/health`, `/api/health/ready` |

### Variables à compléter côté `apps/diaexpress-api/.env.example`

À ajouter dans une itération env (sans secret réel) :

```env
CLERK_SECRET_KEY=
CLERK_ISSUER_URL=
DIAEXPRESS_CLERK_JWT_TEMPLATE=diaexpress-backend
DIAPAY_BASE_URL=
DIAPAY_API_KEY=
DIAPAY_WEBHOOK_SECRET=
DIAEXPRESS_DIAMARKET_API_KEY=
DIAEXPRESS_DIAMARKET_WEBHOOK_URL=
DIAEXPRESS_DIAMARKET_WEBHOOK_SECRET=
UPLOAD_MAX_SIZE_MB=8
```

## 14. Insuffisances principales

1. Routes intégration Diamarket absentes côté DiaExpress.
2. Modèle shipment quote-centric incompatible avec commande externe directe.
3. External pricing non monté malgré UI et modèle.
4. Historique paiements client probablement incomplet (`/api/payments/mine`).
5. Uploads/documents insuffisamment sécurisés/documentés.
6. Statuts DiaExpress pas parfaitement alignés (`picked_up`, `failed` vs `failed_delivery`, `delayed`).
7. Admin et web comportent des doublons historiques.
8. API build ne valide pas le code; lint/typecheck faibles.
9. Pas de tests e2e DiaExpress ↔ Diamarket.
10. Pas de DLQ/retry webhook formalisé.

## 15. Roadmap d’itérations

### Itération 0 — Stabilisation build & env

| Élément | Détail |
|---|---|
| Objectifs | npm uniquement; builds web/admin/api; `.env.example`; Render/Vercel; healthchecks |
| Fichiers probables | `package.json`, `apps/*/package.json`, `.env.example`, `render.yaml`, READMEs |
| Endpoints concernés | `/health`, `/api/health`, `/api/health/ready` |
| Critères d’acceptation | Les 3 commandes build passent ou erreurs documentées; env examples sans secrets; ports clarifiés |
| Tests manuels | Lancer API, ouvrir health, lancer admin/web en dev |
| Risques | Dépendances npm/Next manquantes; variables Clerk requises |
| Livrable documentaire | Mise à jour runbook build/deploy DiaExpress |

### Itération 1 — Auth & sécurité

| Élément | Détail |
|---|---|
| Objectifs | Login admin/client; rôles; permissions; API keys; ownership |
| Fichiers probables | `middleware/auth.js`, `services/diaexpressAuthService.js`, `controllers/admin/apiKeys.js`, tests auth |
| Endpoints concernés | `/api/auth/*`, `/api/users/me`, `/api/v1/admin/api-keys`, routes protected |
| Critères d’acceptation | 401/403 cohérents; admin ne fonctionne qu’avec rôle admin; tests ownership quotes/shipments/adresses |
| Tests manuels | Connexion admin/client, accès refusé, tracking public limité |
| Risques | Boucle Clerk/JWT template; comptes sans rôle |
| Livrable documentaire | Matrice rôles/scopes DiaExpress |

### Itération 2 — Pricing & devis

| Élément | Détail |
|---|---|
| Objectifs | Estimation; grilles tarifaires; poids/volume/destination; external pricing; conversion devis → shipment |
| Fichiers probables | `pricingController`, `pricingService`, `models/Pricing.js`, route external-pricing à créer |
| Endpoints concernés | `/api/quotes/estimate`, `/api/pricing*`, `/api/package-types`, `/api/external-pricing*` |
| Critères d’acceptation | Estimation déterministe; external pricing route soit fonctionnelle soit retirée UI; erreurs 422 lisibles |
| Tests manuels | Créer tarif, estimer, soumettre devis, vérifier breakdown |
| Risques | Tarifs incomplets; sources externes CMA CGM/FedEx indisponibles |
| Livrable documentaire | Guide pricing DiaExpress |

### Itération 3 — Shipments & tracking

| Élément | Détail |
|---|---|
| Objectifs | Création expédition; statuts; tracking public; historique; timeline |
| Fichiers probables | `models/Shipment.js`, `shipmentController`, `trackingController`, `shipmentService` |
| Endpoints concernés | `/api/shipments*`, `/api/tracking/:code` |
| Critères d’acceptation | Conversion quote→shipment; timeline complète; status mapping; tracking PII-safe |
| Tests manuels | Créer shipment, changer status, rechercher tracking public/client/admin |
| Risques | Migration modèle shipment; statuts legacy |
| Livrable documentaire | Contrat tracking DiaExpress |

### Itération 4 — Admin opérationnel

| Élément | Détail |
|---|---|
| Objectifs | Dashboard; devis; shipments; pricing; schedules; users; actions admin |
| Fichiers probables | `apps/diaexpress-admin/app/admin/*`, `src/services/api/*`, composants ressources |
| Endpoints concernés | Routes admin listées section 6 |
| Critères d’acceptation | Toutes pages admin affichent loading/error/empty/data; aucune 404 imprévue |
| Tests manuels | Parcours admin complet avec DB seed |
| Risques | Doublons ressources; flags DiaPay |
| Livrable documentaire | Checklist admin DiaExpress |

### Itération 5 — Web client

| Élément | Détail |
|---|---|
| Objectifs | Demande devis; compte client; tracking; adresses; historique |
| Fichiers probables | `apps/diaexpress-web/src/pages/*`, `src/api/*`, quote-flow |
| Endpoints concernés | `/api/quotes*`, `/api/shipments/me`, `/api/tracking`, `/api/addresses` |
| Critères d’acceptation | Flow estimate→submit→history→tracking; erreurs explicites; mobile OK |
| Tests manuels | Mobile + desktop, auth/no-auth, erreurs API |
| Risques | Pages historiques doublonnées; Clerk config |
| Livrable documentaire | Guide UX client DiaExpress |

### Itération 6 — Interconnexion Diamarket

| Élément | Détail |
|---|---|
| Objectifs | Estimation shipping; création shipment depuis commande; webhook statut; API key; idempotence |
| Fichiers probables | `routes/integrations/diamarket.js`, middleware api key, `models/Shipment.js`, Diamarket `diaexpress.service.ts` si chemin changé |
| Endpoints concernés | `/api/integrations/diamarket/shipping/estimate`, `/api/integrations/diamarket/shipments`, `/api/integrations/diamarket/shipments/:trackingNumber`, Diamarket `/api/shipping/diaexpress/webhook` |
| Critères d’acceptation | Diamarket estime, crée shipment idempotent, synchronise tracking, reçoit webhook signé |
| Tests manuels | Commande Diamarket payée → shipment DiaExpress → statut visible client/admin |
| Risques | Port/env conflit; mismatch payload; migration modèle |
| Livrable documentaire | OpenAPI ou markdown contractuel DiaExpress ↔ Diamarket |

### Itération 7 — Paiement / Diapay si applicable

| Élément | Détail |
|---|---|
| Objectifs | Paiement shipment; statut paiement; reçus; webhook |
| Fichiers probables | `routes/payments.js`, `models/Payment.js`, `services/paymentWorkflowService.js`, web/admin payments |
| Endpoints concernés | `/api/payments/create`, `/api/payments/mine`, `/api/v1/admin/payments*` |
| Critères d’acceptation | Créer payer devis/shipment, historique client, dashboard admin, webhook idempotent |
| Tests manuels | Paiement sandbox, échec, succès, callback |
| Risques | Double responsabilité Diamarket vs DiaExpress; ne pas facturer deux fois |
| Livrable documentaire | Matrice paiement livraison |

### Itération 8 — Production

| Élément | Détail |
|---|---|
| Objectifs | Monitoring; logs; tests; backups; checklist Go Live |
| Fichiers probables | CI, docs runbook, logger, metrics, alerting config |
| Endpoints concernés | health, metrics protégées, webhooks |
| Critères d’acceptation | CI green, dashboards, backups testés, secret rotation, rollback |
| Tests manuels | Smoke staging, load minimal, webhook replay, DB restore drill |
| Risques | Observabilité insuffisante; dépendances providers |
| Livrable documentaire | Checklist Go Live DiaExpress |

## 16. Priorités immédiates détaillées

1. **Documenter et figer le contrat Diamarket** : accepter officiellement les 4 endpoints proposés, scopes, headers, payloads, erreurs, mapping statut.
2. **Corriger les lacunes bloquantes sans refonte** : route external-pricing ou suppression UI; alias tracking provider; endpoint payments mine si web le garde.
3. **Valider environnement/build** : exécuter builds, noter erreurs, compléter env examples, éviter pnpm/turbo, préparer staging avec ports séparés.

## 17. Annexes — commandes d’audit utilisées

```bash
find .. -name AGENTS.md -print
rg --files -g '!*node_modules*'
rg -i "diaexpress|livraison|shipping|tracking|diapay|déploiement|deploiement|environment|env" docs apps -g '!**/node_modules/**' -g '!**/.next/**' -g '!**/dist/**' -l
cat package.json apps/diaexpress-api/package.json apps/diaexpress-admin/package.json apps/diaexpress-web/package.json
sed -n '1,240p' apps/diaexpress-api/server.js
rg "router\.|app\.use|requireAuth|requireRole" apps/diaexpress-api/routes -n
find apps/diaexpress-admin/app -path '*page.tsx' -maxdepth 5 -type f | sort
rg "api|fetch|request|/api/" apps/diaexpress-admin app apps/diaexpress-web/src -n
npm --prefix apps/diaexpress-api run build
npm --prefix apps/diaexpress-admin run build
npm --prefix apps/diaexpress-web run build
```
