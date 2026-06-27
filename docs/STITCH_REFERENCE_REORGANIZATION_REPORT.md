# Rapport de réorganisation de l’export Stitch

## Synthèse

- **Nombre total d’écrans analysés :** 51
- **Export source conservé intact :** `apps/stitch/`
- **Bibliothèque parallèle créée :** `stich-reference/`
- **Images écran :** liens symboliques `screen.png` vers `apps/stitch/` afin d’éviter de versionner des binaires dupliqués

## Catégories créées

- **Analytics** : 3 écran(s)
- **Audit** : 2 écran(s)
- **Categories** : 2 écran(s)
- **Email** : 3 écran(s)
- **Media** : 2 écran(s)
- **Orders** : 4 écran(s)
- **Payments** : 2 écran(s)
- **Products** : 2 écran(s)
- **Promotions** : 6 écran(s)
- **Public Storefront** : 2 écran(s)
- **Settings** : 2 écran(s)
- **Shipping** : 4 écran(s)
- **Storefront** : 3 écran(s)
- **Users** : 5 écran(s)
- **Vendors** : 9 écran(s)

## Composants détectés

- **Activity Feed** : 27 occurrence(s)
- **Avatar** : 24 occurrence(s)
- **Badge** : 32 occurrence(s)
- **Breadcrumb** : 8 occurrence(s)
- **Button** : 51 occurrence(s)
- **Card** : 32 occurrence(s)
- **Chart** : 42 occurrence(s)
- **Color Picker** : 13 occurrence(s)
- **Dashboard Card** : 6 occurrence(s)
- **Date Picker** : 32 occurrence(s)
- **Drawer** : 12 occurrence(s)
- **Editor** : 15 occurrence(s)
- **Export Action** : 17 occurrence(s)
- **Filter** : 20 occurrence(s)
- **Form** : 51 occurrence(s)
- **Hero** : 5 occurrence(s)
- **Map** : 12 occurrence(s)
- **Media Picker** : 41 occurrence(s)
- **Modal** : 4 occurrence(s)
- **Pagination** : 11 occurrence(s)
- **Preview** : 12 occurrence(s)
- **Search Bar** : 49 occurrence(s)
- **Sidebar** : 51 occurrence(s)
- **Stat Card** : 48 occurrence(s)
- **Table** : 49 occurrence(s)
- **Tabs** : 31 occurrence(s)
- **Timeline** : 4 occurrence(s)
- **Topbar** : 51 occurrence(s)

## Doublons et variantes optimisées

- `configuration_compte_bancaire_vendeur_desktop` : `configuration_compte_bancaire_vendeur_desktop`, `configuration_compte_bancaire_vendeur_desktop_optimis`
- `d_tail_de_la_commande_desktop` : `d_tail_de_la_commande_desktop`, `d_tail_de_la_commande_desktop_optimis`
- `gestion_des_avis_clients_desktop` : `gestion_des_avis_clients_desktop`, `gestion_des_avis_clients_desktop_optimis`
- `gestion_des_promotions_desktop` : `gestion_des_promotions_desktop`, `gestion_des_promotions_desktop_optimis`
- `gestion_des_vendeurs_desktop` : `gestion_des_vendeurs_desktop`, `gestion_des_vendeurs_desktop_optimis`
- `gestion_des_virements_desktop` : `gestion_des_virements_desktop`, `gestion_des_virements_desktop_optimis`
- `informations_personnelles_desktop` : `informations_personnelles_desktop`, `informations_personnelles_desktop_optimis`
- `journaux_d_audit_desktop` : `journaux_d_audit_desktop`, `journaux_d_audit_desktop_optimis`
- `mes_commandes_desktop` : `mes_commandes_desktop`, `mes_commandes_desktop_optimis`
- `messagerie_vendeurs_desktop` : `messagerie_vendeurs_desktop`, `messagerie_vendeurs_desktop_optimis`
- `mon_compte_desktop` : `mon_compte_desktop`, `mon_compte_desktop_optimis`
- `nouvelle_promotion_desktop` : `nouvelle_promotion_desktop`, `nouvelle_promotion_desktop_optimis`
- `param_tres_g_n_raux_desktop` : `param_tres_g_n_raux_desktop`, `param_tres_g_n_raux_desktop_optimis`
- `statistiques_de_campagne_desktop` : `statistiques_de_campagne_desktop`, `statistiques_de_campagne_desktop_optimis`

## Pages similaires fusionnées

Les variantes suffixées `_optimis` sont conservées comme références distinctes, mais signalées comme variantes du même écran métier pour faciliter la consolidation lors de l’implémentation.

## Ordre recommandé des implémentations

Voir `stich-reference/IMPLEMENTATION_ORDER.md`.
