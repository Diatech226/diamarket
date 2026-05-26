import { defaultCurrency, supportedCurrencies } from '@/lib/currency';
import { defaultLocale, supportedLocales } from '@/lib/i18n';

export default function HomePage() {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">Base client prête</h2>
      <p>Locales: {supportedLocales.join(', ')} (défaut: {defaultLocale})</p>
      <p>Devises: {supportedCurrencies.join(', ')} (défaut: {defaultCurrency})</p>
    </section>
  );
}
