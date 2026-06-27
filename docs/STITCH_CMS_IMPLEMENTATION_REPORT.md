# Rapport d’implémentation — Stitch CMS & White-Label foundation

## Écrans créés ou améliorés
- Ajout des écrans CMS : promotions, email templates, storefront overview, brand kit, builder, domaine, vendor detail, vendor payouts, vendor messaging.
- Les écrans existants dashboard, products, categories, vendors, users, media, audit logs et settings restent inchangés pour ne pas casser les flux actuels.

## Composants créés
- Fondation UX réutilisable : `DashboardCard`, `DataTable`, `StatusBadge`, `SearchFilterBar`, `FormSection`, `EmptyState`, `LoadingState`, `ErrorState`, `ConfirmDialog`.
- Alias/fondations pour : `MediaPicker`, `BrandColorPicker`, `FontPicker`, `StorefrontPreview`, `BlockEditor`, `VendorProfileCard`, `PayoutSummary`, `AuditLogTimeline`.

## Architecture API frontend
- Ajout de `src/services/api.ts` comme façade stable vers le client existant.
- Ajout de `src/services/cms-api.ts` pour centraliser Auth, Produits, Vendeurs, White-Label, Marketing, Média et Public Storefront.
- Ajout des types TypeScript White-Label et CMS métier dans `src/types/white-label.ts`.

## Endpoints connectés ou déclarés
- Auth/users, produits, catégories, vendeurs, payouts, messaging, storefront config/home/domain, promotions, templates emails, média, public storefront.

## Backend minimal
- Ajout d’un contrôleur White-Label avec réponses JSON cohérentes `{ success, data }`.
- Les endpoints partiels retournent explicitement `501` ou un statut `not_persisted` quand la persistance n’est pas finalisée, afin d’éviter les mocks silencieux.

## Storefront public
- Ajout d’une route dynamique `diamarket-web/src/app/storefront/[domain]/page.tsx` qui consomme `GET /public/storefront/:domain` et prépare le rendu thème/blocs.
- Cette architecture peut évoluer vers `vendor.diamarket.com` ou un domaine personnalisé via résolution de host côté middleware/edge.

## Décisions design
- Style clair, luxe, marketplace professionnelle : surfaces blanches arrondies, hero premium sombre, accents or/olive, tables lisibles et cards synthétiques.
- Approche progressive : fondation et routes avant refonte profonde des écrans existants.

## Limites restantes
- Persistance complète des configs storefront, promotions, templates et payouts.
- Contrôle d’ownership vendorId strict côté API.
- Upload média avancé pour logo/favicon depuis Brand Kit.
- Tests e2e visuels et intégration DNS domaine.

## Prochaines itérations
1. Brancher les écrans foundation sur `cmsApi` avec mutations et formulaires réels.
2. Créer modèles MongoDB StorefrontConfig, StorefrontHomePage, Promotion, EmailTemplate, Payout.
3. Ajouter un middleware de résolution domaine/sous-domaine public.
4. Ajouter tests API contractuels pour chaque endpoint White-Label.
