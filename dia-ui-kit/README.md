# dia-ui-kit

`dia-ui-kit` is the standalone Dia Universe UI foundation. It is a pnpm/Turborepo monorepo with React as the source of truth, CSS custom properties for theming, framework-neutral contracts in `@dia-ui/core`, React custom elements in `@dia-ui/react-elements`, and Angular wrappers in `@dia-ui/angular`.

## Architecture and package boundaries

- `@dia-ui/core`: typed application contracts, navigation/auth adapters, authorization engine, and menu filtering.
- `@dia-ui/tokens`: design tokens and CSS variable helpers.
- `@dia-ui/icons`: icon registry and `DiaIcon` renderer.
- `@dia-ui/react`: providers, hooks, primitives, shells, Phase 1 components, and full inventory public contracts.
- `@dia-ui/react-elements`: custom-element bridge that mounts React with `createRoot`, reflects primitive attributes, accepts complex JavaScript properties, and emits `dia-*` events.
- `@dia-ui/angular`: standalone providers, injection tokens, pipe, directive, and wrapper components using the same core authorization engine.
- `@dia-ui/themes`: neutral, DiaMarket, DiaPay, DiaExpress, and DEL theme presets.
- `@dia-ui/app-shell`: shell-focused entry point.

## Installation

```bash
pnpm add @dia-ui/react @dia-ui/core @dia-ui/themes
npm install @dia-ui/react @dia-ui/core @dia-ui/themes
```

## React usage

```tsx
import { DiaAppShell, DiaCard } from '@dia-ui/react';
import type { DiaAppConfig } from '@dia-ui/core';

const config: DiaAppConfig = {
  id: 'diapay-console',
  name: 'DiaPay Developer Console',
  category: 'payment',
  layout: { navigationMode: 'sidebar', mobileBottomNavigation: true },
  search: { enabled: true, placeholder: 'Search payments' },
  navigation: { sidebarItems: [{ id: 'home', label: 'Overview', href: '/' }] }
};

export function App() {
  return <DiaAppShell config={config} user={{ roles: ['merchant'] }}><DiaCard>Dashboard</DiaCard></DiaAppShell>;
}
```

## Angular usage

Use `provideDiaUi(config, user)` at bootstrap, then use `DiaHaveAuthorityDirective`, `DiaHasAuthorityPipe`, or standalone wrapper components. The Angular package consumes React-powered custom elements and the same `@dia-ui/core` auth engine.

## Custom-element usage

```ts
import { defineDiaElements } from '@dia-ui/react-elements';
defineDiaElements();
document.querySelector('dia-app-shell')!.config = config;
```

Events bubble and are composed: `dia-click`, `dia-change`, `dia-input`, `dia-navigate`, `dia-logout`, `dia-search`, and `dia-cart-click`.

## App configuration

`DiaAppConfig` supports logos, favicon, navigation mode (`sidebar`, `topbar`, `both`, `none`), header/sidebar/bottom menus, nested groups, per-item authorities, cart behavior, search, localization/currencies, responsive layout, theme CSS variable overrides, route metadata, app category, and arbitrary metadata.

## Authorization and menu filtering

`hasDiaAuthority(user, requirement)` allows empty requirements, defaults to `any`, and supports `match: 'all'`. `filterAuthorizedMenuItems(items, user)` removes hidden and unauthorized items recursively and prunes empty parents.

## Theming

Themes are CSS-variable based. Override colors, typography, spacing, radii, shadows, transitions, component heights, layout widths, and focus rings by passing `config.theme.cssVariables` or using presets from `@dia-ui/themes`.

## Icon registration

`registerDiaIcon(name, renderer)` adds custom icons. `DiaIcon` renders registered SVGs and falls back to an accessible neutral symbol.

## Routing and authentication adapters

Core exposes `DiaNavigationAdapter` and `DiaAuthAdapter`. Components do not depend on React Router, Next.js, Clerk, Angular Router, or any API client; host applications provide callbacks/adapters.

## Commands

```bash
pnpm install
pnpm build
pnpm typecheck
pnpm lint
pnpm test
pnpm storybook
pnpm build:storybook
```

## Storybook organization

Stories are planned and categorized as: Foundations, Layout, Actions, Forms, Navigation, Feedback, Overlays, Data Display, Authentication, Marketplace, DiaPay, Logistics, DEL, CMS & Admin, Public Website, App Shells, and Angular Interop. Initial realistic configurations cover DiaMarket storefront/admin, DiaPay checkout/developer console, DiaExpress shipments, DEL equipment dashboards, generic CMS, and public service websites.

## Publishing strategy

Packages publish independently under `@dia-ui/*` with ESM and declaration files. Heavy Phase 3 integrations should use optional entry points to preserve tree-shaking and avoid unnecessary runtime dependencies.

## Incremental migration

1. Install `@dia-ui/core` and model existing app navigation/auth as `DiaAppConfig`.
2. Wrap one low-risk page with `DiaUiProvider` or `DiaAppShell`.
3. Replace primitives (buttons, fields, cards, tables) before domain widgets.
4. For Angular apps, introduce custom elements and wrappers without changing routing.
5. Move shared domain patterns into Dia UI Kit components as apps converge.

## Implementation report

Completed: monorepo/tooling, core contracts, authorization engine and tests, tokens/themes, icon registry, React providers/hooks, layout primitives, buttons/forms/cards/status, modal/drawer/tooltip, navigation shell, data table/pagination, skeleton/empty/error/loading states, Storybook scaffold, React demo, React custom-elements bridge, Angular providers/directive/pipe/wrappers, and public contracts for the complete inventory.

Deferred advanced behavior: rich text/code editors, maps, charts, virtualized/tree tables, kanban, calendars, media editing, page builders, and heavyweight developer tooling. Their public contracts exist as composable placeholders and should be implemented behind optional entry points.
