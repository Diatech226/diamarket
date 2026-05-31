import { ClerkProvider } from '@clerk/nextjs';
import { getClerkRuntimeConfig } from '@/lib/config/env';
import type { ComponentType, PropsWithChildren } from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], display: 'swap' });
const SyncClerkProvider = ClerkProvider as unknown as ComponentType<PropsWithChildren<{ publishableKey: string }>>;

export const metadata: Metadata = {
  title: 'DiaExpress Admin v2',
  description: 'Pilotage avancé de la plateforme DiaExpress',
  metadataBase: new URL('https://adminv2.diaexpress.test'),
};

function RootBody({ children }: { children: React.ReactNode }) {
  return <body className={inter.className}>{children}</body>;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const clerkConfig = getClerkRuntimeConfig();

  const content = (
    <>
      {!clerkConfig.enabled ? (
        <div className="alert alert--error">
          <strong>Configuration Clerk incomplète</strong>
          <p>Variables manquantes: {clerkConfig.missingKeys.join(', ')}</p>
        </div>
      ) : null}
      {children}
    </>
  );

  return (
    <html lang="fr">
      {clerkConfig.enabled && clerkConfig.publishableKey ? (
        <SyncClerkProvider publishableKey={clerkConfig.publishableKey}>
          <RootBody>{content}</RootBody>
        </SyncClerkProvider>
      ) : (
        <RootBody>{content}</RootBody>
      )}
    </html>
  );
}
