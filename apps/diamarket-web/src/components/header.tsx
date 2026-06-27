'use client';
import Link from 'next/link';
import { CartDrawer, CurrencySwitcher, LanguageSwitcher } from '@/components/ui';
import { ThemeToggle } from '@/components/theme/theme-provider';

export function ClientHeader({ siteName = "Diamarket", logo }: { siteName?: string; logo?: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-brand-border bg-brand-surface/95 dark:border-brand-border backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-2 text-xl font-semibold">{logo ? <img src={logo} alt={siteName} className="h-8 w-8 rounded object-contain" /> : null}<span>{siteName}</span></Link>
        <nav className="flex items-center gap-2 text-xs md:gap-3 md:text-sm">
          <Link href="/catalogue">Catalogue</Link>
          <Link href="/vendor-apply" className='hidden md:inline'>Devenir vendeur</Link>
          <Link href="/account">Compte</Link>
          <LanguageSwitcher />
          <CurrencySwitcher />
          <ThemeToggle />
          <CartDrawer />
        </nav>
      </div>
    </header>
  );
}
