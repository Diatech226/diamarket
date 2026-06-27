# Rapport — Design tokens locaux par application

## Objectif

Cette itération ajoute une fondation design locale à chaque frontend Diamarket concerné, sans créer ni utiliser de package de design system partagé pour ces apps.

## Apps modifiées

- `apps/diamarket-cms`
- `apps/diamarket-web`

## Fichiers créés

Pour chaque app modifiée :

- `src/design/colors.ts`
- `src/design/typography.ts`
- `src/design/spacing.ts`
- `src/design/radius.ts`
- `src/design/shadows.ts`
- `src/design/tokens.ts`
- `src/design/theme.ts`
- `src/design/README.md`

## Fichiers mis à jour

Pour chaque app modifiée :

- `tailwind.config.ts` : ajout des couleurs locales `brand.*` et retrait du preset Tailwind partagé.
- `src/app/globals.css` : ajout des variables CSS locales `:root`.
- `package.json` : retrait de la dépendance `@diamarket/design-system`.
- `next.config.mjs` : retrait de `transpilePackages: ['@diamarket/design-system']`.
- `tsconfig.json` : retrait des alias de chemins vers `@diamarket/design-system`.

Le `package-lock.json` racine a aussi été ajusté pour retirer la dépendance partagée des entrées `apps/diamarket-cms` et `apps/diamarket-web`.

## Tokens ajoutés

### Couleurs

- `primary`: `#0058BE`
- `primaryDark`: `#091426`
- `accent`: `#F59E0B`
- `background`: `#F8F9FF`
- `surface`: `#FFFFFF`
- `surfaceAlt`: `#EFF4FF`
- `text`: `#0F172A`
- `textMuted`: `#64748B`
- `border`: `#E2E8F0`
- `success`: `#10B981`
- `warning`: `#F59E0B`
- `error`: `#EF4444`
- `sidebar`: `#091426`
- `sidebarActive`: `#0058BE`

### Typographie

- `fontAdmin`: `Inter, sans-serif`
- `fontDisplay`: `Playfair Display, serif`
- `displayLg`: `32px / 40px`, `700`, `-0.02em`
- `headlineMd`: `24px / 32px`, `600`, `-0.01em`
- `bodyMd`: `14px / 20px`, `400`
- `labelSm`: `12px / 16px`, `500`, `0.02em`

### Spacing

- `xs`: `4px`
- `sm`: `8px`
- `md`: `16px`
- `lg`: `24px`
- `xl`: `32px`
- `2xl`: `48px`
- `3xl`: `64px`

### Radius

- `sm`: `4px`
- `md`: `6px`
- `lg`: `8px`
- `xl`: `12px`
- `pill`: `9999px`

### Shadows

- `none`: `none`
- `hover`: `0 4px 12px rgba(15, 23, 42, 0.05)`
- `modal`: `0 12px 32px rgba(15, 23, 42, 0.12)`

## Différences éventuelles entre apps

- Les valeurs de tokens TypeScript, Tailwind `brand.*` et variables CSS sont identiques entre `apps/diamarket-cms` et `apps/diamarket-web`.
- `apps/diamarket-cms` conserve temporairement l'extension Tailwind locale `olive.*`, car des classes existantes l'utilisent déjà. Cette conservation évite une migration visuelle globale dans cette itération de fondation.
- Aucune app ne dépend désormais du preset Tailwind de `@diamarket/design-system` pour sa configuration locale.

## Validation

Commandes demandées :

- `npm --prefix apps/diamarket-cms run build` : échec environnemental, `next: not found` dans le contexte `--prefix` de cette app.
- `npm --prefix apps/diamarket-web run build` : échec environnemental, `next: not found` dans le contexte `--prefix` de cette app.
- `npm --prefix apps/diaexpress-admin run build` : échec environnemental, `next: not found` dans le contexte `--prefix` de cette app.
- `npm --prefix apps/diaexpress-web run build` : échec environnemental, `next: not found` dans le contexte `--prefix` de cette app.
- `npm --prefix apps/diapay-dashboard run build` : réussite. Note : Next a indiqué qu'ESLint n'est pas installé localement pour l'étape de lint intégrée au build, mais le build s'est terminé avec un code de sortie `0`.
- `npm --prefix apps/diapay-sandbox run build` : réussite.
- `npm --prefix apps/diapay-docs run build` : réussite.

Commande de maintenance tentée :

- `npm install --package-lock-only` : échec environnemental sur `403 Forbidden` lors de la résolution de `swagger-jsdoc` depuis le registre npm.
- `npm install --package-lock-only --offline` : échec environnemental avec `Invalid Version:`.

## Prochaines migrations recommandées

1. Remplacer progressivement les classes couleur hardcodées existantes par les tokens Tailwind `brand.*` dans `apps/diamarket-cms` et `apps/diamarket-web`.
2. Migrer les styles globaux vers les variables CSS locales lorsque Tailwind n'est pas adapté.
3. Supprimer l'extension temporaire `olive.*` de `apps/diamarket-cms` quand les composants concernés auront été migrés vers les tokens `brand.*`.
4. Harmoniser l'installation des dépendances locales ou workspace pour que toutes les commandes `npm --prefix <app> run build` trouvent bien `next`.
5. Étendre cette approche locale aux autres frontends uniquement lors d'itérations dédiées, avec des tokens copiés localement et sans package partagé.
