import './globals.css';
import { ReactNode } from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { AdminSidebar } from '@/components/sidebar';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="fr">
        <body>
          <div className="flex min-h-screen">
            <AdminSidebar />
            <main className="flex-1 p-8">{children}</main>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
