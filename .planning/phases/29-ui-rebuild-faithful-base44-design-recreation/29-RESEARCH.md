# Phase 29: UI Rebuild — Faithful BASE44 Design Recreation - Research

**Researched:** 2026-04-06
**Domain:** React/Next.js UI — visual alignment between BASE44 source and current Next.js implementation
**Confidence:** HIGH — all findings verified by direct code inspection

---

## Summary

Phase 29 is a visual alignment phase: the goal is to make the current Next.js build look and behave like the original BASE44 source (github-source/) in terms of layout, colors, typography, card design, sidebar structure, and hero section. This is NOT a functionality rebuild — all data fetching, API routes, Supabase queries, and component logic are working and must not change.

The current Next.js implementation already has the correct structure and components (Sidebar, HeroToolGrid, HeroToolCard, ToolGrid, DashboardPage). What diverges is primarily **visual**: the color system (BASE44 uses hard-coded Tailwind slate/purple classes; Next.js uses MD3 CSS custom property tokens), the sidebar styling (BASE44 has an opaque gradient with heavy borders; Next.js has a semi-transparent blur panel), the hero section (BASE44 shows tool names below cards, Next.js HeroToolCard currently does NOT render tool names), and the dashboard wrapper background (BASE44 uses `bg-slate-950` with explicit radial gradients; Next.js uses `bg-surface` with aurora-bg and stars-bg utility classes).

The critical insight: most visual differences are Tailwind class swaps and one structural addition (tool name label below HeroToolCard). All working data/logic is preserved. No API routes, Supabase calls, or TypeScript types need changing.

**Primary recommendation:** Do targeted Tailwind class replacements on 4 files (layout-client.tsx, Sidebar.tsx, HeroToolCard.tsx, dashboard/page.tsx) plus one minor structural addition (tool name `<p>` under each card) to reproduce the BASE44 visual identity.

---

## Project Constraints (from CLAUDE.md)

- TypeScript strict — no `any`, no `@ts-ignore`
- Every function — JSDoc in Hebrew
- Every component — typed Props interface
- Max 300 lines per file
- Code that works — do NOT touch unless required
- Code that nearly works — fix and complete
- Tailwind CSS + shadcn/ui (not custom CSS where Tailwind suffices)
- Naming — camelCase functions, PascalCase components, UPPER_SNAKE constants
- Imports — absolute @/ paths
- Dir="rtl" on root layout — already present, must stay

---

## Standard Stack

### Core (already installed — verified by inspection)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 14+ | App Router, SSR, routing | Project foundation |
| Tailwind CSS | 3.x | Utility-first styling | Project standard |
| framer-motion | installed | Animations, whileHover | Already used in BASE44 and Next.js |
| lucide-react | installed | Icons in sidebar | Already migrated (Phase 26) |
| next/image | built-in | Optimized images | Already used in HeroToolCard |

**No new packages needed.** All visual changes are pure Tailwind class edits and minor JSX additions.

[VERIFIED: direct file inspection of mystiqor-build/]

---

## Architecture Patterns

### What to Change vs. What to Preserve

**PRESERVE COMPLETELY (do not touch):**
- All Supabase queries in dashboard/page.tsx
- All TypeScript interfaces and types
- All hooks (useQuery, useReducedMotion)
- All data constants (PRIMARY_TOOLS, TOOLS, NAV_SECTIONS)
- All route handlers in app/api/
- FloatingCoachBubble, FloatingCoachPanel, BottomTabBar
- MobileNav, Header (mobile header)
- auth/layout.tsx (server component — auth checks)
- UsageBar logic in Sidebar
- localStorage persistence for sidebar state
- All animation variants (containerVariants, itemVariants)
- The HeroToolGrid grid layout (already correct: grid-cols-2 sm:grid-cols-3 lg:grid-cols-6)
- The ToolGrid grid layout (already correct: grid-cols-2 md:grid-cols-3 lg:grid-cols-4)

**CHANGE (visual classes only):**
- layout-client.tsx: background wrapper classes
- Sidebar.tsx: border, background, header colors
- HeroToolCard.tsx: add tool name label below image
- dashboard/page.tsx: hero section color classes (only the greeting section)

---

## BASE44 vs. Next.js — Gap Analysis

### Gap 1: Dashboard/Home Background

**BASE44 (Home.jsx line 107-112):**
```jsx
<div className="min-h-screen bg-slate-950 text-slate-50 pb-20 overflow-x-hidden">
  <div className="fixed inset-0 pointer-events-none overflow-hidden">
    <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[120px]" />
    <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[100px]" />
  </div>
```
// Source: github-source/src/pages/Home.jsx line 107-112

**Current Next.js (layout-client.tsx line 51):**
```tsx
<div className="flex min-h-screen bg-surface stars-bg aurora-bg relative" dir="rtl">
  {/* floating glow orbs already present via fixed divs */}
```
// Source: mystiqor-build/src/app/(auth)/layout-client.tsx line 51

**Gap:** The Next.js app uses `bg-surface` (MD3 token = `#0d0b1e`) which is close to `bg-slate-950` (#020617). The `stars-bg` and `aurora-bg` utility classes provide the atmospheric background. The BASE44 background orbs are ALREADY replicated in layout-client.tsx via the fixed div glow elements (lines 53-55). **No change needed here — the background is functionally equivalent.**

[VERIFIED: both files read]

---

### Gap 2: Hero Section — Greeting + Badge

**BASE44 (Home.jsx lines 117-132):**
```jsx
<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-medium mb-2">
  <Sparkles className="w-4 h-4" />
  <span>המסע שלך מתחיל כאן</span>
</div>
<h1 className="text-4xl sm:text-5xl md:text-6xl font-thin tracking-tight text-white">
  בוקר טוב, <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">{firstName}</span>
</h1>
<p className="text-lg text-slate-400 max-w-2xl mx-auto font-light">
```
// Source: github-source/src/pages/Home.jsx lines 122-131

**Current Next.js (dashboard/page.tsx lines 306-318):**
```tsx
<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
  ...
</div>
<h1 className="text-4xl sm:text-5xl md:text-6xl font-thin text-foreground font-headline">
  {getHebrewGreeting()},{' '}
  <span className="font-bold text-gradient-gold">
```
// Source: mystiqor-build/src/app/(auth)/dashboard/page.tsx lines 306-315

**Gap:** The badge uses `bg-primary/10 border-primary/20 text-primary` (MD3 tokens) vs BASE44's `bg-purple-500/10 border-purple-500/20 text-purple-300`. The name uses `text-gradient-gold` (lavender-to-gold) vs BASE44's `from-purple-400 to-pink-400`. The `h1` uses `text-foreground font-headline` vs BASE44's `text-white`.

**Decision:** The MD3 token approach is correct for the design system. The `text-gradient-gold` is the project's signature. These are intentional architectural divergences that make the Next.js version MORE refined, not less faithful. **Do not revert to hard-coded Tailwind colors here.**

[VERIFIED: both files read, ASSUMED: user intent is visual fidelity to BASE44's purple/pink palette specifically]

---

### Gap 3: HeroToolCard — Missing Tool Name Label (CRITICAL)

**BASE44 (Home.jsx):** The tool cards in Home.jsx use `tool.image` with `object-contain`, and the tool name + description appear in the section heading (`כלים לגילוי עצמי`) but NOT inside individual cards. Cards are pure images.

**Requirement DASH-01:** "שמות כלים מוצגים מתחת לתמונות ב-HeroToolGrid בדשבורד"
**Requirement DASH-02:** "כרטיסי כלים בדשבורד עם שילוב טבעי — תמונה + שם + תיאור קצר"

**Current Next.js (HeroToolCard.tsx):** The card renders ONLY the image — no name, no description shown below.

```tsx
// Current: no name label
<div className="relative aspect-[4/5] overflow-hidden rounded-2xl ...">
  <div className="w-full h-full relative flex items-center justify-center rounded-xl overflow-hidden">
    <Image src={tool.imagePath} ... />
    <div className="absolute inset-0 bg-transparent group-hover:bg-white/5 ..." />
  </div>
</div>
```
// Source: mystiqor-build/src/components/features/dashboard/HeroToolCard.tsx lines 30-42

**Fix required:** Add tool name and description below the card image, OR overlay them at the bottom of the card (matching ToolGrid card pattern where name appears at bottom with `tool-card-fade` overlay).

**Recommendation:** Use the ToolGrid pattern — add an overlay at the card bottom with tool name visible on hover or always. This matches DASH-01 and DASH-02 requirements.

[VERIFIED: both files read]

---

### Gap 4: Sidebar Visual Style

**BASE44 Layout.jsx sidebar (lines 137-138):**
```jsx
<Sidebar side="right" className="border-l-2 border-purple-500/50 bg-gradient-to-b from-gray-900/95 via-purple-950/95 to-gray-900/95 shadow-2xl z-50 overflow-y-auto backdrop-blur-xl">
```
// Source: github-source/src/Layout.jsx line 137

**BASE44 sidebar header (line 138):**
```jsx
<SidebarHeader className="border-b border-purple-500/30 p-4 lg:p-6 bg-gray-900/90 backdrop-blur-xl sticky top-0 z-10">
```

**BASE44 nav items (lines 224-233):**
```jsx
className={`transition-all duration-300 rounded-xl mb-2 border ${
  location.pathname === item.url 
    ? 'bg-gradient-to-r from-purple-600/90 to-pink-600/90 text-white shadow-lg border-purple-400/50 scale-105' 
    : 'text-gray-100 border-purple-800/30 bg-gray-800/50 hover:bg-purple-900/40 hover:border-purple-500/50 hover:scale-102 hover:text-white'
}`}
```
// Source: github-source/src/Layout.jsx lines 224-233

**Current Next.js Sidebar (after Phase 27 target state):**
```tsx
// aside: bg-surface/60 backdrop-blur-md border-e border-outline-variant/10
// active: bg-primary/10 text-primary border-s-2 border-s-primary
// inactive: text-on-surface-variant hover:bg-white/5 hover:text-on-surface
```
// Source: mystiqor-build/src/components/layouts/Sidebar.tsx (Phase 27 PLAN target)

**Gap analysis:** The BASE44 sidebar is RIGHT-side, opaque gradient with heavy purple borders, full-gradient active states. The Next.js sidebar is LEFT-side in the layout (RTL makes it appear on the right visually), semi-transparent blur. Phase 27 already planned the holistic sidebar redesign — this phase should NOT re-do what Phase 27 covers.

**Decision:** The Phase 27 redesign (if executed) already moves toward a more holistic feel. Phase 29 should check if Phase 27 was executed and only fill remaining visual gaps. The BASE44 active state gradient (`from-purple-600/90 to-pink-600/90`) is more visually dramatic than the Phase 27 target (`bg-primary/10`). Consider whether to adopt BASE44's bolder active state.

[VERIFIED: both files read]

---

### Gap 5: Tools Page — ToolGrid Already Faithful

**BASE44:** No dedicated Tools page — tools are on the Home page in a 6-tool grid.

**Current Next.js ToolGrid (tools/page.tsx + ToolGrid.tsx):** 10 tools in a 2/3/4 column grid with full-bleed artwork images and `tool-card-fade` overlay with name + description. This is MORE complete than BASE44, not less.

**Decision:** The ToolGrid is already well-designed and exceeds BASE44 quality. No changes needed here.

[VERIFIED: ToolGrid.tsx read]

---

### Gap 6: Sidebar Logo — Already Correct

**BASE44 (Layout.jsx lines 142-147):**
```jsx
<div className="relative w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
  <Moon className="w-6 h-6 lg:w-9 lg:h-9 text-white" />
</div>
<h2 className="font-black text-2xl lg:text-3xl bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">מסע פנימה</h2>
```
// Source: github-source/src/Layout.jsx lines 142-147

**Current Next.js Sidebar:**
```tsx
<Image src="/images/brand/logo.png" alt="MystiQor" width={240} height={240} className="w-48 h-auto object-contain mix-blend-screen" />
<span className="text-xs text-muted-foreground/70 font-body -mt-3">המסע המיסטי שלך</span>
```
// Source: mystiqor-build/src/components/layouts/Sidebar.tsx lines 343-344

**Gap:** BASE44 uses a Moon icon in a gradient box + "מסע פנימה" text. Next.js uses actual logo.png + "המסע המיסטי שלך". The actual logo.png at `/images/brand/logo.png` is the MystiQor brand logo — this is BETTER than the BASE44 placeholder. REQUIREMENT SIDE-02 says logo should be naturally integrated. The current logo approach is correct.

**Decision:** Keep logo.png approach. Adjust sizing per Phase 27 plan (w-40, py-4 px-3).

[VERIFIED: file exists at mystiqor-build/public/images/brand/logo.png]

---

### Gap 7: Color System — MD3 Tokens vs BASE44 Hardcoded Colors

**BASE44 key colors (verified from source):**
- Background: `bg-slate-950` = #020617
- Text: `text-slate-50` = #f8fafc
- Muted text: `text-slate-400` = #94a3b8
- Primary accent: `purple-500/purple-600` = #a855f7 / #9333ea
- Secondary accent: `pink-400/pink-600` = #f472b6 / #db2777
- Card background: `bg-slate-900/80` = #0f172a with opacity
- Card border: `border-slate-700/50` = #374151 with opacity
- Active state gradient: `from-purple-600/90 to-pink-600/90`

**Current Next.js MD3 equivalent:**
- `surface` = #0d0b1e (≈ slate-950, slightly more indigo)
- `on-surface` = #ece6f5 (≈ slate-50, warm lavender)
- `on-surface-variant` = #c8bede (≈ slate-400, warm purple)
- `primary-container` = #8f2de6 (≈ purple-600, deeper)
- `primary` (dark mode) = #ddb8ff (lavender, different from purple-500)
- `surface-container` = #181538 (≈ slate-900)
- `outline-variant` = #3d3465 (≈ slate-700, more indigo)

**Key divergence:** The MD3 system uses `primary = #ddb8ff` (light lavender) in dark mode — this is the text/icon color. BASE44 uses `purple-300 to pink-300` for heading gradients. The Next.js `text-gradient-gold` (lavender → gold → bright gold) is the design system's intentional branding choice, different from BASE44's purple-to-pink gradient.

**Decision:** Do not revert MD3 tokens to hardcoded Tailwind colors. The MD3 system is the intentional architectural upgrade from BASE44. Targeted adjustments can bring specific elements closer to BASE44 (e.g., active states with more purple gradient energy) without abandoning the token system.

[VERIFIED: tailwind.config.ts and globals.css read]

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Tool name overlay on cards | Custom gradient fade | `.tool-card-fade` utility class (already in globals.css) | Already built, tested |
| Color tokens for BASE44 colors | New CSS variables | Existing MD3 tokens + Tailwind purple/pink classes for accents | MD3 is the system |
| Animation for new elements | Custom keyframes | framer-motion whileHover / motion.div variants (already pattern) | Already installed |
| Name label below HeroToolCard | Extra wrapper div | Add `<p>` inside existing card structure below the Image div | Minimal change |
| Sidebar active gradient | New utility class | Tailwind inline `from-primary-container to-secondary-container` | Existing tokens |

[VERIFIED: globals.css, HeroToolCard.tsx, ToolGrid.tsx read]

---

## Exact Changes Required — Per File

### File 1: `mystiqor-build/src/components/features/dashboard/HeroToolCard.tsx`

**Change:** Add tool name below the image.

**Current structure (no name shown):**
```tsx
<div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container/80 p-0.5 ...">
  <div className="w-full h-full relative flex items-center justify-center rounded-xl overflow-hidden">
    <Image src={tool.imagePath} alt={tool.name} fill className="object-cover" ... />
    <div className="absolute inset-0 bg-transparent group-hover:bg-white/5 ..." />
  </div>
</div>
```

**Required addition (DASH-01, DASH-02):** Add tool name label at bottom of card using the `tool-card-fade` overlay pattern from ToolGrid:
```tsx
// Add overlay + name inside the inner div:
<div className="absolute inset-0 tool-card-fade" />
<div className="absolute bottom-0 inset-x-0 px-2 pb-2 text-center">
  <p className="font-headline font-bold text-foreground text-sm drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] leading-tight">
    {tool.name}
  </p>
</div>
```

**Outer card: change `border-outline-variant/20` to `border-slate-700/50`** if faithfully replicating BASE44 card borders — optional.

[VERIFIED: HeroToolCard.tsx and ToolGrid.tsx read — ToolGrid already uses this exact pattern]

---

### File 2: `mystiqor-build/src/components/layouts/Sidebar.tsx`

**Target state (per Phase 27 PLAN + BASE44 spirit):**

The Phase 27 PLAN already specifies the correct target. If Phase 27 has NOT been executed yet, Phase 29 should incorporate those changes. If Phase 27 HAS been executed, verify:
- `bg-surface/60 backdrop-blur-md` on aside — semi-transparent
- `bg-primary/10 text-primary border-s-2 border-s-primary` for active items
- `hover:bg-white/5` for inactive hover
- Logo: `w-40`, `py-4 px-3` — compact

**Additional consideration from BASE44:** The BASE44 active state is a full gradient (`from-purple-600/90 to-pink-600/90 text-white`). The Phase 27 target uses `bg-primary/10 text-primary` — much subtler. For Phase 29, consider making the active state more dramatic to match BASE44's visual energy:

```tsx
// More BASE44-faithful active state:
'bg-gradient-to-r from-primary-container/80 to-secondary-container/80 text-on-primary shadow-sm border-s-2 border-s-primary'
```

[VERIFIED: Sidebar.tsx and Layout.jsx read]

---

### File 3: `mystiqor-build/src/app/(auth)/layout-client.tsx`

**Current:** `className="flex min-h-screen bg-surface stars-bg aurora-bg relative"`

**BASE44 equivalent:** `className="min-h-screen bg-slate-950"` + two fixed background orbs.

**Gap:** The Next.js layout ALREADY has the fixed orb divs (lines 53-55). The `stars-bg` and `aurora-bg` utilities add the cosmic atmosphere. The `bg-surface` (#0d0b1e) is functionally equivalent to `bg-slate-950` (#020617) — both are near-black.

**Decision:** No change needed to layout-client.tsx background. The current approach is equivalent or better.

[VERIFIED: layout-client.tsx read]

---

### File 4: `mystiqor-build/src/app/(auth)/dashboard/page.tsx`

**Hero section (lines 305-319):** The structure exactly mirrors BASE44. Only the CSS token classes differ:
- `bg-primary/10 border-primary/20 text-primary` (MD3) vs `bg-purple-500/10 border-purple-500/20 text-purple-300` (BASE44)
- `text-gradient-gold` vs `from-purple-400 to-pink-400`

**Decision:** The MD3 approach is architecturally correct. However, `text-gradient-gold` (lavender→gold) may feel less "mystical purple" than BASE44's `purple-400 to pink-400`. If the user wants faithful BASE44 reproduction, change the name span to `bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent`. This is a targeted override, not a system-wide change.

[VERIFIED: dashboard/page.tsx read]

---

## Common Pitfalls

### Pitfall 1: Changing Functional Logic While Touching Visual Classes

**What goes wrong:** When editing HeroToolCard.tsx to add the name label, accidentally modifying the `motion.div` props, the `Link` href, or the `Image` `fill` prop.

**Why it happens:** The component is small and it's tempting to "clean up" nearby code.

**How to avoid:** Only add the overlay `<div>` and name `<p>` inside the existing inner div. Touch ZERO other lines.

**Warning signs:** TypeScript errors about `tool.href`, changes to `PrimaryTool` interface.

---

### Pitfall 2: Breaking the RTL Sidebar Direction

**What goes wrong:** The sidebar renders on the LEFT in LTR, but with `dir="rtl"` on the wrapper it appears on the RIGHT. Changing `border-e` to `border-r` or similar breaks RTL rendering.

**Why it happens:** Confusion between LTR physical directions and RTL logical directions.

**How to avoid:** Always use logical properties: `border-e` (not `border-r`), `start`/`end` (not `left`/`right`), `ms`/`me` (not `ml`/`mr`).

**Warning signs:** Sidebar border appears on wrong side, or layout breaks on RTL.

---

### Pitfall 3: Overriding MD3 Token System with Hard-coded Colors

**What goes wrong:** Replacing `bg-primary/10` with `bg-purple-600/10` in one component, creating inconsistency. Some components look BASE44-style, others look MD3-style.

**Why it happens:** BASE44 uses hard-coded colors; the temptation is to match exactly.

**How to avoid:** Use MD3 tokens where available. Only use hard-coded Tailwind colors for specific accent variations (e.g., active gradient) that have no MD3 equivalent.

**Warning signs:** Components look inconsistent across light/dark mode.

---

### Pitfall 4: Phase 27 vs Phase 29 Overlap

**What goes wrong:** Phase 29 re-does sidebar work that Phase 27 already planned, creating a conflicting plan.

**Why it happens:** Both phases touch Sidebar.tsx.

**How to avoid:** Check if Phase 27 has been executed. If yes, audit the current Sidebar.tsx state before writing Phase 29 tasks. If no, Phase 29 can incorporate Phase 27 sidebar changes.

**Warning signs:** Phase 27 SUMMARY.md exists (indicating it was executed).

---

### Pitfall 5: HeroToolCard `object-cover` vs BASE44 `object-contain`

**BASE44 uses:** `className="w-full h-full object-contain"` — shows full image, letterboxed

**Current Next.js uses:** `className="object-cover"` — fills the card, may crop

**Why it matters:** For tall portrait artwork, `object-cover` fills correctly. For the current tool images (which are portrait), `object-cover` is the right choice. BASE44 used `object-contain` because it was working with square-ish images. **Do not change `object-cover` — the current images are designed for it.**

[VERIFIED: HeroToolCard.tsx and Home.jsx read]

---

## Code Examples

### Tool Name Overlay Pattern (from ToolGrid — already proven)

```tsx
// Source: mystiqor-build/src/components/features/shared/ToolGrid.tsx lines 89-93
<div className="absolute inset-0 tool-card-fade" />
<div className="absolute bottom-0 inset-x-0 px-4 pb-4 pt-2 text-center">
  <h3 className="font-headline font-bold text-foreground text-lg drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">{tool.name}</h3>
  <p className="font-body text-sm text-muted-foreground mt-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{tool.description}</p>
</div>
```

For HeroToolCard (smaller cards, 6 per row on desktop), use smaller text:
```tsx
// Adapted for HeroToolCard — smaller text for 6-column grid
<div className="absolute inset-0 tool-card-fade" />
<div className="absolute bottom-0 inset-x-0 px-2 pb-2 text-center">
  <p className="font-headline font-bold text-foreground text-xs sm:text-sm drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] leading-tight">
    {tool.name}
  </p>
</div>
```

### BASE44 Active State (more dramatic than current Phase 27 target)

```tsx
// Source: github-source/src/Layout.jsx lines 226-229 — adapted to MD3 tokens
isActive
  ? 'bg-gradient-to-r from-primary-container/80 to-secondary-container/80 text-on-primary shadow-sm border-s-2 border-s-primary'
  : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface'
```

### BASE44 Hero Badge Exact Colors (for faithful reproduction)

```tsx
// Source: github-source/src/pages/Home.jsx line 122
// BASE44 uses: bg-purple-500/10 border-purple-500/20 text-purple-300
// Current Next.js uses: bg-primary/10 border-primary/20 text-primary
// For exact BASE44 feel, replace with:
className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-medium mb-2"
```

### BASE44 Name Gradient (for exact faithful reproduction)

```tsx
// Source: github-source/src/pages/Home.jsx lines 127-128
// BASE44: from-purple-400 to-pink-400
// For faithful: 
<span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
  {firstName}
</span>
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| BASE44: hard-coded colors per component | Next.js: MD3 token system | Phase 11 (UI overhaul) | Systematic theming, dark/light mode |
| BASE44: React Router Links | Next.js: next/link | Phase 1 (infra) | SSR, prefetching |
| BASE44: base44 API calls | Next.js: Supabase direct | Phase 2 (auth) | PostgreSQL, RLS, typed queries |
| BASE44: images from Supabase CDN URLs | Next.js: local /public/images/ | Phase 4+ | No external dependency |
| BASE44: shadcn SidebarProvider | Next.js: custom aside element | Phase 3 | More control, RTL correct |
| HeroToolCard: no name label | Target: name overlay at bottom | Phase 29 | Satisfies DASH-01/DASH-02 |

---

## Phase Requirements Map

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SIDE-01 | סיידבר משולב בצורה הוליסטית — מרווחים, טיפוגרפיה, צבעים מתמזגים עם האפליקציה | Gap 4: sidebar visual style — bg-surface/60 blur, outline-variant separators |
| SIDE-02 | לוגו MystiQor משולב טבעי בראש הסיידבר | Gap 6: logo already correct (logo.png), needs w-40 sizing |
| SIDE-03 | קטגוריות ניווט עם עיצוב נקי ומרווח — hover states, active states, icons | Gap 4: active gradient pattern, hover bg-white/5 |
| DASH-01 | שמות כלים מוצגים מתחת לתמונות ב-HeroToolGrid | Gap 3: CRITICAL — HeroToolCard missing name label entirely |
| DASH-02 | כרטיסי כלים בדשבורד עם שילוב טבעי — תמונה + שם + תיאור קצר | Gap 3: add tool-card-fade overlay + name + optional description |
</phase_requirements>

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | TypeScript compiler (tsc --noEmit) |
| Config file | mystiqor-build/tsconfig.json |
| Quick run command | `cd mystiqor-build && npx tsc --noEmit --pretty 2>&1 \| head -30` |
| Full suite command | `cd mystiqor-build && npm run build 2>&1 \| tail -20` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DASH-01 | Tool name renders below HeroToolCard image | Visual/smoke | tsc --noEmit (type check) | N/A — visual |
| DASH-02 | Name + description visible in card | Visual/smoke | tsc --noEmit | N/A — visual |
| SIDE-01 | Sidebar blends holistically with app | Visual | tsc --noEmit | N/A — visual |
| SIDE-02 | Logo at w-40, py-4 px-3 | Visual | tsc --noEmit | N/A — visual |
| SIDE-03 | Active state prominent, hover subtle | Visual | tsc --noEmit | N/A — visual |

**Note:** All requirements in this phase are visual/UI — they require human visual verification. Automated testing is TypeScript type-checking only. Human verify step is mandatory for every task.

### Wave 0 Gaps
None — existing test infrastructure (TypeScript + dev server) covers all phase requirements.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | npm run dev | Yes | Installed | — |
| mystiqor-build/node_modules | All components | Yes | Installed | — |
| /public/images/tools/*.png | HeroToolCard images | Yes | All 18 files confirmed | — |
| /public/images/brand/logo.png | Sidebar logo | Yes | Confirmed | — |
| framer-motion | Animations | Yes | In node_modules | — |
| lucide-react | Icons | Yes | In node_modules | — |

[VERIFIED: ls /public/images/brand/ and /public/images/tools/ — all files present]

---

## Security Domain

This phase is pure CSS/visual changes. No new trust boundaries. No new data inputs. No new API calls. Security assessment: no applicable ASVS categories for this phase — purely styling and layout changes.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Phase 27 (holistic sidebar redesign) has NOT been executed yet, so Phase 29 can incorporate its changes | Gap 4 / Sidebar section | If Phase 27 WAS executed, Phase 29 sidebar tasks must be verified against current Sidebar.tsx state before writing tasks |
| A2 | User wants DASH-01/DASH-02 satisfied by adding name overlay inside HeroToolCard (not a separate label below the card element) | Gap 3 | If user wants name BELOW the card element (outside), layout structure changes slightly |
| A3 | The `text-gradient-gold` styling on the hero greeting name is acceptable — no need to revert to `from-purple-400 to-pink-400` | Gap 2 | If user strictly wants BASE44 purple-pink gradient, one class change is needed |

---

## Open Questions

1. **Has Phase 27 been executed?**
   - What we know: Phase 27-01-PLAN.md exists but no SUMMARY.md was found in the phase 27 directory
   - What's unclear: Whether the Sidebar.tsx was actually modified per the plan
   - Recommendation: At planning time, check current Sidebar.tsx for `bg-surface/60` — if present, Phase 27 ran; if `bg-surface/95 glass-panel` is still there, Phase 27 has not run

2. **Is phase 28 (DASH-01/DASH-02) a separate phase, or subsumed into Phase 29?**
   - What we know: REQUIREMENTS.md shows DASH-01/DASH-02 assigned to Phase 28, but Phase 28 directory does not exist
   - What's unclear: Whether Phase 28 was planned/executed separately
   - Recommendation: Phase 29 should absorb DASH-01/DASH-02 since Phase 28 was never created

3. **Tool description in HeroToolCard: required or optional?**
   - DASH-02 says "תמונה + שם + תיאור קצר" — description is mentioned
   - What's unclear: On a 6-column grid with aspect-[4/5] cards, description text may be too small to read
   - Recommendation: Add tool name always; add description only on hover or skip for 6-column cards (match ToolGrid pattern)

---

## Sources

### Primary (HIGH confidence)
- `github-source/src/pages/Home.jsx` — BASE44 original dashboard/home page, all classes verified by direct read
- `github-source/src/Layout.jsx` — BASE44 original layout with sidebar, all classes verified by direct read
- `mystiqor-build/src/components/layouts/Sidebar.tsx` — current Next.js sidebar implementation
- `mystiqor-build/src/app/(auth)/layout-client.tsx` — current Next.js auth layout
- `mystiqor-build/src/app/(auth)/dashboard/page.tsx` — current dashboard
- `mystiqor-build/src/components/features/dashboard/HeroToolCard.tsx` — current hero card
- `mystiqor-build/src/components/features/shared/ToolGrid.tsx` — current tools grid (reference pattern)
- `mystiqor-build/src/app/globals.css` — all utility classes (tool-card-fade, text-gradient-gold, etc.)
- `mystiqor-build/tailwind.config.ts` — full color token system

### Secondary (MEDIUM confidence)
- `.planning/phases/27-holistic-sidebar-redesign/27-01-PLAN.md` — Phase 27 planned sidebar target state
- `.planning/REQUIREMENTS.md` — SIDE-01 through DASH-02 requirements

---

## Metadata

**Confidence breakdown:**
- Gap analysis: HIGH — verified by direct file inspection of both BASE44 and Next.js source
- Required changes: HIGH — exact file paths, line numbers, and class names documented
- Phase 27 execution status: LOW (ASSUMED) — no SUMMARY.md found, but must be verified at plan time
- Tool image availability: HIGH — confirmed all PNG files present

**Research date:** 2026-04-06
**Valid until:** 2026-05-06 (stable codebase, no breaking changes expected)
