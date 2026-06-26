# Environment configuration audit

This document records the monorepo environment variable audit performed for the application templates under `apps/*`.

## Scope and method

Scanned runtime code in `apps/**`, `packages/**`, and `scripts/**` for `process.env`, `import.meta.env`, public prefixes (`NEXT_PUBLIC_`, `VITE_`), `dotenv`, and environment-style constants. The generated `.env.example` files are grouped by application and only include variables that are referenced by each application runtime or its documented runtime snippets.

## Applications covered

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

## Conventions retained

- Browser-exposed values use `NEXT_PUBLIC_`.
- Server secrets remain unprefixed and are only present in API/server templates.
- Public URL variables use service-specific names where the code already does (`NEXT_PUBLIC_DIAEXPRESS_API_BASE_URL`, `NEXT_PUBLIC_DIAPAY_API_URL`) and compatibility aliases are kept only where code still reads them.
- DiaMarket API keeps canonical server names for payments and shipping (`DIAPAY_*`, `SHIPPING_*`, `DIAEXPRESS_*`) because the backend still reads each of them.
- DiaExpress keeps legacy Clerk template aliases because the auth bridge explicitly attempts multiple names for backward compatibility.

## Variables by application

### `apps/diamarket-api`

Groups: application, database, CORS, authentication, admin bootstrap, payments, DiaExpress/shipping, and media storage. Added missing server-side variables used by authentication, Clerk, payment callback URLs, DiaExpress shipping, and media upload configuration.

### `apps/diamarket-web`

Groups: application, URLs, and feature flags. Removed unused routing/session public variables that are not read by the current web app code.

### `apps/diamarket-cms`

Groups: application and URLs. Removed unused CMS URL/session/path variables and kept the two API URL aliases that are actually read by the CMS API clients.

### `apps/diaexpress-api`

Groups: application, MongoDB, CORS, Clerk/authentication, admin bootstrap, DiaPay, email, CMA CGM, FedEx, FX, integrations, compliance, and crypto providers. Added missing timeout, template, sandbox fixture, compliance, FX, and crypto provider variables.

### `apps/diaexpress-web`

Groups: application, URLs, Clerk/authentication, local dev admin, DiaPay/features, email, and analytics. Added public template aliases and local dev admin aliases used by auth helpers; removed unused route/session variables.

### `apps/diaexpress-admin`

Groups: application, URLs, Clerk/authentication, DiaPay/features, and development. Removed unused public cookie/session flags and retained only aliases read by API/auth helpers.

### `apps/diapay-api`

Groups: application and URLs. Removed stale database/auth salt variables that are not read by the current in-memory sandbox API implementation.

### `apps/diapay-dashboard`

Groups: URLs and webhooks. Added the webhook secret used in the developer example page.

### `apps/diapay-docs`

Groups: documentation snippets. Added snippet variables referenced by the generated documentation code examples.

### `apps/diapay-sandbox`

Groups: URLs and sandbox credentials. Added server-side DiaPay URL and test secret used by the sandbox API routes.

## Variables removed as obsolete

- `apps/diamarket-web`: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_DIAMARKET_CMS_URL`, auth path/cookie variables not read by the app.
- `apps/diamarket-cms`: CMS/site/demo/auth path/cookie variables not read by the app.
- `apps/diaexpress-admin`: public cookie/auth source/admin role flags not read by the app.
- `apps/diaexpress-web`: network retry/timeout and route/session variables not read by the app.
- `apps/diapay-api`: `MONGO_URI`, `JWT_SECRET`, `API_KEY_SALT`, not read by the current code.

## Variables added

- DiaExpress API: missing MongoDB tuning, Clerk compatibility, sandbox fixtures, FX timeout, AML/travel-rule, Fireblocks, Coinbase Commerce, and DiaPay timeout aliases.
- DiaExpress web/admin: public Clerk template compatibility variables and admin/dev API URL aliases that are still read by helpers.
- DiaPay dashboard/docs/sandbox: snippet and server-route variables used by runtime pages and routes.

## Duplicate and naming audit

The codebase still contains compatibility aliases for some URLs and Clerk templates. These were not removed from `.env.example` while code still reads them, to avoid breaking existing authentication and API fallback behavior. Recommended future cleanup:

1. Pick one canonical public API URL per frontend.
2. Remove fallback aliases from code.
3. Update `.env.example` again after aliases are no longer referenced.

## Security recommendations

- Never put real `CLERK_SECRET_KEY`, `DIAPAY_SECRET_KEY`, `DIAPAY_API_KEY`, carrier credentials, or crypto provider secrets in frontend applications.
- Treat every `NEXT_PUBLIC_*` value as visible to browser users.
- Do not set `NEXT_PUBLIC_ADMIN_BEARER_TOKEN` in production; it is a development-only fallback.
- Keep `AUTH_ALLOW_HEADER_BRIDGE=false` outside controlled development/test environments.
- Rotate all credentials if a real value was ever committed to an `.env.example` file.
