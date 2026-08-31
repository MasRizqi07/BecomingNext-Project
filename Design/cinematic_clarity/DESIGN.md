---
name: Cinematic Clarity
colors:
  surface: '#131319'
  surface-dim: '#131319'
  surface-bright: '#39383f'
  surface-container-lowest: '#0e0e14'
  surface-container-low: '#1b1b21'
  surface-container: '#1f1f25'
  surface-container-high: '#2a2930'
  surface-container-highest: '#35343b'
  on-surface: '#e4e1ea'
  on-surface-variant: '#bcc9cb'
  inverse-surface: '#e4e1ea'
  inverse-on-surface: '#303037'
  outline: '#869395'
  outline-variant: '#3c494b'
  surface-tint: '#54d8e8'
  primary: '#d5f9ff'
  on-primary: '#00363c'
  primary-container: '#67e8f9'
  on-primary-container: '#006771'
  inverse-primary: '#006973'
  secondary: '#ccbeff'
  on-secondary: '#332664'
  secondary-container: '#4a3d7c'
  on-secondary-container: '#baabf3'
  tertiary: '#fff2db'
  on-tertiary: '#3e2e00'
  tertiary-container: '#ffd15e'
  on-tertiary-container: '#755900'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#91f1ff'
  primary-fixed-dim: '#54d8e8'
  on-primary-fixed: '#001f23'
  on-primary-fixed-variant: '#004f57'
  secondary-fixed: '#e7deff'
  secondary-fixed-dim: '#ccbeff'
  on-secondary-fixed: '#1e0e4e'
  on-secondary-fixed-variant: '#4a3d7c'
  tertiary-fixed: '#ffdf97'
  tertiary-fixed-dim: '#edc150'
  on-tertiary-fixed: '#251a00'
  on-tertiary-fixed-variant: '#5a4300'
  background: '#131319'
  on-background: '#e4e1ea'
  surface-variant: '#35343b'
  surface-1: '#090A0F'
  surface-2: rgba(255, 255, 255, 0.05)
  surface-3: rgba(255, 255, 255, 0.08)
  border: rgba(255, 255, 255, 0.12)
  border-strong: rgba(255, 255, 255, 0.24)
  text-primary: '#F8FAFC'
  text-secondary: '#CBD5E1'
  text-tertiary: '#94A3B8'
  accent-strong: '#22D3EE'
  danger: '#FCA5A5'
  warning: '#FCD34D'
  success: '#86EFAC'
typography:
  display-xl:
    fontFamily: Space Grotesk
    fontSize: 96px
    fontWeight: '700'
    lineHeight: '1.0'
    letterSpacing: -0.02em
  display-xl-mobile:
    fontFamily: Space Grotesk
    fontSize: 56px
    fontWeight: '700'
    lineHeight: '1.0'
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 64px
    fontWeight: '600'
    lineHeight: '1.1'
  display-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.1'
  h1:
    fontFamily: Space Grotesk
    fontSize: 52px
    fontWeight: '600'
    lineHeight: '1.1'
  h1-mobile:
    fontFamily: Space Grotesk
    fontSize: 40px
    fontWeight: '600'
    lineHeight: '1.1'
  h2:
    fontFamily: Space Grotesk
    fontSize: 36px
    fontWeight: '500'
    lineHeight: '1.2'
  h3:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.7'
  body:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.65'
  editorial-italic:
    fontFamily: Playfair Display
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  small:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.55'
  label:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter-mobile: 16px
  gutter-desktop: 32px
  margin-mobile: 20px
  margin-desktop: 64px
  max-content-width: 1200px
  reading-width: 720px
---

## Brand & Style

The design system embodies **Cinematic Clarity**—a philosophy of introspection, privacy, and intentional growth. It is designed to feel like a "digital sanctuary," shifting away from the high-energy, addictive patterns of traditional social apps toward a calm, editorial experience. 

### Design Movement: Minimalist Glassmorphism
The aesthetic combines the structural discipline of **Minimalism** with the depth of **Glassmorphism**.
- **Minimalism:** Use of heavy whitespace (editorial breathing room) and a strict 4px grid ensures that content is never overwhelmed by the interface.
- **Glassmorphism:** Surfaces use frosted glass effects (`backdrop-filter: blur`) to create a sense of physical layering without using heavy shadows, maintaining a lightweight and modern feel.

### Emotional Response
The UI should evoke a sense of **quiet authority** and **safety**. By using a deep, dark canvas and vibrant, purposeful accents, the design signals that the user’s reflections are held in a private, premium space. Motion is sparse and functional, reinforcing the "Calm, not addictive" brand pillar.

## Colors

The color palette is rooted in a deep-space "Canvas" that provides the foundation for "Cinematic" depth. 

### Functional Color Strategy
- **Primary (Cyan - #67E8F9):** Represents "Drifting Paths" or signals. It is used for primary actions, progress indicators, and AI signals.
- **Secondary (Violet - #C4B5FD):** Represents "Intentional Paths." This color is used for specific growth insights and high-value reflection milestones.
- **Neutral (#020205):** The base canvas. All surfaces stack on this deep black to ensure maximum contrast and focus.

### Transparency & Hierarchy
Surfaces are built using incremental opacities of white over the canvas. 
- **Surface-1** is the only solid container, used for base-level content cards.
- **Surface-2 and Surface-3** utilize backdrop blurs to create elevation.
- **Accessibility:** Text colors are strictly mapped to ensure a minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text. Status colors (Danger, Warning, Success) must always be accompanied by labels or icons to satisfy WCAG 2.2 AA requirements.

## Typography

This system utilizes a tri-font strategy to balance technical precision with editorial warmth.

- **Space Grotesk (Display & Labels):** Provides a geometric, futuristic feel. Used for headlines to establish a modern, AI-augmented tone.
- **Inter (Body & System):** The workhorse for readability. Body copy is strictly capped at a minimum of 16px to ensure accessibility during long-form reading sessions.
- **Playfair Display (Editorial Accents):** Used sparingly in italics for pull quotes, "future letters," or reflective prompts to introduce a human, literary quality.

### Scaling & Readability
Large display types use fluid scaling (CSS `clamp`). Long-form reflection results are confined to a "Reading Width" of 680px to 760px to prevent eye fatigue on wide screens.

## Layout & Spacing

The layout is built on a **4px base grid**, favoring generous "editorial" whitespace to promote focus.

### Grid Model
- **Mobile (Up to 767px):** 4-column fluid grid. Content uses a 16px gutter and 20px side margins.
- **Tablet (768px - 1023px):** 8-column grid with 24px gutters.
- **Desktop (1024px+):** 12-column fixed grid. The central container is capped at 1200px, but reading-intensive sections (like AI insights) are narrowed to 720px for optimal line length.

### Spacing Philosophy
Spacing should be used to group related items and separate distinct "chapters" of the user journey. Section headers should have significant top-margin (96px+) to signal a transition in the narrative flow.

## Elevation & Depth

Depth is achieved through **Tonal Layering** and **Glassmorphism** rather than traditional drop shadows.

### Layering Rules
1. **The Canvas (#020205):** The lowest level, always dark.
2. **Surface-1 (Solid):** Used for primary content containers.
3. **Surface-2/3 (Glass):** Used for interactive layers, navigation bars, and modals.
   - **Backdrop Blur:** Capped at 20px to maintain performance.
   - **Stacking:** Maximum of two translucent surfaces may be stacked to prevent loss of legibility.

### Borders
Borders function as "Light Wraps." 
- Default borders (`rgba(255,255,255,0.12)`) define shape.
- Stronger borders (`rgba(255,255,255,0.24)`) are used to highlight active or focused elements. 
Shadows are reserved exclusively for floating elements like Modals or Mobile Jump Menus to provide clear separation from the background.

## Shapes

The system uses a **Rounded** shape language to soften the futuristic "Cinematic" aesthetic, making it feel more approachable and organic.

- **Controls (Buttons/Inputs):** 12px (rounded-md) for a tactile, modern feel.
- **Compact Cards:** 20px (rounded-lg) to distinguish small interactive units.
- **Feature Cards:** 32px (rounded-xl) for large containers and AI-generated summary sections.
- **Pill Shapes:** Reserved for status badges (e.g., "Ready," "Pending") and secondary navigation items to signify they are supplementary to the main flow.

## Components

### Buttons
- **Primary:** Solid Cyan (#67E8F9) with black text. High emphasis.
- **Secondary:** Surface-2 background with a 1px border.
- **Ghost:** No background, border-strong on hover.
- **States:** Hover transitions should be fast (120ms). Focus states use a 2px Cyan outline with a 2px offset for WCAG compliance.

### Inputs & Fields
Inputs use Surface-1 with a default border. Upon focus, the border transitions to Cyan with a subtle outer glow (0px 0px 8px rgba(103, 232, 249, 0.3)). Labels are always visible using the "Label" typography style.

### Cards & Identity Summary
Cards are the primary storytelling vehicle. 
- **The Identity Card:** Uses a specific violet-to-cyan gradient border to represent the synthesis of the user's paths.
- **Interactive Cards:** Must use a 44px minimum touch target for all embedded actions.

### AI Processing (The "Orb")
Instead of standard loaders, use a CSS-based "Orb" or particle system for AI states. These should be `aria-hidden` and respect `prefers-reduced-motion` by switching to a static soft glow.