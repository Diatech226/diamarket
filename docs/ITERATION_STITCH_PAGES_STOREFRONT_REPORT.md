# Iteration Stitch Pages Storefront Report

## Références Stitch utilisées
- `stich-reference/16_public_storefront/storytelling_blog_desktop/code.html` pour la composition hero éditoriale, les cartes de contenu et les espacements premium.
- `stich-reference/16_public_storefront/store_locator_desktop_optimis/code.html` pour les panneaux d'information, états de boutique et présentation responsive.
- `stich-reference/05_vendors/gestion_des_vendeurs_desktop/code.html` et variante optimisée pour les listes vendeurs, actions rapides et table responsive.
- Les tokens locaux `apps/diamarket-cms/src/design/*` et `apps/diamarket-web/src/design/*` restent la source finale des couleurs, rayons, ombres, typographies et espacements.

## Pages créées
- CMS `/storefront` : liste vendeurs, recherche, filtre statut, table responsive, loading, error et empty state.
- CMS `/storefront/[vendorId]/brand-kit` : formulaire brand kit et preview live.
- CMS `/storefront/[vendorId]/builder` : gestion des blocs homepage avec ajout, duplication, suppression, activation et réordonnancement.
- CMS `/storefront/[vendorId]/domain` : sous-domaine, domaine personnalisé, instructions CNAME, statut DNS et vérification.
- CMS `/storefront/[vendorId]/preview` : preview thème/blocs actifs.
- Web `/storefront/[domain]` : rendu public branché sur l'endpoint public.

## Composants créés
- CMS : `StorefrontOverviewTable`, `BrandKitForm`, `BrandColorPicker`, `FontPicker`, `StorefrontPreview`, `BlockEditor`, `BlockList`, `BlockForm`, `DomainStatusCard`, `DnsInstructionsCard`.
- Web : `PublicStorefrontRenderer`, `StorefrontHeroBlock`, `StorefrontProductGrid`, `StorefrontCollectionBlock`, `StorefrontCtaBlock`.

## Endpoints connectés
- `GET /vendors` pour alimenter l'overview CMS.
- `GET /storefront/:vendor_id/config` et `PUT /storefront/:vendor_id/config`.
- `GET /storefront/:vendor_id/pages/home` et `PUT /storefront/:vendor_id/pages/home`.
- `POST /storefront/:vendor_id/domain`.
- `GET /public/storefront/:domain`.

## Limites restantes
- Si les endpoints storefront backend ne sont pas encore disponibles, le CMS affiche un état explicite ou conserve une preview locale non trompeuse pour permettre l'édition visuelle.
- Les uploads logo/favicon restent des champs URL tant que la médiathèque n'est pas reliée à ces pages.
- La vérification DNS affiche les statuts frontend attendus, mais dépend de la réponse backend pour un statut réel persistant.

## Description du rendu
- Interface premium proche Stitch avec grands panneaux arrondis, tables aérées, previews éditoriales, gradients de marque et CTA en pilule.
- Le rendu public compose automatiquement hero, collections, produits et CTA à partir des blocs actifs.

## Tests effectués
- `npm --prefix apps/diamarket-cms run build`
- `npm --prefix apps/diamarket-web run build`
- `npm --prefix apps/diamarket-api run build`

## Notes iteration 3
- Références Storefront obligatoires analysées : `06_storefront/builder/diteur_de_boutique_storefront_builder_desktop`, `06_storefront/brand-kit/identit_visuelle_brand_kit_desktop`, `06_storefront/domain/domaines_seo_desktop`, `16_public_storefront/storytelling_blog_desktop`, `16_public_storefront/store_locator_desktop_optimis`, ainsi que `PAGE_INDEX.md` et `API_MAPPING.md` pour le routage et les endpoints.
- Le fichier demandé `docs/DIAMARKET_LOCAL_TOKENS_UI_MIGRATION_REPORT.md` n'existe pas dans ce checkout ; les tokens locaux disponibles dans `apps/diamarket-cms/src/design/` et `apps/diamarket-web/src/design/` ont donc été utilisés comme source finale.
- Les blocs supportés par le builder couvrent `Hero`, `Carousel`, `FeaturedProducts`, `Video`, `Banners`, `Collections`, `Testimonials`, `FAQ` et `CTA`; l'édition rapide expose désormais titre et description sans copier le HTML Stitch brut.
