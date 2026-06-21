---
name: Bless My Baby Design System
colors:
  surface: '#fbf8ff'
  surface-dim: '#dad9e3'
  surface-bright: '#fbf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f2fd'
  surface-container: '#eeedf7'
  surface-container-high: '#e8e7f1'
  surface-container-highest: '#e3e1ec'
  on-surface: '#1a1b22'
  on-surface-variant: '#434655'
  inverse-surface: '#2f3038'
  inverse-on-surface: '#f1effa'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#5e5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e1dfde'
  on-secondary-container: '#636262'
  tertiary: '#943700'
  on-tertiary: '#ffffff'
  tertiary-container: '#bc4800'
  on-tertiary-container: '#ffede6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#e4e2e1'
  secondary-fixed-dim: '#c7c6c5'
  on-secondary-fixed: '#1b1c1b'
  on-secondary-fixed-variant: '#464746'
  tertiary-fixed: '#ffdbcd'
  tertiary-fixed-dim: '#ffb596'
  on-tertiary-fixed: '#360f00'
  on-tertiary-fixed-variant: '#7d2d00'
  background: '#fbf8ff'
  on-background: '#1a1b22'
  surface-variant: '#e3e1ec'
typography:
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 20px
  margin-mobile: 16px
  margin-desktop: auto
  max-width: 1200px
---

## Brand & Style

The brand personality is nurturing, protective, and celebratory. This design system focuses on the emotional journey of parenthood, providing a safe and warm environment for creating cherished memories. The target audience includes new parents and family members who value simplicity and emotional resonance.

The design style is **Minimalist with Tactile warmth**. It prioritizes heavy whitespace and a soft, clean aesthetic to ensure the focus remains on the baby's photos. By combining a limited, high-quality color palette with gentle elevation, the UI evokes a sense of calm and trustworthiness, moving away from cluttered "baby" aesthetics toward a modern, editorial feel.

## Colors

The palette is designed to be soothing yet functional. 

- **Primary Accent (#2563EB):** A trustworthy, vibrant blue used for primary actions, progress indicators, and key branding moments. It provides a modern contrast to the warmer background.
- **Primary Background (#FBF9F8):** A warm cream that serves as the canvas for the entire application, reducing eye strain and feeling more "organic" than pure white.
- **Surface (#FFFFFF):** Pure white is reserved for cards and interactive components to create a clear visual hierarchy against the cream background.
- **Secondary Text (#71717A):** A soft grey for metadata, labels, and helper text to maintain a gentle visual rhythm.

## Typography

This design system utilizes fonts that offer exceptional legibility for both Latin and Korean characters. 

- **Headlines:** Uses **Plus Jakarta Sans** for its soft, rounded terminals and friendly disposition. It feels modern and approachable.
- **Body & Labels:** Uses **Be Vietnam Pro**, which offers a contemporary and clean look that pairs perfectly with the rounded nature of Korean script (Hangul).

**Korean Implementation Notes:**
- Line heights are slightly increased (minimum 1.6 for body) to accommodate the vertical complexity of Hangul.
- Font weights should avoid the "Thin" range to maintain readability for tired parents.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy on desktop to create a focused, editorial experience, while transitioning to a **Fluid Grid** on mobile devices.

- **Desktop:** 12-column grid centered within a 1200px container.
- **Tablet:** 8-column grid with 24px side margins.
- **Mobile:** 4-column grid with 16px side margins.

The spacing rhythm is based on a 4px baseline, but leans heavily into larger gaps (`lg` and `xl`) to create the "airy" and "nurturing" feel required by the brand. Components should never feel cramped; when in doubt, increase the padding.

## Elevation & Depth

Visual hierarchy is achieved through **Tonal layering and Ambient shadows**. 

- **Surface Level 0:** The Cream (#FBF9F8) background.
- **Surface Level 1 (Cards):** White (#FFFFFF) surfaces with a very subtle, diffused shadow: `0 4px 20px rgba(0, 0, 0, 0.04)`.
- **Interactive Level (Hover):** When a card or element is interactive, the shadow deepens slightly to `0 8px 30px rgba(0, 0, 0, 0.08)` to signal "lift."

Avoid harsh black shadows or heavy borders. The goal is a "soft-focus" depth that feels like a physical photo sitting on a clean table.

## Shapes

The shape language is consistently **Rounded**, reflecting the softness associated with baby products. 

- **Standard Elements:** 8px (`0.5rem`) corner radius for cards, input fields, and standard buttons.
- **Upload Zones:** 12px (`0.75rem`) corner radius to create a distinct, large area for interaction.
- **Chips/Badges:** Fully pill-shaped to contrast against the more structured cards.

## Components

### Buttons
- **Primary:** Solid Blue (#2563EB) with white text. 16px horizontal padding, 500 weight.
- **Secondary:** White background with a Soft Grey (#71717A) border and text.

### Cards
- Large white surfaces with 8px rounded corners. Internal padding should be generous (24px - 32px). This is the primary container for the "Bromide" generation steps.

### Upload Zones
- Use a **dashed border** (2px width, Blue #2563EB at 30% opacity). 
- Background should be a slightly lighter tint of the background or white.
- Include a clear icon and Korean instruction (e.g., "사진을 업로드하세요").

### Input Fields
- White background with a light grey border (1px). 
- Focus state: Border changes to Primary Blue (#2563EB) with a soft 2px blue glow (ring).
- Labels are placed above the field in Label-MD style.

### Progress Stepper
- Simple, thin lines connecting numbered circles. 
- Active state uses Primary Blue; inactive states use Soft Grey.

### Chips (Labels/Tags)
- Pill-shaped with a light Blue tint background (#EBF2FF) and Primary Blue text for active statuses.