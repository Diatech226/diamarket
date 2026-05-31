import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import HeroSlider from '../src/components/home/HeroSlider';
import styles from '../src/components/home/HomePage.module.css';
import { ThreeCards, StepsCards } from '../src/components/home/Cards';
import SeoHead from '../src/components/seo/SeoHead';
import { ANALYTICS_EVENTS, trackEvent } from '../src/lib/analytics/trackEvent';
import { homeContent, homeSeo } from '../src/content/public/homeContent';
import QuickActionCard from '../src/components/home/QuickActionCard';
import TrustStatsRow from '../src/components/home/TrustStatsRow';

const Section = dynamic(() => import('../src/components/home/Section'));
const CTA = dynamic(() => import('../src/components/home/CTA'));

const HomePage = () => {
  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }

    const targets = document.querySelectorAll('.reveal-on-scroll');
    if (!targets.length || typeof IntersectionObserver === 'undefined') {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.revealed);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -40px 0px' }
    );

    targets.forEach((target) => {
      target.classList.add(styles.reveal);
      observer.observe(target);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <main className={styles.homepage}>
      <SeoHead {...homeSeo} />
      <HeroSlider />

      <section className={styles.quickStart} aria-label="Accès rapides" data-reveal data-cms-block="home-quick-actions">
        <div className={styles.container} role="region" aria-label="Actions de démarrage rapide">
          <TrustStatsRow
            items={[
              '⏱️ Réponse moyenne devis: < 10 min',
              '🌍 Réseau multi-pays sécurisé',
              '🤝 Assistance opérationnelle 24/7',
            ]}
          />
          <div className={styles.quickStartHeader}>
            <span className={styles.sectionEyebrow}>Commencer rapidement</span>
            <h2 className={styles.quickStartTitle}>Vos prochaines actions, en un coup d’œil</h2>
            <p>Accédez aux actions clés sans friction et suivez un parcours pensé pour convertir rapidement.</p>
          </div>
          <div className={styles.quickStartGrid}>
            <QuickActionCard href="/quote-request" title="Demander un devis" subtitle="Estimation guidée en 4 étapes" meta="Chemin recommandé pour démarrer sans engagement" isPrimary onClick={() => trackEvent(ANALYTICS_EVENTS.QUOTE_CTA_CLICK, { location: 'home_quickstart', target: 'quote_request' })} />
            <QuickActionCard href="/track-shipment" title="Suivre un colis" subtitle="Statut, timeline et support en temps réel" meta="Idéal après confirmation d’expédition" onClick={() => trackEvent(ANALYTICS_EVENTS.TRACK_PACKAGE_CLICK, { location: 'home_quickstart', target: 'track_shipment' })} />
            <QuickActionCard href="/services" title="Explorer nos services" subtitle="Transport aérien, maritime et local" meta="Comparez les options selon vos contraintes" onClick={() => trackEvent(ANALYTICS_EVENTS.SERVICE_CTA_CLICK, { location: 'home_quickstart', target: 'services' })} />
          </div>
        </div>
      </section>

      <Section id="services" blockId="home-services" eyebrow="Nos engagements" title="Une logistique premium pensée pour votre croissance" description="Nous combinons expertise opérationnelle et technologie pour livrer vos colis avec rigueur.">
        <ThreeCards items={homeContent.valueItems} />
      </Section>

      <Section id="trust" blockId="home-trust" eyebrow="Preuves de confiance" title="La confiance au cœur de notre promesse" description="Des indicateurs concrets qui rassurent vos équipes et vos clients.">
        <div className={styles.statsGrid}>
          {homeContent.trustStats.map((stat) => (
            <article key={stat.label} className={`${styles.card} ${styles.statCard}`}><h3>{stat.value}</h3><p>{stat.label}</p></article>
          ))}
        </div>
      </Section>

      <Section id="a-propos" blockId="home-how-it-works" eyebrow="Parcours client" title="Comment ça marche" description="Un parcours simple, transparent et efficace.">
        <StepsCards steps={homeContent.howItWorks} />
      </Section>

      <Section id="storytelling" blockId="home-storytelling" eyebrow="Méthodologie" title="Une histoire logistique claire" description="Nous relions vos ambitions commerciales à une exécution terrain fiable.">
        <div className={styles.storyGrid}>
          {homeContent.storyBlocks.map((block) => (
            <article key={block.title} className={styles.storyCard}><h3>{block.title}</h3><p>{block.text}</p></article>
          ))}
        </div>
      </Section>

      <Section id="reseau" blockId="home-network" eyebrow="Couverture internationale" title="Présent dans plusieurs pays" description="Notre réseau couvre les principaux hubs logistiques internationaux." muted>
        <div className={styles.network}>
          <div className={styles.networkMap} role="img" aria-label="Carte du réseau logistique DiaExpress" />
          <article className={styles.card}>
            <h3>Logistics Network</h3>
            <p>Coordonnez vos expéditions entre plusieurs continents grâce à des points de transit sécurisés et des partenaires de confiance.</p>
            <p><Link href="/track-shipment" className={styles.btnPrimary} onClick={() => trackEvent(ANALYTICS_EVENTS.TRACK_PACKAGE_CLICK, { location: 'home_network', target: 'track_shipment' })}>Suivre un colis</Link></p>
          </article>
        </div>
      </Section>

      <Section id="testimonials" blockId="home-testimonials" eyebrow="Retours clients" title="Ils nous font confiance" description="Des retours clients qui soulignent notre fiabilité opérationnelle.">
        <div className={styles.grid3}>
          {homeContent.testimonials.map((item) => (
            <article key={item.author} className={`${styles.card} ${styles.testimonialCard}`}>
              <span className={styles.testimonialMarker} aria-hidden="true">★ ★ ★ ★ ★</span>
              <p>“{item.quote}”</p>
              <h3>{item.author}</h3>
            </article>
          ))}
        </div>
      </Section>

      <Section id="contact" blockId="home-final-cta">
        <CTA />
      </Section>
    </main>
  );
};

export default HomePage;
