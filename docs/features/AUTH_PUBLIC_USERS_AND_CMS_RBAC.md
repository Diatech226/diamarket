# Public users and CMS RBAC

## Purpose

The public site and CMS share the API's email/password session. Public users may register and log in, while CMS access is decided separately from authentication.

## Environment

### API (`apps/diamarket-api/.env`)

```env
PUBLIC_REGISTRATION_ENABLED=true
ENABLE_EMAIL_PASSWORD_AUTH=true
DEFAULT_PUBLIC_ROLE=client
AUTH_SESSION_SECRET=<long-random-secret>
AUTH_SESSION_TTL_HOURS=168
AUTH_ALLOW_HEADER_BRIDGE=false
CORS_ALLOWED_ORIGINS=https://www.smovecommunication.com,https://smoovecms.vercel.app
```

`DEFAULT_PUBLIC_ROLE` accepts only `client` or `user`. The API ignores every public registration `role` field, so public registration can never create an admin, editor, or author.

### Public site (`apps/diamarket-web/.env`)

```env
NEXT_PUBLIC_API_URL=https://smoveapi-1.onrender.com/api
NEXT_PUBLIC_AUTH_API_URL=https://smoveapi-1.onrender.com/api/v1/auth
NEXT_PUBLIC_CMS_URL=https://smoovecms.vercel.app
```

### CMS (`apps/diamarket-cms/.env`)

```env
NEXT_PUBLIC_DIAMARKET_API_URL=https://smoveapi-1.onrender.com/api
NEXT_PUBLIC_AUTH_API_URL=https://smoveapi-1.onrender.com/api/v1/auth
```

## Public auth endpoints

These routes are public and must never receive CMS-role middleware:

- `POST /api/v1/auth/register`: creates a normal-role account and starts a session when public registration and email/password auth are enabled.
- `POST /api/v1/auth/login`: starts a session for any valid enabled user, regardless of role.
- `GET /api/v1/auth/session`: reports the current session; it does not require a CMS role.
- `POST /api/v1/auth/logout`: clears the session cookie.
- `GET /api/v1/auth/oauth/providers`: lists configured OAuth providers.

The API also exposes `/api/auth/*` aliases for compatibility.

## Status behavior

- **401 Unauthorized** means no valid session/credentials exist, or login credentials are invalid.
- **403 Forbidden** means authentication is disabled for the requested auth operation, or a valid authenticated user lacks the required CMS role.
- A valid normal-user session opening the CMS is shown **“Accès refusé au CMS”**. It is not reported as a missing-session or authentication error.

## CMS access rules

CMS access is allowed only for `admin`, `editor`, and `author`. Normal roles `client`, `user`, and `viewer` remain authenticated on the public site but receive the CMS forbidden screen. Protected CMS content mutations enforce the same allowed-role list in the API.

The CMS flow is:

1. Call `/auth/session`.
2. Show CMS login when the response is unauthenticated (`401`).
3. Render the dashboard for an authenticated `admin`, `editor`, or `author`.
4. Render the forbidden screen for an authenticated normal role.

## Manual validation

1. Register a new account on the public site's `/account` page.
2. Confirm registration creates a `client`/`user` and opens the normal account area.
3. Log out and log back in with the new account.
4. Open the CMS and confirm **“Accès refusé au CMS”** appears.
5. Log in on the public site with an admin account and confirm **“Accéder au CMS”** appears without an automatic redirect.
6. Open the CMS and confirm the dashboard loads for the admin session.
