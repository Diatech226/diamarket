import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = { title: 'Diapay Sandbox', description: 'Boutique et checkout sandbox Diapay' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="fr"><body>{children}</body></html>;
}
