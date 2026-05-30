import type { ReactNode } from 'react';
import './styles.css';

export const metadata = { title: 'Diapay Developer Portal', description: 'Premium Diapay docs, API playground, SDK guides and sandbox reference.' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="fr"><body>{children}</body></html>;
}
