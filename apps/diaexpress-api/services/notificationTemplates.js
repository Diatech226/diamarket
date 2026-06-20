const templates = {
  quote_submitted: { title: 'Devis reçu', message: 'Votre demande de devis a bien été reçue. Notre équipe revient vers vous rapidement.' },
  quote_info_requested: { title: 'Informations nécessaires', message: 'Nous avons besoin de quelques précisions pour finaliser votre devis.' },
  quote_approved: { title: 'Devis approuvé', message: 'Votre devis est approuvé. Vous pouvez poursuivre la préparation de votre expédition.' },
  shipment_created: { title: 'Expédition créée', message: 'Votre expédition est créée et le suivi est disponible dans votre espace client.' },
  shipment_in_transit: { title: 'Expédition en transit', message: 'Votre colis est en route vers sa destination.' },
  shipment_out_for_delivery: { title: 'Livraison en cours', message: 'Votre colis est en cours de livraison aujourd’hui.' },
  shipment_delivered: { title: 'Colis livré', message: 'Votre colis a été livré. Merci d’utiliser DiaExpress.' },
  shipment_delayed: { title: 'Retard signalé', message: 'Un retard a été signalé sur votre expédition. Nos équipes suivent la situation.' },
  delivery_failed: { title: 'Livraison échouée', message: 'La tentative de livraison a échoué. Une action opérationnelle est en cours.' },
  incident_created: { title: 'Incident créé', message: 'Un incident opérationnel a été créé et nécessite un suivi admin.' },
  payment_received: { title: 'Paiement reçu', message: 'Votre paiement a bien été reçu.' },
};
function renderTemplate(key, variables = {}) {
  const tpl = templates[key] || { title: 'Notification DiaExpress', message: 'Une mise à jour est disponible.' };
  const interpolate = (value) => String(value).replace(/#\{(\w+)\}/g, (_, name) => variables[name] || '');
  return { title: interpolate(tpl.title), message: interpolate(tpl.message) };
}
module.exports = { templates, renderTemplate };
