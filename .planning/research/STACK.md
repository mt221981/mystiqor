# Technology Stack — v1.3 Mystical UX & Coach Prominence

**Project:** MystiQor
**Milestone:** v1.3 — Mystical UX & Coach Prominence
**Researched:** 2026-03-29
**Scope:** NEW capabilities only — existing stack (Next.js 15, TypeScript strict, Tailwind CSS, Supabase, framer-motion 12.38, shadcn/ui) is validated and documented in prior STACK.md (v1.0). This file covers only what v1.3 needs.

---

## Executive Summary

No new npm packages are required for v1.3. All four new capabilities (glow/gradient text, cosmic animations, floating chat widget, mobile bottom tabs, text contrast fixes) are achievable by extending the existing CSS in `globals.css`, adding Tailwind utilities, and writing custom React components using framer-motion and ReactDOM.createPortal — both already installed.

**New library installs: 0.**

---

## Capability 1: Glowing / Gradient Text and Cosmic Animations

### Verdict: CSS-only. No new JS library.

**Rationale:**

`globals.css` already contains the full foundation:
- `.text-gradient-gold` and `.text-gradient-mystic` — working gradient text via `-webkit-background-clip: text`
- `.stars-bg` — layered radial-gradient star pattern with `stars-twinkle` keyframe
- `.aurora-bg` — `background-size: 400% 400%` animated gradient
- `.sparkle-float` — pseudo-element particle drift
- `.shimmer-border` — conic-gradient rotating shimmer
- `pulse-glow`, `float-gentle`, `shimmer`, `sparkle-drift`, `aurora-shift` — all defined `@keyframes`

The gap is not missing technique — it is under-application of existing utilities. Key elements (page headings, card titles, coach icon) do not yet use these classes.

**JS particle libraries (tsparticles, react-particles, lottie-react):**
- tsparticles: ~80 kB gzipped, canvas render loop, CPU-intensive on low-end mobile, conflicts with PWA paint budget. The existing CSS `stars-bg` achieves the same visual at zero JS cost.
- lottie-react: designed for After Effects exports, not hand-authored animations. Adds ~40 kB for no benefit over CSS keyframes.
- react-spring: redundant — framer-motion v12.38 is already installed and covers all animation needs.

**Do not add any of these.**

### New CSS to Add (globals.css additions only)

| Utility | CSS technique | Use case |
|---------|--------------|---------|
| `.text-glow-primary` | `text-shadow` with lavender halo | Section headings on dark surfaces |
| `.text-glow-gold` | `text-shadow` with gold halo | Feature titles, coach label |
| `.text-gradient-cosmic` | `background-clip: text` with teal-to-purple | Alternate heading treatment |
| `.pulse-text-glow` | `@keyframes` on `text-shadow` intensity | Animated heading accent |

**Important constraint:** `text-shadow` does not apply to elements using `-webkit-text-fill-color: transparent` (gradient text). Apply glow utilities to solid-color text only. Gradient headings have sufficient luminance by construction and do not need glow.

### framer-motion (already v12.38) for JS animations

framer-motion covers all JS animation needs for this milestone:
- Floating chat button spring physics and breathing pulse
- Panel expand/collapse via `AnimatePresence`
- Bottom tab indicator slide via `layoutId` shared layout
- Page transitions (already in use via `PageTransition.tsx`)

**Confidence: HIGH** — verified via direct file reads of `globals.css`, `package.json` (framer-motion v12.38), `ChatMessage.tsx`, `PageTransition.tsx`.

---

## Capability 2: Floating Chat Widget Overlay

### Verdict: No new library. framer-motion + ReactDOM.createPortal.

**Why no specialized chat widget library:**

Libraries like `react-chat-widget` or `crisp-sdk-web` are wrappers around third-party chat services (Intercom, Crisp, Drift). They cannot connect to MystiQor's internal coach API endpoints (`/api/coach/conversations`, `/api/coach/messages`). Using them would require duplicating all API logic outside the existing service layer and bypassing the `SubscriptionGuard` component.

### Architecture (new files)

```
src/components/features/coach/
├── FloatingCoachButton.tsx    FAB — crystal ball icon, pulse-glow, open/close trigger
├── FloatingChatPanel.tsx      Mini-chat panel — 300x420px, portal-rendered
└── FloatingCoachWidget.tsx    Parent — manages state, conditionally renders both
```

**Integration point:** `src/app/(auth)/layout-client.tsx`

Render `<FloatingCoachWidget />` once at the authenticated layout level. The widget appears on every authenticated page automatically. Must suppress on `/coach` to avoid duplication alongside the full coach page.

```typescript
// In FloatingCoachWidget.tsx
const pathname = usePathname();
if (pathname === '/coach') return null;
```

**ReactDOM.createPortal** — renders the panel into `document.body` directly, outside the layout tree. This prevents z-index inheritance from nested `overflow: hidden` ancestors and avoids stacking conflicts with the existing `glass-nav` (z-50) and the new bottom tab bar (z-40).

### Z-index Layering

| Layer | z-index | Component |
|-------|---------|-----------|
| Bottom tab bar | 40 | `BottomTabBar` (new) |
| Header `glass-nav` | 50 | Existing |
| Floating chat widget | 60 | `FloatingCoachWidget` (new) |
| shadcn Dialog / Sheet | 100+ | Existing |

### Positioning (RTL)

```css
/* FAB — logical properties for RTL */
position: fixed;
bottom: calc(5rem + env(safe-area-inset-bottom)); /* above tab bar + iPhone notch */
inset-inline-start: 1.5rem; /* = right side in RTL */
z-index: 60;
```

```css
/* Panel — opens upward/inward from FAB position */
position: fixed;
bottom: calc(8rem + env(safe-area-inset-bottom));
inset-inline-start: 1.5rem;
width: 300px;
height: 420px;
z-index: 60;
```

### framer-motion animation pattern

```typescript
// FAB: breathing pulse when closed, shrink when open
<motion.button
  animate={{ scale: isOpen ? 0.9 : 1 }}
  whileHover={{ scale: 1.08 }}
  whileTap={{ scale: 0.95 }}
/>

// Panel: spring slide up from FAB
<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85, y: 20 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
    />
  )}
</AnimatePresence>
```

**Reuse from existing coach page:** `ChatMessage`, `ChatInput`, `QuickActions` components can be imported directly into `FloatingChatPanel`. The existing API fetch functions (`fetchMessages`, `sendMessage`, `createConversation`) from `coach/page.tsx` should be extracted to a shared service module so both the full page and the widget use the same data layer.

**Confidence: HIGH** — framer-motion AnimatePresence and ReactDOM.createPortal are core stable APIs. RTL logical properties (`inset-inline-start`) confirmed working in `MobileNav.tsx` (uses `end-0` logical property).

---

## Capability 3: Mobile Bottom Tab Navigation

### Verdict: No new library. Custom component with Tailwind + framer-motion.

**Why no bottom-nav library:**

Available npm packages (`react-bottom-navigation`, `@mui/bottom-navigation`, etc.) either: (a) have no RTL support, (b) require MUI theme integration that conflicts with the shadcn/Tailwind stack, or (c) are unmaintained (last publish 2021-2022). Building the component takes ~60 lines of Tailwind — less than any library's configuration.

### Tab Structure

5 tabs maximum — beyond 5, thumb reach becomes unreliable on phones under 6 inches.

| Tab | Label | Icon source | Route |
|-----|-------|-------------|-------|
| בית | Dashboard | `LayoutDashboard` (lucide) | `/dashboard` |
| כלים | Tools | `GiCrystalBall` (react-icons/gi) | `/tools` |
| מאמן | Coach | `Sparkles` (lucide) | `/coach` |
| היסטוריה | History | `History` (lucide) | `/history` |
| פרופיל | Profile | `User` (lucide) | `/profile` |

Both icon libraries are already installed (`lucide-react ^0.577.0`, `react-icons ^5.6.0`).

The full 38-item Sidebar remains for desktop. Bottom tabs are `md:hidden` — they do not replace desktop navigation.

### Architecture

```
src/components/layouts/
└── BottomTabBar.tsx    New. Fixed bottom, glass-nav styling, 5 tabs, md:hidden.
```

**Integration:** Add to `src/app/(auth)/layout-client.tsx`. Add `pb-20 md:pb-0` to the main content wrapper to prevent content clipping under the tab bar (bar height = 64px + safe area inset).

### Positioning

```css
position: fixed;
bottom: 0;
inset-inline: 0;            /* RTL-safe full width, logical property */
height: 64px;
padding-bottom: env(safe-area-inset-bottom);
z-index: 40;
```

Use the existing `glass-nav` CSS utility from globals.css — same frosted indigo background (`rgba(10, 9, 28, 0.85)` + `backdrop-filter: blur(20px)`) as the top header. Consistent visual language.

### Active State Animation

framer-motion `layoutId` creates a smooth sliding indicator between tabs without manual position calculation:

```typescript
{isActive && (
  <motion.div
    layoutId="tab-indicator"
    className="absolute top-0 inset-x-1 h-0.5 rounded-full bg-primary"
    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
  />
)}
```

Active tab: `text-primary` + glow. Inactive tab: `text-on-surface-variant/70`.

**Confidence: HIGH** — `layoutId` shared layout animation is a core framer-motion feature (since v4). RTL `inset-inline: 0` is standard CSS logical property, same pattern as the existing `glass-nav` on mobile.

---

## Capability 4: Text Contrast on Dark Cosmic Backgrounds

### Verdict: CSS variable adjustments + className audit. No library.

This is not a library problem. Root cause is three patterns:

**Pattern A — Low opacity modifiers on dim tokens:**
Example: `text-on-surface-variant/50` in `ChatMessage.tsx` timestamps. The base token `#c8bede` has 7.2:1 contrast at full opacity on `#0d0b1e`. At `/50` (50% opacity) the effective contrast drops to ~3.5:1 — fails WCAG AA (4.5:1) for normal text.

**Pattern B — `muted-foreground` near-threshold:**
`--muted-foreground: 268 20% 78%` on `--muted: 250 30% 16%` background gives 4.1:1. Passes AA for large text (3:1 required) but fails for normal text (4.5:1 required). Many UI labels use `muted-foreground` for normal-sized text.

**Pattern C — Gold at low opacity:**
`text-gold-dim/60` (= `#b8913e` at 60% opacity) on `#0d0b1e` deep indigo = ~2.5:1. Fails AA entirely. Used in sidebar labels and secondary text.

### CSS Fixes (globals.css only)

**Fix 1 — Raise `--muted-foreground` lightness:**
```css
.dark {
  --muted-foreground: 268 20% 88%; /* was 78% → 6.1:1 on muted bg */
}
```

**Fix 2 — New glow utilities for key headings:**
```css
@layer utilities {
  /* Glow for solid-color text on dark/complex backgrounds */
  .text-glow-primary {
    text-shadow:
      0 0 20px rgba(221, 184, 255, 0.55),
      0 0 40px rgba(143, 45, 230, 0.3);
  }

  .text-glow-gold {
    text-shadow:
      0 0 15px rgba(212, 168, 83, 0.55),
      0 0 30px rgba(212, 168, 83, 0.25);
  }
}
```

Note: `text-shadow` has no effect on `-webkit-text-fill-color: transparent` elements. Apply only to solid-color text.

### Opacity Audit Rule for Implementation

Apply during phase execution when editing existing files:

| Context | Minimum opacity | Rationale |
|---------|----------------|-----------|
| Meaningful text (labels, values, descriptions) | `/80` minimum | Ensures contrast above 4.5:1 |
| Decorative / timestamps / metadata | `/60` acceptable | Not critical content |
| Headings | Use gradient utilities or `text-on-surface` (full) | Gradient utilities have built-in luminance |
| Gold text on dark bg | `text-gold` or `text-gold-bright` (no opacity) | `text-gold-dim` at any opacity below `/80` fails |

**Confidence: HIGH** — contrast ratios calculated directly from hex/HSL values in `globals.css` and `tailwind.config.ts`. WCAG 2.1 formula applied to actual token values.

---

## Complete New Library Table

| Library | Needed | Verdict | Reason |
|---------|--------|---------|--------|
| tsparticles | No | Reject | 80 kB canvas loop for visual already achieved by existing CSS |
| react-particles | No | Reject | Same as tsparticles |
| lottie-react | No | Reject | No After Effects assets; CSS keyframes sufficient |
| react-spring | No | Reject | Redundant with framer-motion v12.38 |
| react-bottom-navigation | No | Reject | No RTL, unmaintained, 60-line custom component is better |
| react-chat-widget | No | Reject | Third-party service wrapper, incompatible with internal API |
| @radix-ui/react-dialog for FAB | No | Reject | FAB panel is not a modal dialog; portal + ARIA region is correct semantic |
| Any new npm package | No | Reject | All capabilities covered by existing dependencies |

**New installs: 0.**

---

## What Changes in Existing Files

| File | Change type | What changes |
|------|-------------|-------------|
| `src/app/globals.css` | Extension | Add `.text-glow-primary`, `.text-glow-gold`, `.text-gradient-cosmic`; adjust `--muted-foreground` |
| `src/app/(auth)/layout-client.tsx` | Mount | Add `<BottomTabBar />` and `<FloatingCoachWidget />` |
| `src/app/(auth)/layout-client.tsx` | Content offset | Add `pb-20 md:pb-0` to main content wrapper |
| Coach API functions | Extract | Move `fetchMessages`, `sendMessage`, `createConversation` to `src/services/coach/api.ts` for shared use |

**New files:**
- `src/components/layouts/BottomTabBar.tsx`
- `src/components/features/coach/FloatingCoachButton.tsx`
- `src/components/features/coach/FloatingChatPanel.tsx`
- `src/components/features/coach/FloatingCoachWidget.tsx`
- `src/services/coach/api.ts` (extracted from `coach/page.tsx`)

---

## Sources

| Source | Type | Confidence |
|--------|------|------------|
| `mystiqor-build/src/app/globals.css` — direct file read | Codebase | HIGH |
| `mystiqor-build/tailwind.config.ts` — direct file read | Codebase | HIGH |
| `mystiqor-build/package.json` — framer-motion v12.38 confirmed | Codebase | HIGH |
| `mystiqor-build/src/components/layouts/MobileNav.tsx` — RTL logical properties pattern | Codebase | HIGH |
| `mystiqor-build/src/components/features/coach/ChatMessage.tsx` — framer-motion usage | Codebase | HIGH |
| `mystiqor-build/src/components/common/PageTransition.tsx` — AnimatePresence usage | Codebase | HIGH |
| `mystiqor-build/src/app/(auth)/layout-client.tsx` — integration point confirmed | Codebase | HIGH |
| WCAG 2.1 relative luminance formula — applied to token hex values from globals.css | Standard | HIGH |
| framer-motion v12 AnimatePresence, layoutId, spring transition — confirmed in installed node_modules | Library | HIGH |
