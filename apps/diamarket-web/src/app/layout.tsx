import './globals.css';
import { ReactNode } from 'react';
import { ClientHeader } from '@/components/header';
import { ThemeProvider, ThemeScript } from '@/components/theme/theme-provider';
import { StoreProvider } from '@/context/store';
import { getPublicSettings, type PublicSettings } from '@/lib/api';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings().catch((): PublicSettings => ({}));
  const seo = settings.seo ?? {};
  return {
    title: seo.title || `${settings.marketplaceName || 'Diamarket'} | Marketplace premium africaine`,
    description: seo.description || 'Marketplace premium internationale: produits tendances, vendeurs vérifiés, livraison multi-pays.',
    keywords: seo.keywords,
    icons: settings.favicon ? { icon: settings.favicon } : undefined,
    openGraph: { title: seo.title || settings.marketplaceName || 'Diamarket', description: seo.description, images: seo.openGraphImage ? [seo.openGraphImage] : undefined, type: 'website' }
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const settings = await getPublicSettings().catch((): PublicSettings => ({}));
  const siteName = settings.marketplaceName || 'Diamarket';
  return (
    <html lang="fr" suppressHydrationWarning><head><ThemeScript /></head>
      <body className='bg-brand-surface text-brand-dark dark:bg-brand-surface dark:text-brand-text'>
        <ThemeProvider>
        <StoreProvider>
          <ClientHeader siteName={siteName} logo={settings.logo} />
          <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-10">{children}</main>
          <footer className="mt-12 border-t border-white/10 bg-brand-dark text-slate-200">
            <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 md:grid-cols-4 md:px-6">
              <div><p className="text-xl font-bold text-white">{siteName}</p><p className="mt-2 text-sm text-slate-400">La marketplace africaine pour acheter et vendre en confiance.</p></div>
              <div><p className="font-semibold text-white">Acheter</p><p className="mt-2 text-sm text-slate-400">Paiement sécurisé<br/>Livraison suivie<br/>Retours accompagnés</p></div>
              <div><p className="font-semibold text-white">Besoin d’aide ?</p><p className="mt-2 text-sm text-slate-400">{settings.supportContact || 'Support'}<br/>{settings.supportEmail || 'Informations livraison'}<br/>{settings.supportPhone || 'Retours et remboursements'}</p></div>
              <div><p className="font-semibold text-white">Réseaux sociaux</p><p className="mt-2 text-sm text-slate-400">{Object.entries(settings.socialLinks ?? {}).filter(([,v]) => v).map(([k]) => k).join(' · ') || 'Vendeurs vérifiés'}</p></div>
            </div>
            <p className="border-t border-white/10 px-4 py-4 text-center text-xs text-slate-500">© 2026 {siteName}. Vos achats, en toute confiance.</p>
          </footer>
        </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
