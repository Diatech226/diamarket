# Backend MongoDB Connection Audit

Scope audited: `services/diaexpress-backend`.

## 1) How `.env` is loaded

- `.env` is loaded in `config/appConfig.js` through `dotenv.config({ path: BACKEND_ENV_PATH })`.
- `BACKEND_ENV_PATH` resolves to `services/diaexpress-backend/.env`.
- If the file is missing, startup continues using existing process environment values only.
- Because `dotenv` does not use `override: true`, already-exported process env values take priority over file values.

## 2) Priority of environment values

Effective priority for backend runtime values:
1. Existing process environment values (shell/container/CI).
2. Values from `services/diaexpress-backend/.env` for keys not already set.

There is no cascading load of multiple `.env.*` profiles in current code.

## 3) How `MONGODB_URI` is read and validated

- `connectDB()` in `config/db.js` reads `process.env.MONGODB_URI`.
- URI normalization/validation pipeline:
  - `normalizeMongoUri(rawUri)`
  - `parseMongoUri(uri)`
- Validation checks include:
  - scheme must be `mongodb://` or `mongodb+srv://`
  - hostname must exist and be syntactically valid
  - for SRV, Atlas host must end with `.mongodb.net`
  - password encoding sanity check
  - database path must be present (`/test`, `/diaexpress`, etc.)

## 4) Why URI can be considered invalid

`MONGODB_URI` is rejected when one of the following applies:
- missing/invalid URI format
- malformed URL
- missing hostname
- invalid Atlas SRV hostname (not `*.mongodb.net`)
- missing database path (now explicitly invalid)
- malformed credential encoding

When invalid, backend does not attempt to connect and records configuration failure diagnostics.

## 5) How local fallback (`MONGODB_LOCAL_URI`) is decided

- Local URI source:
  - only an explicit `MONGODB_LOCAL_URI` can be used for fallback.
  - the default local URI is kept only as documentation/diagnostic guidance, not as an implicit fallback candidate.
- Fallback activation condition:
  - **both** explicit `MONGODB_LOCAL_URI` is set
  - and `MONGODB_ALLOW_LOCAL_FALLBACK=true`.
- If enabled:
  - backend tries `MONGODB_URI` first (if valid/present), then local fallback.
  - `MONGODB_LOCAL_URI` must be `mongodb://`; `mongodb+srv://` is rejected with the error: `MONGODB_LOCAL_URI must be a local mongodb:// URI. Use MONGODB_URI for Atlas.`
- If disabled:
  - local fallback is not attempted.

## 6) `ALLOW_DEGRADED_MODE` behavior

- `validateStartupConfig()` computes `degradedAllowed` from `ALLOW_DEGRADED_MODE`.
- If DB connection fails:
  - startup continues only when `degradedAllowed=true`.
  - otherwise startup throws and process exits.
- Default is fail-fast in every environment because `scripts/dev-server.js` no longer sets degraded mode automatically.
- `ALLOW_DEGRADED_MODE=true` must be an explicit operator choice; otherwise the process exits before listening when MongoDB is unavailable.

## 7) `MONGODB_ALLOW_LOCAL_FALLBACK` behavior

- Interpreted as truthy for `1/true/yes/on`.
- Only takes effect when `MONGODB_LOCAL_URI` is explicitly provided.
- Prevents accidental fallback to local Mongo when only Atlas should be used.

## 8) Startup profile and degraded-mode request gating

- `server.js` calls `validateStartupConfig()` before DB connect.
- App stores DB state in `app.locals.db`.
- Because startup is fail-fast by default, the server does not listen when DB is offline unless `ALLOW_DEGRADED_MODE=true` is explicitly set.
- Only in explicit degraded mode do health routes remain accessible and business routes return `503 DB_UNAVAILABLE`.

## 9) Health payload behavior (`/api/health`)

Current payload includes:
- db status (`connected` or `failed`)
- db source (`MONGODB_URI`, `MONGODB_LOCAL_URI`, or `none`)
- degraded mode boolean (`true/false`)
- offline reason (`degradedReason` or connection error message)

No full secret URI is exposed; summaries are host-only with masked path.

## 10) DNS / Atlas diagnostics

- For SRV URIs, backend attempts DNS SRV resolution on `_mongodb._tcp.<atlas-host>`.
- On DNS failures (`ENOTFOUND`, `querySrv ENOTFOUND`) logs now provide actionable hints:
  - Atlas hostname typo check
  - DNS resolver check
  - VPN/proxy check
  - IP whitelist check after DNS is fixed

