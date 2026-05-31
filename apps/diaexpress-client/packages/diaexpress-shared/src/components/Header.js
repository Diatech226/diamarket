import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ANALYTICS_EVENTS, trackEvent } from '../lib/analytics';

const NAV_LINKS = [
  { href: '/', label: 'Accueil', match: 'exact' },
  { href: '/track-shipment', label: 'Tracking' },
  { href: '/quote-request', label: 'Devis' },
  { href: '/services', label: 'Services' },
  { href: '/services#services-comparison', label: 'Tarifs', match: 'hash' },
  { href: '/client', label: 'Dashboard' },
  { href: '/contact', label: 'Support' },
];

const MOBILE_LINKS = [
  { href: '/', label: 'Accueil', icon: '⌂', match: 'exact' },
  { href: '/track-shipment', label: 'Suivi', icon: '⌖' },
  { href: '/quote-request', label: 'Devis', icon: '+' },
  { href: '/services', label: 'Services', icon: '◇' },
  { href: '/contact', label: 'Support', icon: '?' },
];

const Header = ({ user, onSignOut, SignInButtonComponent, UserButtonComponent, isAuthReady = false }) => {
  const router = useRouter();
  const [isClientReady, setIsClientReady] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  React.useEffect(() => {
    setIsClientReady(true);
  }, []);

  React.useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  React.useEffect(() => {
    setIsMenuOpen(false);
  }, [router.pathname]);

  const canRenderAuth = isClientReady && isAuthReady;
  const resolvedUser = canRenderAuth ? user : null;

  const isActiveLink = React.useCallback(
    (link) => {
      if (link.match === 'exact') return router.pathname === link.href;
      const pathname = link.href.split('#')[0];
      return router.pathname === pathname || router.pathname.startsWith(`${pathname}/`);
    },
    [router.pathname]
  );

  return (
    <>
      <a className="dx-skip-link" href="#main-content">Aller au contenu principal</a>
      <header className={`dx-header ${isScrolled ? 'dx-header--scrolled' : ''}`}>
        <div className="dx-header__inner">
          <Link href="/" className="dx-header__logo" aria-label="Accueil DiaExpress">
            <span className="dx-header__logo-mark" aria-hidden="true">DX</span>
            <span className="dx-header__logo-text">DiaExpress</span>
          </Link>

          <button
            type="button"
            className="dx-header__menu-toggle"
            aria-expanded={isMenuOpen}
            aria-controls="dx-main-navigation"
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <span aria-hidden="true">☰</span>
            Menu
          </button>

          <nav
            id="dx-main-navigation"
            className={`dx-header__nav ${isMenuOpen ? 'dx-header__nav--open' : ''}`}
            aria-label="Navigation principale"
          >
            {NAV_LINKS.map((link) => {
              const isActive = isActiveLink(link);
              return (
                <Link key={link.href} href={link.href} aria-current={isActive ? 'page' : undefined}>
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className={`dx-header__actions ${isMenuOpen ? 'dx-header__actions--open' : ''}`} suppressHydrationWarning>
            <Link
              href="/quote-request"
              className="dx-button-inline"
              onClick={() => trackEvent(ANALYTICS_EVENTS.SEND_PACKAGE_CLICK, { location: 'header' })}
            >
              Envoyer un colis
            </Link>
            {!canRenderAuth ? null : resolvedUser ? (
              <>
                <Link href="/mes-colis" className="dx-button-inline dx-button-inline--ghost">
                  Mes colis
                </Link>
                {UserButtonComponent ? <UserButtonComponent /> : null}
                <button type="button" className="dx-button-inline dx-button-inline--ghost" onClick={onSignOut}>
                  Déconnexion
                </button>
              </>
            ) : SignInButtonComponent ? (
              <SignInButtonComponent mode="modal">
                <button type="button" className="dx-button-inline dx-button-inline--ghost">Connexion</button>
              </SignInButtonComponent>
            ) : null}
          </div>
        </div>
      </header>

      <nav className="dx-bottom-nav" aria-label="Navigation mobile DiaExpress">
        {MOBILE_LINKS.map((link) => {
          const isActive = isActiveLink(link);
          return (
            <Link key={link.href} href={link.href} aria-current={isActive ? 'page' : undefined}>
              <span aria-hidden="true">{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
};

export default Header;
