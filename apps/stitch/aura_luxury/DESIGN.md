---
name: Aura Luxury
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
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#775a19'
  on-secondary: '#ffffff'
  secondary-container: '#fed488'
  on-secondary-container: '#785a1a'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#191c1e'
  on-tertiary-container: '#818486'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#ffdea5'
  secondary-fixed-dim: '#e9c176'
  on-secondary-fixed: '#261900'
  on-secondary-fixed-variant: '#5d4201'
  tertiary-fixed: '#e0e3e5'
  tertiary-fixed-dim: '#c4c7c9'
  on-tertiary-fixed: '#191c1e'
  on-tertiary-fixed-variant: '#444749'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-md:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.03em
spacing:
  container-margin: 24px
  gutter: 16px
  section-gap: 64px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style
The design system is rooted in the philosophy of "Quiet Luxury"—where sophistication is expressed through restraint, precision, and high-quality materiality. It targets a discerning audience that values heritage and exclusivity.

The visual style is **Minimalist-Luxury**, blending clean editorial layouts with classical typographic flourishes. The emotional response should be one of calm confidence, mirroring the experience of walking into a high-end boutique where every object is given ample room to breathe. High-contrast typography and a restricted color palette create a sense of authoritative elegance, while subtle tactile details ensure the digital experience feels as premium as the products themselves.

## Colors
The palette is built on a foundation of "Midnight Navy" and "Burnished Gold." 

- **Primary (#0F172A):** A deep, near-black navy used for text, iconography, and high-emphasis backgrounds to provide grounding and authority.
- **Secondary (#C5A059):** A refined champagne gold used sparingly for accents, active states, and call-to-action highlights. It should never overwhelm the layout.
- **Surface & Backgrounds:** Utilize pure white (#FFFFFF) for primary surfaces and "Cloud Gray" (#F8FAFC) for subtle section differentiation.
- **Functional Neutrals:** Slate tones are used for secondary text and borders to maintain a soft, low-contrast UI environment that lets product photography dominate.

## Typography
The typography system relies on a dramatic contrast between the serif display face and the sans-serif functional face.

**Playfair Display** is reserved for headlines and editorial moments. It should be typeset with slightly tighter letter spacing in larger sizes to emphasize its elegant strokes. 

**Inter** provides a clean, utilitarian balance for body copy, product descriptions, and navigational elements. For "Label" roles, use uppercase styling with increased letter spacing to evoke the look of high-fashion branding and luxury packaging.

## Layout & Spacing
The layout follows a **Fluid Grid** model with generous safe areas to prevent visual clutter. 

- **Mobile:** A 4-column grid with 24px outer margins. Use 16px gutters for product tiles.
- **Desktop/Tablet:** A 12-column grid centered in a max-width container of 1440px. 
- **Rhythm:** Vertical rhythm is driven by wide "Section Gaps" (64px+) to create a boutique-like pacing where each product story feels isolated and important. Avoid dense clusters of information; if in doubt, increase the white space.

## Elevation & Depth
In this design system, depth is achieved through **Tonal Layers** and **Low-Contrast Outlines** rather than heavy shadows.

- **Surface Tiers:** Use subtle shifts from White to Cloud Gray to define card boundaries.
- **Borders:** Use 1px solid lines in very light slate (#E2E8F0) for inputs and containers.
- **Shadows:** When necessary (e.g., for floating action buttons or primary modals), use "Ambient Shadows"—ultra-diffused, 10-15% opacity navy tints with a 20px+ blur radius to simulate natural, soft lighting.
- **Imagery:** Product images should use a consistent soft-grey background to create a seamless transition between the UI and the content.

## Shapes
The design system utilizes **Sharp (0px)** corners for all structural elements including buttons, input fields, and image containers. This architectural approach reinforces a sense of precision, high-end tailoring, and timelessness. 

Internal elements like small tags or chips may use a minimal 2px radius if absolutely necessary for legibility, but the primary aesthetic remains strictly rectilinear.

## Components

- **Buttons:** Primary buttons are solid Midnight Navy with White uppercase text. Secondary buttons are outlined (1px) with a subtle Gold hover/active state. Height should be a consistent 56px for a substantial, premium feel.
- **Input Fields:** Bottom-border only or very thin 1px full borders. Labels should be small, uppercase, and placed above the field. No placeholder text; use floating labels to maintain a clean look.
- **Cards:** Product cards must be borderless, using generous padding and centered typography. The image should take up 70-80% of the card area.
- **Chips/Filters:** Minimalist text-only filters with a Primary Gold underline for the active state. Avoid "bubble" or rounded pill shapes.
- **Icons:** Use thin-stroke (1px or 1.5px) linear icons. Icons should be sized at 24px but placed within a 48px touch target.
- **Refined Imagery:** All image containers should maintain a consistent aspect ratio (typically 4:5 for fashion/jewelry) to maintain the grid's integrity.