# Diamarket design theme audit report

Date: 2026-06-27
Scope: `apps/diamarket-cms` and `apps/diamarket-web` only. DiaExpress and Diapay were not modified.

## References reviewed

- `DESIGN.md` and `guide_de_style_frontend_couleurs_typographie.md` were requested as references; this repository snapshot does not contain these exact root files.
- `docs/LOCAL_DESIGN_TOKENS_PER_APP_REPORT.md`
- `docs/DIAMARKET_LOCAL_TOKENS_UI_MIGRATION_REPORT.md` was requested; this repository snapshot does not contain this exact file.
- Existing Stitch implementation reports in `docs/STITCH_*` and `docs/ITERATION_STITCH_*`.
- `stich-reference/` was requested; this repository snapshot does not contain this exact directory name.

## Pages audited

### CMS

Checked the routing and shared layout/components for: `/dashboard`, `/products`, `/categories`, `/vendors`, `/storefront`, `/storefront/[vendorId]/brand-kit`, `/storefront/[vendorId]/builder`, `/storefront/[vendorId]/domain`, `/orders`, `/media`, `/promotions`, `/email-templates`, `/users`, `/audit-logs`, and `/settings`.

### Web

Checked the routing and shared layout/components for: `/`, `/catalogue`, `/product/[slug]`, `/category/[slug]`, `/cart`, `/checkout`, `/account`, and `/storefront/[domain]`.

## Gaps found

- CMS theme support was binary and local to the topbar, using the legacy `theme` storage key and not exposing `system` mode.
- Web had no global theme provider/toggle and used a fixed light body/header/footer palette.
- Both apps had light CSS variables but no dark CSS variable contract for `--color-background`, `--color-surface`, `--color-surface-alt`, `--color-text`, `--color-text-muted`, and `--color-border`.
- Tailwind brand colors were hard-coded instead of being backed by app-local CSS variables, which made dark mode inconsistent.
- Shared classes such as `.surface`, `.field`, `.btn-secondary`, `.admin-card`, and `.admin-field` were still tied to white/slate/zinc surfaces.

## Corrections applied

- Added a reusable client `ThemeProvider`, `ThemeToggle`, and pre-hydration `ThemeScript` to both apps.
- Added persisted `light`, `dark`, and `system` modes using `diamarket-theme` in `localStorage`.
- Added `html.dark` synchronization before hydration to reduce theme flash.
- Enabled Tailwind class-based dark mode in both Diamarket Tailwind configs.
- Converted the local Tailwind `brand` palette to CSS-variable-backed colors.
- Added dark CSS variables to both app globals.
- Updated CMS root layout, CMS topbar, Web root layout, and Web header to use the provider/toggle and local brand tokens.
- Updated common reusable CSS component classes to use brand tokens for cards, inputs, secondary buttons, focus rings, and surfaces.

## Hard-coded colors and exceptions

- Global theme hard-coded app shell colors were replaced with local brand/CSS-variable tokens.
- Storefront white-label previews still contain inline color styles by design because they render seller-provided brand colors and gradient previews.
- Slide/background preview fields still allow custom colors because CMS users manage marketing visuals.

## Accessibility notes

- Focus-visible rings remain globally enforced for buttons, links, inputs, selects, and textareas.
- Minimum touch targets remain enforced for buttons/selects and CMS controls.
- Dark-mode text, placeholders, cards, and input surfaces now use local text and border variables.

## Remaining issues

- Some older page-level files still contain semantic Tailwind colors such as red/emerald/amber status tones. These are acceptable for alerts/statuses but should be consolidated into semantic token utilities during a deeper component-by-component refactor.
- The repository snapshot is missing some requested source reference artifacts, so this report records a code-level audit against available documentation and implemented Stitch pages rather than pixel-perfect image comparison.
- Some legacy page-level semantic status colors remain and should be moved to token aliases in a future pass.

## Tests performed

- `npm --prefix apps/diamarket-cms run build` completed successfully after installing local app dependencies in the environment.
- `npm --prefix apps/diamarket-web run build` completed successfully after installing local app dependencies in the environment.
