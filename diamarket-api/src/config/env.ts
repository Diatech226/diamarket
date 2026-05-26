import dotenv from 'dotenv';
dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  mongoUri: process.env.MONGO_URI ?? '',
  clerkIssuer: process.env.CLERK_ISSUER_URL ?? '',
  clerkSecretKey: process.env.CLERK_SECRET_KEY ?? ''
};
