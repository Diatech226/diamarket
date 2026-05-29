import dns from 'node:dns/promises';
import mongoose from 'mongoose';

const MONGODB_SRV_PREFIX = 'mongodb+srv://';

const getMongoHostname = (uri: string): string => {
  try {
    return new URL(uri).hostname || 'unknown-host';
  } catch {
    return 'invalid-mongodb-uri';
  }
};

const getSrvRecord = (hostname: string) => `_mongodb._tcp.${hostname}`;

const getErrorText = (error: unknown) => (error instanceof Error ? error.message : String(error));

const getErrorCode = (error: unknown) =>
  typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';

const isSrvDnsError = (error: unknown) => {
  const errorText = `${getErrorCode(error)} ${getErrorText(error)}`;
  return /querySrv|ENOTFOUND|EAI_AGAIN|ETIMEOUT|ENODATA|ESERVFAIL|ECONNREFUSED/i.test(errorText);
};

const redactMongoCredentials = (message: string) =>
  message.replace(/(mongodb(?:\+srv)?:\/\/)([^@\s/]+)@/gi, '$1***:***@');

const buildSrvDnsErrorMessage = (error: unknown, hostname: string) => {
  const baseMessage = redactMongoCredentials(getErrorText(error));
  const srvRecord = getSrvRecord(hostname);
  const configuredResolvers = dns.getServers().join(', ') || 'unknown';

  return [
    `MongoDB Atlas DNS SRV lookup failed for host "${hostname}" (${srvRecord}).`,
    'Connection to MongoDB is required, so the API will stop.',
    `Configured DNS resolver(s): ${configuredResolvers}.`,
    '',
    'Checks to run:',
    '1) Verify that this machine has internet access.',
    `2) Verify DNS resolution with: nslookup -type=SRV ${srvRecord}`,
    '3) Verify that the MongoDB Atlas cluster exists, is not paused, and that the hostname was not typed manually.',
    '4) Copy MONGODB_URI again from Atlas > Connect > Drivers and paste it unchanged, then only replace username/password.',
    '5) If mongodb+srv:// keeps failing on this network, copy the standard mongodb:// URI from Atlas and use it as MONGODB_URI.',
    '',
    `Original error: ${baseMessage}`
  ].join('\n');
};

const buildConnectionErrorMessage = (error: unknown, hostname: string, uri: string) => {
  const baseMessage = redactMongoCredentials(getErrorText(error));

  if (uri.startsWith(MONGODB_SRV_PREFIX) && isSrvDnsError(error)) {
    return buildSrvDnsErrorMessage(error, hostname);
  }

  return [
    `MongoDB connection failed for host "${hostname}".`,
    'Connection to MongoDB is required, so the API will stop.',
    `Original error: ${baseMessage}`
  ].join('\n');
};

const assertSrvDnsResolves = async (uri: string, hostname: string) => {
  if (!uri.startsWith(MONGODB_SRV_PREFIX)) return;

  try {
    await dns.resolveSrv(getSrvRecord(hostname));
  } catch (error) {
    throw new Error(buildSrvDnsErrorMessage(error, hostname));
  }
};

export async function connectDatabase() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI is missing. Set it in apps/diamarket-api/.env or export it before starting the API.');
  }

  const hostname = getMongoHostname(mongoUri);
  console.info(`[database] MongoDB host: ${hostname}`);

  try {
    await assertSrvDnsResolves(mongoUri, hostname);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
    console.info(`[database] Connected to MongoDB host: ${hostname}`);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('MongoDB Atlas DNS SRV lookup failed')) {
      throw error;
    }

    throw new Error(buildConnectionErrorMessage(error, hostname, mongoUri));
  }
}
