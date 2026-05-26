import dotenv from 'dotenv';
dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  mongoUri: process.env.MONGO_URI ?? '',
  clerkIssuer: process.env.CLERK_ISSUER_URL ?? '',
  clerkSecretKey: process.env.CLERK_SECRET_KEY ?? '',
  shippingProvider: process.env.SHIPPING_PROVIDER ?? 'mock',
  shippingApiBaseUrl: process.env.SHIPPING_API_BASE_URL ?? '',
  shippingApiKey: process.env.SHIPPING_API_KEY ?? '',
  shippingApiTimeout: Number(process.env.SHIPPING_API_TIMEOUT ?? 15000),
  shippingDefaultOriginCountry: process.env.SHIPPING_DEFAULT_ORIGIN_COUNTRY ?? 'Burkina Faso',
  shippingDefaultOriginCity: process.env.SHIPPING_DEFAULT_ORIGIN_CITY ?? 'Ouagadougou'
};
