import './globals.css';
import { ReactNode } from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { ClientHeader } from '@/components/header';
import { StoreProvider } from '@/context/store';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="fr">
        <body>
          <StoreProvider>
            <ClientHeader />
            <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
          </StoreProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
