# DiaExpress — explication technique, fonctionnelle et roadmap

> Audit factuel du code au 14 juin 2026. Le périmètre principal est `apps/diaexpress-api`, `apps/diaexpress-web`, `apps/diaexpress-admin` et leurs configurations. Les états indiquent la maturité observée dans le code, pas une validation métier ou production.

## 1. Résumé exécutif

DiaExpress est un produit logistique permettant de publier des services de transport, estimer puis demander un devis, transformer un devis en expédition, planifier les opérations, suivre un colis et régler un devis via DiaPay. Le code contient déjà une base métier étendue, mais il est dans une phase d'intégration/stabilisation plutôt que prêt pour la production.

| App | Rôle | État observé |
|---|---|---|
| `diaexpress-api` | API Express/MongoDB, auth Clerk-compatible, devis, pricing, expéditions, tracking, opérations et paiements | Riche et testée sur plusieurs domaines, mais contrats hétérogènes, configuration incomplète et quelques surfaces non sécurisées |
| `diaexpress-web` | Site public et espace client Next.js Pages Router | Parcours public/client présents; coexistence de plusieurs générations de composants et appels API cassés/anciens |
| `diaexpress-admin` | Back-office Next.js App Router | Protection admin sérieuse et écrans métiers nombreux; quelques écrans sont génériques, vides ou simulés |

### Ce qui fonctionne déjà dans le code

- Healthchecks, métriques mémoire, connexion MongoDB avec diagnostic, mode dégradé explicite et logs structurés.
- Authentification backend par identité externe/Clerk, synchronisation d'utilisateur MongoDB, rôles `client`, `admin`, `delivery`, clés d'intégration.
- Devis public ou authentifié, estimation, cycle de validation admin, conversion en expédition.
- CRUD pricing, catalogue colis, référentiels logistiques, expéditions, historique de tracking et réservations.
- Paiement DiaPay avec création, callback, synchronisation d'état, modèle local et pistes crypto/custody.
- Admin avec devis, expéditions, pricing, référentiels, utilisateurs, paiements, providers, clés API et santé API.

### Incomplet ou fragile

- `.env.example` API ne documente qu'une petite partie des variables réellement lues (Clerk, admin seed, DiaPay, transporteurs, email, intégrations, crypto, FX absents).
- L'API a plusieurs contrats parallèles et aliases (`/api/admin` et `/api/v1/admin`, anciens statuts, anciennes routes); `routes/api.js` est mort/non monté.
- L'upload `/api/uploads` est public, sans contrôle de type/taille/auth explicite au niveau route; le stockage est local, inadapté aux déploiements éphémères.
- Le callback DiaPay est public comme attendu pour un webhook, mais le secret configuré n'est pas visiblement appliqué dans la route; le webhook crypto est un stub `501`.
- Le frontend contient des appels obsolètes (`/api/shipments/user/:id`, `/api/shipments/quote`) et beaucoup de duplication (`pages`, `src/pages`, `src/views`, composants `.js`/`.jsx`, anciennes vues admin dans le web).
- Aucun vrai logout backend: la session est gérée par Clerk côté clients. Pas de suite de tests pour `diaexpress-web`; scripts admin `test` et API `build/lint/typecheck` sont des placeholders.

### Risques avant production

1. **Sécurité/intégrité paiement et upload**: authentifier les callbacks par signature, vérifier propriété du devis payé, sécuriser les uploads et retirer tout secret local suivi.
2. **Contrats et configuration**: figer une version API, documenter toutes les variables, éliminer les appels obsolètes et valider CORS/Clerk/DiaPay de bout en bout.
3. **Qualité release**: obtenir builds/tests/lint/typecheck reproductibles, tests E2E des parcours critiques, stockage média durable, monitoring et sauvegardes.

## 2. Architecture générale

```text
Navigateur client ── Clerk JWT ──> diaexpress-web :3000 ── HTTP ──┐
                                                                   ├─> diaexpress-api :5000 ──> MongoDB Atlas
Navigateur admin ─── Clerk JWT ──> diaexpress-admin :3001 ── HTTP ─┘          │
                                                                              ├─> DiaPay
                                                                              ├─> CMA CGM / FedEx
                                                                              └─> SMTP / FX / custody crypto
```

Le dépôt racine est un workspace **npm** et utilise Turbo pour certaines commandes. DiaExpress est lancé par `npm run dev:diaexpress` via `scripts/dev.mjs`; le build agrégé est `npm run build:diaexpress`. La roadmap demandée mentionne « suppression pnpm/workspace »: aucun `pnpm` n'est requis par les trois apps auditées, mais le workspace npm racine reste actuellement structurant.

### 2.1 `diaexpress-api`

- **Rôle**: source de vérité métier et persistance MongoDB.
- **Stack**: Node.js CommonJS, Express 5, Mongoose 8, Clerk backend, Axios, Multer, Nodemailer.
- **Port**: `5000` par défaut (`PORT`).
- **Commandes**: `npm run dev`, `npm start`, `npm test`, `npm run seed:admin`, `npm run migrate:payments`; `build`, `lint`, `typecheck` ne font pas de vraie vérification.
- **Variables essentielles**: `MONGODB_URI`, `CORS_ORIGINS`, `CLERK_SECRET_KEY` et paramètres JWT, admin seed, DiaPay, intégrations transporteurs. Voir section 9.
- **Relations**: sert web/admin; appelle DiaPay et des providers externes; peut accepter une clé partenaire pour booking/tracking.

### 2.2 `diaexpress-web`

- **Rôle**: marketing, estimation/devis, tracking public, espace client, adresses, réservations, expéditions et paiements.
- **Stack**: Next.js 14 Pages Router, React 18, Clerk, Axios, Framer Motion, jsPDF/html2canvas, Web3.
- **Port**: `3000`.
- **Commandes**: `npm run dev`, `build`, `start`, `lint`, `typecheck`; `test` est absent fonctionnellement.
- **Variables**: URL API canonique `NEXT_PUBLIC_DIAEXPRESS_API_BASE_URL`, clés/templates Clerk, URL site/admin, flags DiaPay et paramètres réseau.
- **Relations**: consomme l'API; Clerk émet le JWT attendu par l'API; ouvre le parcours DiaPay.

### 2.3 `diaexpress-admin`

- **Rôle**: back-office opérationnel et configuration métier.
- **Stack**: Next.js 14 App Router, React 18, Clerk, composants maison, Vitest/testing-library présents.
- **Port**: `3001`.
- **Commandes**: `npm run dev`, `dev:clean`, `build`, `start`, `lint`, `typecheck`; malgré des tests présents, `npm test` affiche seulement « No tests specified » (utiliser `npx vitest run`).
- **Variables**: URL API, URL admin DiaPay, Clerk public/secret et template JWT, flag DiaPay; fallback bearer uniquement dev.
- **Relations**: vérifie d'abord Clerk puis `/api/users/me`/backend pour confirmer le rôle admin; consomme les routes métier et `/api/v1/admin`.

## 3. DiaExpress API

### 3.1 Structure et fichiers principaux

- `server.js`: CORS, JSON, contexte requête, métriques, rate limit auth/admin, healthchecks, garde MongoDB, montage des routes et bootstrap.
- `config/`: MongoDB, configuration applicative, validation au démarrage, CMA CGM, FedEx, auth.
- `middleware/`: authentification/rôles, synchronisation utilisateur, validation, rate limiting, erreurs, contexte et métriques.
- `controllers/`: orchestration HTTP historique; `src/domains/*/application` introduit une couche métier plus structurée pour quote/network/shipment/tracking/operations.
- `services/`: pricing, shipment, auth/identité, admin seed, DiaPay/paiement, notifications/email, transporteurs, FX et crypto custody.
- `models/`: schémas Mongoose.
- `routes/v1/admin.js` et `routes/v1/public.js`: API versionnée, encore coexistante avec les routes historiques.

### 3.2 Modèles MongoDB

| Modèle | Finalité / données clés |
|---|---|
| `User` | identité Clerk/externe, email, rôle `client/admin/delivery`, profil et préférences |
| `Quote` | route, transport, colis, estimation/prix final, statut, audit, paiement, shipment/tracking |
| `Shipment` | devis source, propriétaire, tracking unique, statut, historique, planification/assignation |
| `Pricing` | corridor, modes, prix/unité, plages dimensions/poids/volume, colis/conteneurs, surcharges, last mile |
| `Payment` | lien quote/user, ID DiaPay, provider/méthode, montants fiat/crypto, compliance et statut |
| `CryptoTransaction` | transaction custody/on-chain et conformité |
| `Address`, `Country`, `MarketPoint` | référentiels client/opérationnels |
| `TransportLine`, `ExpeditionLine`, `Embarkment`, `Expedition`, `Schedule` | réseau, départs, capacité et planification |
| `Reservation` | réservation FCL/LCL, documents et conversion opérationnelle |
| `PackageType` | catalogue et modes autorisés |
| `Notification`, `OperationalException`, `ExternalPricing` | notifications, incidents métier et tarifs providers |

### 3.3 Auth, rôles et sécurité observée

- `requireAuth` valide l'identité, synchronise/crée l'utilisateur MongoDB et attache `req.user`, `req.dbUser`, `req.userId`.
- `requireRole(role)` autorise le rôle demandé et considère toujours `admin` comme supérieur.
- `optionalAuth` permet un devis anonyme; `requireUserOrIntegrationKey` et son optionnel servent partenaires/transporteurs.
- L'admin seed au démarrage et `npm run seed:admin` promeuvent/créent un admin depuis variables d'environnement.
- L'admin Next.js ajoute une double barrière: session Clerk puis rôle retourné par le backend.
- Limites: pas de logout API (normal avec JWT stateless, mais à documenter), upload public, callback paiement à signer, métriques publiques, pas de CSRF nécessaire pour bearer mais CORS doit être strict.

### 3.4 Logique métier

- **Devis/pricing**: l'estimation recherche le pricing compatible route/mode/mesures; le devis sauvegarde une photographie du calcul. Plusieurs statuts modernes et legacy coexistent.
- **Expédition/tracking**: conversion depuis devis, code de tracking unique, transitions et historique; le tracking public agrège le shipment et peut interroger un transporteur.
- **Opérations**: lignes, embarquements, schedules, réservations, capacité et assignation d'un shipment.
- **DiaPay**: création distante puis `Payment` local, mise à jour quote/payment, callback et consultation admin. Le webhook crypto est explicitement non implémenté.
- **Notifications/email**: modèles/services et jobs admin existent; la robustesse de livraison (queue durable/retry provider) reste à finaliser.

### 3.5 Catalogue des endpoints montés

Légende état: **Prêt** = implémentation cohérente observée; **Partiel** = implémenté mais intégration/contrat incomplet; **Sécuriser** = risque avant production; **À documenter** = utile mais contrat non formalisé. Les réponses varient encore entre enveloppes `{data, meta}`, `{items...}` et objets bruts.

#### Santé, public et intégrations

| Method | Endpoint | Auth | Rôle requis | Description | Body attendu | Réponse attendue | État |
|---|---|---|---|---|---|---|---|
| GET | `/health` | Non | — | Liveness simple | — | `{status:"ok"}` | Prêt |
| GET | `/api/health`, `/api/health/live`, `/api/health/ready` | Non | — | Santé détaillée/live/readiness | — | DB/auth/paiement/domaines | Prêt |
| GET | `/api/metrics` | Non | — | Métriques mémoire | — | résumé métriques | Sécuriser |
| GET | `/api/v1/public/services` | Non | — | Catalogue public | query éventuelle | services formatés | Prêt |
| GET | `/api/v1/public/rates` | Non | — | Taux FX publics | query devises | taux formatés | Partiel |
| POST | `/api/bookings` | JWT ou clé intégration | user/partner | Créer booking transporteur | booking/provider | booking normalisé | Partiel |
| GET | `/api/tracking/:trackingCode` | Optionnel JWT/clé | — | Tracking public/provider | — | shipment + événements | Prêt |
| POST | `/api/uploads` | Non | — | Upload image local | multipart fichier | URL/fichier | Sécuriser |

#### Auth, utilisateurs et adresses

| Method | Endpoint | Auth | Rôle requis | Description | Body attendu | Réponse attendue | État |
|---|---|---|---|---|---|---|---|
| POST | `/api/auth/token` | Identifiants/contrat auth | — | Échanger un token auth DiaExpress | token/client selon mode | token/identité | À documenter |
| GET | `/api/auth/me`, `/api/users/me` | JWT | user | Identité/profil courant | — | user + identity | Prêt |
| POST | `/api/auth/sync` | JWT | user | Synchroniser profil | identité | user | Prêt |
| PUT/PATCH | `/api/users/me` | JWT | user | Modifier profil autorisé | profil filtré | user mis à jour | Prêt |
| GET/POST | `/api/addresses` | JWT | user | Lister/créer ses adresses | création: `line1,city,country,...` | adresses/adresse | Prêt |
| GET/PUT/DELETE | `/api/addresses/:id` | JWT | propriétaire | Lire/modifier/supprimer adresse | champs adresse | adresse/confirmation | Prêt |

#### Devis et pricing

| Method | Endpoint | Auth | Rôle requis | Description | Body attendu | Réponse attendue | État |
|---|---|---|---|---|---|---|---|
| POST | `/api/quotes/estimate`, `/api/quotes/estimateQuote` | Non | — | Estimer sans créer | route, transport, poids/volume/dimensions | offres/estimation | Prêt |
| POST | `/api/quotes` | Optionnel | — | Créer demande de devis | route, transport, colis, contact | quote | Prêt |
| GET | `/api/quotes/meta` | Non | — | Métadonnées du wizard | — | origines/destinations/modes/types | Prêt |
| GET | `/api/quotes/me` | JWT | user | Historique devis utilisateur | filtres | devis | Prêt |
| GET | `/api/quotes/:id` | JWT | propriétaire/admin | Détail devis | — | quote | Prêt |
| GET | `/api/quotes`, `/api/quotes/all` | JWT | admin | Tous devis | filtres/pagination | devis | Prêt |
| PATCH | `/api/quotes/:id`, `/api/quotes/:id/status` | JWT | admin | Modifier devis/statut | patch ou `status` | quote | Prêt |
| POST | `/api/quotes/:id/{confirm,reject,dispatch,review,request-info,ready-for-shipment}` | JWT | admin | Transitions devis | note/raison selon action | quote/shipment éventuel | Partiel (aliases/statuts) |
| POST | `/api/quotes/:id/pay` | JWT | user | Initier paiement d'un devis | méthode/options | paiement | Partiel |
| DELETE | `/api/quotes/:id` | JWT | admin | Supprimer devis | — | confirmation | À sécuriser/auditer |
| GET | `/api/pricing/public/routes`, `/api/pricing/routes`, `/api/pricing/locations`, `/api/pricing/warehouses` | Non | — | Référentiels publics pricing | — | routes/lieux/warehouses | Prêt |
| GET | `/api/pricing`, `/api/pricing/meta`, `/api/pricing/:id` | JWT | admin | Lire pricing | filtres | pricing/meta | Prêt |
| POST/PUT/DELETE | `/api/pricing`, `/api/pricing/:id` | JWT | admin | CRUD pricing | règle pricing | pricing/confirmation | Prêt |
| GET | `/api/package-types` | Non | — | Catalogue colis | — | types | Prêt |
| POST/PUT/DELETE | `/api/package-types`, `/api/package-types/:id` | JWT | admin | CRUD type colis | type colis | type/confirmation | Prêt |

#### Shipments, réservations, schedules et opérations

| Method | Endpoint | Auth | Rôle requis | Description | Body attendu | Réponse attendue | État |
|---|---|---|---|---|---|---|---|
| POST | `/api/shipments/from-quote`, `/api/shipments/create-from-quote` | JWT | admin | Convertir devis en shipment | `quoteId` | shipment | Prêt/alias à réduire |
| GET | `/api/shipments/me` | JWT | user | Mes expéditions | filtres | shipments | Prêt |
| GET | `/api/shipments` | JWT | admin | Toutes expéditions | filtres | shipments | Prêt |
| GET | `/api/shipments/:shipmentId` | JWT | propriétaire/admin | Détail shipment | — | shipment | Prêt |
| PATCH | `/api/shipments/:id/status` | JWT | admin | Transition statut | `status`, lieu/note éventuels | shipment | Prêt |
| POST | `/api/shipments/:id/history` | JWT | admin | Ajouter événement tracking | statut, lieu, note | shipment | Prêt |
| PATCH | `/api/shipments/:id/assign-embarkment`, `/assign-operation` | JWT | admin | Affecter opération | embarkment/schedule | shipment | Prêt/alias à réduire |
| DELETE | `/api/shipments/:id` | JWT | admin | Supprimer shipment | — | confirmation | À sécuriser/auditer |
| POST/GET | `/api/reservations`, `/api/reservations/me` | JWT | user | Créer/lister réservations | réservation FCL/LCL | réservation(s) | Prêt |
| GET/PATCH | `/api/reservations`, `/api/reservations/:id/status` | JWT | admin | Lister/transitionner | statut/raison | réservation(s) | Prêt |
| POST | `/api/reservations/:id/documents` | JWT | user | Ajouter document | type + URL | réservation | Partiel (ownership/storage) |
| GET | `/api/schedules`, `/api/schedules/public`, `/api/schedules/available/route` | Non | — | Planning public | route/filtres | schedules | Prêt |
| POST/PATCH/DELETE | `/api/schedules`, `/api/schedules/:id` | JWT | admin | CRUD schedules | schedule | schedule/confirmation | Prêt |
| GET/POST | `/api/expeditions`, `/api/expeditions/transport-lines` | JWT | admin | Lister/créer expéditions/lignes | ressource | ressource(s) | Prêt |
| GET/PUT/DELETE | `/api/expeditions/:id`, `/api/expeditions/transport-lines/:id` | JWT | admin | Détail/édition/suppression | patch | ressource | Prêt |
| GET | `/api/expeditions/transport-lines/meta` | JWT | admin | Métadonnées lignes | — | meta | Prêt |

#### Admin legacy/logistique et admin v1

| Method | Endpoint | Auth | Rôle requis | Description | Body attendu | Réponse attendue | État |
|---|---|---|---|---|---|---|---|
| GET/PATCH/POST | `/api/admin/quotes/*` | JWT | admin | Liste, édition et transitions devis | selon action | quote(s) | Partiel: duplique `/api/quotes` |
| CRUD | `/api/admin/market-points/*` | JWT | admin | Gestion points réseau | market point | ressource(s) | Prêt |
| CRUD | `/api/admin/{countries,expedition-lines,embarkments,addresses}/*` | JWT | admin | Référentiels logistiques | ressource | ressource(s) | Prêt |
| GET | `/api/v1/admin/payments`, `/summary`, `/:id`, `/:id/events` | JWT | admin | Supervision paiements | filtres | paiement(s)/événements | Prêt |
| GET | `/api/v1/admin/notifications/jobs`, `/:jobId` | JWT | admin | Jobs notifications | filtres | jobs | Partiel |
| GET/POST/PATCH/DELETE | `/api/v1/admin/providers/configs/*`; GET `/providers`, `/providers/errors` | JWT | admin | Providers/configs/erreurs | config | ressources | Partiel |
| GET/POST/PATCH/DELETE | `/api/v1/admin/api-keys/*` | JWT | admin | Clés partenaires | clé/config | ressources | Prêt, à durcir |
| GET/POST/PATCH/DELETE | `/api/v1/admin/users/*` | JWT | admin | Gestion utilisateurs | profil/rôle | user(s) | Prêt, à auditer |
| GET/PATCH | `/api/v1/admin/operations/reservations*` | JWT | admin | Pilotage réservations | statut/raison | réservations | Prêt |
| GET | `/api/v1/admin/operations/schedules`, `/operations/shipments` | JWT | admin | Vues planning | filtres | items | Prêt |
| PATCH | `/api/v1/admin/operations/shipments/:id/assign` | JWT | admin | Affectation opérationnelle | schedule/embarkment | shipment | Prêt |

Toutes les routes `/api/v1/admin/*` sont aussi montées sous `/api/admin/*`, ce qui crée des collisions/aliases avec les routes admin historiques. `routes/api.js` contient d'autres anciennes routes, mais **n'est pas monté dans `server.js`** et ne constitue donc pas une API disponible.

#### Paiements

| Method | Endpoint | Auth | Rôle requis | Description | Body attendu | Réponse attendue | État |
|---|---|---|---|---|---|---|---|
| POST | `/api/payments/create` | JWT | user | Créer paiement DiaPay/crypto | `quoteId`, devise, méthode, URLs, metadata | payment + réponse provider | Partiel |
| GET | `/api/payments/mine` | JWT | user | Mes paiements | — | paiements | Prêt |
| POST | `/api/payments/callbacks/diapay` | Non (webhook) | DiaPay | Réconcilier état | événement/ID/statut | accusé + mise à jour | Sécuriser signature/idempotence |
| POST | `/api/payments/webhook/crypto` | Non | provider | Webhook crypto | événement | `501` | À créer |

## 4. DiaExpress Web

### Pages et composants

- **Public**: `/`, `/about`, `/services`, `/contact`, `/delivery`, `/track-shipment`.
- **Devis**: ancien `/quote-request` et nouveau flow multi-pages `/quote-request/start|route|transport|cargo|estimate|details|review|success`.
- **Client**: `/client`, `/quotes`, `/mes-colis`, `/shipments`, `/shipment/[id]/confirm`, `/new-shipment/[quoteId]`, `/profile/addresses`, réservations, `/payments`.
- **Architecture UI**: composants marketing, primitives, états loading/error/empty/success, design tokens et styles responsive existent; toutefois les générations sont dupliquées et le mélange français/anglais nuit à la cohérence.

### Parcours client attendu et état

1. **Visite**: landing et pages marketing présentes, SEO helper présent.
2. **Estimation/devis**: wizard détaillé, métadonnées API, calcul volume et sélection offre; coexistence de deux flows à consolider.
3. **Création compte/connexion**: ClerkProvider présent; pages Clerk dédiées absentes du web, l'expérience dépend des composants/redirects Clerk et doit être testée.
4. **Demande d'expédition**: conversion pilotée principalement par admin; pages de confirmation côté client présentes, contrat à vérifier.
5. **Suivi colis**: recherche publique et timeline présentes.
6. **Paiement**: page/dialogue et flag DiaPay présents; dépend du backend/configuration.
7. **Historique**: devis, colis, expéditions, paiements/adresses présents.

### Insuffisances web

- Duplication massive entre `pages/`, `src/pages/`, `src/views/`, anciennes vues admin et composants `.js`/`.jsx`.
- Quelques helpers appellent des endpoints inexistants; les tests E2E/RTL sont absents.
- `src/utils/sendEmails.js` lit des secrets email dans du code frontend: même si non utilisé/bundlé selon imports, cette responsabilité doit rester uniquement backend.
- Web3 est lourd et peut être inutile si le paiement crypto passe par DiaPay/custody backend.
- Responsive/design tokens existent mais doivent être validés sur appareils; états et langues sont incohérents entre flows.

## 5. DiaExpress Admin

### Pages et capacités

- **Dashboard** `/admin`: vue d'ensemble, à valider comme KPI réel.
- **Devis**: liste, pending, détail, création, actions/transitions.
- **Shipments/tracking**: listes, détail, filtres, statut, historique, affectation et recherche tracking.
- **Pricing/catalogue/réseau**: pricing, package types, countries, addresses, market points, transport/expedition lines, embarkments.
- **Utilisateurs et accès**: users, admin-users, API keys.
- **Paiements/intégrations**: liste/détail paiements, providers, jobs, santé API, settings.
- **CMS**: écran basé sur `mockPages`, donc non fonctionnel comme CMS réel.

### Protection et permissions

Le middleware Clerk s'active seulement si la configuration est complète. Le layout `/admin` exige ensuite un `userId` Clerk puis appelle le backend pour vérifier que l'utilisateur synchronisé a réellement le rôle admin. Le backend protège à nouveau les routes par `requireAuth + requireRole('admin')`. C'est une bonne défense en profondeur; la whitelist/seed et les templates JWT doivent cependant être correctement configurés.

### Parcours admin attendu et état

1. Connexion admin Clerk: présent, avec pages d'erreur explicites.
2. Dashboard: présent mais KPI à professionnaliser.
3. Consultation/traitement devis: présent.
4. Validation et conversion en shipment: présent.
5. Modification statut/timeline/affectation: présent.
6. Configuration pricing/réseau: présente.
7. Suivi paiements/providers/jobs: présent, dépend de DiaPay.
8. Gestion utilisateurs/rôles/clés: présente, à auditer finement.

Manquent surtout les livreurs comme workflow dédié, un vrai CMS/médias, exports CSV/PDF, audit log admin complet et une suite de tests raccordée à `npm test`.

## 6. Fonctionnalités existantes

| Fonctionnalité | Présente | Partielle | Manquante | Commentaire |
|---|:---:|:---:|:---:|---|
| Login / register | ✓ | | | Délégué à Clerk; synchronisation backend |
| Logout | | ✓ | | Clerk côté client, pas documenté/testé de bout en bout |
| Protection admin | ✓ | | | Double contrôle frontend/backend |
| Seed admin `.env` | ✓ | | | Code présent, variables absentes du `.env.example` API |
| Devis | ✓ | | | Public/auth/admin, transitions nombreuses |
| Calcul prix | ✓ | | | Service et tests présents; règles complexes à valider métier |
| Pricing admin | ✓ | | | CRUD et UI riches |
| Expéditions | ✓ | | | Conversion, statuts, opérations |
| Tracking public | ✓ | | | Interne/provider, sécurité anti-énumération à considérer |
| Historique utilisateur | ✓ | | | devis/shipments/paiements |
| Gestion utilisateurs | ✓ | | | admin v1 |
| Gestion média | | ✓ | | upload local public; CMS mock |
| Paiement DiaPay | | ✓ | | création/callback/admin; signature/idempotence à durcir |
| Crypto paiement | | ✓ | | modèles/providers; webhook `501` |
| Notifications | | ✓ | | service/jobs/modèle, fiabilité delivery à confirmer |
| Emails | | ✓ | | Nodemailer simple, variables non documentées |
| Logs | ✓ | | | structurés + contexte; destination/retention à prévoir |
| Healthcheck | ✓ | | | live/ready/détaillé |
| Tests | | ✓ | | API riche, admin tests non raccordés, web absent |
| Déploiement Render/Vercel | | ✓ | | Dockerfiles et Vercel présents; pas de manifeste Render observé |
| Variables `.env` | | ✓ | | exemples incomplets/incohérents de scope |
| Gestion livreurs | | | ✓ | rôle `delivery` existe sans workflow/UI dédié |

## 7. Insuffisances et risques

### Critique

- **Webhook/callback paiement**: exiger signature `DIAPAY_WEBHOOK_SECRET`, protection replay, idempotency key et journal immuable avant mouvement financier.
- **Autorisation paiement**: confirmer explicitement que seul le propriétaire/admin peut payer le `quoteId`; ne pas se contenter de l'existence du devis.
- **Upload public/local**: auth, validation MIME réelle, taille, antivirus, noms sûrs, stockage objet et URLs signées.
- **Secrets/configuration**: `.env.example` API omet presque tous les paramètres sensibles requis; un fichier `.env` existe dans le dossier API et doit rester strictement hors Git/rotation si exposé.

### Important

- Contrats multiples, collisions `/api/admin`, aliases et statuts legacy compliquent clients, sécurité et migrations.
- CORS devient permissif (`origin: true`) quand `CORS_ORIGINS` est vide; interdire ce fallback en production.
- MongoDB Atlas est obligatoire par défaut, mais index/migrations/backups/monitoring ne sont pas industrialisés.
- Pas de tests E2E auth → devis → conversion → tracking → paiement; web sans tests.
- `diaexpress-web` appelle certains endpoints inexistants; erreurs runtime probables sur anciennes vues.
- Stockage upload local perdu sur conteneur/Vercel; `/uploads` relatif au cwd.
- Validation des bodies inégale et réponse HTTP non uniforme.

### Moyen

- Duplication considérable web/admin et dépendances potentiellement inutiles (`web3`, vues admin historiques).
- `npm test` admin n'exécute pas les tests; API build/lint/typecheck ne vérifient rien.
- Notifications/email sans queue durable clairement opérée; pas de SMS/push réel visible.
- Métriques publiques, sans authentification/export Prometheus; logs sans stratégie de rétention.
- Tracking public peut permettre l'énumération si codes prévisibles ou fuites de données; minimiser le payload public.
- UX bilingue et plusieurs wizards de devis; états vides/erreurs cohérents seulement sur une partie de l'app.

### Faible

- README/env mentionnent encore `client`/`adminv2`, signe de renommages incomplets.
- Routes/fichiers à casse atypique (`Schedules.js`, `PackageTypeController.js`) et contrôleur `reservationController` sans extension, fragiles selon OS/outillage.
- Pas de documentation OpenAPI unifiée pour DiaExpress.

## 8. Roadmap de futures itérations

### Itération 1 — Stabilisation technique

**Objectif**: npm uniquement; build web/admin/api OK; supprimer les références pnpm inutiles tout en décidant explicitement du sort du workspace npm; `.env.example` complet; docs installation; healthcheck API; CORS strict.

**Livrables/acceptation**: CI exécute install/build/lint/typecheck/tests; aucun appel frontend vers route inexistante; matrice variables par environnement; `/api/health/ready` pilote le déploiement.

### Itération 2 — Auth & rôles

**Objectif**: login/register/logout; protection admin; seed admin via `.env`; rôles user/admin/livreur si nécessaire; middleware auth; permissions routes.

**Livrables/acceptation**: matrice RBAC endpoint par endpoint; tests ownership; parcours Clerk E2E; aucune whitelist implicite; procédure de promotion/révocation admin.

### Itération 3 — Devis & pricing

**Objectif**: calcul prix fiable; pricing admin; règles poids/volume/destination/transport; devis public; sauvegarde devis; conversion devis en expédition.

**Livrables/acceptation**: contrat canonique versionné, statuts legacy migrés, tests de limites/règles, snapshot du pricing et validation métier signée.

### Itération 4 — Expéditions & tracking

**Objectif**: création shipment; statuts colis; tracking public; historique client; timeline admin; notifications statut.

**Livrables/acceptation**: machine d'état unique, événements auditables, payload public minimisé, intégrations transporteurs résilientes, notifications testées.

### Itération 5 — Paiement Diapay

**Objectif**: checkout; statut paiement; webhook; idempotence; facture/reçu; paiement d'expédition ou devis.

**Livrables/acceptation**: signature/replay/idempotence, ownership, rapprochement automatique, reçus, tests sandbox et procédure incident/remboursement.

### Itération 6 — Admin professionnel

**Objectif**: dashboard KPI; gestion devis; expéditions; pricing; clients; livreurs; logs admin; exports CSV/PDF.

**Livrables/acceptation**: audit trail immuable, permissions fines, KPI issus de données réelles, exports sécurisés et suppression des écrans mock.

### Itération 7 — UX/UI production

**Objectif**: site public professionnel; responsive; design system; formulaires fluides; loading/error/empty states; espace client; tracking clair.

**Livrables/acceptation**: un seul flow devis, accessibilité, tests mobiles, cohérence linguistique, analytics consentis et performances mesurées.

### Itération 8 — Production & monitoring

**Objectif**: CI/CD; logs structurés; monitoring; backups; sécurité; documentation; checklist go-live.

**Livrables/acceptation**: SLO/alertes, sauvegarde/restauration testée, scan dépendances/secrets, stockage objet, runbooks, OpenAPI et revue go-live.

## 9. Documentation technique

### Installation et lancement local

Prérequis: version Node compatible Next 14/Express 5, npm, MongoDB Atlas ou Mongo local explicitement autorisé, projet Clerk; DiaPay/transporteurs optionnels pour les flows correspondants.

```bash
# depuis la racine
npm install
cp apps/diaexpress-api/.env.example apps/diaexpress-api/.env
cp apps/diaexpress-web/.env.example apps/diaexpress-web/.env.local
cp apps/diaexpress-admin/.env.example apps/diaexpress-admin/.env.local

npm run dev:diaexpress
# ou séparément
npm --prefix apps/diaexpress-api run dev      # :5000
npm --prefix apps/diaexpress-web run dev      # :3000
npm --prefix apps/diaexpress-admin run dev    # :3001
```

Vérification: `curl http://localhost:5000/health` puis `curl http://localhost:5000/api/health/ready`.

### Variables nécessaires

| Groupe | Variables réellement lues / recommandées |
|---|---|
| API minimale | `NODE_ENV`, `PORT`, `MONGODB_URI`, `CORS_ORIGINS`, `ALLOW_DEGRADED_MODE` (false en prod) |
| Mongo tuning | `MONGODB_LOCAL_URI`, `MONGODB_ALLOW_LOCAL_FALLBACK`, timeouts et tailles pool `MONGODB_*` |
| Auth Clerk | `CLERK_SECRET_KEY`, issuer/audience/authorized parties/template; paramètres `DIAEXPRESS_AUTH_*` selon mode |
| Admin seed | `ADMIN_SEED_EMAIL`, `ADMIN_SEED_CLERK_ID`/`EXTERNAL_ID`, `ADMIN_SEED_NAME`; aliases `ADMIN_DEFAULT_*` |
| DiaPay | `ENABLE_DIAPAY`, `DIAPAY_API_URL`/`DIAPAY_BASE_URL`, `DIAPAY_API_KEY` ou bearer, timeout, `DIAPAY_WEBHOOK_SECRET` |
| Intégrations | `INTEGRATION_API_KEYS`, variables `CMACGM_*`, `FEDEX_*` |
| Crypto/compliance | `FIREBLOCKS_*`, `COINBASE_COMMERCE_*`, `AML_*`, `TRAVEL_RULE_THRESHOLD` |
| Notifications/FX | `EMAIL_USER`, `EMAIL_PASS`, `FX_PROVIDER_*`, `FX_*` |
| Web | `NEXT_PUBLIC_DIAEXPRESS_API_BASE_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_ADMIN_APP_URL`, Clerk public/template, DiaPay flags |
| Admin | `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_ADMIN_API_BASE_URL`, Clerk public/secret/template, DiaPay URL/flag; bearer fallback uniquement dev |

**Action obligatoire**: enrichir `apps/diaexpress-api/.env.example`; sa version actuelle ne couvre que Mongo/CORS/port.

### Commandes de contrôle recommandées

```bash
npm run build:diaexpress
npm --prefix apps/diaexpress-api test
npm --prefix apps/diaexpress-web run typecheck
npm --prefix apps/diaexpress-web run build
npm --prefix apps/diaexpress-admin run typecheck
npm --prefix apps/diaexpress-admin run build
npx vitest run --config apps/diaexpress-admin/vitest.config.ts
```

### Stratégie de déploiement

- **API**: conteneur/service long-running (Render ou équivalent), healthcheck `/api/health/ready`, Atlas privé/allowlist, secrets gérés par plateforme, stockage média objet externe.
- **Web/Admin**: Vercel via les `vercel.json`, variables séparées preview/prod et CORS API limité aux domaines exacts.
- **Release**: migrations/index Mongo avant trafic, tests smoke, callbacks DiaPay pointant vers API publique signée, providers en sandbox avant activation.
- **Observabilité**: centraliser logs structurés, exporter métriques, alertes sur readiness, taux erreurs auth/paiement/provider et sauvegardes Atlas.

## 10. Contraintes respectées

Cet audit ne refond ni ne supprime de fonctionnalité. Il documente l'état observé et signale les erreurs/risques. Aucun comportement applicatif n'est modifié par ce ticket.

## 11. Conclusion et prochaine étape

### Principales conclusions

- DiaExpress dispose d'une base fonctionnelle plus avancée qu'un prototype: domaines logistiques, back-office, sécurité admin et paiements sont déjà matérialisés.
- La dette principale n'est pas l'absence de fonctionnalités, mais la coexistence de versions/aliases, la configuration lacunaire, les anciennes vues et le manque de validation E2E.
- Le produit ne doit pas passer en production avant sécurisation paiement/upload, stabilisation des contrats et pipeline de qualité reproductible.

### Trois premières priorités

1. **Sécuriser** DiaPay/webhooks, ownership et uploads/secrets.
2. **Stabiliser** le contrat API canonique, les variables d'environnement et tous les builds/appels frontend.
3. **Tester de bout en bout** auth → devis → expédition → tracking → paiement, avec CI/CD et observabilité.

### Prochaine branche recommandée

`chore/diaexpress-stabilization-iteration-1`

Cette branche doit rester ciblée sur l'itération 1: configuration, contrats cassés, commandes de qualité, CORS/healthcheck et documentation d'installation, sans refonte visuelle ni nouvelle fonctionnalité métier.
