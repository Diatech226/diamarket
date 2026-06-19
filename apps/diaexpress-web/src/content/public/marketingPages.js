export const servicePages = {
  'air-freight': { title: 'Fret aérien', transport: 'Aérien', delay: '3 à 7 jours', benefits: ['Priorité sur les délais', 'Suivi temps réel', 'Gestion documents export'], faq: ['Quels colis sont acceptés ?', 'Comment est calculé le prix ?'] },
  'sea-freight': { title: 'Fret maritime', transport: 'Maritime', delay: '21 à 35 jours', benefits: ['Optimisé pour volumes', 'Groupage et conteneurs', 'Coût maîtrisé'], faq: ['Faites-vous du groupage ?', 'Quels ports sont couverts ?'] },
  'road-transport': { title: 'Transport routier', transport: 'Routier', delay: '2 à 8 jours', benefits: ['Réseau régional', 'Collecte flexible', 'Livraison porte-à-porte'], faq: ['Quelles routes régionales ?', 'Le suivi est-il disponible ?'] },
  'express-delivery': { title: 'Livraison express', transport: 'Express', delay: '24 à 72 h', benefits: ['Traitement prioritaire', 'Assistance proactive', 'Idéal documents et urgences'], faq: ['Quel délai minimum ?', 'Puis-je assurer mon colis ?'] },
};
export const routePages = {
  'ouagadougou-abidjan': { origin: 'Ouagadougou', destination: 'Abidjan', delay: '2 à 5 jours', transport: 'Routier / Express' },
  'ouagadougou-accra': { origin: 'Ouagadougou', destination: 'Accra', delay: '3 à 6 jours', transport: 'Routier régional' },
  'ouagadougou-montreal': { origin: 'Ouagadougou', destination: 'Montréal', delay: '5 à 12 jours', transport: 'Aérien international' },
};
