export const contactSeo = {
  title: 'Contact DiaExpress | Assistance logistique et devis',
  description:
    'Contactez DiaExpress pour vos demandes de devis, support d’expédition et accompagnement logistique premium.',
  path: '/contact',
  image: '/images/hero-illustration.svg',
  imageAlt: 'Illustration du support client DiaExpress',
};

export const contactContent = {
  heroPills: ['Réponse rapide', 'Conseil dédié', 'Support opérationnel'],
  info: [
    { label: 'Téléphone', value: '+225 01 02 03 04 05' },
    { label: 'Email', value: 'contact@diaexpress.com' },
    { label: 'Adresse', value: 'Abidjan, Cocody, Côte d’Ivoire' },
    { label: 'Support', value: 'Assistance opérationnelle 24/7 (astreinte urgences)' },
  ],
  reassurance: [
    'Notre équipe revient vers vous sous 24h ouvrées pour les demandes commerciales.',
    'Pour les urgences opérationnelles, une astreinte dédiée est disponible 24/7.',
    'Chaque demande est traitée avec un suivi clair et des prochaines étapes concrètes.',
  ],
  reasonOptions: [
    { value: 'quote', label: 'Demande de devis' },
    { value: 'tracking', label: 'Aide suivi colis' },
    { value: 'support', label: 'Support opérationnel' },
    { value: 'partnership', label: 'Partenariat logistique' },
  ],
  statusMessages: {
    info: 'Transparence: ce formulaire enregistre actuellement votre demande côté interface.',
    success: 'Demande enregistrée avec succès. Notre équipe vous recontacte sous 24h ouvrées.',
    error: 'Veuillez corriger les champs en erreur pour continuer.',
    submitting: 'Votre message est en cours d’envoi…',
  },
  initialForm: { name: '', email: '', reason: '', message: '' },
  faq: [
    { q: 'Quel est le délai de réponse ?', a: 'Les demandes commerciales reçoivent une première réponse sous 24h ouvrées.' },
    { q: 'Comment suivre mon colis ?', a: 'Utilisez la page de suivi avec votre code de tracking pour voir les derniers jalons.' },
    { q: 'Le formulaire envoie-t-il au backend ?', a: 'Non, il reste statique côté frontend tant qu’aucun endpoint contact dédié n’est disponible.' },
  ],
};
