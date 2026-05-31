# DiaExpress Admin v2

Console Next.js 14 (App Router) pour l'administration logistique et diaPay. L'interface admin v2 est accessible sous le segment `/admin` et utilise une sidebar commune + un header par page.


## Admin UX IA (Iteration 7)

### Navigation structure
- Dashboard
- Quotes
- Shipments
- Pricing
- Expeditions
- Package Types
- Addresses / Market Points
- Tracking
- Users
- Payments
- Settings

### Page responsibilities
- Dashboard: KPIs + latest activity + alerts.
- Quotes: unified quote pipeline (list, review, create, approve/reject, request info, convert).
- Shipments: operational queue (status updates, tracking events, assign/schedule).
- Tracking: direct shipment lookup.
- Pricing / Users / Payments / Settings: governance and administration.

### Core workflow
1. Quote intake and review on `/admin/quotes`
2. Convert eligible quote to shipment
3. Operate shipment lifecycle on `/admin/shipments`
4. Monitor daily operations from dashboard and tracking

### How to extend adminv2
1. Create the route under `app/admin/*`.
2. Reuse shared UX components (`PageHeader`, `Table`, `Badge`, `Button`, drawers).
3. Wire existing API service modules (`lib/api/*`, `src/services/api/*`) without contract changes.
4. Add loading, empty and error states before linking page in sidebar.

## Setup local

```bash
cd /workspace/diaexpress_backend
npm install
npm run dev:adminv2
```

> Important: utilisez l'installation **depuis la racine monorepo** pour éviter les conflits de dépendances (Clerk / Next / styled-jsx).

Si Next.js remonte des erreurs de routes en doublon ou des artefacts de cache, lancez :

### Workspace dependency audit (monorepo)

| Scope | `next` | `react` | `react-dom` | `@clerk/nextjs` |
| --- | --- | --- | --- | --- |
| root `package.json` | — | — | — | — |
| `apps/diaexpress-adminv2` | `14.2.25` | `18.3.1` | `18.3.1` | `6.39.1` |
| `apps/diaexpress-client` | `14.2.25` | `18.3.1` | `18.3.1` | `6.39.1` |

> Root workspace intentionally does **not** declare `next`, `react`, `react-dom` or `@clerk/nextjs`. This avoids forcing backend/root-level resolution for adminv2 server auth.

### Compatibility matrix (validated)

| Package | Version (adminv2) |
| --- | --- |
| `next` | `14.2.25` |
| `react` | `18.3.1` |
| `react-dom` | `18.3.1` |
| `styled-jsx` | `5.1.1` |
| `client-only` | `0.0.1` |
| `@clerk/nextjs` | `6.39.1` |

`styled-jsx` and `client-only` are now pinned in both dependencies and overrides to avoid nested resolution drift when installing from root **or** from `apps/diaexpress-adminv2`.

### Clean dependency reset (recommended for Clerk/Next resolution issues)

From repo root (preferred):

```bash
rm -rf node_modules package-lock.json
rm -rf apps/diaexpress-adminv2/node_modules apps/diaexpress-adminv2/package-lock.json
rm -rf apps/diaexpress-client/node_modules apps/diaexpress-client/package-lock.json
npm install
npm run dev:adminv2
```

From `apps/diaexpress-adminv2` only (quick local reset):

```bash
npm run deps:reset
npm install
npm run dev
```

Cache-only reset:

```bash
npm run dev:clean
```

### Configuration
1. Copiez `.env.example` en `.env` et complétez les valeurs.
2. Démarrez l’app avec `npm run dev`.

### Ports
- Développement : `http://localhost:3001`
- Production : `npm run build && npm start` (même port si `PORT` est défini)

### Troubleshooting
- **Clerk resolved from wrong `node_modules`** (`...backend/node_modules/@clerk/nextjs/...routeMatcher`):
  1. Stop all dev servers.
  2. Run the clean reset commands above from monorepo root.
  3. Confirm resolution from adminv2: `npm --prefix apps/diaexpress-adminv2 ls @clerk/nextjs next react react-dom`.
  4. Restart with `npm run dev:adminv2` (or `npm run dev` from root).
  5. If problem persists, remove any ad-hoc `node_modules` created in sibling folders and reinstall from root only.
- **`/admin/auth-error?reason=backend-unauthorized` loop**: admin layout now keeps `/admin/auth-error` stable (no recursive redirect) and renders the error screen until Clerk/backend config is fixed.
- **401 `missing_token`** : aucun bearer transmis au backend (vérifier bridge `lib/api/auth.ts` + env Clerk).
- **401 `expired_token`** : token Clerk expiré; adminv2 force un refresh et retente 1 fois, puis affiche `/admin/auth-error`.
- **401 `invalid_token`** : token rejeté (template/audience/issuer/env incompatibles).
- **403 `role_forbidden`** : session valide mais rôle non-admin côté backend.
- **API non joignable** : vérifiez `NEXT_PUBLIC_API_BASE_URL` / `NEXT_PUBLIC_DIAPAY_ADMIN_API_BASE_URL` + CORS backend.
- **Erreurs de build** : supprimez `.next` avec `npm run dev:clean`.
- **`Can't resolve 'client-only' in styled-jsx`** : supprimez les `node_modules` + lockfiles (root et adminv2), réinstallez, puis vérifiez `npm ls styled-jsx client-only` depuis la racine (attendu: `styled-jsx@5.1.1`, `client-only@0.0.1`).
- **Auth Clerk** : assurez-vous que `middleware.ts` est présent (avec `clerkMiddleware()`) et que les clés Clerk sont définies.
- **diaPay down** : laissez `NEXT_PUBLIC_ENABLE_DIAPAY=false` en local pour éviter de bloquer le dashboard.

## Auth admin (routes protégées)

- **/admin/*** exige une session Clerk. Si l’utilisateur n’est pas authentifié, redirection `/sign-in`.
- **Rôle admin** : le rôle est déduit des claims Clerk (`role`/`roles`) et doit inclure `admin`.
- **Non-admin** : affichage “Access denied”.
- **API** : `lib/api/auth.ts` est **browser-only** pour injecter le Bearer et gérer les redirections 401/403 côté client.

### App Router vs Pages Router (Clerk helpers)

- **App Router server code** (`app/*` Server Components, Route Handlers) :
  - utilisez `auth()` via `lib/api/auth.server.ts`
  - helper recommandé : `resolveAppRouterAuthToken(...)`
- **Pages Router / `pages/api/*`** :
  - utilisez `getAuth(req)` via `lib/api/auth.pages.ts`
  - helper recommandé : `getPagesAuth(req)`
- **Ne pas mélanger** :
  - `lib/api/auth.server.ts` contient `server-only` et ne doit jamais être importé par du code client ni par du code partagé consommé par `pages/`.
  - `lib/api/auth.ts` ne doit pas importer de module `server-only`.

## Pages disponibles + endpoints utilisés par page

> Détail complet : `docs/api-contract.md`.

### `/admin` (dashboard)
- `GET /api/quotes`
- `GET /api/shipments`
- `GET /payments/summary` (diaPay admin via `NEXT_PUBLIC_DIAPAY_ADMIN_API_BASE_URL`)

### `/admin/quotes`
- `GET /api/quotes`
- `GET /api/quotes/meta`
- `POST /api/quotes/estimate`
- `POST /api/quotes`
- `POST /api/quotes/:id/confirm`
- `POST /api/quotes/:id/reject`
- `PATCH /api/quotes/:id`
- `POST /api/shipments/from-quote`

### `/admin/shipments`
- `GET /api/shipments`
- `GET /api/shipments/:id`
- `PATCH /api/shipments/:id/status`
- `POST /api/shipments/:id/history`
- `PATCH /api/shipments/:id/assign-embarkment`

### `/admin/expeditions`
- `GET/POST/PUT/DELETE /api/expeditions/transport-lines`
- `GET/POST/PATCH/DELETE /api/admin/embarkments`
- `GET /api/admin/market-points`
- `GET /api/admin/countries`

### `/admin/pricing`
- `GET /api/pricing`
- `POST /api/pricing`
- `GET /api/package-types`

### Référentiels (users, addresses, market-points, countries)
- `GET /api/admin/users`
- `GET/POST/PATCH/DELETE /api/admin/addresses`
- `GET/POST/PATCH/DELETE /api/admin/market-points`
- `GET/POST/PATCH/DELETE /api/admin/countries`

### DiaPay admin
- `GET /payments`
- `GET /payments/:id`
- `GET /payments/:id/events`
- `GET /notifications/jobs`
- `GET /api-keys`
- `GET /users`

### API Health (dev-only)
- `/admin/api-health` → ping `/api/health` puis fallback `/api/v1/public/services`

## UX patterns

- **Tables** : listes paginées avec filtres et lignes actionnables.
- **Drawers** : détails + actions (quotes, shipments).
- **Badges** : statuts normalisés (quote, payment, shipment).
- **Toasts** : feedback success/error centralisé.

## Configuration API

Un client HTTP unique est disponible via `lib/api/client.ts` (base URL, JSON, erreurs, header `Authorization`).

| Variable | Rôle | Exemple |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Base API logistique principale | `http://localhost:5000` |
| `NEXT_PUBLIC_ADMIN_API_BASE_URL` | Alias admin (si utilisé) | `http://localhost:5000` |
| `NEXT_PUBLIC_LOGISTICS_API_BASE_URL` | Fallback logistique (legacy) | `http://localhost:5000` |
| `NEXT_PUBLIC_DIAPAY_ADMIN_API_BASE_URL` | Base diaPay Admin | `http://localhost:5000/api/v1/admin` |
| `BACKEND_URL` | Base backend logistique (serveur/local) | `http://localhost:5000` |
| `ADMIN_API_BASE_URL` | Base admin backend (`/api/v1/admin`) | `http://localhost:5000/api/v1/admin` |
| `NEXT_PUBLIC_ENABLE_DIAPAY` | Active les appels diaPay en dev | `false` |
| `NEXT_PUBLIC_ADMIN_BEARER_TOKEN` | Token admin fallback (dev) | `super-secret-token` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Publishable key Clerk | `pk_test_...` |
| `NEXT_PUBLIC_CLERK_JWT_TEMPLATE` | Template JWT Clerk (si requis) | `admin` |

## Roadmap “API reliability”

- **It1** : client API unique + mapping endpoints validés
- **It2** : retries contrôlés + cache léger (SWR/React Query)
- **It3** : observabilité (logs corrélés, traces, alertes)
- **It4** : stratégie de backoff + rate limiting côté client

## How to split into separate repos
1. Copier le dossier `apps/diaexpress-adminv2` dans un nouveau repo.
2. Conserver `package.json`, `package-lock.json`, `next.config.mjs`, `tsconfig.json` et `.eslintrc.json`.
3. Ajouter `.env` sur la nouvelle machine à partir de `.env.example`.
4. Mettre à jour votre CI/CD pour utiliser ce dossier comme racine du projet.


### Clerk token template troubleshooting (server auth bridge)
- Symptom: `unable to resolve server Clerk token: Not Found`.
- Meaning: `auth().getToken({ template })` requested a Clerk JWT template that does not exist in the active Clerk instance.
- Adminv2 behavior: the server now retries once without template and, if still failing, routes to `/admin/auth-error?reason=token-template-missing` (stable page, no loop).
- Required alignment:
  - frontend/adminv2: `NEXT_PUBLIC_CLERK_JWT_TEMPLATE`
  - backend: `CLERK_JWT_TEMPLATE` (or `DIAEXPRESS_CLERK_JWT_TEMPLATE`)
  - Clerk dashboard: template name must exist and emit claims expected by backend verification.

## Auth bridge (adminv2 ↔ backend)

### Flux end-to-end
1. `middleware.ts` active Clerk sur toutes les pages admin.
2. `app/admin/layout.tsx` vérifie la session Clerk + rôle admin côté frontend.
3. Le client API partagé (`lib/api/client.ts`) injecte automatiquement `Authorization: Bearer <token>` via `lib/api/auth.ts`.
4. Le token est résolu de façon centralisée (helper unique `lib/api/auth.ts`):
   - **Browser**: `window.Clerk.session.getToken(...)`
   - **Fallback bridge**: `GET /api/admin/auth/token` côté serveur quand Clerk browser n'est pas encore hydraté
   - **Server (SSR/RSC)**: `const { getToken } = await auth(); await getToken({ skipCache: true })` via `@clerk/nextjs/server`
   - le template est aligné via `NEXT_PUBLIC_CLERK_JWT_TEMPLATE` (frontend) + `CLERK_JWT_TEMPLATE` (backend)
5. Le backend valide le bearer, sync l’utilisateur local puis applique RBAC (`requireRole('admin')`).

### Variables d’environnement auth requises
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_JWT_TEMPLATE` (et même template côté backend via `CLERK_JWT_TEMPLATE`)
- `NEXT_PUBLIC_API_BASE_URL`
- optionnel (dev fallback seulement): `NEXT_PUBLIC_ADMIN_BEARER_TOKEN`

### Distinction 401/403 (anti-boucle)
- **401 + pas de session frontend** → redirection `/sign-in`.
- **401 `expired_token`** → 1 retry avec token fresh, puis `/admin/auth-error?reason=session-invalid`.
- **401 `missing_token` ou `token_template_not_found`** → pas de redirection forcée, affichage d’erreur inline stable (diagnostic bridge auth).
- **401 `invalid_token` + session Clerk existante** → redirection `/admin/auth-error`.
- **403** → `/access-denied`.

### Règle canonique (obligatoire)
Tous les endpoints backend protégés (`/api/users/me`, `/api/quotes`, `/api/shipments`, etc.) **doivent passer par** `lib/api/client.ts` pour mutualiser:
- injection `Authorization: Bearer <token>`
- fallback token bridge serveur
- classification d’erreurs auth (401/403/missing token)

### Problèmes fréquents (401/403)
- Template JWT mismatch entre frontend/backend (`NEXT_PUBLIC_CLERK_JWT_TEMPLATE` vs `CLERK_JWT_TEMPLATE`).
- URL backend incorrecte (`NEXT_PUBLIC_API_BASE_URL`).
- Session Clerk active mais token backend invalide/expiré.
- Rôle admin absent dans claims Clerk **et** utilisateur non whiteliste backend (`ADMIN_WHITELIST`).

### Test local recommandé
1. Démarrer backend (`services/diaexpress-backend`) et adminv2.
2. Se connecter une seule fois sur `/sign-in`.
3. Ouvrir `/admin`.
4. Vérifier dans Network que `GET /api/quotes` et `GET /api/shipments` partent avec header `Authorization: Bearer ...`.
5. Vérifier qu’aucune redirection en boucle vers `/sign-in` n’a lieu.
6. Tester un compte non-admin: accès `/admin` doit mener à un état `403 / access denied`.

## Iteration 2 — Admin auth model

### How admin auth works
1. Clerk session is required (`middleware.ts` + `/sign-in` redirect when unauthenticated).
2. Admin layout verifies backend role authority through `GET /api/users/me` using a Clerk bearer token.
3. Access decision is deterministic:
   - no backend auth => redirect `/sign-in`
   - authenticated non-admin => `/access-denied`
   - authenticated admin => access granted

### Protected route behavior
- `/admin/*` routes are guarded by both Clerk session and backend DB role (`User.role === admin`).
- Frontend does not trust Clerk claims as final authorization source.

### Backend token bridge
- Token retrieval is centralized in `lib/api/auth.ts`.
- Canonical template: `NEXT_PUBLIC_DIAEXPRESS_CLERK_JWT_TEMPLATE` (fallback `NEXT_PUBLIC_CLERK_JWT_TEMPLATE`, default `diaexpress-backend`).
- Auth header propagation is always `Authorization: Bearer <token>`.
- Static bearer fallback was removed to avoid ambiguous auth states.

### Access denied behavior
- Backend `403` maps to `/access-denied`.
- Backend `401` maps to `/sign-in` (or `/admin/auth-error` for expired/session-invalid cases on browser calls).

### Troubleshooting auth loops
- Ensure frontend/backend use the same Clerk JWT template.
- Verify backend `/api/users/me` returns 200 for admin accounts.
- If 401 persists with active Clerk session, inspect `/admin/auth-error` reason and backend auth logs.

## Iteration 4 — Quote management flow

### Operational quote queue
The admin quote queue now works on a canonical lifecycle: `requested -> under_review -> approved/rejected/awaiting_customer_approval -> customer_approved -> ready_for_shipment`.

### Review actions
Admin quote operations exposed by backend:
- take into review (`under_review`)
- approve
- reject (with reason)
- request more info/customer confirmation (`awaiting_customer_approval`)
- mark ready for shipment (`ready_for_shipment`)
- update pricing note / internal notes / priority

### Filters and statuses
Quote list filtering supports:
- status
- priority (`urgent`, `normal`, `low`)
- source (`client`, `admin`, `partner`, `import`)
- aging (`fresh`, `overdue review`)
- search (id, customer, route)

## Iteration 5 — Shipment operations flow

### Shipment queue operations
Admin shipment console now supports:
- status-filtered queue (canonical lifecycle statuses)
- shipment tracking code search + route context
- aging indicator (days since creation)
- shipment detail drawer with quote source, timestamps, and normalized timeline

### Shipment actions
From shipment detail, admin can:
- schedule shipment
- dispatch / mark in transit
- mark delivered
- cancel / return
- append manual tracking notes/events
- assign shipment to embarkment (light linkage)

### Tracking timeline behavior
Shipment details render normalized timeline events from backend contract:
- chronological event stream
- actor/source attribution
- event type + location + note
- no mixed quote/shipment status assumptions

## Pricing management flow
- Pricing list supports operational filtering by state, currency, and route search.
- Each row shows state badges (active/inactive) and currency for quick auditability.
- Create/edit form now exposes validity window (`validFrom`, `validUntil`), `currency`, and active state.
- Lane-linking remains backward compatible with route text, but lane-linked records are preferred by backend estimation logic.
- Validation errors from backend include conflict and overlap messages designed for operator action.

## Clerk configuration hardening (2026-04)

### Required env vars (adminv2)

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Enables Clerk frontend SDK and sign-in UI. |
| `CLERK_SECRET_KEY` | Yes | Enables server-side auth resolution (`auth()`, token bridge). |
| `NEXT_PUBLIC_DIAEXPRESS_CLERK_JWT_TEMPLATE` (or `NEXT_PUBLIC_CLERK_JWT_TEMPLATE`) | Recommended | Aligns frontend token template with backend validation. |

> Important: `CLERK_PUBLISHABLE_KEY` alone is not enough for adminv2. Use `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`.

### Local run checklist

1. Set Clerk env keys in `apps/diaexpress-adminv2/.env`.
2. Start backend and adminv2:
   - backend (repo service command)
   - `npm run dev:adminv2` from monorepo root
3. Open `http://localhost:3001/admin`.
4. Expected behavior:
   - unauthenticated + valid Clerk config => one redirect to `/sign-in`
   - authenticated admin => access to `/admin`
   - missing Clerk env => explicit auth configuration error state (no redirect loop)

### Missing Clerk env behavior

When `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` or `CLERK_SECRET_KEY` is missing:
- Clerk middleware is bypassed to avoid unstable auth checks.
- `/sign-in` renders an explicit **AuthUnavailable** state (no Clerk SignIn mount).
- `/admin/*` renders explicit **AuthUnavailable** state.
- Dev logs emit a single warning describing missing keys.

### Keyless mode policy

- Accidental keyless mode is disabled by default.
- To intentionally allow keyless experiments in development, set:
  - `NEXT_PUBLIC_CLERK_ENABLE_KEYLESS=true`
- Without this flag, missing Clerk keys disable auth paths deterministically.

### Troubleshooting sign-in loop

If you observe repeated requests like `/sign-in/SignIn_clerk_catchall_check_*`:
1. Verify `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is present (exact name).
2. Verify `CLERK_SECRET_KEY` is present.
3. Restart Next.js dev server after env updates.
4. Confirm you are not unintentionally running keyless mode.
5. If backend is down, expect backend-offline UI under `/admin`, not sign-in catchall spam.

### Failure state mapping

- **Auth misconfiguration (missing Clerk env):** `AuthUnavailable` screen.
- **Backend unavailable / degraded (Mongo/API down):** backend-offline screen.
- **Backend 401 with no frontend session:** redirect to `/sign-in`.
- **Backend 401 with active Clerk session:** `/admin/auth-error`.
- **Backend 403:** `/access-denied`.

## Iteration G operations notes

- Backend severe errors now include a support reference (`error.reference`) mapped from backend correlation IDs.
- When reporting incidents, include:
  1) timestamp,
  2) route/action,
  3) support reference from API error payload.
- Operational procedures: see `docs/runbook.md`.


## Production deployment notes (Iteration H)

- Admin v2 Docker image: `apps/diaexpress-adminv2/Dockerfile`
- Reverse-proxied domain target: `https://admin.example.com`
- Internal app port in container: `3001`
- Production env template: `deployment/env/adminv2.production.env.example`

Ensure Clerk allowed origins/redirects include the final HTTPS admin domain.

## Adminv2 backend JWT template contract (Clerk)

### Required behavior
- Adminv2 resolves backend bearer tokens from Clerk using a configurable JWT template name.
- Canonical env key: `NEXT_PUBLIC_BACKEND_JWT_TEMPLATE`.
- Backward-compatible fallbacks remain supported:
  - `NEXT_PUBLIC_DIAEXPRESS_CLERK_JWT_TEMPLATE`
  - `NEXT_PUBLIC_CLERK_JWT_TEMPLATE`
  - `NEXT_PUBLIC_CLERK_TEMPLATE`
  - server-only: `BACKEND_JWT_TEMPLATE`, `DIAEXPRESS_CLERK_JWT_TEMPLATE`, `CLERK_JWT_TEMPLATE`, `CLERK_TEMPLATE`
- If none is set, default template name is `diaexpress-backend`.

### Clerk dashboard setup
1. Open Clerk Dashboard → **JWT Templates**.
2. Create template named exactly `diaexpress-backend` (or your configured override).
3. Ensure backend verification is aligned with the same template/audience/issuer expectations.
4. Deploy frontend/backend env values using the same template name.

### Missing template semantics
- If Clerk template is missing, adminv2 does **not** run redirect loops.
- Protected requests fail with a stable auth/configuration error state.
- Dev logs emit one-time diagnostics for:
  - missing Clerk JWT template,
  - missing backend bearer token from bridge.

### How protected requests obtain bearer token
1. `lib/api/client.ts` calls `applyAuthHeader()` from `lib/api/auth.ts`.
2. Browser path tries `window.Clerk.session.getToken({ template })`.
3. If browser token is unavailable (or template lookup fails), adminv2 falls back to `GET /api/admin/auth/token` server bridge.
4. If no token can be resolved, request is short-circuited with explicit auth failure (prevents 401/missing_token spam loops).
