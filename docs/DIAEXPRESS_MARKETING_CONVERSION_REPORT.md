# DiaExpress — Marketing, acquisition & conversion report

_Date : 2026-06-19._

## Sources obligatoires utilisées

- `docs/DIAEXPRESS_INTERNAL_AUDIT_AND_INTEGRATION_ROADMAP.md`
- `docs/DIAEXPRESS_DESIGN_UX_FRONTEND_REPORT.md`
- `docs/DIAEXPRESS_CMS_CONTENT_SETTINGS_REPORT.md`

## Audit conversion

| Page | Objectif | CTA | Conversion actuelle | Blocage | Amélioration |
|---|---|---|---|---|---|
| Homepage | Qualifier le besoin et orienter vers devis/tracking | Demander un devis, Suivre un colis | CTA existants mais peu scénarisés | Le visiteur ne peut pas estimer sans engagement | Hero premium, quick estimate, preuves, témoignages et footer premium |
| Tracking | Rassurer client/prospect | Suivre un colis | Endpoint public existant | Peu de rebond commercial après consultation | CTA footer et analytics tracking prêts |
| Quote Request | Générer devis complet | Soumettre un devis | Parcours existant à préserver | Friction si besoin incomplet | Ajout `/quote-lead` pour capter les prospects incomplets |
| Services | Valoriser les offres | Devis, contact | Page liste existante | SEO service incomplet | Landing pages dédiées air/sea/road/express |
| Contact | Déclencher contact humain | Contacter support | Page existante | Peu d'acquisition structurée | Footer premium et lead form complémentaire |
| Client Portal | Fidéliser clients | Mes devis, mes expéditions | Portail déjà branché | Principalement post-vente | Navigation commerciale sans casser quotes/tracking/shipments |

## Pages créées ou améliorées

- Hero homepage premium avec CTA devis et tracking.
- Widget `Quick Estimate` homepage : origine, destination, poids, transport, prix estimé et délai estimé sans création de devis.
- Landing pages services : `/services/air-freight`, `/services/sea-freight`, `/services/road-transport`, `/services/express-delivery`.
- Landing pages routes SEO : `/routes/ouagadougou-abidjan`, `/routes/ouagadougou-accra`, `/routes/ouagadougou-montreal`.
- Lead generation : `/quote-lead`.
- SEO technique : `robots.txt`, `sitemap.xml`, canonical/OpenGraph via `SeoHead` existant.
- Footer premium avec services, routes populaires, support, tracking rapide et devis rapide.

## CMS marketing

- API CMS enrichie pour témoignages, études de cas, newsletter, leads et CTA marketing.
- Admin : `/admin/testimonials`, `/admin/case-studies`, `/admin/newsletter`, `/admin/marketing`.
- Routes populaires restent compatibles CMS pour préparer l'expansion régionale.

## SEO avancé

- OpenGraph/canonical/robots sont conservés dans `SeoHead`.
- Sitemap dynamique basé sur les pages marketing prioritaires.
- Robots public avec lien sitemap.
- Architecture de routes SEO service et corridors régionaux.
- Metadata CMS existante via `SiteSettings.seo`.

## Acquisition & analytics

- Préparation Google Analytics via `NEXT_PUBLIC_GA_MEASUREMENT_ID`.
- Préparation Matomo via `NEXT_PUBLIC_MATOMO_URL`.
- Préparation Meta Pixel via `NEXT_PUBLIC_META_PIXEL_ID`.
- Pas d'intégration forcée : scripts injectés seulement si variable publique présente.

## Recommandations

1. Connecter les routes CMS SEO avec génération dynamique de routes à partir de `PopularRoute` dès qu'un rendu ISR est validé.
2. Ajouter un scoring de leads côté admin pour prioriser les demandes urgentes.
3. Ajouter un dashboard d'entonnoir : vues homepage, quick estimate, clic devis, lead envoyé, devis soumis.
4. Tester les formulaires avec MongoDB/Clerk staging et comptes admin réels.
5. Ajouter des contenus réels client, photos et études de cas avant lancement commercial.
