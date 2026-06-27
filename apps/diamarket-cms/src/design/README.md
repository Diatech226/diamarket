# Design local Diamarket

Cette app possède sa propre fondation design locale. Elle ne dépend pas d'un package de design system partagé.

## Couleurs

- `primary`: `#0058BE`
- `primaryDark`: `#091426`
- `accent` / `warning`: `#F59E0B`
- `background`: `#F8F9FF`
- `surface`: `#FFFFFF`
- `surfaceAlt`: `#EFF4FF`
- `text`: `#0F172A`
- `textMuted`: `#64748B`
- `border`: `#E2E8F0`
- `success`: `#10B981`
- `error`: `#EF4444`
- `sidebar`: `#091426`
- `sidebarActive`: `#0058BE`

## Typographie

- `fontAdmin`: `Inter, sans-serif`
- `fontDisplay`: `Playfair Display, serif`
- `displayLg`: `32px / 40px`, graisse `700`, tracking `-0.02em`
- `headlineMd`: `24px / 32px`, graisse `600`, tracking `-0.01em`
- `bodyMd`: `14px / 20px`, graisse `400`
- `labelSm`: `12px / 16px`, graisse `500`, tracking `0.02em`

## Spacing

`xs: 4px`, `sm: 8px`, `md: 16px`, `lg: 24px`, `xl: 32px`, `2xl: 48px`, `3xl: 64px`.

## Radius

`sm: 4px`, `md: 6px`, `lg: 8px`, `xl: 12px`, `pill: 9999px`.

## Shadows

- `none`: `none`
- `hover`: `0 4px 12px rgba(15, 23, 42, 0.05)`
- `modal`: `0 12px 32px rgba(15, 23, 42, 0.12)`

## Règles d'utilisation

- Utiliser les exports locaux de `src/design/*` pour toute nouvelle logique TypeScript.
- Utiliser les classes Tailwind `brand.*` pour les nouveaux styles Tailwind.
- Utiliser les variables CSS locales pour les styles globaux ou les cas hors Tailwind.
- Ne pas hardcoder de nouvelles couleurs hors tokens.
- Ne pas importer de package de design system partagé.

## Exemple Tailwind

```tsx
<button className="rounded-xl bg-brand-primary px-4 py-2 text-white hover:bg-brand-dark">
  Valider
</button>
```

## Exemple CSS variable

```css
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-hover);
}
```
