# Auth flow stabilization report

## Scope

Audited and stabilized the authentication and session contracts for:

- Diamarket API, CMS, and Web.
- DiaExpress API, Admin, and Web.
- Currency seed used by the Diamarket `/currencies` CMS flow and backed by the `currencyrates` collection.

## Errors found

1. The currency initialization flow had historically relied on non-idempotent insert semantics. Re-running the flow could trigger `MongoBulkWriteError: E11000 duplicate key` for `code: "XOF"` if a process had already inserted the default currency.
2. DiaExpress auth responses were not consistently shaped as `{ success, message, user, token }` or `{ success: false, message }`, which made frontend error handling more brittle.
3. DiaExpress frontend role guards could derive access from Clerk metadata. The backend database role must be the source of truth for admin/client/delivery authorization, except the explicit local dev admin bypass.
4. DiaExpress user sync accepted any role emitted by an identity provider before Mongoose validation. Invalid values could fail sync or create inconsistent assumptions.

## Cause of the XOF duplicate bug

`XOF` has a unique index through the `CurrencyRate.code` model. Any seed that uses `insertMany` or a count-then-insert pattern can race with another request or startup process and attempt to insert `XOF` twice. The safe approach is per-code upsert.

## Currency seed fix

The Diamarket currency controller now ensures defaults through `CurrencyRate.bulkWrite()` with `updateOne` and `upsert: true` per currency code. Existing currency documents are not deleted. Seed metadata and current rates are updated idempotently, then `XOF` is enforced as the only default currency. Duplicate manual creates now return a clean `409` JSON error instead of bubbling a Mongo duplicate-key exception.

Expected log after seed execution:

```txt
[currency-seed] Default currencies ensured.
```

## Diamarket auth flows

- Public registration ignores any submitted role and creates `role=user`.
- Login returns `success`, `token`, and `user`.
- `/api/auth/me` reloads the user from MongoDB and rejects missing/disabled accounts.
- Logout clears the session cookie and returns JSON.
- Admin seed uses `.env` (`ADMIN_DEFAULT_EMAIL`, `ADMIN_DEFAULT_PASSWORD`, `ADMIN_RESET_PASSWORD_ON_START`) and hashes passwords with bcrypt.
- CMS admin access remains backed by `/api/auth/me` and backend admin-protected endpoints.

## DiaExpress auth flows

- Clerk/backend bridge remains the runtime auth path.
- `/api/auth/token`, `/api/auth/sync`, and `/api/auth/me` now include normalized success/error fields.
- Generic API success/error helpers now include root `success` and `message` fields while preserving existing `data`/`error` envelopes.
- User sync only accepts normalized DiaExpress roles: `admin`, `client`, and `delivery`; unknown identity-provider roles fall back to `client`.
- Frontend role gates now use the synced backend user role as the source of truth. Clerk metadata alone no longer grants admin access.
- Public tracking remains public through `/api/tracking`; client dashboards continue to require authenticated backend tokens.

## Roles

- Diamarket: `admin`, `vendor`, `user`.
- DiaExpress: `admin`, `client`, `delivery`.

Frontend role selection is not trusted for privilege elevation; backend middleware remains authoritative.

## Files modified

- `apps/diamarket-api/src/controllers/currencies.controller.ts`
- `apps/diaexpress-api/controllers/authController.js`
- `apps/diaexpress-api/services/userIdentityService.js`
- `apps/diaexpress-api/utils/http.js`
- `apps/diaexpress-api/.env.example`
- `apps/diaexpress-web/src/components/RoleProtected.js`
- `apps/diaexpress-web/src/components/ProtectedRoute.js`
- `docs/CURRENCY_SEED_FIX_REPORT.md`
- `docs/AUTH_FLOW_STABILIZATION_REPORT.md`

## `.env.example` updates

DiaExpress API now documents both canonical `ADMIN_DEFAULT_*` variables and legacy `ADMIN_SEED_*` aliases. Existing Diamarket and frontend examples already document API URLs, ports, cookies, Clerk bridge variables, CORS, MongoDB, and default admin/reset variables.

## Tests/checks realized

Build checks were run for all requested apps where package scripts exist. Manual browser flows (`npm run dev:diamarket`, `npm run dev:diaexpress`) were not executed in this non-interactive terminal session.

## Remaining risks

- Full end-to-end verification still requires running MongoDB and Clerk-compatible tokens in a real dev environment.
- DiaExpress Admin and Web share some legacy wrappers; further cleanup can remove older Clerk-metadata role assumptions once all pages use the central auth context.
