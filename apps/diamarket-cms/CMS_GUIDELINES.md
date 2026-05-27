# CMS Guidelines - Diamarket

## Design system
- Dashboard premium type SaaS (Stripe/Linear style): surfaces nettes, radius généreux, hiérarchie typographique claire.
- Utiliser `rounded-2xl`, `border-zinc`, ombres légères et densité compacte pour une UX enterprise.
- Préserver un contraste AA en light/dark.

## Architecture UI
- Réutiliser des composants UI (`DataTable`, `StatCard`, `PageHeader`) et éviter la duplication.
- Préférer les composants client uniquement pour interactions (search, pagination, tabs, toasts).
- Les pages CMS doivent rester composables par sections: KPIs, visualisation, table opérationnelle.

## Performance
- Lazy-load des modules lourds (graphs, editors) quand branchés à des libs externes.
- Ajouter cache côté service pour requêtes analytics fréquentes.
- Virtualiser les tables au-delà de 200 lignes visibles.

## International
- Préparer i18n pour labels clés (orders, payments, shipping, vendor statuses).
- Éviter les chaînes codées en dur dans les composants critiques long-terme.
