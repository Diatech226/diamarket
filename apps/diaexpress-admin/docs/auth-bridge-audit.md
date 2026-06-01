# Auth bridge audit (adminv2 ↔ diaexpress-backend)

## Scope checked
- `apps/diaexpress-adminv2/middleware.ts`
- `apps/diaexpress-adminv2/lib/api/client.ts`
- `apps/diaexpress-adminv2/lib/api/auth.ts`
- `apps/diaexpress-adminv2/app/admin/layout.tsx`
- `apps/diaexpress-adminv2/src/services/api/*`
- `services/diaexpress-backend/middleware/auth.js`
- `services/diaexpress-backend/services/diaexpressAuthService.js`
- `services/diaexpress-backend/services/userIdentityService.js`
- `services/diaexpress-backend/routes/user.js`

## What currently works
1. **Frontend session gate is active**: admin pages are protected by Clerk middleware + `safeClerkAuth()` + role check in admin layout.
2. **Backend has Clerk verification support**: bearer tokens can be verified through `@clerk/backend` and mapped to an internal identity.
3. **Backend can sync identity to DB user**: `syncUserFromIdentity()` upserts local users and supports admin email whitelist promotion.
4. **Adminv2 API calls are centralized** in one client (`lib/api/client.ts`) and shared across quotes/shipments/admin services.

## What is broken
1. **Token propagation is browser-only in adminv2**:
   - `resolveAuthToken()` relies on `window.Clerk.session.getToken(...)`.
   - Server-side data fetches (dashboard/admin pages) do not have `window`, so requests are sent **without Authorization header**.
2. **401 handling is too aggressive on frontend**:
   - Any backend `401` triggers immediate redirect to `/sign-in`.
   - This conflates “no Clerk session” with “backend bridge/token failure”, creating redirect loops.
3. **Backend auth failure reasons are opaque**:
   - Most failures return only `Non authentifié`, making bridge debugging difficult.
4. **`/api/users/me` stack is redundant and fragile**:
   - `requireAuth` already syncs user; route then runs `syncUser` again.

## Exact reason for the 401 loop
1. User is signed in (valid Clerk frontend session).
2. Admin page fetches protected backend resources from server/client path where no token is attached.
3. Backend returns `401 Non authentifié`.
4. Adminv2 global handler redirects to `/sign-in` for any `401`.
5. Clerk session still exists, user goes back into protected admin route, fetch happens again without valid bridge token, and the loop repeats.

## Minimal fix strategy
1. **Adminv2**: make token resolution SSR-aware and centralized.
   - Resolve Clerk token on server via Clerk server auth API.
   - Keep browser token path for client requests.
   - Inject `Authorization: Bearer <token>` in shared API client for all protected backend calls.
2. **Adminv2**: change auth failure routing logic.
   - Redirect to `/sign-in` only when there is no frontend session.
   - Route backend bridge `401` to dedicated admin auth error state (no loop).
   - Keep `403` mapped to access denied.
3. **Backend**: improve auth validation observability and compatibility.
   - Log auth failure reason without leaking token.
   - Distinguish missing/malformed/invalid/expired token.
   - Keep Clerk + static token compatibility.
4. **Backend `/api/users/me`**: rely on already-resolved user from `requireAuth`, avoid double sync middleware.
