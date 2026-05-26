import './globals.css';
import { ReactNode } from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { ClientHeader } from '@/components/header';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="fr">
        <body>
          <ClientHeader />
          <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
