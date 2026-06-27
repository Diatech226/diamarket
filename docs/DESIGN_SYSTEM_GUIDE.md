# Diamarket Design System

Le Design System partagé vit dans `packages/design-system` et devient la source unique des couleurs, typographies, espacements, rayons, ombres, animations, icônes et composants UI utilisés par `diamarket-web`, `diamarket-cms` et les surfaces HTML de `diamarket-api`.

## Palette et tokens

Les couleurs s'importent depuis `@diamarket/design-system/colors` ou `@diamarket/design-system/tokens`. Les composants ne doivent pas écrire directement de classes comme `bg-blue-600`, `bg-slate-900`, `text-gray-600` ou `border-gray-200`.

Tokens sémantiques disponibles : `Primary`, `PrimaryHover`, `PrimarySoft`, `Secondary`, `Accent`, `Success`, `Warning`, `Danger`, `Surface`, `SurfaceAlt`, `Border`, `Divider`, `Text`, `TextMuted`, `Sidebar`, `SidebarActive`, `SidebarHover`, `Card`, `CardHover`, `Overlay`, `Input`, `InputFocus`, `Skeleton`, `Placeholder`.

La palette historique olive Diamarket est conservée, avec `#556B2F` comme primaire, et l'accent or `#C9A227` reste centralisé.

## Typographie

Les styles typographiques sont centralisés dans `typography.ts` : `Display`, `Headline`, `Title`, `Body`, `Caption`, `Label` et `Code`. Les composants ne doivent pas redéfinir localement `font-size`, `font-weight`, `line-height` ou `letter-spacing` sauf exception documentée.

## Espacements, radius, ombres et animations

- Espacements : `2`, `4`, `8`, `12`, `16`, `20`, `24`, `32`, `40`, `48`, `64`, `80`, `96`.
- Radius : `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `pill`, `full`.
- Ombres : `card`, `dropdown`, `modal`, `tooltip`, `hover`, `floating`.
- Animations : `fade`, `slide`, `scale`, `drawer`, `modal`, `toast`, `accordion`, `pageTransition`, `skeleton`.

## Tailwind

Les apps Next utilisent le preset partagé :

```ts
import diamarketPreset from '@diamarket/design-system/tailwind-preset';

export default {
  presets: [diamarketPreset],
  content: ['./src/**/*.{ts,tsx}', '../../packages/design-system/**/*.{ts,tsx}'],
};
```

Utiliser les couleurs `ds-*`, les espacements et les radius du preset au lieu de valeurs arbitraires.

## Composants

Le package expose les composants communs : `Button`, `Input`, `Textarea`, `Checkbox`, `Switch`, `Select`, `Card`, `Modal`, `Drawer`, `Tooltip`, `Dropdown`, `Pagination`, `Table`, `StatCard`, `DataGrid`, `EmptyState`, `LoadingState`, `Loading`, `Skeleton`, `Toast`, `Badge`, `Alert`, `Avatar`, `Tabs`, `Breadcrumb`, `SearchBar`.

Exemple :

```tsx
import { Button, Card, StatCard } from '@diamarket/design-system/components';

export function DashboardSummary() {
  return (
    <Card>
      <StatCard label="Commandes" value="128" />
      <Button>Voir les commandes</Button>
    </Card>
  );
}
```

## Icônes

Toute nouvelle icône passe par le wrapper `Icon` depuis `@diamarket/design-system/icons`. Ne pas mélanger plusieurs librairies d'icônes dans les apps Diamarket.

## Dark mode et white-label

Les tokens exposent `colors.light` et `colors.dark`. Les composants consomment des tokens sémantiques, ce qui permet de changer de thème ou d'ajouter une marque white-label sans modifier leur code.

## Accessibilité

Chaque composant commun doit conserver : focus visible, taille de clic minimale de 44 px, labels accessibles, navigation clavier et contraste suffisant. Les modales utilisent `role="dialog"` et `aria-modal`, les états de chargement utilisent `role="status"`.

## Migration

1. Ajouter une dépendance à `@diamarket/design-system` dans chaque application Diamarket.
2. Remplacer les palettes locales Tailwind par le preset partagé.
3. Migrer écran par écran les couleurs, ombres, radius, espacements et typographies codés en dur.
4. Remplacer les composants locaux par les composants communs lorsque le rendu visuel peut être conservé.
5. Valider par `npm run typecheck` puis `npm run build:diamarket`.

## Bonnes pratiques

- Aucun nouveau composant ne doit définir sa propre palette.
- Aucun nouveau composant ne doit choisir une typographie locale hors tokens.
- Les exceptions doivent être documentées dans la PR et migrées ensuite.
- Les emails HTML de l'API doivent importer les tokens et générer leurs styles depuis ces valeurs.
