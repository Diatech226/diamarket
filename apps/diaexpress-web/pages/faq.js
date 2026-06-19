import React from 'react';
import SeoHead from '../src/components/seo/SeoHead';
import { getPublicFaq, getPublicSiteSettings } from '../src/api/cms';
import { FAQItem, PremiumCta, PublicBackgroundVisual, PublicPageHero, PublicSection, styles, useRevealOnScroll } from '../src/components/marketing/PublicPageSections';

const faq = [
  { q: 'Comment demander un devis ?', a: 'Cliquez sur “Demander un devis”, complétez origine, destination, transport, colis et contacts. Nous avons besoin de ces informations pour calculer le tarif.' },
  { q: 'Où suivre mon colis ?', a: 'Utilisez le champ “Suivre mon colis” avec votre code de suivi. La page publique masque les détails sensibles.' },
  { q: 'Que signifie “Votre colis est en transit” ?', a: 'Le colis a quitté une étape opérationnelle et progresse vers le prochain hub ou la destination.' },
  { q: 'Que faire en cas de retard ?', a: 'Vérifiez votre code de suivi puis contactez le support avec la référence DiaExpress.' },
];

function FAQPage({ cmsFaq = [], settings = null }) {
  const items = cmsFaq.length ? cmsFaq.map((item) => ({ q: item.question, a: item.answer })) : faq;
  const pageSeo = settings?.seo?.find?.((item) => item.page === 'faq' || item.page === 'help') || {};
  useRevealOnScroll();
  return <PublicBackgroundVisual><SeoHead title={pageSeo.metaTitle || 'FAQ DiaExpress | Questions fréquentes'} description={pageSeo.metaDescription || 'Réponses aux questions fréquentes sur devis, tracking, livraison et support DiaExpress.'} path="/faq" image={pageSeo.openGraphImage} keywords={pageSeo.keywords} canonical={pageSeo.canonical} robots={pageSeo.robots} /><PublicPageHero eyebrow="Aide" title="Questions fréquentes" subtitle="Des réponses simples pour préparer, suivre et comprendre vos expéditions." pills={['Devis', 'Tracking', 'Livraison', 'Support']} /><PublicSection title="FAQ" description="Microcopy unifiée et orientée client."><div className={styles.grid}>{items.map((item) => <FAQItem key={item.q} item={item} />)}</div></PublicSection><PremiumCta title="Vous n’avez pas trouvé la réponse ?" text="Notre équipe peut vous aider à cadrer un devis ou vérifier un suivi." /></PublicBackgroundVisual>;
}

export async function getServerSideProps() { const [cmsFaq, settings] = await Promise.all([getPublicFaq(), getPublicSiteSettings()]); return { props: { cmsFaq: cmsFaq || [], settings } }; }
export default FAQPage;
