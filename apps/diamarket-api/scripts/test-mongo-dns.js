#!/usr/bin/env node
const dns = require('node:dns').promises;
const path = require('node:path');
const dotenv = require('dotenv');

const apiEnvPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: apiEnvPath, override: true });

const redactMongoCredentials = (value) =>
  value.replace(/(mongodb(?:\+srv)?:\/\/)([^@\s/]+)@/gi, '$1***:***@');

const getSrvRecordFromMongoUri = (uri) => {
  if (!uri) {
    throw new Error('MONGODB_URI is missing. Set it in apps/diamarket-api/.env or export it before running this script.');
  }

  if (!uri.startsWith('mongodb+srv://')) {
    throw new Error('MONGODB_URI must start with mongodb+srv:// to test Atlas SRV DNS resolution. Use the Atlas SRV URI from Connect > Drivers.');
  }

  let parsed;
  try {
    parsed = new URL(uri);
  } catch {
    throw new Error(`MONGODB_URI is not a valid MongoDB URI: ${redactMongoCredentials(uri)}`);
  }

  if (!parsed.hostname) {
    throw new Error(`MONGODB_URI does not contain a hostname: ${redactMongoCredentials(uri)}`);
  }

  return `_mongodb._tcp.${parsed.hostname}`;
};

const main = async () => {
  console.info(`[mongo:dns] Loaded API env from: ${apiEnvPath}`);

  const srvRecord = getSrvRecordFromMongoUri(process.env.MONGODB_URI);
  console.info(`[mongo:dns] Testing SRV record: ${srvRecord}`);

  try {
    const records = await dns.resolveSrv(srvRecord);
    console.info(`[mongo:dns] DNS SRV resolution succeeded (${records.length} record${records.length === 1 ? '' : 's'}).`);
    for (const record of records) {
      console.info(`[mongo:dns] ${record.name}:${record.port} priority=${record.priority} weight=${record.weight}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[mongo:dns] DNS SRV resolution failed for ${srvRecord}.`);
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
