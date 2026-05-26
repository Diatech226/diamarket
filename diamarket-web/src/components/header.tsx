'use client';
import Link from 'next/link';
import { CartDrawer, CurrencySwitcher, LanguageSwitcher } from '@/components/ui';

export function ClientHeader() {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-semibold">Diamarket</Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/catalogue">Catalogue</Link>
          <Link href="/vendor-apply">Devenir vendeur</Link>
          <LanguageSwitcher />
          <CurrencySwitcher />
          <CartDrawer />
        </nav>
      </div>
    </header>
  );
}
