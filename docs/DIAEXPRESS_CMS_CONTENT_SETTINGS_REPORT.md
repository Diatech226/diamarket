# DiaExpress — Rapport CMS contenu, paramètres & branding

_Date : 2026-06-19._

## Sources obligatoires utilisées

- `docs/DIAEXPRESS_INTERNAL_AUDIT_AND_INTEGRATION_ROADMAP.md`
- `docs/DIAEXPRESS_DESIGN_UX_FRONTEND_REPORT.md`
- `docs/DIAEXPRESS_QUOTES_SHIPMENTS_UI_FLOW_REPORT.md`
- `docs/DIAEXPRESS_CLIENT_PORTAL_REPORT.md`

## Audit contenu actuel

| Section | Source actuelle | Administrable ? | Donnée nécessaire | Correction proposée |
|---|---|---:|---|---|
| Homepage hero | `apps/diaexpress-web/pages/index.js`, `src/content/public/homeContent.js`, `HeroSlider` | Partiel après itération | titre, sous-titre, image, CTA devis, CTA tracking | Ajout `GET /api/public/homepage` + formulaire admin `/admin/cms` pour hero/CTA avec fallback propre. |
| Services homepage | `homeContent.valueItems` | Oui après itération | titre, description, icône, image, type transport, actif, ordre | Ajout modèles/endpoints `services`, page admin `/admin/services`, branchement homepage/services. |
| Statistiques homepage | `homeContent.trustStats` | Partiel | valeur, libellé | Champ `stats` dans `HomepageContent`; fallback sur contenu existant. |
| Routes populaires | Non pilotées CMS | Oui après itération | origine, destination, transport, délai, prix indicatif, actif, ordre | Ajout modèle/endpoints `popular-routes`, page admin `/admin/popular-routes`, affichage homepage si données présentes. |
| Témoignages | `homeContent.testimonials` | Partiel | auteur, citation, ordre | Champ `testimonials` dans `HomepageContent`; fallback sur contenu existant. |
| FAQ homepage/aide | `pages/faq.js` et contenus statiques | Oui après itération | question, réponse, catégorie, ordre, actif | Ajout modèle/endpoints `faq`, page admin `/admin/faq`, branchement homepage et `/faq`. |
| Contact | `src/content/public/contactContent.js` | Oui après itération | téléphone, email, WhatsApp, adresse, horaires, réseaux | Ajout `SiteSettings` et branchement `/contact` sur les coordonnées CMS avec fallback. |
| Branding | SEO/head statique et assets publics | Oui après itération | nom, slogan, logo, favicon, couleur principale | Ajout `/admin/settings` et `GET /api/public/site-settings`; les données sont exposées au web. |
| SEO | `SeoHead` + contenus SEO statiques | Oui après itération | title, description, OG image, keywords, canonical, robots | `SiteSettings.seo` supporte les pages prioritaires; `SeoHead` accepte keywords/canonical/robots. |
| Images | Assets publics codés dans composants/contenus | Partiel | URL logo, favicon, hero, service, OG image | Champs URL ajoutés; upload dédié non modifié pour rester backend minimal. |

## Contenus rendus administrables

- Paramètres généraux : entreprise, slogan, logo, favicon, couleur principale, téléphone, email, WhatsApp, adresse, horaires, réseaux sociaux, pays couverts et devise principale.
- Homepage : hero title/subtitle, hero image, CTA devis, CTA tracking, statistiques, témoignages, services, routes populaires et FAQ homepage.
- Services logistiques : CRUD complet avec activation/désactivation et ordre d’affichage.
- Routes populaires : CRUD complet avec activation/désactivation et ordre d’affichage.
- FAQ : CRUD complet avec catégorie, activation/désactivation et ordre.
- SEO : structure de configuration par page dans `SiteSettings.seo` pour homepage, tracking, quote request, services et contact.

## Endpoints ajoutés

### Public

- `GET /api/public/site-settings`
- `GET /api/public/homepage`
- `GET /api/public/services`
- `GET /api/public/popular-routes`
- `GET /api/public/faq`

### Admin

- `GET /api/admin/site-settings`
- `PUT /api/admin/site-settings`
- `GET /api/admin/homepage`
- `PUT /api/admin/homepage`
- `GET /api/admin/services`
- `POST /api/admin/services`
- `PUT /api/admin/services/:id`
- `DELETE /api/admin/services/:id`
- `GET /api/admin/popular-routes`
- `POST /api/admin/popular-routes`
- `PUT /api/admin/popular-routes/:id`
- `DELETE /api/admin/popular-routes/:id`
- `GET /api/admin/faq`
- `POST /api/admin/faq`
- `PUT /api/admin/faq/:id`
- `DELETE /api/admin/faq/:id`

## Pages modifiées

- API : modèles CMS et routes montées dans `apps/diaexpress-api/server.js`.
- Admin : `/admin/settings`, `/admin/cms`, `/admin/services`, `/admin/popular-routes`, `/admin/faq` et navigation admin.
- Web public : homepage, services, FAQ, contact et composant SEO.

## UX admin

Chaque module de liste CMS inclut :

- état loading/error/empty ;
- création et édition via formulaire ;
- suppression avec confirmation ;
- activation/désactivation ;
- ordre d’affichage ;
- rafraîchissement après mutation.

## Limites restantes

1. Le formulaire contact reste frontend-only : aucun endpoint d’envoi email/contact n’a été ajouté.
2. Les URLs d’images sont administrables, mais l’upload média n’a pas été refondu pour éviter une modification backend massive.
3. La configuration SEO est stockée dans `SiteSettings.seo`; une interface dédiée SEO par page pourrait être ajoutée ensuite.
4. Le footer global historique n’a pas de composant unique identifié dans le web Pages Router; les coordonnées CMS sont exposées et branchées sur la page contact, prêtes pour un futur footer unifié.
5. Les tests manuels complets nécessitent un MongoDB et une session admin Clerk fonctionnels.
