'use client';
import Link from 'next/link';
import { CartDrawer, CurrencySwitcher, LanguageSwitcher } from '@/components/ui';

export function ClientHeader() {
  return (
    <header className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-6">
        <Link href="/" className="text-xl font-semibold">Diamarket</Link>
        <nav className="flex items-center gap-2 text-xs md:gap-3 md:text-sm">
          <Link href="/catalogue">Catalogue</Link>
          <Link href="/vendor-apply" className='hidden md:inline'>Devenir vendeur</Link>
          <LanguageSwitcher />
          <CurrencySwitcher />
          <CartDrawer />
        </nav>
      </div>
    </header>
  );
}
