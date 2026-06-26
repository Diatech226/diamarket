# Environment configuration audit

This audit synchronizes the application-level `.env.example` files with environment variables read by runtime code under `apps/**`. The scan focused on `process.env.*`, `process.env[...]`, optional `process.env?.[...]`, `import.meta.env.*`, dotenv usage, and runtime URL/config helpers.

## Applications audited

- `apps/diamarket-api`
- `apps/diamarket-web`
- `apps/diamarket-cms`
- `apps/diaexpress-api`
- `apps/diaexpress-web`
- `apps/diaexpress-admin`
- `apps/diapay-api`
- `apps/diapay-dashboard`
- `apps/diapay-docs`
- `apps/diapay-sandbox`

No `apps/diapay-sdk-js` directory exists in the current workspace. The shared SDK package present in this monorepo is `packages/diapay-node`, which reads `DIAPAY_SECRET_KEY` and `DIAPAY_BASE_URL` from the consumer process environment.

## Conventions retained

- Browser-exposed variables use `NEXT_PUBLIC_` in Next.js applications.
- Server-only secrets remain unprefixed (`CLERK_SECRET_KEY`, `DIAPAY_SECRET_KEY`, webhook secrets, API keys, database URIs).
- Canonical local service URLs are aligned around:
  - Diamarket web: `http://localhost:3000`
  - Diamarket CMS: `http://localhost:3001`
  - Diamarket API: `http://localhost:5001`
  - DiaExpress web: `http://localhost:3010`
  - DiaExpress admin: `http://localhost:3011`
  - DiaExpress API: `http://localhost:5010`
  - DiaPay API: `http://localhost:5100`
  - DiaPay sandbox/checkout: `http://localhost:5103`
- Legacy aliases that are still read by code are kept in `.env.example` files rather than removed.

## Variables by application

### `apps/diamarket-api`

Sections cover application, database, CORS, authentication, admin bootstrap, payments, DiaExpress shipping, and local media storage. The example includes all variables read by `src/config/env.ts`, including `JWT_SECRET`, `AUTH_SESSION_SECRET`, `CLERK_SECRET_KEY`, `DIAPAY_*`, `DIAEXPRESS_*`, and `MEDIA_*`.

### `apps/diamarket-web`

The frontend reads only public configuration: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_AUTH_API_URL`, `NEXT_PUBLIC_CMS_URL`, and `NEXT_PUBLIC_DEMO_MODE`.

### `apps/diamarket-cms`

The CMS reads `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_DIAMARKET_API_URL`.

### `apps/diaexpress-api`

The backend example covers application flags, MongoDB, CORS, Clerk authentication, admin bootstrap, DiaPay, email, CMA CGM, FedEx, FX, integration keys, compliance, and crypto provider configuration.

### `apps/diaexpress-web`

The web app uses multiple public and server-side URL fallbacks. The example now includes the missing server-side fallback variables used by the API URL resolver: `DIAEXPRESS_API_BASE_URL`, `DIAEXPRESS_ADMIN_API_BASE_URL`, `LOGISTICS_API_BASE_URL`, `DIAEXPRESS_BACKEND_URL`, `DIAEXPRESS_PUBLIC_URL`, `DIAEXPRESS_PUBLIC_HOST`, `DIAEXPRESS_PUBLIC_PORT`, `SITE_URL`, `NEXTAUTH_URL`, and `VERCEL_URL`.

### `apps/diaexpress-admin`

The admin app uses public API URLs, Clerk public config, JWT template aliases, DiaPay feature toggles, and a development bearer token fallback. The example now also includes the server-side Clerk variables `CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`, which are referenced by admin auth readiness checks.

### `apps/diapay-api`

The API reads `PORT`, `DIAPAY_API_PUBLIC_URL`, and `DIAPAY_CHECKOUT_URL`.

### `apps/diapay-dashboard`

The dashboard reads `NEXT_PUBLIC_DIAPAY_API_URL`. Documentation/demo snippets also reference `DIAPAY_WEBHOOK_SECRET`, so it remains documented in the example.

### `apps/diapay-docs`

The docs include snippet/demo values for `DIAPAY_SECRET_KEY` and `DIAPAY_WEBHOOK_SECRET`.

### `apps/diapay-sandbox`

The sandbox reads public and server-side DiaPay API URLs plus the sandbox merchant secret key: `NEXT_PUBLIC_DIAPAY_API_URL`, `DIAPAY_API_URL`, and `DIAPAY_SECRET_KEY`.

## Common variables

- Application: `NODE_ENV`, `PORT`, `TZ`
- URLs: `NEXT_PUBLIC_*_URL`, `*_API_BASE_URL`, `*_PUBLIC_URL`
- Database: `MONGODB_URI`, `MONGODB_LOCAL_URI`, MongoDB timeout/pool tuning variables
- Authentication: `CLERK_*`, `JWT_SECRET`, `AUTH_SESSION_SECRET`, JWT template aliases
- Payments: `DIAPAY_*`, `PAYMENT_*`, webhook secrets
- Logistics/carriers: `DIAEXPRESS_*`, `SHIPPING_*`, `CMACGM_*`, `FEDEX_*`
- Email: `EMAIL_USER`, `EMAIL_PASS`
- Analytics: public DiaExpress web analytics keys

## Added variables

- `apps/diaexpress-admin/.env.example`
  - `CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`
- `apps/diaexpress-web/.env.example`
  - `DIAEXPRESS_API_BASE_URL`
  - `DIAEXPRESS_ADMIN_API_BASE_URL`
  - `ADMIN_API_BASE_URL`
  - `LOGISTICS_API_BASE_URL`
  - `DIAEXPRESS_BACKEND_URL`
  - `API_HOST`
  - `API_PORT`
  - `DIAEXPRESS_API_PORT`
  - `SITE_URL`
  - `APP_URL`
  - `NEXTAUTH_URL`
  - `VERCEL_URL`
  - `DIAEXPRESS_PUBLIC_URL`
  - `DIAEXPRESS_PUBLIC_HOST`
  - `DIAEXPRESS_PUBLIC_PORT`

## Removed variables

No variables were removed. Existing aliases that are still read by code were retained to avoid breaking local or deployed environments.

## Findings and recommendations

- Variables used but absent: resolved for `diaexpress-admin` and `diaexpress-web` by adding the missing runtime keys listed above.
- Variables present but unused: no removals were made because the remaining examples either match runtime reads or intentionally document local snippets/demo integrations.
- Duplicates/aliases: several apps still read legacy aliases (`API_BASE_URL`, `NEXT_PUBLIC_API_BASE_URL`, product-specific URL variables). They should be normalized in code in a separate refactor; this audit keeps all still-used aliases.
- Sensitive client exposure: `NEXT_PUBLIC_ADMIN_BEARER_TOKEN` and DiaExpress sandbox/dev admin tokens are public by design for local fallback flows but must never contain production secrets. Prefer Clerk tokens in production and leave public fallback tokens empty.
- Secrets: never prefix database URIs, private API keys, webhook secrets, or Clerk secret keys with `NEXT_PUBLIC_`.
