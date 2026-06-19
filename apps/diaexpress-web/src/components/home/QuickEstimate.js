import React from 'react';
import styles from './HomePage.module.css';

const transportMultipliers = { air: 4.8, sea: 1.6, road: 2.4, express: 6.2 };
const delays = { air: '3 à 7 jours', sea: '21 à 35 jours', road: '2 à 8 jours', express: '24 à 72 h' };

export default function QuickEstimate() {
  const [form, setForm] = React.useState({ origin: 'Ouagadougou', destination: 'Abidjan', weight: 5, transport: 'air' });
  const weight = Math.max(Number(form.weight) || 0, 1);
  const base = 18 + weight * (transportMultipliers[form.transport] || 3);
  const crossBorder = form.origin.trim().toLowerCase() !== form.destination.trim().toLowerCase() ? 22 : 8;
  const estimatedPrice = Math.round(base + crossBorder);
  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  return (
    <section className={styles.quickEstimate} aria-labelledby="quick-estimate-title" data-cms-block="quick-estimate">
      <div>
        <span className={styles.sectionEyebrow}>Quick Estimate</span>
        <h2 id="quick-estimate-title">Simulez un prix sans créer de devis</h2>
        <p>Obtenez une première fourchette commerciale, puis transformez-la en demande de devis personnalisée.</p>
      </div>
      <div className={styles.estimateGrid}>
        <label>Origine<input value={form.origin} onChange={set('origin')} /></label>
        <label>Destination<input value={form.destination} onChange={set('destination')} /></label>
        <label>Poids (kg)<input type="number" min="1" value={form.weight} onChange={set('weight')} /></label>
        <label>Transport<select value={form.transport} onChange={set('transport')}><option value="air">Aérien</option><option value="sea">Maritime</option><option value="road">Routier</option><option value="express">Express</option></select></label>
      </div>
      <div className={styles.estimateResult}>
        <strong>Prix estimé : {estimatedPrice.toLocaleString('fr-FR')} €</strong>
        <span>Délai estimé : {delays[form.transport]}</span>
        <a className={styles.btnPrimary} href={`/quote-request?origin=${encodeURIComponent(form.origin)}&destination=${encodeURIComponent(form.destination)}&transport=${form.transport}`}>Demander un devis</a>
      </div>
    </section>
  );
}
