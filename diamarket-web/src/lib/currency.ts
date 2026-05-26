export const supportedCurrencies = ['FCFA', 'USD'] as const;
export type SupportedCurrency = (typeof supportedCurrencies)[number];
export const defaultCurrency: SupportedCurrency = 'FCFA';
