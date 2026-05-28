# MongoDB troubleshooting for diamarket-api

`diamarket-api` loads MongoDB configuration explicitly from `apps/diamarket-api/.env` and overrides any inherited shell value for the same variable. Do not hardcode Atlas URIs in source code and never commit real credentials.

## Local fallback

For local development, start MongoDB locally and use:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/diamarket
ALLOW_API_WITHOUT_DB=true
```

`ALLOW_API_WITHOUT_DB=true` lets `/api/health` keep working when local MongoDB is temporarily stopped. Routes that require the database return `503 Database unavailable` until MongoDB is available again.

## Atlas checklist

1. **Cluster exists**: confirm the Atlas cluster name and hostname still exist in the Atlas project.
2. **Network Access / IP whitelist**: add your current public IP address, or use a temporary development-only allowlist entry if appropriate.
3. **Database User**: confirm the database user exists and has the required permissions for the target database.
4. **Encoded username/password**: URL-encode special characters in the username or password before placing them in `MONGODB_URI`.
5. **DNS SRV lookup**: test whether your machine can resolve the Atlas SRV record by replacing `<atlas-hostname>` with the hostname copied from Atlas:

```bash
nslookup -type=SRV _mongodb._tcp.<atlas-hostname>
```

## If `querySrv ENOTFOUND` persists

`querySrv ENOTFOUND` means the DNS SRV record cannot be resolved from the machine starting the API. The API logs only the MongoDB hostname, never the password, to help identify which cluster is being used.

If the cluster hostname is correct but SRV lookup still fails:

- use the standard `mongodb://` connection string from Atlas instead of `mongodb+srv://`;
- or change your DNS servers to reliable public resolvers such as:
  - `1.1.1.1`
  - `8.8.8.8`

## Temporary degraded API mode

For UI development only, you can let the API start without MongoDB:

```env
ALLOW_API_WITHOUT_DB=true
```

In this mode:

- `diamarket-api` starts and logs `[database] MongoDB unavailable, API started in degraded mode`;
- `/api/health` continues to return a successful response;
- routes that require MongoDB return `503 Database unavailable`.

Keep `ALLOW_API_WITHOUT_DB=false` for normal staging and production environments so database issues fail fast.
