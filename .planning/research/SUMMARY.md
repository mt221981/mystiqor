# Project Research Summary

**Project:** MystiQor
**Domain:** Mystical/Spiritual Personal Analysis Platform — UX Atmosphere Layer (v1.3)
**Researched:** 2026-03-29
**Confidence:** HIGH

## Executive Summary

MystiQor v1.3 is a UX atmosphere milestone on top of a fully operational mystical personal analysis platform. The codebase already has a complete MD3 dark cosmic design system — glassmorphism panels, nebula gradients, star animations, gold/lavender tokens, and mystical iconography — but that system is inconsistently applied and has three concrete gaps: text contrast failures on dark backgrounds, no persistent AI coach access across pages, and a 47-item hamburger sidebar that dominates mobile navigation. The v1.3 milestone is about closing those gaps and amplifying what exists, not rebuilding anything. Every new capability (glowing text, floating chat overlay, bottom tabs, cosmic section headers) is achievable using the existing stack — zero new npm packages are required.

The recommended approach is a strictly additive build sequence driven by a single blocking dependency: text contrast fixes must come first, because all subsequent visual improvements depend on a legible baseline. From there, the two highest-leverage features (floating AI coach widget and mobile bottom tab navigation) are built independently and wired into the authenticated layout in a single integration step. Atmospheric polish — mystical loading states, section headers, page entry animations — rounds out the milestone as a breadth sweep across all tool pages. A final phase refines the coach AI's context freshness and sidebar organization for desktop power users.

The chief technical risk is animation performance: `layout-client.tsx` already runs eight or more simultaneous CSS keyframe sequences plus three backdrop-filter blur layers. Any new animation added without auditing the existing budget risks dropped frames and battery drain on mid-range mobile devices — directly undermining the mystical atmosphere the milestone aims to create. The second risk is the z-index stack: Header, MobileNav, floating chat, and bottom tab bar must coexist without tap-event collisions, and this requires a global z-index scale to be defined before the floating component is coded. Both risks have documented prevention strategies; they are pre-solvable, not exploratory problems.

---

## Key Findings

### Recommended Stack

No new packages are needed for v1.3. The existing stack — Next.js 15, TypeScript strict, Tailwind CSS, Supabase, framer-motion v12.38, shadcn/ui, Zustand v5, React Query, react-icons v5.6, lucide-react v0.577 — covers every new capability. Libraries evaluated and explicitly rejected: tsparticles (80 kB canvas loop for a visual already achieved by existing CSS), lottie-react (no After Effects assets; CSS keyframes sufficient), react-spring (redundant with framer-motion v12.38), react-bottom-navigation (no RTL, unmaintained; 60-line custom component is better), and react-chat-widget (third-party service wrapper, incompatible with internal API routes). All four new capabilities are built with CSS extensions to `globals.css` and custom React components using framer-motion AnimatePresence, Zustand stores, and ReactDOM.createPortal — both already installed.

**Core technologies for v1.3 (all already in package.json):**
- **framer-motion v12.38:** Panel open/close (AnimatePresence), bottom tab indicator (layoutId shared layout), FAB spring physics — patterns already in use in `PageTransition.tsx` and `ChatMessage.tsx`
- **Zustand v5:** `floating-coach.ts` store for isOpen/activeConversationId/unreadCount; centralized scroll-lock counter coordinating MobileNav and chat overlay
- **ReactDOM.createPortal:** Renders floating chat panel into `document.body`, escaping `overflow: hidden` ancestors and preventing z-index inheritance from nested layout
- **CSS logical properties (`inset-inline-start`, `start-*` Tailwind):** RTL-safe fixed positioning — pattern already established in `MobileNav.tsx` (`end-0`)
- **`env(safe-area-inset-bottom)`:** iPhone home indicator clearance for bottom tab bar; must be applied to tab bar inner container, not body

**New files required (no new packages):**
- `src/stores/floating-coach.ts`
- `src/services/coach/client-api.ts` (extracted from `coach/page.tsx`)
- `src/components/features/coach/FloatingCoachBubble.tsx`
- `src/components/features/coach/FloatingCoachPanel.tsx`
- `src/components/features/coach/FloatingCoachOverlay.tsx`
- `src/components/layouts/BottomTabBar.tsx`

**Files modified (existing):**
- `src/app/globals.css` — add `.text-glow-primary`, `.text-glow-gold`, `.text-gradient-cosmic`; adjust `--muted-foreground` lightness 78%→88%; add `@media (prefers-reduced-motion: reduce)` block
- `src/app/(auth)/layout-client.tsx` — mount FloatingCoachOverlay + BottomTabBar; add `pb-16 md:pb-0` to main
- `src/components/layouts/Sidebar.tsx` — change default open sections from all→priority only; persist to localStorage; gold treatment on coach item
- `src/app/api/coach/messages/route.ts` — call `buildCoachingContext()` per-message instead of reading stale stored context

---

### Expected Features

**Must have (table stakes) — Phase 1-2:**
- **Readable text on dark backgrounds** — `text-gold-dim/60` (~2.8:1) and `text-on-surface-variant/60` (~3.5:1) at sub-70% opacity fail WCAG AA; the base token passes at 6.5:1 but opacity modifiers destroy it; this is a blocking prerequisite for all UX improvements
- **Persistent AI coach access on every authenticated page** — floating orb with inline panel; validated by Sanctuary (context-aware coach), ChatGPT mobile (no auto-expand), Intercom (persistent floating)
- **Mobile navigation under 5 taps to any primary destination** — 5-tab bottom bar covers 90% of daily use; eliminates 47-item hamburger problem for mobile users
- **Consistent atmospheric feel across all pages** — utilities exist but are not applied uniformly; tool pages feel like plain SaaS cards next to the cosmic dashboard

**Should have (differentiators) — Phase 3:**
- **Glowing text on insight headings** — `filter: drop-shadow` (not `text-shadow` which silently fails on gradient text) on h1/h2 in tool results; creates "revelation" perception
- **Orb breathing animation** — 4s `orb-breathe` keyframe (scale 1.0→1.05, opacity 0.85→1.0) signals presence and life
- **Mystical loading states** — central `MysticLoadingState` component; contextual Hebrew phrases ("קורא את הכוכבים...", "מפענח את הדפוסים...") replacing generic "טוען..."
- **StandardSectionHeader component** — astronomical symbol + glow + gradient title applied to every tool page
- **Page entry animation** — 500ms `animate-in fade-in slide-in-from-bottom-4` at authenticated layout level; creates "summoning" sensation

**Phase 4 (power-user polish):**
- **Dynamic coach context per message** — `buildCoachingContext()` called on every POST (`~4 parallelized DB queries, ~50ms`); coach stays current as user runs new analyses mid-conversation
- **Sidebar distillation** — 3 priority sections open by default; 5 secondary sections collapsed; state persisted to localStorage; coach entry with gold border treatment
- **Context-aware floating coach opener** — pathname-based tool context injection when tapping orb on a tool page

**Explicit defers (v1.4+):**
- Streaming chat token-by-token in floating panel (infrastructure change)
- Notification badges on floating orb (requires unread message tracking infrastructure)
- Full coach page redesign (`/coach` page is not changed in v1.3)
- Animated landing page with cosmic parallax
- New color palette (the purple/lavender/gold/indigo palette is established and must not be altered)
- Multi-language support (Hebrew only)

---

### Architecture Approach

All new components are additive to the authenticated layout (`layout-client.tsx`). The floating overlay and bottom tab bar are siblings inside the outer layout div — not nested inside the main content column — so they persist across route changes without re-mounting. This is the only correct placement in Next.js App Router: layout components do not re-mount on navigation; page components do. The floating coach uses a Zustand store (`floating-coach.ts`) for state shared between the bubble, the panel, and the full coach page. Chat API functions are extracted from `coach/page.tsx` into a shared `services/coach/client-api.ts` so both consumers use a single source of truth. The sidebar receives a configuration-only change (default open sections and localStorage persistence) — no structural rewrite.

**Major components and responsibilities:**

1. **`FloatingCoachOverlay`** — orchestrates bubble/panel visibility; reads `usePathname()` to suppress on `/coach`; lives in layout, persists across navigation
2. **`FloatingCoachBubble`** — fixed FAB at `bottom-24 start-6 md:bottom-6` (RTL logical properties); breathing animation; unread badge from Zustand store
3. **`FloatingCoachPanel`** — glass-panel drawer (300×420px mobile, 380×560px desktop); reuses `ChatMessage`, `ChatInput`, `QuickActions` from existing coach components; data from shared `client-api.ts`
4. **`floating-coach.ts` (Zustand store)** — `isOpen`, `activeConversationId`, `unreadCount`, scroll-lock counter (shared with MobileNav to prevent race conditions)
5. **`BottomTabBar`** — 5-tab fixed bottom strip (`md:hidden`); `usePathname()` with `startsWith` matching; `glass-nav` styling; `env(safe-area-inset-bottom)` on inner container
6. **`services/coach/client-api.ts`** — extracted `fetchConversations`, `createConversation`, `fetchMessages`, `sendMessage`; imported by both full coach page and floating panel
7. **`messages/route.ts` (modified)** — `buildCoachingContext()` called per POST via `Promise.all`; ~4 parallelized DB queries at ~50ms, invisible within LLM latency

**Build sequence (strict dependency order):**

`floating-coach.ts` (store) → `client-api.ts` (extraction) → FloatingCoachBubble → FloatingCoachPanel → FloatingCoachOverlay → coach/page.tsx refactor → BottomTabBar → Sidebar.tsx config → messages/route.ts → layout-client.tsx (integration last — wires everything together)

---

### Critical Pitfalls

1. **Animation GPU overload from stacking new effects on existing 8+ keyframes** — `layout-client.tsx` already runs three `blur-[100-120px]` blob animations plus `stars-bg`, `aurora-bg`, `sparkle-drift`, `shimmer-rotate`, `float-gentle`. Audit the existing budget before adding anything. Preferred mitigation: replace blob animations with static radial gradients, then redirect the saved GPU budget to new effects. Never add `backdrop-filter` to the floating chat bubble — the existing `glass-nav` and `glass-panel` already saturate GPU compositing layers.

2. **No `prefers-reduced-motion` support anywhere in the codebase** — All six `@keyframes` blocks in `globals.css` animate unconditionally. Add a single `@media (prefers-reduced-motion: reduce)` block as the absolute first task of any animations work. The 10-line fix retroactively covers all existing animations plus every new v1.3 animation. Without it, the app fails WCAG 2.3.3 and causes physical discomfort for a significant portion of the wellness app audience.

3. **z-index collision between Header (z-50), MobileNav (z-50), floating chat bubble, and bottom tabs** — Define a global z-index scale as CSS custom properties before coding any new positioned component. Recommended scale: `--z-header: 50`, `--z-mobile-panel: 50`, `--z-floating: 60`, `--z-modal: 70`, `--z-toast: 80`. Share `isMobileNavOpen` state via Zustand so the floating bubble hides (`opacity-0 pointer-events-none`) when the mobile nav is open.

4. **iOS virtual keyboard covers floating chat input in PWA mode** — `position: fixed` elements misbehave in iOS Safari standalone mode when the virtual keyboard opens. Implement a `visualViewport` resize handler that adjusts `bottom` offset dynamically. Must be tested on a physical iOS device in add-to-home-screen mode — Chrome DevTools emulation does not reproduce this behavior.

5. **Text contrast fixes that break existing components using the same token** — The base `on-surface-variant` token (`#c8bede`) passes WCAG AA at 6.5:1. The actual failures are the opacity-modified variants: `text-gold-dim/60` (~2.8:1), `text-on-surface-variant/60` (~3.5:1). Fix strategy: introduce new accessible-specific tokens rather than changing base token values; changing a base token immediately affects all 50+ usage sites including intentionally decorative elements.

6. **Three competing navigation systems if hamburger is not retired on mobile** — Adding bottom tabs alongside the existing hamburger menu without removing the hamburger creates two authoritative navigation systems with inconsistent active states. Bottom tabs must replace the hamburger as the primary mobile navigation pattern. The full-sidebar MobileNav overlay stays as secondary deep-nav access; the hamburger `<Menu>` button in Header becomes `hidden md:block` when tabs are visible.

**Additional moderate pitfalls:**
- Scroll lock race condition (MobileNav + floating chat both call `document.body.style.overflow` independently) — centralize in Zustand scroll-lock counter
- Bottom tab safe-area conflict (body already applies `env(safe-area-inset-bottom)`; tab bar and main must not double-stack)
- Gradient text + `text-shadow` silently does nothing — use `filter: drop-shadow` on all gradient text elements
- Sidebar active-state gaps when items are collapsed — map every collapsed item to a parent whose href is a prefix of the route
- Service worker cache invalidation on navigation changes — increment `CACHE_VERSION` in `sw.js`

---

## Implications for Roadmap

Four phases are recommended. The ordering is driven by: (1) the text contrast blocking dependency, (2) the need to define the global z-index scale and reduced-motion baseline before any animated components are coded, (3) a natural split between critical interactive features and atmospheric breadth work.

### Phase 1: Foundation — Contrast, Z-index, Reduced Motion

**Rationale:** Text contrast is a blocking dependency for every subsequent visual improvement. The global z-index scale and `prefers-reduced-motion` baseline must be established before any new animated or positioned components are coded. This phase is unglamorous infrastructure, but it is what makes Phases 2-4 possible without regressions.

**Delivers:** WCAG-compliant dark theme (specific opacity-modified class fixes, new accessible tokens, raised `--muted-foreground` lightness); global z-index CSS custom properties; `@media (prefers-reduced-motion: reduce)` block retroactively protecting all existing and future animations.

**Addresses features from FEATURES.md:** "Readable text at all times" (table stakes #1)

**Avoids pitfalls:** Pitfall 2 (no reduced-motion support), Pitfall 5 (token changes breaking existing components), Pitfall 3 (z-index scale defined here before any floating component is coded)

**Research flag:** Skip. CSS contrast fixes and accessibility media queries are standard, fully-documented patterns. All token hex values are known from direct file reads. No unknowns.

---

### Phase 2: Floating Coach Widget + Bottom Tab Navigation

**Rationale:** These are the two highest-leverage features and are largely independent of each other. Both mount into `layout-client.tsx` as the final integration step, so they can be built concurrently and wired together at the end. Both depend on Phase 1's z-index constants and safe-area strategy.

**Delivers:** Floating AI coach orb accessible from every authenticated page (bubble + glass-panel drawer + Zustand store + shared API client); 5-tab mobile bottom navigation retiring the hamburger as primary mobile nav; `pb-16 md:pb-0` main content padding; `visualViewport` keyboard handler for iOS PWA; centralized scroll-lock Zustand counter.

**Addresses features from FEATURES.md:** "Persistent coach access on every page" (table stakes #2), "Mobile navigation under 5 taps" (table stakes #3)

**Avoids pitfalls:** Pitfall 1 (floating bubble uses solid background, no backdrop-filter), Pitfall 3 (z-index scale from Phase 1), Pitfall 4 (iOS PWA keyboard — visualViewport handler), Pitfall 6 (hamburger retired on mobile — bottom tabs are primary), Pitfall 7 (scroll lock centralized in Zustand), Pitfall 10 (safe-area conflict handled), Pitfall 13 (RTL logical properties: `start-6` not `right-6`), Pitfall 15 (inline chat with Zustand state, not navigation link to /coach)

**Research flag:** Needs attention during planning for one gap: confirm whether shadcn/ui Sheet is installed (MobileNav.tsx has a comment "ישודרג כשיותקן" — upgrade when installed). If Sheet is available, a Sheet-based drawer is simpler than a custom portal panel. Also confirm iOS PWA keyboard test plan on physical device.

---

### Phase 3: Atmospheric Depth Sweep

**Rationale:** Once critical interactive features are in place, this phase applies atmospheric polish across the breadth of all tool pages. Each individual task is low-complexity (CSS utility + component application); the challenge is breadth, not depth. Grouping all atmosphere work in one phase keeps the creative work together and makes it easy to gate-review the overall mystical feel at once.

**Delivers:** `MysticLoadingState` component replacing generic spinners across all tool pages; `StandardSectionHeader` on all tool pages (astronomical symbol + glow + gradient title); page entry animation (`animate-in fade-in slide-in-from-bottom-4`) at authenticated layout level; orb breathing animation (4s CSS keyframe); `filter: drop-shadow` glow on key insight headings.

**Addresses features from FEATURES.md:** "Sense of entering a different world" (table stakes #4), "Mystical iconography" (table stakes #5), glowing text (differentiator), cosmic section headers (differentiator), page entry animation (differentiator), mystical loading states (differentiator)

**Avoids pitfalls:** Pitfall 1 (animation budget — no new keyframes without auditing existing budget; replace blob animations if needed), Pitfall 11 (gradient text + text-shadow = invisible; use filter: drop-shadow throughout)

**Research flag:** Skip. All techniques are well-understood CSS patterns with existing usage examples in the codebase. No exploratory unknowns.

---

### Phase 4: Coach Intelligence + Desktop Sidebar Polish

**Rationale:** Dynamic coach context and sidebar distillation are lower urgency than the mobile improvements in Phases 2-3. Desktop sidebar simplification benefits power users but does not affect the mobile-first majority. Coach context freshness enhances the already-deployed floating coach from Phase 2. Both are quality improvements, not new-feature additions.

**Delivers:** Coach that stays current on analyses run during a conversation (`buildCoachingContext()` per POST, ~4 parallelized queries); sidebar showing 3 priority sections open by default with localStorage persistence; coach sidebar entry with gold border treatment; optional context-aware floating coach opener (pathname → tool context injection, "I see you just received your natal chart...").

**Addresses features from FEATURES.md:** "FloatingCoach context-awareness" (differentiator), "Sidebar distillation" (differentiator), "Orb breathing animation" (already in Phase 3 — confirmed here in coach polish context)

**Avoids pitfalls:** Pitfall 8 (sidebar active state for collapsed/removed items — map to parent href prefixes), Pitfall 12 (service worker cache invalidation — increment CACHE_VERSION for nav structure change), Pitfall 14 (sidebar state not persisted — localStorage persistence implemented here)

**Research flag:** Verify Supabase query volume for `buildCoachingContext()` per-message (~4 queries × message volume) against plan limits. If volume is a concern, implement 60s TTL in-memory cache from the start rather than as a retrofit.

---

### Phase Ordering Rationale

- **Phase 1 first:** Text contrast is a visual blocker; z-index constants and reduced-motion baseline are safety infrastructure that must exist before any new positioned/animated components. Non-negotiable sequence.
- **Phase 2 as the high-impact phase:** Floating coach and bottom tabs are the two features users immediately notice. They are also the most technically complex (PWA behavior, z-index, RTL, Zustand coordination). Completing them cleanly before the breadth sweep of Phase 3 prevents interactive component work from being interleaved with CSS utility application across dozens of files.
- **Phase 3 as breadth sweep:** All atmospheric features are low-depth, high-breadth. Grouping them enables a coherent visual review of the whole app's mystical feel at the end of the phase.
- **Phase 4 last:** Coach intelligence and sidebar polish are meaningful quality improvements but do not change the user's first impression of v1.3. They are correctly deprioritized after the features that users see and feel immediately.

### Research Flags

**Needs deeper research or explicit test planning during phase planning:**
- **Phase 2 (Floating Coach):** iOS PWA virtual keyboard behavior with `visualViewport` API — needs an explicit test plan on physical device before the phase is considered complete. Also: confirm shadcn/ui Sheet availability for drawer implementation decision.
- **Phase 4 (Dynamic Context):** Validate Supabase query volume implications of `buildCoachingContext()` per-message against plan read limits. Decide TTL cache strategy before implementation begins.

**Standard patterns — skip research phase:**
- **Phase 1 (Contrast + Accessibility):** WCAG formulas applied to known hex values; CSS media query is a single well-documented block. Zero unknowns.
- **Phase 3 (Atmospheric Sweep):** All CSS techniques (keyframes, filter: drop-shadow, Tailwind animate-in) have existing usage examples in the codebase. No novel patterns.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All findings from direct file reads: `package.json`, `globals.css`, `tailwind.config.ts`, component source files. Zero inference or external lookup. |
| Features | HIGH | Primary source is direct code inspection of the running codebase. Comparable-app patterns (Co-Star, Pattern, Sanctuary) are training-data knowledge (cutoff August 2025) — MEDIUM confidence for those comparisons; HIGH for the primary code-derived findings. |
| Architecture | HIGH | All patterns derived from direct analysis of the exact files being modified: `layout-client.tsx`, `Sidebar.tsx`, `MobileNav.tsx`, `messages/route.ts`, `context-builder.ts`. Build sequence is deterministic from the dependency graph. |
| Pitfalls | HIGH (code-derived) / MEDIUM (iOS PWA) | Pitfalls 1-3, 5-9, 11, 13-15 derived from direct source inspection and known CSS/browser behavior. Pitfall 4 (iOS PWA virtual keyboard) and Pitfall 12 (service worker patterns) are MEDIUM — based on well-documented but not live-tested browser behavior. |

**Overall confidence: HIGH**

### Gaps to Address

- **WCAG contrast on gradient text** — `text-gradient-gold` and `text-gradient-mystic` use `-webkit-text-fill-color: transparent`. Standard contrast checkers cannot measure them. Must be tested manually in-browser with a color picker at the rendered pixel level during Phase 1 execution.
- **shadcn/ui Sheet availability** — `MobileNav.tsx` contains a comment suggesting upgrade to Sheet component when installed. Verify at Phase 2 start: if Sheet is installed, prefer it for the floating panel drawer (simpler than custom portal); if not, use portal + custom panel as documented in ARCHITECTURE.md.
- **Supabase query volume for dynamic context** — Four parallelized queries per coach message is acceptable at current scale. Needs explicit validation against plan row-read limits before Phase 4 production deploy. Preemptively add 60s TTL cache if projections are uncertain.
- **iOS PWA keyboard behavior** — Prevention strategy (`visualViewport` handler) is specified and well-documented. Needs live device verification in standalone mode during Phase 2 testing. Chrome DevTools mobile emulation does not reproduce this specific behavior.

---

## Sources

### Primary (HIGH confidence — direct codebase inspection)
- `mystiqor-build/src/app/globals.css` — full animation definitions, token values, safe-area padding, existing keyframes
- `mystiqor-build/src/app/(auth)/layout-client.tsx` — existing layout structure, animation layers, z-index baseline
- `mystiqor-build/src/components/layouts/Sidebar.tsx` — 47-item nav, 8 sections, open-state initialization, active-route logic
- `mystiqor-build/src/components/layouts/MobileNav.tsx` — z-index 50, scroll lock pattern, RTL panel positioning (`end-0`)
- `mystiqor-build/src/components/layouts/Header.tsx` — z-index 50, hamburger trigger
- `mystiqor-build/src/app/(auth)/coach/page.tsx` — fetch functions to extract, existing `ChatMessage` + `ChatInput` + `QuickActions` components
- `mystiqor-build/src/app/api/coach/messages/route.ts` — current context pattern (stale stored `convRow.context?.text`)
- `mystiqor-build/src/services/coach/context-builder.ts` — `buildCoachingContext()` function and its DB query structure
- `mystiqor-build/src/lib/animations/presets.ts` — existing framer-motion animation presets
- `mystiqor-build/package.json` — framer-motion v12.38, zustand v5, next v16, lucide-react v0.577, react-icons v5.6
- `mystiqor-build/tailwind.config.ts` — confirmed token hex values: `on-surface-variant` #c8bede, `surface` #0d0b1e, `gold-dim` #b8913e, `muted-foreground` HSL 268 20% 78%
- `mystiqor-build/src/app/layout.tsx` — PWA service worker registration
- `.planning/PROJECT.md` — v1.3 milestone goal definition and existing v1.2 state

### Secondary (MEDIUM confidence — training data, cutoff August 2025)
- Co-Star app — bottom tabs for mobile astrology navigation, austere mystical aesthetic with single accent color
- Pattern app — card entry animations (fade up, 400ms), floating primary action button
- Sanctuary astrology — persistent floating "talk to astrologer" button, context-aware opener validated in production
- Insight Timer — 4-5 bottom tab structure as the standard for wellness app navigation
- ChatGPT mobile — floating chat widget behavior (no auto-expand, panel slides up, explicit full-screen action)
- WCAG 2.1 guidelines — contrast ratio formulas and thresholds (4.5:1 normal text, 3:1 large text, 3:1 UI components)
- iOS Safari `visualViewport` API behavior for PWA keyboard handling (well-documented browser behavior)
- Service worker `SKIP_WAITING` message pattern for immediate cache invalidation

---
*Research completed: 2026-03-29*
*Milestone: v1.3 Mystical UX & Coach Prominence*
*Ready for roadmap: yes*
