# Phase 11 Research — UI Overhaul Design System

**Source:** `UI/stitch_onboarding/` — 83+ design files (HTML + PNG)
**Confidence:** HIGH — extracted directly from production HTML files

---

## Design System Tokens

### Colors (Tailwind Config)

```javascript
colors: {
  // Primary
  "primary": "#ddb8ff",
  "primary-container": "#8f2de6",
  "primary-fixed": "#f0dbff",
  "primary-fixed-dim": "#ddb8ff",
  "on-primary": "#490080",
  "on-primary-container": "#f2dfff",
  "on-primary-fixed": "#2c0051",
  "on-primary-fixed-variant": "#6800b4",
  "inverse-primary": "#861fdd",

  // Secondary
  "secondary": "#c3c0ff",
  "secondary-container": "#3626ce",
  "secondary-fixed": "#e2dfff",
  "secondary-fixed-dim": "#c3c0ff",
  "on-secondary": "#1d00a5",
  "on-secondary-container": "#b3b1ff",
  "on-secondary-fixed": "#0f0069",
  "on-secondary-fixed-variant": "#3323cc",

  // Tertiary
  "tertiary": "#4edea3",
  "tertiary-container": "#007650",
  "tertiary-fixed": "#6ffbbe",
  "tertiary-fixed-dim": "#4edea3",
  "on-tertiary": "#003824",
  "on-tertiary-container": "#76ffc2",
  "on-tertiary-fixed": "#002113",
  "on-tertiary-fixed-variant": "#005236",

  // Surface & Background
  "background": "#131315",
  "surface": "#131315",
  "surface-dim": "#131315",
  "surface-bright": "#39393b",
  "surface-container-lowest": "#0e0e10",
  "surface-container-low": "#1c1b1d",
  "surface-container": "#201f22",
  "surface-container-high": "#2a2a2c",
  "surface-container-highest": "#353437",
  "surface-tint": "#ddb8ff",
  "surface-variant": "#353437",
  "on-surface": "#e5e1e4",
  "on-surface-variant": "#ccc3d8",
  "on-background": "#e5e1e4",

  // Error
  "error": "#ffb4ab",
  "error-container": "#93000a",
  "on-error": "#690005",
  "on-error-container": "#ffdad6",

  // Outline & Inverse
  "outline": "#958da1",
  "outline-variant": "#4a4455",
  "inverse-surface": "#e5e1e4",
  "inverse-on-surface": "#313032",
}
```

### Typography

```javascript
fontFamily: {
  headline: ["Plus Jakarta Sans", "sans-serif"],
  body: ["Inter", "sans-serif"],
  label: ["Manrope", "sans-serif"],
}
```

**Google Fonts:**
- Plus Jakarta Sans: 300,400,500,600,700,800
- Inter: 300,400,500,600
- Manrope: 400,500,600,700
- Material Symbols Outlined: wght,FILL@100..700,0..1

### Border Radius

```javascript
borderRadius: { DEFAULT: "0.25rem", lg: "0.5rem", xl: "0.75rem", full: "9999px" }
```

---

## Custom CSS Classes

```css
.nebula-glow { background: linear-gradient(135deg, #8f2de6 0%, #3626ce 100%); }
.glass-nav { background: rgba(19, 19, 21, 0.6); backdrop-filter: blur(12px); }
.glass-panel { background: rgba(32, 31, 34, 0.6); backdrop-filter: blur(12px); }
.stars-bg { background-image: radial-gradient(circle at 2px 2px, rgba(221, 184, 255, 0.15) 1px, transparent 0); background-size: 40px 40px; }
.glow-soft { box-shadow: 0 20px 50px rgba(143, 45, 230, 0.08); }
.celestial-glow { box-shadow: 0 0 40px rgba(143, 45, 230, 0.15); }
```

**Scrollbar:**
```css
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #4a4455; border-radius: 10px; }
```

---

## Component Patterns

### Header (TopAppBar)
- `fixed top-0 w-full z-50 bg-[#131315]/60 backdrop-blur-xl shadow-[0_20px_50px_rgba(143,45,230,0.08)]`
- Height: `h-16`
- Brand: `font-headline text-xl font-bold text-[#ddb8ff]`

### Cards
- Base: `bg-surface-container rounded-xl p-6 border border-outline-variant/5`
- Glass: `bg-surface-container/60 backdrop-blur-xl rounded-xl p-6`
- Highlighted: `bg-gradient-to-br from-primary-container to-secondary-container rounded-xl p-8`

### Stat Cards (Bento)
- Container: `bg-surface-container rounded-xl p-4 h-32 relative overflow-hidden`
- Value: `text-3xl font-headline font-black text-on-surface`
- Label: `font-label text-xs text-on-surface-variant`
- Badge: `bg-tertiary/10 text-tertiary px-2 py-0.5 rounded-full font-label text-[10px]`
- Glow: `absolute -bottom-4 -left-4 w-12 h-12 bg-tertiary/5 rounded-full blur-xl`

### Buttons
- Primary: `bg-gradient-to-br from-primary-container to-secondary-container text-white font-headline font-bold py-4 rounded-xl shadow-[0_10px_30px_rgba(143,45,230,0.3)] active:scale-95`
- Secondary: `border border-outline-variant/20 hover:bg-surface-container rounded-lg py-2 px-4`
- Icon: `text-on-surface-variant hover:text-primary p-2 rounded-full active:scale-95`

### Inputs
- `w-full bg-surface-container-lowest border-none rounded-lg p-4 text-on-surface placeholder:text-outline/40 focus:ring-1 focus:ring-primary/40`

### Progress Bar
- Track: `h-1.5 w-full bg-surface-container rounded-full overflow-hidden`
- Fill: `h-full bg-gradient-to-l from-primary-container to-secondary-container rounded-full shadow-[0_0_15px_rgba(143,45,230,0.4)]`

### Layout
- Main: `pt-24 pb-32 px-6 max-w-7xl mx-auto space-y-8`
- Bento: `grid grid-cols-2 md:grid-cols-4 gap-4`
- Asymmetric: `grid grid-cols-1 lg:grid-cols-3 gap-6` with `lg:col-span-2`

### Floating Glows (Background)
```html
<div class="fixed top-1/4 -left-20 w-96 h-96 bg-primary-container/5 rounded-full blur-[100px] -z-10"></div>
<div class="fixed bottom-1/4 -right-20 w-96 h-96 bg-secondary-container/5 rounded-full blur-[100px] -z-10"></div>
```

---

## Existing Files to Update

### Config
- `tailwind.config.ts` — Replace entire color palette + fontFamily
- `src/app/globals.css` — Add custom CSS classes (nebula-glow, glass-nav, stars-bg, etc.)
- `src/app/layout.tsx` — Update fonts (Plus Jakarta Sans, Inter, Manrope, Material Symbols)

### App Shell
- `src/components/layouts/Sidebar.tsx` — Glass panel + new colors
- `src/components/layouts/Header.tsx` — Glass nav + nebula glow
- `src/app/(auth)/layout-client.tsx` — Stars background + floating glows

### All Pages (30+ files)
- Every page needs color/typography class updates
- Card backgrounds: `bg-card` → `bg-surface-container`
- Text colors: `text-foreground` → `text-on-surface`
- Buttons: shadcn defaults → gradient/glass patterns
- Forms: shadcn input → dark glass inputs

---

## Migration Strategy

1. **Design system first** — Update tailwind.config + globals.css + fonts
2. **Shared components** — Create reusable StitchCard, StitchButton, StitchInput, StatCard
3. **App shell** — Header, sidebar, layout (affects every page)
4. **Pages by priority** — Dashboard → Tools → Tracking → AI → Growth → Learning

**Key principle:** Don't replace shadcn/ui — extend it with the Stitch theme. Override shadcn CSS variables to match the design tokens.
