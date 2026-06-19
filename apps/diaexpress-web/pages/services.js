import React from 'react';
import SeoHead from '../src/components/seo/SeoHead';
import { servicesContent, servicesSeo } from '../src/content/public/servicesContent';
import { getPublicServices, getPublicSiteSettings } from '../src/api/cms';
import {
  PremiumCta,
  PublicBackgroundVisual,
  PublicCTAButton,
  PublicPageHero,
  PublicSection,
  PublicServiceCard,
  ServiceComparisonCard,
  styles,
  useRevealOnScroll,
} from '../src/components/marketing/PublicPageSections';
import { ANALYTICS_EVENTS, trackEvent } from '../src/lib/analytics/trackEvent';

function ServicesPage({ cmsServices = [], settings = null }) {
  const services = cmsServices.length ? cmsServices.map((service) => ({ title: service.title, description: service.description, text: service.description, icon: service.icon || '✈️', image: service.image, idealFor: service.transportType || 'Expéditions DiaExpress', ctaHref: '/quote-request', ctaLabel: 'Demander un devis', ctaEvent: 'quote' })) : servicesContent.services;
  const pageSeo = settings?.seo?.find?.((item) => item.page === 'services') || {};
  useRevealOnScroll();
  return (
    <PublicBackgroundVisual>
      <SeoHead {...servicesSeo} title={pageSeo.metaTitle || servicesSeo.title} description={pageSeo.metaDescription || servicesSeo.description} image={pageSeo.openGraphImage || servicesSeo.image} keywords={pageSeo.keywords} canonical={pageSeo.canonical} robots={pageSeo.robots} />
      <PublicPageHero eyebrow="Nos expertises" title="Nos services logistiques" subtitle="Une offre premium pour orchestrer vos flux internationaux et locaux avec visibilité, fiabilité et accompagnement métier." pills={servicesContent.heroPills} actions={<><PublicCTAButton href="/quote-request" onClick={() => trackEvent(ANALYTICS_EVENTS.QUOTE_CTA_CLICK, { location: 'services_hero', target: 'quote_request' })}>Demander un devis</PublicCTAButton><PublicCTAButton href="/track-shipment" ghost onClick={() => trackEvent(ANALYTICS_EVENTS.TRACK_PACKAGE_CLICK, { location: 'services_hero', target: 'track_shipment' })}>Suivre un colis</PublicCTAButton></>} />

      <PublicSection blockId="services-list" title="Nos services" description="Des solutions calibrées selon vos contraintes de délai, volume et budget.">
        <div className={styles.grid}>{services.map((service) => <PublicServiceCard key={service.title} service={service} />)}</div>
      </PublicSection>

      <PublicSection blockId="services-comparison" title="Quel service choisir ?" description="Comparez rapidement les options pour décider avec clarté.">
        <div className={styles.cardStack}>{servicesContent.comparison.map((row) => <ServiceComparisonCard key={row.label} row={row} />)}</div>
      </PublicSection>

      <PublicSection blockId="services-benefits" title="Avantages DiaExpress" description="Une exécution pensée pour réduire vos frictions opérationnelles.">
        <div className={styles.grid}>{servicesContent.trustPoints.map((reason) => <article key={reason} className={styles.card}><h3>✔</h3><p>{reason}</p></article>)}</div>
      </PublicSection>

      <PremiumCta title="Prêt à lancer votre prochaine expédition ?" text="Démarrez avec un devis personnalisé ou suivez un envoi existant en temps réel." />
    </PublicBackgroundVisual>
  );
}

export async function getServerSideProps() { const [cmsServices, settings] = await Promise.all([getPublicServices(), getPublicSiteSettings()]); return { props: { cmsServices: cmsServices || [], settings } }; }
export default ServicesPage;
