import React from 'react';
import SeoHead from '../src/components/seo/SeoHead';
import { PremiumCta, PublicBackgroundVisual, PublicFeatureCard, PublicPageHero, PublicSection, styles, useRevealOnScroll } from '../src/components/marketing/PublicPageSections';

const terms = [
  { title: 'Informations exactes', text: 'Le tarif dépend des données transmises: origine, destination, poids, volume, dimensions et nature du colis.', icon: '✅' },
  { title: 'Contrôle opérationnel', text: 'Un devis approuvé peut nécessiter des informations complémentaires avant expédition.', icon: '🧾' },
  { title: 'Tracking public', text: 'Le suivi public affiche uniquement les informations nécessaires au statut et au parcours.', icon: '🔒' },
];

export default function DeliveryTermsPage() {
  useRevealOnScroll();
  return <PublicBackgroundVisual><SeoHead title="Conditions de livraison DiaExpress" description="Conditions générales de préparation, devis, expédition et suivi DiaExpress." path="/conditions-livraison" /><PublicPageHero eyebrow="Livraison" title="Conditions de livraison" subtitle="Principes opérationnels pour des expéditions fiables, lisibles et sécurisées." pills={['Devis vérifié', 'Statuts normalisés', 'Données protégées']} /><PublicSection title="Principes clés" description="Résumé frontend informatif; les conditions contractuelles finales restent validées par l’équipe DiaExpress."><div className={styles.grid}>{terms.map((item) => <PublicFeatureCard key={item.title} {...item} />)}</div></PublicSection><PremiumCta title="Préparer une expédition" text="Démarrez une demande de devis guidée et obtenez une estimation selon les données réelles." /></PublicBackgroundVisual>;
}
