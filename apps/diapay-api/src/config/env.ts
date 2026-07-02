export const env = {
  port: Number(process.env.PORT ?? 5100),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  diapayCheckoutUrl: process.env.DIAPAY_CHECKOUT_URL ?? 'http://localhost:3102',
};
