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
  const baseMessage = redactMongoCredentials(error instanceof Error ? error.message : String(error));
  const srvRecord = `_mongodb._tcp.${hostname}`;

  return [
    `MongoDB Atlas DNS SRV lookup failed for host "${hostname}" (${srvRecord}).`,
    'Connection to MongoDB is required, so the API will stop.',
    'Checks to run:',
    '1) verify that this machine has internet access;',
    '2) verify that DNS resolution works for the Atlas SRV record;',
    '3) verify that the MongoDB Atlas cluster exists and is running;',
    '4) verify that MONGODB_URI exactly matches the URI copied from Atlas > Connect > Drivers;',
    '5) if mongodb+srv:// keeps failing on this network, try the standard mongodb:// URI from Atlas.',
    `Original error: ${baseMessage}`
  ].join(' ');
};

const buildConnectionErrorMessage = (error: unknown, hostname: string, uri: string) => {
  const baseMessage = redactMongoCredentials(error instanceof Error ? error.message : String(error));

  if (uri.startsWith(MONGODB_SRV_PREFIX) && isSrvDnsError(error)) {
    return buildSrvDnsErrorMessage(error, hostname);
  }

  return `MongoDB connection failed for host "${hostname}". Connection to MongoDB is required, so the API will stop. Original error: ${baseMessage}`;
};

export async function connectDatabase() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI is missing. Set it in apps/diamarket-api/.env or export it before starting the API.');
  }

  const hostname = getMongoHostname(mongoUri);
  console.info(`[database] MongoDB host: ${hostname}`);

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
    console.info(`[database] Connected to MongoDB host: ${hostname}`);
  } catch (error) {
    throw new Error(buildConnectionErrorMessage(error, hostname, mongoUri));
  }
}
