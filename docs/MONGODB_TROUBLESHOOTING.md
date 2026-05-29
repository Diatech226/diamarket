# MongoDB troubleshooting for diamarket-api

`diamarket-api` loads MongoDB configuration explicitly from `apps/diamarket-api/.env` and overrides any inherited shell value for the same variable. Do not hardcode Atlas URIs in source code and never commit real credentials.

MongoDB is mandatory for the API. If the connection fails at startup, the API stops instead of starting in degraded mode.

## Local development

For local development, start MongoDB locally and use:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/diamarket
```

## Atlas checklist

1. **Cluster exists**: confirm the Atlas cluster name and hostname still exist in the Atlas project.
2. **Network Access / IP whitelist**: add your current public IP address, or whitelist the fixed outbound IP of your server.
3. **Database User**: confirm the database user exists and has the required permissions for the target database.
4. **Encoded username/password**: URL-encode special characters in the username or password before placing them in `MONGODB_URI`.
5. **DNS SRV lookup**: test whether your machine can resolve the Atlas SRV record by replacing `<atlas-hostname>` with the hostname copied from Atlas:

```bash
nslookup -type=SRV _mongodb._tcp.<atlas-hostname>
```

You can also run:

```bash
npm run test:mongo:dns
```

## If `querySrv ENOTFOUND` persists

`querySrv ENOTFOUND` means the DNS SRV record cannot be resolved from the machine starting the API. The API logs only the MongoDB hostname, never the password, to help identify which cluster is being used.

If DNS confirms that the Atlas `.mongodb.net` hostname itself no longer exists, the API and `npm run test:mongo:dns` print `The Atlas hostname appears invalid or no longer exists.` In that case, copy a fresh URI from **Atlas > Connect > Drivers** and confirm you are in the correct Atlas project before treating it as a network outage.

If the cluster hostname is correct but SRV lookup still fails:

- verify internet access from the machine running the API;
- verify DNS resolution with `nslookup -type=SRV _mongodb._tcp.<atlas-hostname>`;
- verify that the Atlas cluster exists and is running;
- verify that `MONGODB_URI` exactly matches the URI copied from **Atlas > Connect > Drivers**;
- change DNS to reliable public resolvers such as `1.1.1.1` or `8.8.8.8`;
- use the standard `mongodb://` connection string from Atlas instead of `mongodb+srv://` if the network blocks SRV lookups.

For a full setup guide, see [`docs/MONGODB_ATLAS_SETUP.md`](./MONGODB_ATLAS_SETUP.md).
