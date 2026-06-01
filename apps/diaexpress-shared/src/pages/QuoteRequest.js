import React from 'react';
import QuoteWizard from '../components/quote/QuoteWizard';
import styles from './QuoteRequest.module.css';

const QuoteRequest = ({ initialOrigins = [] } = {}) => {
  return (
    <div className={styles.quoteRequestPage}>
      <div className={styles.pageGlow} aria-hidden="true" />
      <div className={styles.pageContent}>
        <section className={styles.hero}>
          <span className={styles.heroBadge}>Estimation gratuite, sans connexion</span>
          <h1 className={styles.heroTitle}>Obtenez votre estimation d’expédition</h1>
          <p className={styles.heroSubtitle}>
            Un parcours premium et progressif pour définir la route, sélectionner le transport,
            renseigner votre colis, obtenir un tarif fiable DiaExpress puis créer votre devis si vous êtes connecté.
          </p>
        </section>

        <div className={styles.wizardShell}>
          <div className={styles.quoteWizard}>
            <QuoteWizard initialOrigins={initialOrigins} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteRequest;
