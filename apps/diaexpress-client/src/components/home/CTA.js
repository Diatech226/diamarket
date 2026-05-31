import React from 'react';
import Link from 'next/link';
import styles from './HomePage.module.css';
import { ANALYTICS_EVENTS, trackEvent } from '../../lib/analytics/trackEvent';

const CTA = () => (
  <div className={styles.ctaBlock} data-cms-block="home-cta">
    <div>
      <h2>Prêt à envoyer votre colis ?</h2>
      <p>Créez votre demande en quelques minutes et suivez votre expédition de bout en bout, avec accompagnement expert.</p>
      <p className={styles.ctaReassurance}>✔ Estimation transparente · ✔ Support client 24/7.</p>
    </div>
    <div className={styles.ctaActions}>
      <Link href="/quote-request" className={styles.btnPrimary} onClick={() => trackEvent(ANALYTICS_EVENTS.QUOTE_CTA_CLICK, { location: 'home_bottom_cta', target: 'quote_request' })}>Obtenir mon devis</Link>
      <Link href="/track-shipment" className={styles.btnSecondary} onClick={() => trackEvent(ANALYTICS_EVENTS.TRACK_PACKAGE_CLICK, { location: 'home_bottom_cta', target: 'track_shipment' })}>Suivre un colis</Link>
    </div>
  </div>
);

export default React.memo(CTA);
