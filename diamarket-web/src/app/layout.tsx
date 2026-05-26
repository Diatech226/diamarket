import './globals.css';
import { ReactNode } from 'react';
import { ClerkProvider } from '@clerk/nextjs';
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
    <ClerkProvider>
      <html lang="fr">
        <body className='bg-slate-50'>
          <StoreProvider>
            <ClientHeader />
            <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-10">{children}</main>
          </StoreProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
