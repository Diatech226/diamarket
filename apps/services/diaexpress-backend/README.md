# DiaExpress Backend (Express + Mongo)

## Setup local

### Prérequis
- Node.js 18+
- MongoDB accessible (local ou distant)

### Installation
```bash
cd /workspace/diaexpress_backend
npm install
```

> Recommandé: installer depuis la racine monorepo pour garder les versions alignées entre backend/admin/client.

### Variables d’environnement
Copiez `.env.example` en `.env` et complétez les valeurs.

> Important (monorepo): ce backend charge explicitement **uniquement** `services/diaexpress-backend/.env`.
> Il ne lit pas le `.env` racine comme source de vérité.
> Référence code: `config/appConfig.js` appelle `dotenv.config({ path: services/diaexpress-backend/.env })`.

| Variable | Description | Défaut |
| --- | --- | --- |
| `PORT` | Port HTTP du serveur | `5000` |
| `MONGODB_URI` | URI MongoDB primaire **requise**, `mongodb://` ou `mongodb+srv://`, avec nom de base (`/diaexpress`, `/test`, etc.) | — |
| `MONGODB_LOCAL_URI` | URI MongoDB locale fallback optionnelle ; doit être `mongodb://`, jamais `mongodb+srv://` | — |
| `MONGODB_ALLOW_LOCAL_FALLBACK` | Autorise le fallback local seulement si `true` et `MONGODB_LOCAL_URI` est valide | `false` |
| `ALLOW_DEGRADED_MODE` | Autorise explicitement un démarrage sans MongoDB ; laisser `false` hors dépannage UI temporaire | `false` |
| `BACKEND_URL` | URL backend utilisée par les apps web | `http://localhost:5000` |
| `ADMIN_API_BASE_URL` | URL API admin canonique | `http://localhost:5000/api/v1/admin` |
| `CORS_ORIGINS` | Origines CORS séparées par des virgules | — |
| `REQUEST_LOGGING` | Active les logs de requêtes | `true` |
| `ENABLE_QUOTE_ESTIMATION_PROBE` | Active le probe d’estimation | `false` |
| `NEXT_PUBLIC_ENABLE_DIAPAY` | Active diaPay (true/false) | `true` (désactiver explicitement avec `false`) |
| `ENABLE_DIAPAY` | Active diaPay côté backend (prioritaire) | idem |
| `DIAPAY_BASE_URL` | Base URL diaPay | — |
| `DIAPAY_WEBHOOK_SECRET` | Secret webhook diaPay | — |
| `DIAPAY_API_URL` | URL API diaPay | — |
| `DIAPAY_API_TIMEOUT` | Timeout API diaPay (ms) | — |
| `DIAPAY_API_KEY` | API key diaPay | — |
| `DIAPAY_BEARER_TOKEN` | Bearer token diaPay | — |
| `CLERK_SECRET_KEY` | Secret Clerk | — |
| `CLERK_JWT_ISSUER` | Issuer JWT Clerk | — |
| `CLERK_JWT_AUDIENCE` | Audience JWT Clerk | — |
| `CLERK_JWT_TEMPLATE` | Template JWT Clerk | — |
| `DIAEXPRESS_AUTH_MODE` | Mode auth interne | — |
| `DIAEXPRESS_AUTH_TOKENS` | Tokens internes | — |
| `DIAEXPRESS_AUTH_CLIENTS` | Clients OAuth internes | — |
| `ADMIN_DEFAULT_EMAIL` | Email admin seed | — |
| `ADMIN_DEFAULT_PASSWORD` | Password admin seed | — |
| `ADMIN_WHITELIST` | Emails admin whitelistes | — |
| `EMAIL_USER` | SMTP user | — |
| `EMAIL_PASS` | SMTP pass | — |
| `CMACGM_MODE` | Mode CMA CGM | — |
| `FEDEX_MODE` | Mode FedEx | — |
| `INTEGRATION_API_KEYS` | API keys d’intégrations | — |

### Lancer le serveur
```bash
npm run dev
```
Le serveur démarre par défaut sur le port **5000**.

Au démarrage, le backend valide `MONGODB_URI` (primaire, requis) puis tente la connexion MongoDB. Par défaut, si MongoDB est indisponible, le processus échoue avant d'écouter le port HTTP.

Règles importantes :
- `ALLOW_DEGRADED_MODE` est `false` si absent ; seul `ALLOW_DEGRADED_MODE=true` autorise temporairement un démarrage sans DB avec réponses API `503 DB_UNAVAILABLE`.
- `MONGODB_LOCAL_URI` est optionnel mais, s'il est défini, il doit être local (`mongodb://...`) ; une URI Atlas `mongodb+srv://...` y est rejetée.
- `MONGODB_ALLOW_LOCAL_FALLBACK` est `false` si absent ; le fallback local n'est tenté que si cette variable vaut explicitement `true` et si `MONGODB_LOCAL_URI` est valide.

Configurations recommandées :
- **Atlas only** : définissez `MONGODB_URI=mongodb+srv://.../diaexpress?...` et laissez `MONGODB_ALLOW_LOCAL_FALLBACK=false`.
- **Atlas + fallback local explicite** : définissez un `MONGODB_URI` Atlas valide, `MONGODB_LOCAL_URI=mongodb://127.0.0.1:27017/diaexpress`, puis `MONGODB_ALLOW_LOCAL_FALLBACK=true`.
- **Local primaire** : utilisez une URI locale dans `MONGODB_URI` (ex. `mongodb://127.0.0.1:27017/diaexpress`) plutôt que de laisser `MONGODB_URI` vide.

## MongoDB connectivity (Atlas + local)

### Démarrer MongoDB local (instructions exactes)

#### Option A — Docker (recommandé, cross-platform)
```bash
docker run --name diaexpress-mongo -d -p 27017:27017 -v diaexpress-mongo-data:/data/db mongo:7
```
Vérifier que MongoDB répond:
```bash
docker logs --tail 30 diaexpress-mongo
```
Arrêter / redémarrer:
```bash
docker stop diaexpress-mongo
docker start diaexpress-mongo
```

#### Option B — service local (sans Docker)
- **macOS (Homebrew)**
  ```bash
  brew tap mongodb/brew
  brew install mongodb-community@7.0
  brew services start mongodb-community@7.0
  ```
- **Ubuntu/Debian (systemd)**
  ```bash
  sudo systemctl enable mongod
  sudo systemctl start mongod
  sudo systemctl status mongod
  ```

#### Vérifier la connexion locale
```bash
mongosh "mongodb://127.0.0.1:27017/diaexpress" --eval "db.runCommand({ ping: 1 })"
```
Attendu: `ok: 1`.

### Utiliser MongoDB local
1. Lancer MongoDB en local (par défaut sur `127.0.0.1:27017`).
2. Pour utiliser local comme base primaire, définir dans `.env` :
   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017/diaexpress
   MONGODB_ALLOW_LOCAL_FALLBACK=false
   ALLOW_DEGRADED_MODE=false
   ```
3. Pour l'utiliser uniquement en fallback d'Atlas, garder `MONGODB_URI` sur Atlas, définir `MONGODB_LOCAL_URI=mongodb://127.0.0.1:27017/diaexpress`, puis activer explicitement `MONGODB_ALLOW_LOCAL_FALLBACK=true`.

### Utiliser MongoDB Atlas
1. Dans Atlas, copier **exactement** la connection string SRV de votre cluster.
2. Définir dans `.env` une URI complète avec **database name** :
   ```env
   MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.wxdxz04.mongodb.net/diaexpress?retryWrites=true&w=majority&appName=Cluster0
   ```
3. Points obligatoires :
   - le host doit correspondre exactement au host Atlas (`*.mongodb.net`) ;
   - le nom de base (`/diaexpress`) ne doit pas être omis ;
   - si le password contient `@`, `:`, `/`, `?`, `%`, etc., il doit être URL-encodé ;
   - l'IP de la machine appelante doit être autorisée dans Atlas **Network Access / IP Access List**.

Exemple de password URL-encodé (`p@ss:w/rd` -> `p%40ss%3Aw%2Frd`) :
```env
MONGODB_URI=mongodb+srv://app_user:p%40ss%3Aw%2Frd@cluster0.wxdxz04.mongodb.net/diaexpress?retryWrites=true&w=majority&appName=Cluster0
```

### Basculer entre `MONGODB_URI` et `MONGODB_LOCAL_URI`
- **Priorité**: `MONGODB_URI` est requis et tenté en premier seulement s'il est valide.
- **Fallback explicite**: si Atlas échoue, le backend tente `MONGODB_LOCAL_URI` **uniquement si** `MONGODB_ALLOW_LOCAL_FALLBACK=true` et `MONGODB_LOCAL_URI` est défini/valide.
- **Forcer local**: mettre l'URI locale directement dans `MONGODB_URI` (`mongodb://127.0.0.1:27017/diaexpress`).
- **Mode dégradé**: désactivé par défaut. Si `ALLOW_DEGRADED_MODE=true` est explicitement défini, le serveur peut écouter sans DB et les routes API renvoient `503 DB_UNAVAILABLE`.
- **Comportement startup attendu**:
  - URI Atlas valide + DB joignable → log de connexion réussie via `MONGODB_URI` ;
  - URI Atlas invalide → rejet de l'URI avec message d'action, pas d'écoute HTTP sauf configuration explicitement dégradée ;
  - Atlas indisponible + fallback désactivé/indisponible → arrêt du processus par défaut.

### Vérifier l'état via health endpoints
- `GET /health`
- `GET /api/health`

Réponse JSON (exemple uniquement si `ALLOW_DEGRADED_MODE=true` a été activé explicitement) :
```json
{
  "ok": false,
  "service": "diaexpress-backend",
  "db": {
    "connected": false,
    "source": "none",
    "error": {
      "code": "ENOTFOUND"
    }
  },
  "degradedMode": true,
  "timestamp": "2026-04-07T00:00:00.000Z"
}
```

### Seed admin
```bash
npm run seed:admin
```
Le seed est idempotent et crée/met à jour un compte admin basé sur `ADMIN_DEFAULT_EMAIL`.
Le seed n'écrit plus `updatedAt` dans `$setOnInsert` (timestamp géré par Mongoose) pour éviter l'erreur `Updating the path 'updatedAt' would create a conflict at 'updatedAt'`.

## Auth & rôles

- **DiaExpress Auth** : tokens internes via `DIAEXPRESS_AUTH_TOKENS` / `DIAEXPRESS_AUTH_CLIENTS` (Bearer). Les routes utilisent `requireAuth` et `requireRole`.
- **Clerk JWT** : si aucun token interne, un JWT Clerk est vérifié et ses roles/metadata alimentent l’identité.
- **Source de vérité rôle** : `User.role` (`client`, `admin`, `delivery`), mis à jour via `syncUserFromIdentity`.

Pour le détail complet, voir `docs/security-audit.md`.


### Règle admin CMS (email prioritaire)

- Le backend ne contient plus de fallback hardcodé d'email admin.
- Promotion admin par email possible uniquement via configuration explicite:
  - `ADMIN_WHITELIST` (liste CSV)
  - `CMS_ADMIN_EMAIL` ou `ADMIN_DEFAULT_EMAIL` (optionnel, unitaire)
- Lors de chaque sync/login (`syncUserFromIdentity`), un email matching la politique ci-dessus est promu `User.role = admin`.
- Cette promotion est **idempotente**: un utilisateur existant avec un autre rôle est automatiquement promu admin au prochain sync.

### Protection CMS/admin côté API

Toutes les routes CMS/admin doivent appliquer:
- `requireAuth` (non connecté => `401`)
- `requireRole('admin')` (connecté non-admin => `403`)

Routes principales concernées:
- `/api/admin/*`
- `/api/v1/admin/*`
- `/api/admin/quotes/*`
- `/api/admin/market-points/*`

### Changer la règle admin plus tard

1. Mettre à jour `ADMIN_WHITELIST` / `CMS_ADMIN_EMAIL` / `ADMIN_DEFAULT_EMAIL`.
2. Aligner les variables côté frontend CMS (`NEXT_PUBLIC_CMS_ADMIN_EMAIL` si utilisé).
3. Redéployer backend + frontend.
4. Vérifier le résultat via `GET /api/users/me` avec un token du compte ciblé.


## Endpoints

- **Résumé** : routes publiques (estimation devis, tracking), routes utilisateur (quotes/shipments/addresses), routes admin (pricing, expeditions, admin quotes, users).
- **Documentation** : `docs/security-audit.md` contient la table “Endpoint / Méthode / Auth / Rôle / UI / Notes”.

## Troubleshooting

- **`ENOTFOUND _mongodb._tcp.<cluster>.mongodb.net`**  
  Cause: hostname Atlas invalide ou faute de frappe DNS.  
  Action: recopier exactement le host Atlas depuis l'UI Atlas dans `MONGODB_URI`.

- **`Atlas hostname "... is invalid"` / host Atlas refusé avant connexion**  
  Cause: `MONGODB_URI` SRV n'utilise pas un host Atlas valide (doit finir par `.mongodb.net`).  
  Action: corriger le host SRV Atlas dans `MONGODB_URI` (ex: `cluster0.wxdxz04.mongodb.net`).

- **`ECONNREFUSED 127.0.0.1:27017`**  
  Cause: MongoDB local non démarré (ou URI locale incorrecte).  
  Action: démarrer MongoDB local, ou corriger `MONGODB_LOCAL_URI`.

- **Authentication failed / bad auth**  
  Cause: identifiants invalides ou password non URL-encodé.  
  Action: vérifier username/password Atlas et URL-encoder les caractères spéciaux du password.

- **Atlas IP access list error (whitelist / not in IP Access List)**  
  Cause: l'IP de la machine n'est pas autorisée dans Atlas.  
  Action: ajouter l'IP (ou plage) dans Atlas Network Access puis réessayer.

- **Missing database name in URI**  
  Cause: URI SRV sans `/database` (ex: `...mongodb.net/?...`).  
  Action: ajouter explicitement le nom de base (ex: `/diaexpress`) dans `MONGODB_URI`.

- **Malformed URI / `URI must start with mongodb:// or mongodb+srv://`**  
  Cause: URI invalide ou schéma absent.  
  Action: corriger le format URI complet ; le backend rejette les URI invalides et échoue au démarrage par défaut.

- **`MONGODB_LOCAL_URI must be a local mongodb:// URI. Use MONGODB_URI for Atlas.`**
  Cause: `MONGODB_LOCAL_URI` contient une URI Atlas/SRV (`mongodb+srv://`).
  Action: déplacer l'URI Atlas dans `MONGODB_URI` et réserver `MONGODB_LOCAL_URI` à une URI locale `mongodb://...`.

- **`MONGODB_URI` absent**  
  Cause: variable primaire non définie.  
  Action: définir `MONGODB_URI` avec un nom de base (`/diaexpress`, `/test`, etc.). Pour local, utilisez `mongodb://127.0.0.1:27017/diaexpress` dans `MONGODB_URI`.

- **`503 DB_UNAVAILABLE` / mode dégradé explicite**
  Cause: aucune connexion MongoDB disponible et `ALLOW_DEGRADED_MODE=true` a été défini explicitement.
  Action: restaurer une connexion DB, remettre `ALLOW_DEGRADED_MODE=false`, puis vérifier `GET /api/health` (`ok=true`, `degradedMode=false`).

- **Conflit update Mongo (`lastSyncedAt` / `updatedAt`)**
  Cause: conflit de chemins dans une commande d'upsert Mongo.
  Action: mettre à jour vers cette itération (retry défensif côté `syncUserFromIdentity`).

- **diaPay indisponible** : en dev, vous pouvez définir `NEXT_PUBLIC_ENABLE_DIAPAY=false` pour désactiver les fonctionnalités de paiement.
- **E11000 duplicate key** : vérifiez que l’email ou le clerkUserId n’existe pas déjà; exécutez le seed admin de façon idempotente.
- **Indexes** : `email` est unique, `clerkUserId`/`externalId` sont `sparse`.
- **Auth Clerk** : assurez-vous que les clés/issuers Clerk sont cohérents côté frontend.
- **401 sur CMS alors que connecté** : vérifier que le token backend est bien envoyé et que `GET /api/users/me` répond 200.
- **403 sur CMS** : l'utilisateur est authentifié mais `User.role !== admin` (ou email non présent dans la politique admin configurée).
- **Accès refusé côté frontend mais backend OK** : vérifier les claims Clerk email/role et la route `/forbidden` du CMS.

## Scripts utiles
- `npm run dev` : démarre le serveur en mode développement
- `npm run start` : démarre le serveur
- `npm run test` : lance les tests Node
- `npm run lint` : placeholder lint (à configurer)

## Roadmap “Backend”

- **It1** : hardening auth/rbac + audit logs
- **It2** : quote lifecycle strict + transitions
- **It3** : pricing breakdown + explainability
- **It4** : embarkments/schedules + capacity/reservations
- **It5** : observability (pino, metrics, retries)

## How to split into separate repos
1. Copier le dossier `services/diaexpress-backend` dans un nouveau repo.
2. Conserver `package.json`, `package-lock.json`, `server.js` et les dossiers internes.
3. Configurer vos variables `.env` sur la nouvelle machine.
4. Mettre à jour votre CI/CD pour cibler ce dossier comme racine du projet.

## Adminv2 authentication bridge

### Authorization header attendu
Les routes protégées attendent:

```http
Authorization: Bearer <token>
```

Le token peut être:
- un token DiaExpress interne (registre `DIAEXPRESS_AUTH_TOKENS`/clients), ou
- un token Clerk valide (vérifié avec `@clerk/backend`).

### Validation backend des requêtes adminv2
1. `requireAuth` tente de résoudre l’identité depuis le bearer.
2. Si bearer inconnu en interne, le backend tente la vérification Clerk.
3. Si identité trouvée, `syncUserFromIdentity` upsert l’utilisateur local.
4. `requireRole('admin')` valide le rôle DB et garde une compatibilité avec les rôles d’identité.

### `/api/users/me` et sync user
- `/api/users/me` passe par `requireAuth`.
- `requireAuth` fournit déjà `req.user`, `req.dbUser`, `req.identity` après sync.
- La réponse retourne le profil utilisateur local + identité auth résolue.

### Troubleshooting 401 "Non authentifié"
Regarder les logs backend `[auth]`:
- `missing_token` → aucun header Authorization reçu.
- `malformed_authorization_header` → format non `Bearer <token>`.
- `expired_token` → JWT expiré.
- `invalid_token` → token invalide, mauvais template/audience/issuer, ou token d’un autre environnement.
- `user_sync_failed` → identité valide mais impossible de sync/upsert User.
- `role_forbidden` (réponse 403) → token valide, mais rôle utilisateur insuffisant pour la route admin.

Checklist rapide:
1. Frontend envoie bien `Authorization: Bearer ...`.
2. `CLERK_SECRET_KEY`, `CLERK_JWT_TEMPLATE`, `CLERK_JWT_ISSUER`, `CLERK_JWT_AUDIENCE` sont cohérents.
3. `ADMIN_WHITELIST` contient les emails admin attendus si nécessaire.
4. Vérifier `GET /api/health` et l’état MongoDB (sync user dépend de la DB).

## Iteration 2 — Canonical auth contract (source of truth)

### Protected API contract
All protected endpoints now require exactly:

```http
Authorization: Bearer <Clerk JWT>
```

Expected JWT verification strategy:
- verify with Clerk backend (`@clerk/backend verifyToken`),
- canonical template: `DIAEXPRESS_CLERK_JWT_TEMPLATE` (fallback `CLERK_JWT_TEMPLATE`, default `diaexpress-backend`),
- optional legacy templates are disabled by default and only enabled via `DIAEXPRESS_ALLOW_LEGACY_CLERK_TEMPLATES=true`.

### Role authority
- Backend DB field `User.role` is authoritative for authorization decisions.
- `requireRole(...)` no longer grants access from Clerk claims when DB role does not match.
- Frontend role checks are UX mirrors only.

### Forced admin rule
- Forced admin email is config-driven via `CMS_ADMIN_EMAIL` (default: `zcedric121@gmail.com`).
- On sync/login, that email is always promoted/kept as `admin`.
- Existing accounts with non-admin role are auto-promoted idempotently.
- Forced promotions emit explicit audit logs: `[auth/audit] forced_admin_promotion`.

### 401 vs 403 behavior
- `401` (`missing_token`, `expired_token`, `invalid_token`, etc.): user is not authenticated for backend.
- `403` (`role_forbidden`): user is authenticated but does not have required role.

### Troubleshooting auth failures
- `missing_token`: no Authorization header received.
- `expired_token`: JWT `exp` already elapsed.
- `invalid_token`: signature/template/issuer/audience mismatch, or malformed JWT.
- `role_forbidden`: token valid but `User.role` is not sufficient.

## Iteration 3 backend contract hardening

### Normalized API style
- Success list: `{ data, pagination?, meta? }`
- Success single: `{ data, meta? }`
- Error: `{ error: { code, message, details? } }`

### Validation strategy
- Central `middleware/validate.js` for critical write routes.
- Field-level error details under `error.details`.

### Pagination/filter conventions
- Standard query params: `page`, `limit`, `search`, `sortBy`, `sortOrder`.
- List responses include `pagination.total` and `pagination.totalPages`.

### Write safety / idempotency
- Shipment creation from quote is idempotent (returns existing shipment when already created).
- Shipment status transitions are guarded to avoid invalid partial states.

### Common backend error codes
- `VALIDATION_ERROR`
- `UNAUTHORIZED`
- `FORBIDDEN`
- `QUOTE_NOT_FOUND`
- `SHIPMENT_NOT_FOUND`
- `PRICING_NOT_FOUND`
- `ADDRESS_NOT_FOUND`
- `PACKAGE_TYPE_NOT_FOUND`
- `DB_UNAVAILABLE`
- `INTERNAL_ERROR`

## Iteration 4 — Quote domain professionalization

### Estimate vs quote creation
- `POST /api/quotes/estimate` (or legacy `/estimateQuote`) returns a **temporary non-persistent estimate** (`temporary=true`).
- `POST /api/quotes` creates the persistent quote object and starts lifecycle at `requested`.
- Backward compatibility: legacy estimate payload keys (`quotes`, `quoteEstimate`) are still returned in `legacy` fields.

### Canonical quote lifecycle
States:
- `draft`
- `requested`
- `under_review`
- `approved`
- `rejected`
- `awaiting_customer_approval`
- `customer_approved`
- `expired`
- `cancelled`
- `ready_for_shipment`
- `converted`

Legacy status values are normalized to canonical equivalents when read/transitioned.

### Transition rules (enforced)
- `requested -> under_review`
- `under_review -> approved|rejected|awaiting_customer_approval`
- `awaiting_customer_approval -> customer_approved|rejected|expired`
- `customer_approved -> ready_for_shipment`
- `ready_for_shipment -> converted`
- terminal states reject invalid transitions with `409 QUOTE_INVALID_TRANSITION`.

### Admin review actions
- `PATCH /api/quotes/:id/status` (canonical status transition)
- `POST /api/quotes/:id/review`
- `POST /api/quotes/:id/request-info`
- `POST /api/quotes/:id/ready-for-shipment`
- `PATCH /api/quotes/:id` (pricing note, priority, review/admin notes)

### Canonical quote payload contract
Canonical response now includes normalized sections:
- `customer` (requester and recipient contacts)
- `route` (origin/destination/transport/pickup)
- `package` (dimensions/weight/volume/package type)
- `pricing` (estimated/final/currency/breakdown/provider)
- `audit` (submitted/reviewed/approved/rejected/customerApproved timestamps + actors + history)
- `operations` (`ageHours`, `reviewAgeHours`, `isOverdueReview`)

## Iteration 5 — Shipment lifecycle & logistics flow

### Quote → Shipment conversion rules
- Endpoint: `POST /api/shipments/from-quote` (alias: `/api/shipments/create-from-quote`).
- Access: `admin` only.
- Eligible quote statuses: `ready_for_shipment` (backward-compatible: `approved`, `customer_approved`).
- Idempotent behavior: one shipment per quote (`quoteId` uniqueness check in service).
- Conversion metadata persisted on shipment (`meta.conversion`):
  - `sourceQuoteId`
  - `convertedAt`
  - `convertedBy`
  - optional conversion notes

### Shipment lifecycle states
- `draft`
- `created`
- `pending_dispatch`
- `scheduled`
- `in_transit`
- `delayed`
- `at_hub`
- `out_for_delivery`
- `delivered`
- `failed_delivery`
- `returned`
- `cancelled`

### Allowed transitions (summary)
- `created -> pending_dispatch|scheduled|cancelled`
- `pending_dispatch -> scheduled|in_transit|cancelled`
- `scheduled -> in_transit|delayed|cancelled`
- `in_transit -> at_hub|out_for_delivery|delayed|delivered|failed_delivery|cancelled`
- `at_hub -> out_for_delivery|in_transit|delayed|cancelled`
- `out_for_delivery -> delivered|failed_delivery|delayed|cancelled`
- `failed_delivery -> out_for_delivery|returned|cancelled`
- terminal: `delivered|returned|cancelled`

### Tracking timeline contract
Tracking responses now return normalized events under `events` and `timeline`:
- `eventType`
- `status`
- `timestamp`
- `location`
- `note`
- `source`
- `actorId` / `actorLabel`
- optional `carrierReference`

### Lifecycle timestamps
Shipment stores operational timestamps:
- `createdAtOperational`
- `scheduledAt`
- `dispatchedAt`
- `deliveredAt`
- `cancelledAt`
- `returnedAt`
- plus actor trace in `meta.lastStatusChangedBy`

## Pricing Engine (Iteration 6)
- Pricing now separates operational scope (`scopeType`: `lane|legacy_route|default`) from tariff formulas inside `transportPrices`.
- Active validity is enforced at estimate time: rule must be `isActive=true`, `validFrom<=now`, and `validUntil` not expired.
- Conflict behavior: create/update rejects overlapping active rules on the same lane/route + transport type + overlapping validity window.
- Estimation contract (`POST /api/quotes/estimate`) returns deterministic result with:
  - `totalPrice`, `currency`
  - `appliedRule` (pricing ids + lane/route/package/range match)
  - `breakdown` (base, surcharges, unit/range/package context)
  - `explanation` (`strategy`, fallback usage, warnings)
- Failure modes are explicit:
  - `PRICING_NOT_FOUND`
  - `PRICING_AMBIGUOUS`
  - `PRICING_VALIDATION_ERROR` / `PRICING_CONFLICT` on admin mutations.

## Procédure de validation Mongo (checklist)

1. Vérifier les variables dans `services/diaexpress-backend/.env` :
   - `MONGODB_URI` défini avec un nom de base (`mongodb+srv://.../diaexpress?...` ou `mongodb://127.0.0.1:27017/diaexpress`)
   - `MONGODB_LOCAL_URI` absent ou défini en `mongodb://...` uniquement
   - `MONGODB_ALLOW_LOCAL_FALLBACK=false` sauf fallback local explicitement voulu
   - `ALLOW_DEGRADED_MODE=false` sauf dépannage UI temporaire
2. Démarrer Mongo local uniquement si vous utilisez une URI locale primaire ou un fallback local explicite.
3. Démarrer le backend (`npm run dev`).
4. Vérifier `GET /api/health` :
   - attendu : `ok=true`, `degradedMode=false`, `db.status=connected`
   - si MongoDB est indisponible et `ALLOW_DEGRADED_MODE=false`, le processus doit s'arrêter avant d'écouter le port HTTP.


## Iteration C (scalable architecture preparation)

Backend now starts moving to a **modular monolith** with explicit domain seams:

- `src/domains/domainRegistry.js`: authoritative domain map and ownership intent.
- `src/domains/quote/application/*`: quote request + lifecycle orchestration.
- `src/domains/shipment/application/*`: quote→shipment conversion and shipment lifecycle orchestration.
- `src/domains/tracking/application/*`: tracking synchronization orchestration.
- `src/domains/network/application/masterDataService.js`: network/master-data access seam.
- `src/shared/events/*`: in-process domain event bus and publisher for extractable workflows.

This keeps one deployable backend while reducing cross-domain write leakage.

## Iteration G — Observability & production hardening

### New operational endpoints
- `GET /api/health`
- `GET /api/health/live`
- `GET /api/health/ready`
- `GET /api/metrics`

### Correlation IDs
Every response now includes:
- `x-correlation-id`
- `x-request-id`

For severe failures, API errors include `error.reference` so support can locate matching logs.

### Minimum deployment quality gate
Run before deploy:
```bash
npm --prefix services/diaexpress-backend test
npm --prefix apps/diaexpress-adminv2 run test
npm --prefix apps/diaexpress-client run test
```

### Runbook
See root docs:
- `docs/runbook.md`
- `docs/deployment-readiness-summary.md`


## Production deployment notes (Iteration H)

- Backend Docker image: `services/diaexpress-backend/Dockerfile`
- Runtime port: `5000` (internal; exposed through Nginx on `api` domain)
- Health endpoints for container checks:
  - `/api/health/live`
  - `/api/health/ready`
- Upload persistence uses Docker volume mounted at `services/diaexpress-backend/uploads`.
- Production env template: `deployment/env/backend.production.env.example`

Recommended production DB: MongoDB Atlas / managed Mongo via `MONGODB_URI`.
