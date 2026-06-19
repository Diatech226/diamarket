import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import HeroSlider from '../src/components/home/HeroSlider';
import styles from '../src/components/home/HomePage.module.css';
import { ThreeCards, StepsCards } from '../src/components/home/Cards';
import SeoHead from '../src/components/seo/SeoHead';
import { ANALYTICS_EVENTS, trackEvent } from '../src/lib/analytics/trackEvent';
import { homeContent, homeSeo } from '../src/content/public/homeContent';
import { getPublicHomepage } from '../src/api/cms';
import QuickActionCard from '../src/components/home/QuickActionCard';
import TrustStatsRow from '../src/components/home/TrustStatsRow';
import QuickEstimate from '../src/components/home/QuickEstimate';

const Section = dynamic(() => import('../src/components/home/Section'));
const CTA = dynamic(() => import('../src/components/home/CTA'));

const HomePage = ({ cms = null }) => {
  const seo = cms?.seo || {};
  const heroTitle = cms?.heroTitle || homeContent.hero?.title || 'Expédiez vos colis en toute confiance';
  const heroSubtitle = cms?.heroSubtitle || homeContent.hero?.subtitle || 'Solutions logistiques fiables avec suivi temps réel.';
  const services = cms?.services?.length ? cms.services.map((item) => ({ title: item.title, text: item.description })) : homeContent.valueItems;
  const stats = cms?.stats?.length ? cms.stats : homeContent.trustStats;
  const testimonials = cms?.testimonials?.length ? cms.testimonials : homeContent.testimonials;
  const routes = cms?.popularRoutes || [];
  const faq = cms?.faq || [];
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
      <SeoHead {...homeSeo} title={seo.metaTitle || homeSeo.title} description={seo.metaDescription || homeSeo.description} image={seo.openGraphImage || homeSeo.image} keywords={seo.keywords} canonical={seo.canonical} robots={seo.robots} />
      <HeroSlider />
      <section className={styles.quickStart} data-cms-block="home-hero-cms"><div className={styles.container}><h1>{heroTitle}</h1><p>{heroSubtitle}</p><p><Link href={cms?.primaryCtaHref || '/quote-request'} className={styles.btnPrimary}>{cms?.primaryCtaLabel || 'Demander un devis'}</Link> <Link href={cms?.trackingCtaHref || '/track-shipment'} className={styles.btnSecondary}>{cms?.trackingCtaLabel || 'Suivre un colis'}</Link></p></div></section>

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

      <div className={styles.container}><QuickEstimate /></div>

      <Section id="services" blockId="home-services" eyebrow="Nos engagements" title="Une logistique premium pensée pour votre croissance" description="Nous combinons expertise opérationnelle et technologie pour livrer vos colis avec rigueur.">
        <ThreeCards items={services} />
      </Section>

      <Section id="trust" blockId="home-trust" eyebrow="Preuves de confiance" title="La confiance au cœur de notre promesse" description="Des indicateurs concrets qui rassurent vos équipes et vos clients.">
        <div className={styles.statsGrid}>
          {stats.map((stat) => (
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
          {testimonials.map((item) => (
            <article key={item.author} className={`${styles.card} ${styles.testimonialCard}`}>
              <span className={styles.testimonialMarker} aria-hidden="true">★ ★ ★ ★ ★</span>
              <p>“{item.quote}”</p>
              <h3>{item.author}</h3>
            </article>
          ))}
        </div>
      </Section>


      {routes.length ? <Section id="popular-routes" blockId="home-popular-routes" eyebrow="Routes populaires" title="Corridors les plus demandés" description="Données pilotées depuis le CMS admin."><div className={styles.grid3}>{routes.map((route) => <article key={`${route.origin}-${route.destination}`} className={styles.card}><h3>{route.origin} → {route.destination}</h3><p>{route.transport} · {route.estimatedDelay || 'Délai sur devis'}</p><p>{route.indicativePrice || 'Prix indicatif sur demande'}</p></article>)}</div></Section> : null}
      {faq.length ? <Section id="faq" blockId="home-faq" eyebrow="FAQ" title="Questions fréquentes" description="Réponses administrables depuis DiaExpress Admin."><div className={styles.grid3}>{faq.map((item) => <article key={item._id || item.question} className={styles.card}><h3>{item.question}</h3><p>{item.answer}</p></article>)}</div></Section> : null}

      <Section id="contact" blockId="home-final-cta">
        <CTA />
      </Section>
    </main>
  );
};

export async function getServerSideProps() {
  const cms = await getPublicHomepage();
  return { props: { cms } };
}

export default HomePage;
