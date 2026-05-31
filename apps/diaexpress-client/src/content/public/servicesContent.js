export const servicesSeo = {
  title: 'Services DiaExpress | Fret aérien, maritime et livraison locale',
  description:
    'Explorez les services logistiques DiaExpress: fret aérien, fret maritime, livraison locale et accompagnement opérationnel personnalisé.',
  path: '/services',
  image: '/images/home/hero-sea.svg',
  imageAlt: 'Conteneurs maritimes illustrant les services logistiques DiaExpress',
};

export const servicesContent = {
  heroPills: ['Support 24/7', 'Visibilité temps réel', 'Délais maîtrisés'],
  services: [
    {
      icon: '✈️',
      title: 'Fret aérien',
      text: 'Accélérez vos expéditions critiques grâce à des départs fréquents, un traitement prioritaire et une visibilité de bout en bout.',
      idealFor: 'Urgence commerciale, pièces sensibles, délais contractuels serrés.',
      ctaLabel: 'Lancer un devis aérien',
      ctaHref: '/quote-request',
      ctaEvent: 'quote_request',
    },
    {
      icon: '🚢',
      title: 'Fret maritime',
      text: 'Optimisez vos coûts sur les volumes importants avec des solutions de consolidation et un pilotage logistique planifié.',
      idealFor: 'Volumes élevés, flux réguliers, stratégie de réduction des coûts.',
      ctaLabel: 'Planifier un envoi maritime',
      ctaHref: '/quote-request',
      ctaEvent: 'quote_request',
    },
    {
      icon: '🚚',
      title: 'Livraison locale',
      text: 'Fiabilisez le dernier kilomètre avec suivi en direct, notifications clients et remise finale sécurisée.',
      idealFor: 'Livraisons urbaines, distribution B2B/B2C, zones métropolitaines.',
      ctaLabel: 'Organiser une livraison locale',
      ctaHref: '/quote-request',
      ctaEvent: 'quote_request',
    },
    {
      icon: '🧩',
      title: 'Solutions logistiques',
      text: 'Bénéficiez d’un accompagnement expert pour le routage, la conformité et la coordination multi-acteurs.',
      idealFor: 'Chaînes complexes, besoins multi-pays, opérations sur mesure.',
      ctaLabel: 'Parler à un expert logistique',
      ctaHref: '/contact',
      ctaEvent: 'contact',
    },
  ],
  comparison: [
    { label: 'Rapidité', air: 'Très élevée', sea: 'Planifiée', local: 'Même jour / J+1', logistics: 'Selon scénario' },
    { label: 'Volume', air: 'Faible à moyen', sea: 'Moyen à très élevé', local: 'Petit à moyen', logistics: 'Multi-flux' },
    { label: 'Optimisation budget', air: 'Priorité délai', sea: 'Excellente', local: 'Équilibrée', logistics: 'Sur mesure' },
    { label: 'Visibilité', air: 'Suivi renforcé', sea: 'Jalons planifiés', local: 'Temps réel', logistics: 'Pilotage global' },
  ],
  useCases: [
    {
      title: 'Particuliers',
      text: 'Envoyez des colis personnels rapidement avec un accompagnement clair du départ à la livraison.',
      recommendation: 'Livraison locale ou fret aérien selon l’urgence.',
    },
    {
      title: 'Entreprises',
      text: 'Sécurisez vos approvisionnements et vos livraisons clients avec des flux stables et pilotés.',
      recommendation: 'Fret maritime + solutions logistiques pour les flux réguliers.',
    },
    {
      title: 'E-commerce',
      text: 'Maintenez une promesse de livraison fiable pour vos clients, y compris en pics d’activité.',
      recommendation: 'Livraison locale avec support logistique pour l’orchestration.',
    },
    {
      title: 'Import/Export',
      text: 'Coordonnez vos opérations internationales avec conformité documentaire et anticipation des risques.',
      recommendation: 'Fret maritime ou aérien, encadré par nos solutions logistiques.',
    },
  ],
  trustPoints: [
    'Suivi colis disponible à chaque étape clé.',
    'Manipulation sécurisée avec protocoles qualité.',
    'Devis transparents adaptés à vos contraintes.',
    'Assistance dédiée avant, pendant et après expédition.',
  ],
};
