# Clerk auth loop audit (adminv2)

## Scope audited
- `apps/diaexpress-adminv2/.env`
- `apps/diaexpress-adminv2/middleware.ts`
- `apps/diaexpress-adminv2/app/layout.tsx`
- `apps/diaexpress-adminv2/app/sign-in/[[...sign-in]]/page.tsx`
- `apps/diaexpress-adminv2/app/admin/layout.tsx`
- `apps/diaexpress-adminv2/lib/config/env.ts`
- `apps/diaexpress-adminv2/lib/auth/clerk.ts`

## Confirmed root cause of the sign-in loop

1. **Publishable key mismatch in env naming**
   - `.env` currently defines `CLERK_PUBLISHABLE_KEY`, but adminv2 runtime validation requires `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`.
   - Because the expected public env key is missing, the app enters Clerk keyless behavior, which is explicitly reported in logs (`You are running in keyless mode`).

2. **Sign-in page always renders `<SignIn>` even when Clerk is misconfigured**
   - `app/sign-in/[[...sign-in]]/page.tsx` always mounts Clerk SignIn.
   - In keyless/misconfigured state, Clerk JS repeatedly probes sign-in catchall endpoints (e.g. `/sign-in/SignIn_clerk_catchall_check_*`) and can keep retrying.

3. **Middleware always enables Clerk for all routes**
   - `middleware.ts` exports `clerkMiddleware()` unconditionally.
   - With missing required env, auth middleware participates in the broken flow rather than failing fast to a deterministic app state.

4. **Admin guard fallback message is not auth-specific**
   - `app/admin/layout.tsx` uses `safeClerkAuth()`. If Clerk context is unavailable it renders a generic backend-offline panel (`BackendOffline`) message.
   - This blurs root cause (auth config) with backend outages.

## Missing Clerk vars observed

From `lib/config/env.ts`, required keys are:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

From `.env` audit:
- `CLERK_SECRET_KEY` is present.
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is missing.
- `CLERK_PUBLISHABLE_KEY` exists but is not used by current validation/client runtime.

## Keyless mode: intended or accidental?

**Accidental** for this app.
- Current code warns about missing env keys and still boots Clerk components.
- There is no explicit feature flag or intentional keyless configuration path.
- Therefore keyless mode is entered implicitly due to env naming mismatch, not by design.

## Loop amplification points

1. Sign-in page mounts Clerk SignIn in misconfigured state (primary trigger).
2. Unconditional Clerk middleware remains active even when config is invalid.
3. Admin redirect logic can still redirect to `/sign-in`, which re-enters (1).

## Fix strategy

### A) Explicit Clerk config validation at startup
- Add a dedicated Clerk config utility that:
  - requires `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - requires `CLERK_SECRET_KEY` for server-authenticated routes
  - optionally supports explicit keyless opt-in via an env flag (default off)
  - logs config issues once in development

### B) Remove accidental keyless behavior
- Do not mount `ClerkProvider` or `<SignIn>` when Clerk is not configured.
- Show a stable developer-facing configuration error page/state.

### C) Break redirect loops deterministically
- Middleware should bypass Clerk auth handling when Clerk is not configured.
- Admin layout should detect auth misconfiguration before calling Clerk auth and render an auth-unavailable state instead of redirecting.
- Keep single redirect behavior for true unauthenticated sessions only when Clerk is configured.

### D) Distinguish failure domains in UI
- Auth misconfiguration: dedicated auth-config error UI.
- Backend unavailable (e.g., Mongo degraded): backend-offline UI.
- Backend 401/403 with valid Clerk session: existing auth-error / access-denied flow.

### E) Documentation
- Update README with required vars, local run instructions, keyless opt-in/opt-out behavior, and sign-in loop troubleshooting.
