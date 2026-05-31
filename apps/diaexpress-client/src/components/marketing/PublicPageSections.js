import React from 'react';
import Link from 'next/link';
import styles from './PublicPages.module.css';
import { ANALYTICS_EVENTS, trackEvent } from '../../lib/analytics/trackEvent';

export const useRevealOnScroll = () => {
  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const nodes = document.querySelectorAll('[data-reveal]');
    if (!nodes.length || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(styles.revealed);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    nodes.forEach((node) => {
      node.classList.add(styles.reveal);
      observer.observe(node);
    });
    return () => observer.disconnect();
  }, []);
};

export const PublicReveal = ({ children }) => <div data-reveal>{children}</div>;

export const PublicBackgroundVisual = ({ children }) => <main className={styles.page}>{children}</main>;

export const PublicPageHero = ({ eyebrow, title, subtitle, pills = [], actions, visual }) => (
  <section className={styles.hero}>
    <div className={styles.container} data-reveal>
      <div className={styles.heroCard}>
        <div>
          {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
          <h1 className={styles.title}>{title}</h1>
          {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
          {pills.length ? <div className={styles.heroPills}>{pills.map((pill) => <span key={pill}>{pill}</span>)}</div> : null}
          {actions ? <div className={styles.heroActionRow}>{actions}</div> : null}
        </div>
        {visual || null}
      </div>
    </div>
  </section>
);

export const PublicSection = ({ title, description, children, blockId }) => (
  <section className={styles.section} data-reveal data-cms-block={blockId || title}>
    <div className={styles.container}>
      <header className={styles.sectionHeader}>
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </header>
      {children}
    </div>
  </section>
);

export const PublicCTAButton = ({ href, children, ghost = false, onClick }) => (
  <Link href={href} className={ghost ? styles.buttonGhostDark : styles.button} onClick={onClick}>{children}</Link>
);

export const PublicFeatureCard = ({ title, text, helper, icon }) => (
  <article className={styles.card}>
    {icon ? <span className={styles.serviceIcon} aria-hidden>{icon}</span> : null}
    <h3>{title}</h3><p>{text}</p>
    {helper ? <small className={styles.helperText}>{helper}</small> : null}
  </article>
);

export const PublicServiceCard = ({ service }) => (
  <article className={styles.card}>
    <span className={styles.serviceIcon} aria-hidden>{service.icon}</span>
    <h3>{service.title}</h3>
    <p>{service.text}</p>
    <small className={styles.helperText}><strong>Idéal pour:</strong> {service.idealFor}</small>
    <Link href={service.ctaHref} className={styles.buttonGhostDark} onClick={() => trackEvent(service.ctaEvent === 'contact' ? ANALYTICS_EVENTS.CONTACT_CTA_CLICK : ANALYTICS_EVENTS.QUOTE_CTA_CLICK, { location: 'services_card', target: service.ctaEvent, service: service.title })}>{service.ctaLabel}</Link>
  </article>
);

export const ServiceComparisonCard = ({ row }) => (
  <article className={styles.comparisonRow}><strong>{row.label}</strong><p><span>Fret aérien:</span> {row.air}</p><p><span>Fret maritime:</span> {row.sea}</p><p><span>Livraison locale:</span> {row.local}</p><p><span>Logistique entreprise:</span> {row.logistics}</p></article>
);

export const ValueCard = ({ value }) => <PublicFeatureCard title={value.title} text={value.text} helper={<><strong>Preuve opérationnelle:</strong> {value.proof}</>} />;

export const ContactInfoCard = ({ item }) => <article className={styles.card}><h3>{item.label}</h3><p>{item.value}</p></article>;

export const ContactFormCard = ({ children }) => <div className={`${styles.card} ${styles.contactForm}`}>{children}</div>;

export const FAQItem = ({ item }) => <article className={styles.card}><h3>{item.q}</h3><p>{item.a}</p></article>;

export const PublicTrustBanner = ({ items }) => (
  <div className={styles.grid}>{items.map((item) => <article key={item} className={styles.card}><h3>Engagement</h3><p>{item}</p></article>)}</div>
);

export const PremiumCta = ({ title, text }) => (
  <div className={styles.container} data-reveal>
    <section className={styles.cta} data-cms-block="premium-cta"><div><h2>{title}</h2><p>{text}</p></div><div className={styles.ctaActions}><Link href="/quote-request" className={styles.button}>Demander un devis</Link><Link href="/track-shipment" className={styles.buttonGhost}>Suivre un colis</Link></div></section>
  </div>
);

export { styles };
