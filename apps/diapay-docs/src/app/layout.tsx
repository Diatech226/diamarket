import type { ReactNode } from 'react';

export const metadata = {
  title: 'Diapay Docs',
  description: 'Documentation Diapay pour checkout, providers de paiement et webhooks.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, background: '#f8fafc', color: '#0f172a' }}>{children}</body>
    </html>
  );
}
