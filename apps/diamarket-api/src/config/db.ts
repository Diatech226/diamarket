import mongoose from 'mongoose';
import { env } from './env';

type DatabaseStatus = 'connected' | 'degraded' | 'disconnected';

let databaseStatus: DatabaseStatus = 'disconnected';
let databaseUnavailableReason = 'Database connection has not been initialized.';

export const getDatabaseStatus = () => ({
  available: databaseStatus === 'connected',
  status: databaseStatus,
  reason: databaseUnavailableReason
});

const getMongoHostname = (uri: string): string => {
  try {
    return new URL(uri).hostname || 'unknown-host';
  } catch {
    return 'invalid-mongodb-uri';
  }
};

const isSrvDnsError = (error: unknown) => {
  if (!(error instanceof Error)) return false;
  return /querySrv|ENOTFOUND|ETIMEOUT|ENODATA|ESERVFAIL/i.test(error.message);
};

const redactMongoCredentials = (message: string) =>
  message.replace(/(mongodb(?:\+srv)?:\/\/)([^@\s/]+)@/gi, '$1***:***@');

const buildConnectionErrorMessage = (error: unknown, hostname: string) => {
  const baseMessage = redactMongoCredentials(error instanceof Error ? error.message : String(error));

  if (isSrvDnsError(error)) {
    return [
      `MongoDB DNS SRV lookup failed for host "${hostname}".`,
      'Verify that the Atlas cluster exists and that your DNS resolver can resolve the _mongodb._tcp SRV record.',
      'If mongodb+srv:// keeps failing, try the standard mongodb:// connection string from Atlas or use a local fallback such as mongodb://127.0.0.1:27017/diamarket.',
      `Original error: ${baseMessage}`
    ].join(' ');
  }

  return `MongoDB connection failed for host "${hostname}": ${baseMessage}`;
};

const markDegraded = (reason: string) => {
  databaseStatus = 'degraded';
  databaseUnavailableReason = reason;
  console.warn(`[database] WARNING: API started without MongoDB. ${reason}`);
  console.warn('[database] Routes that require MongoDB will return 503 Database unavailable; /api/health remains available.');
};

export async function connectDatabase() {
  const mongoUri = env.mongodbUri;

  if (!mongoUri) {
    const message = 'MONGODB_URI is missing. Set it in apps/diamarket-api/.env or export it before starting the API.';
    if (env.allowApiWithoutDb) {
      markDegraded(message);
      return;
    }
    throw new Error(message);
  }

  const hostname = getMongoHostname(mongoUri);
  console.info(`[database] Connecting to MongoDB host: ${hostname}`);

  try {
    await mongoose.connect(mongoUri);
    databaseStatus = 'connected';
    databaseUnavailableReason = '';
    console.info(`[database] Connected to MongoDB host: ${hostname}`);
  } catch (error) {
    const message = buildConnectionErrorMessage(error, hostname);
    if (env.allowApiWithoutDb) {
      markDegraded(message);
      return;
    }
    throw new Error(message);
  }
}
