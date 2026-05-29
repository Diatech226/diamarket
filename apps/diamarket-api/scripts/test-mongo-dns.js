#!/usr/bin/env node
const dns = require('node:dns').promises;
const path = require('node:path');
const dotenv = require('dotenv');

const apiEnvPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: apiEnvPath, override: true });

const redactMongoCredentials = (value) =>
  value.replace(/(mongodb(?:\+srv)?:\/\/)([^@\s/]+)@/gi, '$1***:***@');

const getHostnameFromMongoUri = (uri) => {
  let parsed;
  try {
    parsed = new URL(uri);
  } catch {
    throw new Error(`MONGODB_URI is not a valid MongoDB URI: ${redactMongoCredentials(uri)}`);
  }

  if (!parsed.hostname) {
    throw new Error(`MONGODB_URI does not contain a hostname: ${redactMongoCredentials(uri)}`);
  }

  return parsed.hostname;
};

const getSrvRecordFromMongoUri = (uri) => {
  if (!uri) {
    throw new Error('MONGODB_URI is missing. Set it in apps/diamarket-api/.env or export it before running this script.');
  }

  if (!uri.startsWith('mongodb+srv://')) {
    const hostname = getHostnameFromMongoUri(uri);
    console.info(`[mongo:dns] MONGODB_URI does not use mongodb+srv://, so there is no SRV record to test. Hostname: ${hostname}`);
    console.info('[mongo:dns] Standard mongodb:// URIs bypass Atlas SRV lookup.');
    return null;
  }

  return `_mongodb._tcp.${getHostnameFromMongoUri(uri)}`;
};

const main = async () => {
  console.info(`[mongo:dns] Loaded API env from: ${apiEnvPath}`);
  console.info(`[mongo:dns] DNS resolver(s): ${dns.getServers().join(', ') || 'unknown'}`);

  const srvRecord = getSrvRecordFromMongoUri(process.env.MONGODB_URI);
  if (!srvRecord) return;

  console.info(`[mongo:dns] Testing SRV record: ${srvRecord}`);
  console.info(`[mongo:dns] Equivalent manual command: nslookup -type=SRV ${srvRecord}`);

  try {
    const records = await dns.resolveSrv(srvRecord);
    console.info(`[mongo:dns] DNS SRV resolution succeeded (${records.length} record${records.length === 1 ? '' : 's'}).`);
    for (const record of records) {
      console.info(`[mongo:dns] ${record.name}:${record.port} priority=${record.priority} weight=${record.weight}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[mongo:dns] DNS SRV resolution failed for ${srvRecord}.`);
    console.error('[mongo:dns] This is a DNS/Atlas URI problem before Mongoose can connect.');
    console.error('[mongo:dns] Checks: verify internet access, DNS resolver, Atlas cluster existence, and the exact Atlas URI copied from Connect > Drivers.');
    console.error('[mongo:dns] If mongodb+srv:// keeps failing on this network, try the standard mongodb:// URI from Atlas.');
    console.error(`[mongo:dns] Original error: ${message}`);
    process.exitCode = 1;
  }
};

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[mongo:dns] ${message}`);
  process.exit(1);
});
