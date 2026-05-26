export const supportedLocales = ['fr', 'en', 'zh'] as const;
export type SupportedLocale = (typeof supportedLocales)[number];

export const defaultLocale: SupportedLocale = 'fr';
