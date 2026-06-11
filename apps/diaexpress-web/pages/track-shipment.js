import TrackShipment from '@/pages/TrackShipment';
import SeoHead from '../src/components/seo/SeoHead';
import { trackingSeo } from '../src/content/public/trackingContent';

const TrackShipmentPage = () => {
  return (
    <main className="dx-premium-page">
      <SeoHead {...trackingSeo} />
      <section className="dx-section dx-tracking-shell">
        <div className="dx-container">
          <div className="dx-page-hero-card">
            <span className="dx-kicker">service client premium</span>
            <h1>Suivez votre expédition en temps réel</h1>
            <p className="dx-subtle">Visualisez les étapes clés, le statut en direct et les détails de parcours de votre colis.</p>
            <div className="dx-trust-pills">
              <span>Données actualisées</span>
              <span>Historique complet</span>
              <span>Visibilité bout-en-bout</span>
            </div>
          </div>
          <div className="dx-stepper" role="list" aria-label="tracking benefits">
            <div className="dx-stepper__item" role="listitem"><span>1</span><div><strong>Code unique</strong><small>Saisie rapide du numéro de suivi</small></div></div>
            <div className="dx-stepper__item" role="listitem"><span>2</span><div><strong>Statut clair</strong><small>Visualisez la progression en un coup d’œil</small></div></div>
            <div className="dx-stepper__item" role="listitem"><span>3</span><div><strong>Support direct</strong><small>Contactez l’équipe en cas d’anomalie</small></div></div>
          </div>

          <p className="dx-subtle">Astuce: gardez votre code de suivi à portée de main pour accélérer la recherche.</p>
          <div className="dx-tracking-card" data-cms-block="tracking-tool">
            <TrackShipment />
          </div>
        </div>
      </section>
    </main>
  );
};

export default TrackShipmentPage;
