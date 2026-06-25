import { api, getPublicSettings, type PublicSettings } from '@/lib/api';
import HomeClient from './pageClient';

export default async function HomePage() {
  const settings = await getPublicSettings().catch((): PublicSettings => ({}));
  if (settings.maintenanceMode) {
    return <section className="mx-auto max-w-2xl rounded-3xl bg-white p-8 text-center shadow-sm"><h1 className="text-3xl font-bold">{settings.marketplaceName || 'Diamarket'} est en maintenance</h1>{settings.maintenanceImage ? <img src={settings.maintenanceImage} alt="Maintenance" className="mx-auto my-6 max-h-72 rounded-2xl object-contain" /> : null}<p className="mt-4 text-slate-600">{settings.maintenanceMessage || 'La marketplace est temporairement indisponible.'}</p>{settings.supportEmail ? <p className="mt-4 text-sm text-slate-500">Support : {settings.supportEmail}</p> : null}</section>;
  }
  const [slides, categories, products] = await Promise.all([api.getSlides(), api.getCategories(), api.getProducts()]);
  return <HomeClient slides={slides} categories={categories} products={products} />;
}
