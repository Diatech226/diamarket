# Backend auth bridge audit (adminv2 → diaexpress-backend)

## Scope

### Adminv2
- `apps/diaexpress-adminv2/lib/api/client.ts`
- `apps/diaexpress-adminv2/lib/api/auth.ts`
- `apps/diaexpress-adminv2/lib/auth/clerk.ts`
- `apps/diaexpress-adminv2/app/admin/layout.tsx`

### Backend
- `services/diaexpress-backend/middleware/auth.js`
- `services/diaexpress-backend/services/diaexpressAuthService.js`
- `services/diaexpress-backend/services/userIdentityService.js`
- `services/diaexpress-backend/routes/user.js`

## 1) Token source in adminv2

Adminv2 resolves the bearer token centrally in `lib/api/auth.ts` and injects it from the shared API client:

1. `apiClient(...)` calls `applyAuthHeader(...)` before each request.
2. `resolveAuthToken(...)` chooses source in this order:
   - explicit token override from caller,
   - Clerk session token,
   - optional dev fallback `NEXT_PUBLIC_ADMIN_BEARER_TOKEN`.
3. Clerk helpers are split by router/runtime:
   - browser/client shared code: `lib/api/auth.ts` (no `server-only` import)
   - App Router server code: `lib/api/auth.server.ts` (`auth().getToken(...)`)
   - Pages Router API code: `lib/api/auth.pages.ts` (`getAuth(req)`)

## 2) Token template currently used

Token template is resolved from (first non-empty):
- `NEXT_PUBLIC_CLERK_JWT_TEMPLATE`
- `NEXT_PUBLIC_CLERK_TEMPLATE`
- `NEXT_PUBLIC_CLERK_TOKEN_TEMPLATE`
- server-side fallback envs (`CLERK_JWT_TEMPLATE`, `CLERK_TEMPLATE`, `CLERK_TOKEN_TEMPLATE`)

This means frontend and backend must agree on the same Clerk JWT template semantics.

## 3) Backend validation strategy

The backend auth chain is:

1. `requireAuth` / `requireRole` call `ensureRequestIdentityAsync(req)`.
2. `ensureRequestIdentityAsync` tries, in order:
   - DiaExpress internal bearer token registry,
   - Clerk JWT verification with `@clerk/backend` (`verifyToken(...)`).
3. Clerk verification uses:
   - `CLERK_SECRET_KEY`
   - optional issuer (`CLERK_JWT_ISSUER`)
   - optional audience (`CLERK_JWT_AUDIENCE` or list variants)
   - optional template candidates (`CLERK_JWT_TEMPLATE`, etc.)
4. If valid, backend fetches Clerk user profile, derives roles, syncs local user (`syncUserFromIdentity`), then enforces RBAC.

## 4) Why `expired_token` is returned today

`expired_token` can be returned from two places:

1. **JWT payload expiry check in middleware**: request contains bearer token with `exp` in the past.
2. **Clerk verify failure interpreted as expiry**: verification errors containing expiry-related wording are mapped to `expired_token`.

The current incident (“token present but backend returns 401 expired_token”) indicates the bridge is no longer missing headers; it is now failing on **token freshness or compatibility at verification time**.

Most likely contributors:
- stale token reuse from cache on repeated client calls,
- template mismatch between token issuance and backend verification config,
- clock skew/env mismatch causing a near-expiry token to be rejected.

## 5) Minimal fix strategy

1. **Adminv2**
   - Always fetch fresh Clerk token for protected requests (`skipCache` when available).
   - Keep token retrieval centralized in one helper.
   - Retry once on `401 + expired_token` with forced fresh token.
   - If retry still fails: route to explicit “session invalid / sign in again” state.

2. **Backend**
   - Preserve strict verification, but improve reason mapping (`missing_token`, `invalid_token`, `expired_token`, `role_forbidden`).
   - Ensure verify options (issuer/audience/template candidates) align with adminv2 token template.
   - Log structured auth failures without leaking token content.

3. **Role path**
   - Keep `/api/users/me` behind `requireAuth` and use synced DB user.
   - Return 403 for authenticated non-admin users on admin routes.
