import React from 'react';
import SeoHead from '../src/components/seo/SeoHead';
import { ANALYTICS_EVENTS, trackEvent } from '../src/lib/analytics/trackEvent';
import { contactContent, contactSeo } from '../src/content/public/contactContent';
import {
  ContactFormCard,
  ContactInfoCard,
  FAQItem,
  PublicBackgroundVisual,
  PublicCTAButton,
  PublicPageHero,
  PublicSection,
  styles,
  useRevealOnScroll,
} from '../src/components/marketing/PublicPageSections';

export default function ContactPage() {
  useRevealOnScroll();
  const [form, setForm] = React.useState(contactContent.initialForm);
  const [status, setStatus] = React.useState('idle');

  const submit = (e) => {
    e.preventDefault();
    setStatus('success');
    trackEvent(ANALYTICS_EVENTS.CONTACT_FORM_SUBMIT, { location: 'contact_page', submission_type: 'frontend_static' });
    setForm(contactContent.initialForm);
  };

  return (
    <PublicBackgroundVisual>
      <SeoHead {...contactSeo} />
      <PublicPageHero eyebrow="Contact" title="Contactez DiaExpress" subtitle="Une équipe disponible pour vos demandes de devis, suivi et assistance opérationnelle." pills={contactContent.heroPills} />

      <PublicSection title="Nos canaux de contact" description="Choisissez le canal le plus rapide selon votre besoin.">
        <div className={styles.grid}>{contactContent.info.map((item) => <ContactInfoCard key={item.label} item={item} />)}</div>
      </PublicSection>

      <PublicSection title="Formulaire de contact" description="Formulaire frontend statique (aucun endpoint backend contact détecté).">
        <ContactFormCard><form onSubmit={submit}><label className={styles.fieldLabel}>Nom<input className={styles.fieldInput} value={form.name} onChange={(e)=>setForm({ ...form, name: e.target.value })} autoComplete="name" required/></label><label className={styles.fieldLabel}>Email<input className={styles.fieldInput} type="email" value={form.email} onChange={(e)=>setForm({ ...form, email: e.target.value })} autoComplete="email" required/></label><label className={styles.fieldLabel}>Message<textarea rows={4} className={`${styles.fieldInput} ${styles.fieldTextarea}`} value={form.message} onChange={(e)=>setForm({ ...form, message: e.target.value })} required/></label><button className={styles.button} type="submit">Envoyer</button>{status==='success' ? <p className={styles.successText} role="status" aria-live="polite">Message enregistré côté interface. Utilisez aussi <a href="mailto:contact@diaexpress.com">contact@diaexpress.com</a>.</p> : null}</form></ContactFormCard>
      </PublicSection>

      <PublicSection title="Assistance" description="Informations utiles pour accélérer le traitement."><div className={styles.grid}>{contactContent.reassurance.map((item) => <article key={item} className={styles.card}><p>{item}</p></article>)}</div></PublicSection>
      <PublicSection title="FAQ courte" description="Réponses rapides aux questions les plus fréquentes."><div className={styles.grid}>{contactContent.faq.map((item) => <FAQItem key={item.q} item={item} />)}</div></PublicSection>
      <section className={styles.section} data-reveal><div className={styles.container}><div className={styles.inlineCta}><div><h2>Besoin d’avancer tout de suite ?</h2><p>Demandez un devis ou suivez un envoi en cours.</p></div><div className={styles.ctaActions}><PublicCTAButton href="/quote-request">Demander un devis</PublicCTAButton><PublicCTAButton href="/track-shipment" ghost>Suivre un colis</PublicCTAButton></div></div></div></section>
    </PublicBackgroundVisual>
  );
}
