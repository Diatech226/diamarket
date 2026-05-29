# MongoDB Atlas setup for `diamarket-api`

`diamarket-api` requires a working MongoDB connection at startup. There is no degraded mode: if MongoDB Atlas cannot be reached, the API stops with a clear startup error. Never commit a real Atlas username or password.

## 1. Copy the official URI from MongoDB Atlas

1. Open MongoDB Atlas and select the project that contains the Diamarket cluster.
2. Open **Database** and select the target cluster.
3. Click **Connect**.
4. Choose **Drivers**.
5. Select **Node.js** as the driver family.
6. Copy the generated connection string.
7. Paste it into `apps/diamarket-api/.env` as `MONGODB_URI`.
8. Replace the placeholders with the correct database username and password.
9. Keep the URI exact: do not rename the cluster host manually.

Example shape only, without real credentials:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.wmizrba.mongodb.net/diamarket?retryWrites=true&w=majority&appName=Cluster0
```

If your username or password contains special characters, URL-encode them before placing them in the URI.

## 2. Whitelist your IP in Network Access

1. In Atlas, open **Security > Network Access**.
2. Click **Add IP Address**.
3. For local development, click **Add Current IP Address**.
4. Add an optional comment such as `local development`.
5. Save and wait until the entry is active.

For production, whitelist only the fixed outbound IPs used by your server or hosting provider. Avoid `0.0.0.0/0` except for short, controlled tests.

## 3. Verify the Database User

1. In Atlas, open **Security > Database Access**.
2. Confirm that the username used in `MONGODB_URI` exists.
3. Confirm that the user has the required permissions for the Diamarket database.
4. If you reset the password, update `apps/diamarket-api/.env` immediately.
5. URL-encode the password in the URI if it contains characters such as `@`, `:`, `/`, `?`, `#`, `%`, or spaces.

## 4. Test Atlas SRV DNS resolution

Atlas `mongodb+srv://` URIs require DNS SRV resolution. Test the SRV record directly:

```bash
nslookup -type=SRV _mongodb._tcp.cluster0.wmizrba.mongodb.net
```

You can also run the API helper script from the repository root:

```bash
npm run test:mongo:dns
```

Or, if you are working inside the API package directly:

```bash
npm --prefix apps/diamarket-api run test:mongo:dns
```

The helper reads `apps/diamarket-api/.env`, validates that `MONGODB_URI` is a usable Atlas SRV URI, extracts the hostname, and resolves the SRV record without printing the username or password.


## 5. Startup URI validation and invalid-host diagnostics

At startup, `diamarket-api` validates `MONGODB_URI` before opening the Mongoose connection:

- `MONGODB_URI` must be present.
- The URI must start with `mongodb+srv://` for Atlas SRV connections or `mongodb://` for the standard MongoDB URI.
- `mongodb+srv://` URIs must not include a port.
- `mongodb+srv://` hostnames must be fully qualified.
- The API validates the SRV record (`_mongodb._tcp.<hostname>`) before connecting, so DNS problems fail fast with a targeted message.

If the MongoDB driver reports `querySrv ENOTFOUND`, the API now checks whether the Atlas hostname itself exists. When DNS confirms that the host does not exist, the startup error includes this exact diagnostic:

```text
The Atlas hostname appears invalid or no longer exists.
```

In that case, do not troubleshoot it as a generic network outage first. Copy a fresh URI from **Atlas > Connect > Drivers** and confirm that the cluster has not been deleted, renamed, paused, or selected from the wrong Atlas project.

## 6. Change Windows DNS to 1.1.1.1 or 8.8.8.8

If `querySrv ENOTFOUND` persists after you have confirmed that the Atlas hostname exists, switch Windows to a reliable public resolver:

1. Open **Settings**.
2. Go to **Network & internet**.
3. Open **Advanced network settings**.
4. Select your active adapter under **More network adapter options** or **Hardware and connection properties**.
5. Open the adapter DNS settings.
6. Set DNS to manual IPv4.
7. Use one of these resolver pairs:
   - Cloudflare: preferred `1.1.1.1`, alternate `1.0.0.1`
   - Google: preferred `8.8.8.8`, alternate `8.8.4.4`
8. Save, then open a new terminal and retry the `nslookup` command.

You can also flush the local DNS cache after changing DNS:

```powershell
ipconfig /flushdns
```

## 7. If SRV DNS still fails

Check the following before restarting the API:

- Internet access is working from the machine running the API.
- DNS resolution works for the Atlas SRV record.
- The Atlas cluster exists, is not paused, and belongs to the selected project.
- `MONGODB_URI` exactly matches the URI copied from **Atlas > Connect > Drivers**.
- Network Access includes your current public IP or your server outbound IP.
- The Database User exists and the password in `.env` is current.

If the local network blocks SRV lookups, copy the **standard `mongodb://` URI** from Atlas and use that in `MONGODB_URI` instead of the `mongodb+srv://` URI.
