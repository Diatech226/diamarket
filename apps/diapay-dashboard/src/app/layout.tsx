import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Diapay Dashboard',
  description: 'Dashboard marchand et administrateur pour Diapay.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
