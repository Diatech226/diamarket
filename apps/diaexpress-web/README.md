# DiaExpress Web (Next.js)

Portail client/public (quotes, tracking, paiements, dashboard).

## Versions supportées (validées)
- `next`: `14.2.25`
- `react`: `18.3.1`
- `react-dom`: `18.3.1`
- `@clerk/nextjs`: `^6.39.x`
- `@clerk/clerk-react`: `^5.61.x`

## Setup local
```bash
cd /workspace/diamarket
pnpm install
pnpm --filter diaexpress-web dev
```

> Important: faites l'installation à la racine du monorepo pour garder des résolutions stables.

### Configuration
1. Copiez `.env.example` en `.env`.
2. Renseignez la base API (`BACKEND_URL`, `NEXT_PUBLIC_API_BASE_URL`, `ADMIN_API_BASE_URL`).
3. Configurez Clerk (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`) si l'auth est activée.

### Ports
- Développement : `http://localhost:3000` (Next.js par défaut)
- Production : `pnpm --filter diaexpress-web build && pnpm --filter diaexpress-web start` (même port si `PORT` est défini)

## Auth client + stockage token

- **Clerk** : le client utilise Clerk pour la session et récupère un Bearer token via `useBackendAuth`.
- **Backend** : les appels API sont envoyés en `Authorization: Bearer <token>` lorsque l’utilisateur est signé.
- **Fallback** : en environnement dev sans Clerk, `useBackendAuth` peut activer un mode local.

## Pages + endpoints

- **Quotes** (wizard) : `POST /api/quotes`, `POST /api/quotes/estimate`, `GET /api/quotes/me`.
- **Tracking** : `GET /api/tracking/:code`.
- **Shipments** : `GET /api/shipments/me`.
- **Addresses** : `GET/POST/PATCH/DELETE /api/addresses`.
- **Payments** : `POST /api/payments/create`, `GET /api/payments/mine`.

## Roadmap “Client”

- **quote request UX** (smooth wizard)
- **tracking UI** (timeline)
- **documents upload for reservation**
- **payment UX diaPay** (redirects + status)

## Troubleshooting
- **API non joignable** : vérifiez `BACKEND_URL`, `NEXT_PUBLIC_API_BASE_URL` et `NEXT_PUBLIC_ADMIN_API_BASE_URL`.
- **Auth Clerk** : assurez-vous que `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` est défini.
- **Imports partagés** : le package est local dans `packages/diaexpress-shared`.
- **Erreur `Cannot find module 'next/dist/server/future/route-modules/pages/vendored/contexts/router-context'`** :
  1. vérifiez que `next` est bien `14.2.25` dans `apps/diaexpress-web/package.json`,
  2. supprimez `node_modules` + `.next` dans l'app,
  3. réinstallez via `npm run install:clean` depuis la racine monorepo,
  4. relancez `pnpm --filter diaexpress-web dev`.

## Scripts
- `pnpm --filter diaexpress-web dev`
- `pnpm --filter diaexpress-web build`
- `pnpm --filter diaexpress-web start`
- `pnpm --filter diaexpress-web lint`
- `pnpm --filter diaexpress-web test`

## How to split into separate repos
1. Copier le dossier `apps/diaexpress-web` dans un nouveau repo.
2. Conserver `packages/diaexpress-shared` (workspace ou vendored) pour conserver les imports `@diaexpress/shared`.
3. Ajouter votre `.env` à partir de `.env.example`.
4. Mettre à jour la CI/CD pour utiliser ce dossier comme racine du projet.

## Iteration 2 — Client auth model

### Protected vs public backend calls
- Public routes (tracking/public catalog) are called without bearer token.
- Protected routes (`/api/users/me`, addresses, payments, user quotes/shipments) require `Authorization: Bearer <Clerk JWT>`.

### Client auth/session bridge
- Token retrieval uses shared `useBackendAuth` + shared canonical token resolver.
- User synchronization now calls:
  - `POST /api/auth/sync`
  - `GET /api/users/me`
- Shared auth context uses backend API base URL (`buildApiUrl`) to avoid origin mismatch.

### Source of truth and role checks
- Backend DB (`User.role`) is the authority.
- Frontend route components use backend user role for UX and must not override backend decisions.
- 401 means session/token issue (re-auth required), while 403 means authenticated but unauthorized role.

### Troubleshooting session mismatch
- Frontend signed-in but backend 401: verify Clerk JWT template alignment and bearer propagation.
- Backend 403 on admin pages: account is authenticated but DB role is not admin.
- If `/api/users/me` fails intermittently, inspect network for missing/expired bearer token and retry paths.

## Iteration 4 — Client quote request journey

### Estimate vs submit behavior
1. Client performs a temporary quote estimate (`POST /api/quotes/estimate`).
2. Estimate remains non-persistent and is only a pricing proposal.
3. Client explicitly submits quote request (`POST /api/quotes`) to create persistent business object.

### Statuses shown to clients
Client quote statuses now align with backend lifecycle:
- `requested` (submitted)
- `under_review`
- `approved`
- `rejected`
- `awaiting_customer_approval` (needs client action)
- `customer_approved`
- `ready_for_shipment`

### UX clarification
Quote wizard no longer auto-creates shipment after quote submission; shipment execution is handled in later workflow steps.

## Iteration 5 — Client shipment & tracking flow

### Shipment vs quote status distinction
- Quote status tracks commercial/review lifecycle.
- Shipment status tracks physical execution lifecycle (`created -> ... -> delivered/returned/cancelled`).
- Client screens should never infer shipment state from quote status once conversion is done.

### Tracking contract consumed by client
Client tracking pages now consume backend normalized timeline contract:
- `status` / `currentStatus`
- `events` / `timeline`
- each event includes `eventType`, `timestamp`, `location`, `note`, `source`, optional actor/carrier reference

### Visibility model
- Authenticated shipment history uses protected `/api/shipments/me`.
- Public tracking lookup uses `/api/tracking/:trackingCode`.
- These two paths stay separated while sharing the same timeline semantics.

## Client estimate behavior and pricing dependency
- Client estimate depends on backend pricing as source of truth (`/api/quotes/estimate`).
- Estimate response now includes explanation metadata (matched rule IDs, strategy, warnings) to support support/admin debugging.
- Estimate failures are meaningful and should be handled explicitly in UI flows:
  - no pricing found
  - ambiguous pricing configuration
  - invalid input for transport/package/dimensions
  - expired or inactive pricing configuration.

## Iteration 8 — Client UX stabilization

### End-to-end client flow
1. **Estimate** (`/quote-request`): origin/destination/package → estimate API.
2. **Submit quote**: customer confirms estimate + contact details → quote creation.
3. **Quote status visibility** (`/quotes`): pending / under review / approved / rejected + operational statuses.
4. **Shipment tracking** (`/track-shipment`): tracking-code search + timeline states.

### Quote process clarifications
- Estimate and quote submission are intentionally separate.
- No shipment is created during estimate.
- Quote statuses are customer-facing and described in plain language.

### Tracking process clarifications
- Tracking page reflects **shipment lifecycle** (physical execution).
- Quote status remains commercial lifecycle and is displayed in `/quotes` only.

### Auth behavior
- Protected routes rely on Clerk + `useBackendAuth`.
- API errors now map to readable categories (network/validation/server/unauthorized).
- Unauthorized responses should be interpreted as session-expired/re-auth required.

## Iteration G operations notes

- API error normalization now carries a `reference` field for support-friendly incident triage.
- For 5xx/upstream failures, surface the reference in UX support messaging where available.
- Operational recovery and diagnosis guidance: `docs/runbook.md`.


## Production deployment notes (Iteration H)

- Client Docker image: `apps/diaexpress-client/Dockerfile`
- Reverse-proxied domain target: `https://www.example.com`
- Internal app port in container: `3000`
- Production env template: `deployment/env/client.production.env.example`

Use domain-based API URLs (`https://api.example.com`) for all public client env variables.


## Iteration 3 — Public website finalization (April 23, 2026)

### Public page inventory (final)
- `/` (homepage)
- `/quote-request`
- `/track-shipment`
- `/about`
- `/services`
- `/contact`

### Finalized UX behaviors
- Smooth route transitions with lightweight top-progress feedback.
- Active-state navigation for stronger orientation.
- Upgraded loading/error/empty/success states on public critical flows.
- Quote flow reassurance messaging and clearer next-step communication.
- Tracking flow skeleton loading + support-oriented not-found handling.
- Contact form interaction polish (focus, validation, submit/success states).

### Guardrails preserved
- No backend logic changes.
- No API contract changes.
- No auth flow changes.
- Existing business flows remain intact.

## Iteration 4 — Public website growth readiness (April 23, 2026)

### SEO foundation
- Public pages now use a shared SEO head component (`src/components/seo/SeoHead.js`).
- Metadata includes title, description, canonical, robots, Open Graph and Twitter tags.
- SEO content definitions are page-scoped in `src/content/public/*`.

### CMS-ready content organization
- Homepage/About/Services/Contact/Quote/Tracking copy blocks are separated from UI rendering.
- Content can be replaced by CMS payload mapping with minimal component changes.

### Analytics instrumentation
- New vendor-neutral tracker: `src/lib/analytics/trackEvent.js`.
- Events currently covered:
  - `send_package_click`
  - `track_package_click`
  - `service_cta_click`
  - `quote_flow_start`
  - `quote_flow_submit`
  - `contact_form_submit`
  - `tracking_search`

### Performance + accessibility notes
- Hero slider non-primary images are lazy-loaded.
- Reveal observers now respect reduced motion and unsupported browser fallbacks.
- Quote/tracking heading hierarchy was corrected to avoid nested page-level headings.
- Contact form semantics improved (`type=email`, explicit labels, autocomplete hints).

## Iteration 9 — Public UI/UX page-by-page framework (April 24, 2026)

### New planning & alignment docs
- `docs/public-site-page-inventory.md`
- `docs/public-site-uiux-page-audit.md`
- `docs/public-site-uiux-page-roadmap.md`
- `docs/public-site-cms-backend-alignment.md`

### Implemented in this pass
- Homepage quick-access cards added below hero (`/`, direct links to quote/tracking/services).
- Navigation refined for mobile with a dedicated menu toggle and robust active-route behavior.
- Header actions improved with contextual “Mes colis” access for authenticated users.
