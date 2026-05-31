import React from 'react';
import SeoHead from '../src/components/seo/SeoHead';
import { servicesContent, servicesSeo } from '../src/content/public/servicesContent';
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

export default function ServicesPage() {
  useRevealOnScroll();
  return (
    <PublicBackgroundVisual>
      <SeoHead {...servicesSeo} />
      <PublicPageHero eyebrow="Nos expertises" title="Nos services logistiques" subtitle="Une offre premium pour orchestrer vos flux internationaux et locaux avec visibilité, fiabilité et accompagnement métier." pills={servicesContent.heroPills} actions={<><PublicCTAButton href="/quote-request" onClick={() => trackEvent(ANALYTICS_EVENTS.QUOTE_CTA_CLICK, { location: 'services_hero', target: 'quote_request' })}>Demander un devis</PublicCTAButton><PublicCTAButton href="/track-shipment" ghost onClick={() => trackEvent(ANALYTICS_EVENTS.TRACK_PACKAGE_CLICK, { location: 'services_hero', target: 'track_shipment' })}>Suivre un colis</PublicCTAButton></>} />

      <PublicSection blockId="services-list" title="Nos services" description="Des solutions calibrées selon vos contraintes de délai, volume et budget.">
        <div className={styles.grid}>{servicesContent.services.map((service) => <PublicServiceCard key={service.title} service={service} />)}</div>
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
