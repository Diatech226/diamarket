# Auth flow stabilization report

## Scope audited

- Diamarket API: `apps/diamarket-api`
- Diamarket CMS: `apps/diamarket-cms`
- Diamarket Web: `apps/diamarket-web`
- DiaExpress API: `apps/diaexpress-api`
- DiaExpress Admin: `apps/diaexpress-admin`
- DiaExpress Web: `apps/diaexpress-web`

## Errors found

### Blocking currency seed error

The active blocker was the duplicate-key error on `currencyrates.code` for `XOF`. The currencies controller used a count-then-`insertMany` seed path, which is not idempotent under partial seed or concurrent request/startup conditions.

### Auth contract observations

- Diamarket API already returns normalized auth success payloads with `success`, `token`, and `user` for register/login, and normalized JSON failures with `success: false` and `message`.
- Diamarket registration already ignores any submitted `role` and creates public accounts with `role: 'user'`.
- Diamarket API session resolution supports both Bearer token and HttpOnly cookie through the same JWT session reader.
- Diamarket admin seed is idempotent and supports `ADMIN_RESET_PASSWORD_ON_START=true`.
- DiaExpress Admin uses Clerk for frontend session and verifies backend admin authority through `/api/users/me`; backend DB role remains the source of truth.
- DiaExpress API has backend RBAC helpers for `admin`, `client`, and `delivery`-style role enforcement and exposes explicit 401/403 reasons.

## Currency seed fix

`apps/diamarket-api/src/controllers/currencies.controller.ts` now replaces `insertMany(seed)` with `bulkWrite` operations that use `updateOne` + `upsert: true` keyed by currency `code`.

The seed:

- inserts missing defaults;
- updates safe seed-controlled operational fields on existing defaults;
- does not delete production rows;
- enforces `XOF` as the single default currency;
- logs `[currency-seed] Default currencies ensured.`.

## Diamarket auth flows

### API

Supported routes:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

Behavior verified in code:

- Register validates email/name/password and forces `role: 'user'`.
- Login validates email/password, rejects disabled accounts, and returns `Invalid credentials` on bad credentials.
- Password hashes use the shared password utility before persistence.
- JWT session token is returned in JSON and set as an HttpOnly cookie.
- `requireAuth` accepts Bearer tokens and cookies, reloads the user from MongoDB, rejects disabled users, and normalizes backend role authority.
- Admin bootstrap uses `.env` defaults, preserves idempotence, and supports password reset on startup.

### CMS

Expected flow:

- Admin logs in through the shared auth endpoint.
- Token/cookie are reused for `/auth/me` session refresh checks.
- CMS routes require an authenticated admin user.
- Normal `user` and `vendor` accounts must be denied from admin CMS routes.
- API/network failures should surface as explicit authentication/API availability errors instead of generic invalid-response messaging.

### Web

Expected flow:

- Public registration creates a client `user` only.
- Public login/logout use the same token/cookie contract.
- Account/profile routes require authentication.
- Frontend must not expose or trust a role selector for public account creation.

## DiaExpress auth flows

### API

Expected flow:

- Clerk/backend bearer identity is resolved by auth middleware.
- Backend `User.role` is authoritative for authorization decisions.
- Admin routes require `admin`.
- Client spaces require authenticated client-compatible identity.
- Delivery routes require delivery-compatible role where configured.
- Public tracking remains available without login.

### Admin

Expected flow:

- Clerk session is required for admin UI.
- The admin layout checks backend authority through `/api/users/me` with a Clerk bearer token.
- Non-admin users are redirected/blocked with access-denied messaging.
- Auth-error pages are stable and avoid redirect loops.

### Web

Expected flow:

- Public visitors can track shipments.
- Client dashboard/account pages require authentication.
- Login/session errors should be clear and stable.

## Role normalization

- Diamarket roles: `admin`, `vendor`, `user`.
- DiaExpress roles: `admin`, `client`, `delivery`.
- Public Diamarket registration forces `user`.
- DiaExpress admin authorization is checked backend-side; frontend claims are not the sole authority.

## Environment examples updated

Updated examples include API URLs, ports, MongoDB, JWT/session/cookie controls, CORS origins, default admin bootstrap/reset controls, and Clerk-related variables where applicable.

Updated files:

- `apps/diamarket-api/.env.example`
- `apps/diamarket-cms/.env.example`
- `apps/diamarket-web/.env.example`
- `apps/diaexpress-api/.env.example`
- `apps/diaexpress-admin/.env.example`
- `apps/diaexpress-web/.env.example`

## Tests and validation performed

Programmatic validation was run with npm build commands for the six requested apps. Manual browser validation was not performed in this non-interactive environment.

## Remaining risks / follow-up

- Full end-to-end manual tests require local MongoDB/Clerk credentials and browser interaction.
- Any production Clerk JWT template names must match the values in the app and API environment files.
- If old databases contain multiple documents with legacy/dirty currency codes outside the unique normalized `code` contract, those should be reconciled manually without deleting live production data unexpectedly.
