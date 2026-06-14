import './globals.css';
import { ReactNode } from 'react';
import { ClientHeader } from '@/components/header';
import { StoreProvider } from '@/context/store';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Diamarket | Marketplace premium africaine',
  description: 'Marketplace premium internationale: produits tendances, vendeurs vérifiés, livraison multi-pays.',
  openGraph: {
    title: 'Diamarket Premium Marketplace',
    description: 'Expérience premium mobile-first pour acheter en confiance.',
    type: 'website'
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
        <body className='bg-slate-50'>
          <StoreProvider>
            <ClientHeader />
            <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-10">{children}</main>
            <footer className="mt-12 border-t bg-slate-950 text-slate-200">
              <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 md:grid-cols-4 md:px-6">
                <div><p className="text-xl font-bold text-white">Diamarket</p><p className="mt-2 text-sm text-slate-400">La marketplace africaine pour acheter et vendre en confiance.</p></div>
                <div><p className="font-semibold text-white">Acheter</p><p className="mt-2 text-sm text-slate-400">Paiement sécurisé<br/>Livraison suivie<br/>Retours accompagnés</p></div>
                <div><p className="font-semibold text-white">Besoin d’aide ?</p><p className="mt-2 text-sm text-slate-400">FAQ et support<br/>Informations livraison<br/>Retours et remboursements</p></div>
                <div><p className="font-semibold text-white">Marketplace</p><p className="mt-2 text-sm text-slate-400">Vendeurs vérifiés<br/>Devenir vendeur<br/>Conditions et confidentialité</p></div>
              </div>
              <p className="border-t border-white/10 px-4 py-4 text-center text-xs text-slate-500">© 2026 Diamarket. Vos achats, en toute confiance.</p>
            </footer>
          </StoreProvider>
        </body>
    </html>
  );
}
