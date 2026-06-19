import React from 'react';
import SeoHead from '../src/components/seo/SeoHead';
import { PremiumCta, PublicBackgroundVisual, PublicFeatureCard, PublicPageHero, PublicSection, styles, useRevealOnScroll } from '../src/components/marketing/PublicPageSections';

const help = [
  { title: 'Préparer un devis', text: 'Rassemblez origine, destination, type de transport, poids, volume et contacts expéditeur/destinataire.', helper: 'Objectif: obtenir une estimation fiable.', icon: '📦' },
  { title: 'Suivre un colis', text: 'Saisissez le code de suivi transmis après création de l’expédition.', helper: 'Message attendu: “Votre colis est en transit” ou statut équivalent.', icon: '📍' },
  { title: 'Comprendre une exception', text: 'Un statut rouge indique un incident à vérifier avec le support.', helper: 'Aucune donnée sensible n’est affichée publiquement.', icon: '⚠️' },
];

export default function HelpPage() {
  useRevealOnScroll();
  return <PublicBackgroundVisual><SeoHead title="Aide DiaExpress | Support devis et tracking" description="Centre d’aide DiaExpress pour préparer vos colis, demander un devis et suivre une expédition." path="/aide" /><PublicPageHero eyebrow="Support" title="Centre d’aide DiaExpress" subtitle="Guides rapides pour avancer sans friction dans vos parcours logistiques." pills={['Mobile first', 'Messages clairs', 'Support opérationnel']} /><PublicSection title="Guides rapides" description="Les actions les plus utiles avant de contacter l’équipe."><div className={styles.grid}>{help.map((item) => <PublicFeatureCard key={item.title} {...item} />)}</div></PublicSection><PremiumCta title="Besoin d’un accompagnement ?" text="Contactez l’équipe avec votre référence de devis ou votre tracking." /></PublicBackgroundVisual>;
}
