---
name: Diamarket Admin
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45474c'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#75777d'
  outline-variant: '#c5c6cd'
  surface-tint: '#545f73'
  primary: '#091426'
  on-primary: '#ffffff'
  primary-container: '#1e293b'
  on-primary-container: '#8590a6'
  inverse-primary: '#bcc7de'
  secondary: '#0058be'
  on-secondary: '#ffffff'
  secondary-container: '#2170e4'
  on-secondary-container: '#fefcff'
  tertiary: '#1e1200'
  on-tertiary: '#ffffff'
  tertiary-container: '#35260c'
  on-tertiary-container: '#a38c6a'
  error: '#ef4444'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e3fb'
  primary-fixed-dim: '#bcc7de'
  on-primary-fixed: '#111c2d'
  on-primary-fixed-variant: '#3c475a'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#fadfb8'
  tertiary-fixed-dim: '#ddc39d'
  on-tertiary-fixed: '#271902'
  on-tertiary-fixed-variant: '#564427'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
  success: '#10b981'
  warning: '#f59e0b'
  surface-subtle: '#f8fafc'
  border-light: '#e2e8f0'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  code-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 20px
  margin-mobile: 16px
  sidebar-width: 260px
---

## Brand & Style

The design system is engineered for a high-trust, professional CMS environment where data density and administrative efficiency are paramount. The brand personality is authoritative yet unobtrusive, functioning as a silent partner to the marketplace administrators. 

The chosen design style is **Corporate / Modern**, leaning heavily into a refined "SaaS Professional" aesthetic. It prioritizes clarity, systematic organization, and a sense of permanence. By utilizing a disciplined color palette and high-quality typography, the system ensures that complex marketplace data—ranging from inventory management to vendor disputes—remains legible and actionable. The interface evokes a sense of control and reliability, essential for back-office operations where mistakes can have significant financial consequences.

## Colors

The palette is anchored by a deep slate primary color, used for structural elements like sidebars and primary headers to establish authority. The secondary "Action Blue" is reserved strictly for interactive elements—links, primary buttons, and active states—to guide the user's eye toward progress.

Semantic colors (Success, Warning, Error) play a critical role in the CMS workflow, signaling the status of orders and vendor approvals at a glance. A range of neutral grays and off-whites provides the necessary "Surface" and "Border" tokens to create a clean, layered interface without visual clutter.

## Typography

This design system uses **Inter** exclusively to leverage its exceptional legibility in data-heavy environments. The typographic hierarchy is tight, with small increments between sizes to accommodate high-density dashboards.

- **Headlines:** Use Semi-Bold (600) or Bold (700) weights with slight negative letter spacing for a modern, compact look in module headers.
- **Body:** Standardized at 14px for the majority of UI text to balance readability with information density.
- **Labels:** Used for table headers, form labels, and badges. These often use Medium (500) or Semi-Bold (600) weights to differentiate from editable content.

## Layout & Spacing

The design system utilizes a **12-column fluid grid** for the main content area, allowing the dashboard to scale from small laptops to ultra-wide monitors. 

- **Layout Model:** A persistent vertical sidebar on the left for desktop (260px), which collapses into a bottom navigation bar or hamburger menu for mobile devices.
- **Spacing Rhythm:** Based on a 4px baseline. Components use 16px (md) as the standard padding for cards and containers, while tighter 8px (sm) spacing is used for internal element grouping.
- **Density:** The system supports a "Compact" mode for data tables where vertical padding is reduced from 12px to 8px to show more rows per screen.

## Elevation & Depth

To maintain a professional and "flat" aesthetic, the design system avoids heavy shadows. Hierarchy is established through **Tonal Layers** and **Low-Contrast Outlines**.

- **Level 0 (Background):** The base canvas, typically `#f8fafc`.
- **Level 1 (Cards/Surface):** White containers with a 1px border (`#e2e8f0`). No shadow is used for standard data cards.
- **Level 2 (Hover/Active):** A very subtle, diffused shadow (4px blur, 5% opacity) to indicate interactivity.
- **Level 3 (Modals/Popovers):** A more pronounced ambient shadow (12px blur, 10% opacity) used to lift critical action dialogs above the backdrop.

## Shapes

The design system uses a **Soft** shape language. This ensures the interface feels approachable and modern without appearing too "consumer-oriented" or playful. 

- **Standard Elements:** Inputs, buttons, and badges use a 0.25rem (4px) corner radius.
- **Large Elements:** Stat cards and modals use a 0.5rem (8px) radius to soften the larger surface areas.
- **Pill Shapes:** Reserved exclusively for status badges (e.g., "Success", "Pending") to differentiate them from actionable buttons.

## Components

- **Stat Cards:** Feature a secondary-colored icon (left-aligned) followed by a label and a large `headline-md` value. Optional "trend" indicators (green/red) should use `label-sm`.
- **Data Tables:** Headers must be `label-sm` in all-caps or medium-weight, with a subtle gray background. Rows use `body-md`. Status badges within rows must follow the pill-shaped geometry.
- **Navigation Sidebar:** Uses the `primary_color_hex` for the background. Active states should be indicated by a subtle background tint or a 4px left-border accent in action-blue.
- **Form Inputs:** Must have a clear focus state using a 2px outer ring in action-blue. Validation states (Error/Success) must change the border color and include a `body-sm` helper text below the input.
- **Confirmation Modals:** For critical "Reject" or "Approve" actions, the primary action button should reflect the intent (e.g., Red for reject, Green for approve). Modals should always include a 50% opacity slate overlay (scrim) to maintain focus.
- **Chips/Badges:** Small, non-interactive indicators used for categories or tags. Use a light tint of the semantic color with dark text for high readability.