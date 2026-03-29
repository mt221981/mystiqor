# Architecture Patterns

**Domain:** MystiQor v1.3 — Floating Chat Overlay, Bottom Tabs, Sidebar Simplification, Dynamic Coach Context
**Researched:** 2026-03-29
**Milestone:** v1.3 Mystical UX & Coach Prominence
**Confidence:** HIGH — derived from direct analysis of the running codebase (mystiqor-build/)

---

## Scope of This Research

This document covers ONLY what v1.3 introduces or modifies. It does not re-document the complete system architecture (see `.planning/ARCHITECTURE.md` for that). The four specific questions addressed:

1. How to integrate a floating chat overlay into Next.js App Router layout
2. How to implement bottom tab navigation alongside the existing sidebar
3. How to restructure the 47-item sidebar into a simplified version
4. How to make coach context dynamic (refresh on each message)

---

## Existing Layout Structure (What We Are Modifying)

```
AuthLayoutClient (layout-client.tsx) — 'use client'
  └── div.flex.min-h-screen (stars-bg aurora-bg)
      ├── div.hidden.md:flex.md:w-64   ← Sidebar (desktop only)
      │     └── Sidebar.tsx (357 lines, 47 items, 8 collapsible sections)
      ├── div.flex-1.flex-col          ← Main content column
      │     ├── Header (fixed, h-16, z-50, glass-nav)
      │     └── main.flex-1.overflow-auto.pt-16
      │           └── div.mx-auto.max-w-7xl.px-6.py-8 ← {children}
      └── MobileNav (overlay, opens from hamburger in Header)
```

Three fixed/overlay layers already in use:
- `Header` — `fixed top-0 z-50`
- `MobileNav` — `fixed inset-0 z-50` (overlay) + `fixed inset-y-0 end-0 z-50` (panel)
- Ambient glow orbs — `fixed ... -z-10`

---

## Component 1: Floating Chat Overlay

### Architecture Decision

The floating chat bubble must be a **persistent client component rendered inside `AuthLayoutClient`**, not inside any individual page. This is the only way to achieve "present on every page without re-mounting" in Next.js App Router.

The overlay has two states: **bubble** (collapsed, bottom-corner) and **panel** (expanded, drawer/modal). State lives in a new Zustand store: `stores/floating-coach.ts`.

**Why Zustand and not local state:** The full coach page (`/coach`) needs to know if the overlay has an active conversation, and the overlay needs to know if the user navigated to the full coach page (to hide itself). Shared Zustand state coordinates these two views cleanly without prop-drilling across the layout.

### Z-index Stack (Existing + New)

| Layer | z-index | Element |
|-------|---------|---------|
| Background | -10 | Ambient glow orbs |
| Page content | auto | Main content |
| Sidebar | auto | Desktop sidebar (static) |
| Header | 50 | `fixed top-0 z-50` |
| Mobile nav overlay | 50 | `fixed inset-0 z-50` |
| Floating chat bubble | 40 | `fixed bottom-... z-40` |
| Floating chat panel | 45 | `fixed inset-... z-45` or drawer |
| Toaster | 9999 | Sonner (default) |

**Rationale:** Bubble at z-40 stays below Header and MobileNav overlay. Panel at z-45 covers page content but stays below Header so the user can still navigate. If a sheet/drawer pattern is used instead of a modal, it can be z-50 with a lower-opacity backdrop.

### Placement: Bottom-Start (RTL Correct)

In RTL layout (`dir="rtl"`), "bottom-start" is bottom-right in physical screen coordinates. This matches the expected "WhatsApp-style" floating button position for Hebrew apps.

```
Tailwind classes for bubble: fixed bottom-6 start-6 z-40
                   (RTL:     fixed bottom-6 right-6 z-40 visually)
```

Use `start-6` (not `right-6`) to respect `dir="rtl"` and remain RTL-safe.

### Panel Shape Options

Two viable patterns, given the existing design system:

**Option A: Drawer (recommended)**
A panel that slides up from the bottom (mobile) or in from the corner (desktop), sized to a portion of the viewport. Does not block the whole screen. The MobileNav already implements this pattern as a right-sliding drawer.

```
Mobile:  slides up from bottom, height ~70vh, z-45
Desktop: expands in bottom-start corner, width 380px height 560px, z-45
```

**Option B: Full-screen modal**
Covers entire screen. Simpler to implement but destroys the "ambient" feel. Avoid on desktop; accept on mobile if drawer is complex.

Recommendation: **Option A — Drawer**, matching the app's glass-panel aesthetic with `glass-panel` CSS class, `backdrop-blur`, and `border border-outline-variant/10`.

### New Files

| File | Purpose | Status |
|------|---------|--------|
| `src/stores/floating-coach.ts` | Zustand store: isOpen, activeConversationId, unreadCount | NEW |
| `src/components/features/coach/FloatingCoachBubble.tsx` | Fixed bubble button with sparkle animation | NEW |
| `src/components/features/coach/FloatingCoachPanel.tsx` | Expanded drawer: ChatMessage list + ChatInput | NEW |
| `src/components/features/coach/FloatingCoachOverlay.tsx` | Combines bubble + panel, reads Zustand store | NEW |

### Integration Point: layout-client.tsx

Add `FloatingCoachOverlay` as a sibling to the main content div, inside the outer `div.flex.min-h-screen`. Do NOT wrap it in the main content column — it must be a fixed overlay, not flow-positioned.

```tsx
// layout-client.tsx — addition only
import { FloatingCoachOverlay } from '@/components/features/coach/FloatingCoachOverlay';

// Inside the outer div, after </MobileNav>:
<FloatingCoachOverlay />
```

This adds exactly two lines to layout-client.tsx. No other layout changes needed.

### Hide Condition

The floating bubble should hide itself when the user is on `/coach` (the full coach page). Read `usePathname()` inside `FloatingCoachOverlay` and render `null` when `pathname === '/coach'` or `pathname.startsWith('/coach/')`.

### Reuse of Existing Components

`FloatingCoachPanel` MUST reuse:
- `ChatMessage` from `components/features/coach/ChatMessage.tsx` — same message bubble UI
- `ChatInput` from `components/features/coach/ChatInput.tsx` — same input with send button
- `QuickActions` from `components/features/coach/QuickActions.tsx` — prompt suggestions

The fetch functions (`fetchConversations`, `fetchMessages`, `sendMessage`) from `coach/page.tsx` should be extracted to a shared module: `src/services/coach/client-api.ts`. Both the full page and the overlay panel import from there.

### Zustand Store: floating-coach.ts

```typescript
interface FloatingCoachState {
  isOpen: boolean;
  activeConversationId: string | null;
  unreadCount: number;
  open: () => void;
  close: () => void;
  setConversation: (id: string) => void;
  clearUnread: () => void;
  incrementUnread: () => void;
}
```

The `unreadCount` drives a badge on the bubble when the panel is closed and a new message arrives.

---

## Component 2: Bottom Tab Navigation

### Architecture Decision

Bottom tabs appear on mobile only (`md:hidden`), replacing (or working alongside) the hamburger-menu-opens-MobileNav pattern. They are a **fixed bar at the bottom of the screen**, `z-40`, `h-16`.

The existing `MobileNav` (full-sidebar overlay) is NOT removed — it remains accessible via the hamburger button in the Header for users who need deep navigation. Bottom tabs are a **fast-access shortcut layer**, not a full replacement.

### Tab Items (5 max — thumb-friendly)

Five items that cover the most important destinations for a typical user session:

| Tab | Icon | Route | Hebrew Label |
|-----|------|-------|-------------|
| בית | LayoutDashboard | /dashboard | לוח בקרה |
| כלים | GiCrystalBall | /tools/numerology | כלים |
| מאמן | MessageCircle | /coach | מאמן |
| מסע | GiTargetArrows | /goals | יעדים |
| פרופיל | User | /profile | פרופיל |

"מאמן" tab is the center/prominent tab because it is the core value proposition of v1.3.

### Active State Detection

Use `usePathname()`. A tab is active if `pathname === href` or `pathname.startsWith(href)` (for nested tool routes).

Special case for "כלים": active when `pathname.startsWith('/tools/')`. Use a dedicated `isActiveTools` check.

### Bottom Inset: Avoid Overlay with Floating Bubble

The floating chat bubble is at `bottom-6 start-6`. The bottom tab bar is `h-16` (`64px`). Both exist simultaneously on mobile. Adjust the bubble position to `bottom-24` on mobile to clear the tab bar.

Use responsive Tailwind: `bottom-24 md:bottom-6` on the bubble wrapper.

### Main Content Padding

The tab bar is `fixed`, meaning it overlaps the bottom of `main`. Add `pb-16 md:pb-0` to the `main` element (or its inner wrapper) so content is not hidden behind the tab bar on mobile.

In `layout-client.tsx`, change:
```
main.flex-1.overflow-auto.pt-16
```
to:
```
main.flex-1.overflow-auto.pt-16.pb-16.md:pb-0
```

### New Files

| File | Purpose | Status |
|------|---------|--------|
| `src/components/layouts/BottomTabBar.tsx` | Fixed bottom navigation, mobile-only, 5 tabs | NEW |

### Integration Point: layout-client.tsx

Add `BottomTabBar` as a sibling inside the main content column div (`div.flex-1.flex-col`), after `<main>`:

```tsx
// Inside div.flex-1.flex-col:
<Header onMobileMenuOpen={...} />
<main className="flex-1 overflow-auto pt-16 pb-16 md:pb-0">
  {children}
</main>
<BottomTabBar />   {/* md:hidden applied inside BottomTabBar */}
```

This adds one line + modifies one className in layout-client.tsx.

---

## Component 3: Sidebar Simplification

### Architecture Decision

The current Sidebar has 47 items in 8 collapsible sections. The goal is a simplified desktop sidebar that shows the most important destinations, with secondary items accessible via MobileNav (mobile) or collapsed sections (desktop).

**Strategy: Collapse-by-default for secondary sections + reduce visible items**

Do NOT rewrite Sidebar.tsx from scratch. Instead:
1. Change the default `openSections` state so only priority sections are open by default
2. Reduce the sections to a "primary" list shown expanded and "secondary" list collapsed

This is a configuration change, not a structural rewrite.

### New Section Structure (Desktop Sidebar)

**Always open (expanded by default):**
- "ראשי" — Dashboard (1 item, remove "/" homepage link)
- "מסע אישי" — Coach, Goals, Mood, Journal, Daily Insights (5 items)
- "כלים מיסטיים" — 8 core tools (unchanged)

**Collapsed by default:**
- "אסטרולוגיה מתקדמת" — 5 astro sub-pages
- "מתקדם" — 6 advanced tools
- "למידה" — 5 learning items
- "היסטוריה ואנליטיקה" — 3 items
- "חשבון" — 6 account items

**Removed from sidebar:**
- "/" homepage link (users navigating home from a protected page is edge case; remove clutter)

### Implementation: Change openSections Defaults

In `Sidebar.tsx`, change the initial state from "all open" to "priority open":

```typescript
// BEFORE: all sections open
const [openSections, setOpenSections] = useState<Record<string, boolean>>(
  () => Object.fromEntries(NAV_SECTIONS.map((section) => [section.title, true]))
);

// AFTER: only priority sections open by default
const OPEN_BY_DEFAULT = new Set(['ראשי', 'מסע אישי', 'כלים מיסטיים']);
const [openSections, setOpenSections] = useState<Record<string, boolean>>(
  () => Object.fromEntries(
    NAV_SECTIONS.map((section) => [section.title, OPEN_BY_DEFAULT.has(section.title)])
  )
);
```

### Coach Prominence in Sidebar

The "מאמן AI" item in "מסע אישי" should be visually distinct — not just a regular nav item. Apply a subtle gold glow or `mystic-card-gold` treatment to make it stand out:

```tsx
// In CollapsibleSection, for the coach item specifically:
isActive && item.href === '/coach'
  ? 'bg-primary-container/20 text-primary gold-glow border border-gold/20'
  : isActive
  ? 'bg-primary-container/20 text-primary ...'
  : 'text-on-surface-variant hover:...'
```

### Files Modified

| File | Change | Risk |
|------|--------|------|
| `src/components/layouts/Sidebar.tsx` | Change default open sections + style coach item | LOW — config only |

---

## Component 4: Dynamic Coach Context

### Current Problem

`context-builder.ts` (`buildCoachingContext`) is called once when a conversation is created and stored in `conversations.context`. In the current `messages/route.ts`, the system prompt reads `convRow.context?.text` — the static stored context — not a fresh fetch.

This means: user runs a new astrology analysis, then asks the coach about it. The coach does not know about the new analysis because the context was built when the conversation started.

### Architecture Decision

**Call `buildCoachingContext` on every POST to `/api/coach/messages`, not once at conversation creation.**

The `getPersonalContext` call already happens per-message (line 136 of `messages/route.ts`). The fuller `buildCoachingContext` from `services/coach/context-builder.ts` should also run per-message, replacing the stale `convRow.context?.text`.

This adds ~4 Supabase queries per message (profile, 20 analyses, 10 goals, 14 mood entries — all parallelized via `Promise.all`). At typical LLM latency (1-3s), these parallel DB queries (5-50ms each) are invisible to the user.

### Revised POST /api/coach/messages Flow

```
POST /api/coach/messages
  1. Auth check (existing)
  2. Zod validate input (existing)
  3. Verify conversation ownership (existing)
  4. getPersonalContext() — name, zodiac, life path (existing, ~1 query)
  5. buildCoachingContext() — MOVED HERE, runs every message (~4 parallel queries)
  6. Save user message (existing)
  7. Fetch last 20 messages for history (existing)
  8. Compose system prompt: COACH_PERSONA + fresh context + personal identity + history
  9. invokeLLM() (existing)
  10. Save assistant reply (existing)
  11. Update conversation metadata (existing)
```

Step 5 replaces the stale `convRow.context?.text` read.

### Context Caching Consideration

If context freshness is critical but query count is a concern, add a simple in-memory TTL cache at the API route level using a `Map<userId, { context: string; timestamp: number }>`. Cache for 60 seconds. This means the context is at most 60 seconds stale — fresh enough for a conversation flow.

This is optional optimization. Start without it; add if DB query volume becomes a concern.

### Files Modified

| File | Change | Risk |
|------|--------|------|
| `src/app/api/coach/messages/route.ts` | Import + call `buildCoachingContext` per POST | LOW — additive |
| `src/services/coach/context-builder.ts` | Remove `eslint-disable any` if types improve | OPTIONAL |

**Do NOT change the `conversations.context` DB column usage for conversation creation** — it can remain as a fallback seed for the first message if `buildCoachingContext` fails.

---

## Data Flow Diagrams

### Floating Chat Overlay Data Flow

```
User clicks bubble (FloatingCoachBubble)
  → setOpen(true) in floating-coach Zustand store
  → FloatingCoachPanel renders (with AnimatePresence from framer-motion)
      → useQuery(['coach-conversations']) — fetch conversation list
      → User selects or creates conversation
      → useQuery(['coach-messages', conversationId]) — fetch messages
      → ChatMessage components render
      → User types in ChatInput
      → useMutation → POST /api/coach/messages
          → buildCoachingContext() — fresh DB queries
          → LLM call
          → response saved
      → React Query invalidates ['coach-messages', conversationId]
      → ChatMessage list re-renders with reply
      → incrementUnread() if panel is closed when reply arrives (future)
```

### Bottom Tab Navigation Data Flow

```
BottomTabBar (client component)
  → usePathname() — determines active tab
  → renders 5 Link elements with active styling
  → No server state, no mutations
  → On tap → Next.js router navigates
  → Layout persists (no re-mount of FloatingCoachOverlay, Sidebar, Header)
```

### Coach Context Dynamic Flow (Modified)

```
POST /api/coach/messages
  → auth check
  → validate input
  → [parallel]:
      getPersonalContext() → profiles table (1 query)
      buildCoachingContext():
          → Promise.all([profiles, analyses×20, goals×10, mood×14])
  → compose system prompt with fresh context
  → invokeLLM
  → save assistant reply
```

---

## Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| `FloatingCoachOverlay` | Orchestrates bubble + panel visibility | `floating-coach` Zustand store, `usePathname` |
| `FloatingCoachBubble` | Fixed button, unread badge, sparkle animation | `floating-coach` store (open/close, unreadCount) |
| `FloatingCoachPanel` | Chat drawer: message list + input | React Query (coach-messages), Coach API routes |
| `BottomTabBar` | Fixed mobile tab strip | `usePathname` only, no state |
| `Sidebar` (modified) | Desktop nav, sections collapsed by default | `usePathname`, `useSubscription` |
| `floating-coach.ts` (store) | isOpen, activeConversationId, unreadCount | Read by Overlay, Bubble, Panel |
| `client-api.ts` (new) | Shared fetch functions for coach | Used by coach/page.tsx AND FloatingCoachPanel |

---

## Patterns to Follow

### Pattern 1: Fixed Overlay in App Router Layout

**What:** Persistent components (overlay, FAB) live in `layout-client.tsx`, not in page files.

**Why:** Next.js App Router layouts persist across route changes. A component in the layout does not re-mount when the user navigates between pages. This is the correct way to achieve "stays open when navigating."

**Implementation:**
```tsx
// layout-client.tsx
return (
  <QueryClientProvider client={queryClient}>
    <div className="flex min-h-screen bg-surface stars-bg aurora-bg relative" dir="rtl">
      {/* ambient orbs */}
      {/* sidebar */}
      {/* main content column */}
      <FloatingCoachOverlay />  {/* ← ADD HERE, outside main column */}
      <MobileNav ... />
    </div>
    <Toaster ... />
  </QueryClientProvider>
);
```

### Pattern 2: RTL-Safe Fixed Positioning

**What:** Use `start-*` / `end-*` Tailwind classes, never `left-*` / `right-*`, for fixed elements in an RTL app.

**When:** Any `fixed` or `absolute` positioned element — bubble, panel, drawer.

**Example:**
```tsx
// Bubble — bottom-start = bottom-right in RTL
className="fixed bottom-24 start-6 md:bottom-6 z-40"

// Drawer panel — slides from start edge in RTL
className="fixed inset-y-0 start-0 w-96 z-45"
```

### Pattern 3: Framer Motion for Panel Animation

**What:** Use `framer-motion` (already in `package.json` at v12.38) for entering/exiting the floating panel. The `animations.scaleIn` and `transitions.spring` presets already exist in `lib/animations/presets.ts`.

**Why:** The existing codebase already imports framer-motion. Using it for the chat panel maintains consistency and provides the bounce/spring feel that suits the mystical aesthetic.

**Example (FloatingCoachPanel):**
```tsx
import { motion, AnimatePresence } from 'framer-motion';
import { animations, transitions } from '@/lib/animations/presets';

<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      transition={transitions.spring}
      className="fixed bottom-20 start-6 md:bottom-24 z-45 glass-panel rounded-2xl ..."
    >
      {/* panel content */}
    </motion.div>
  )}
</AnimatePresence>
```

### Pattern 4: Shared Coach API Client

**What:** Extract the raw fetch functions from `coach/page.tsx` into `src/services/coach/client-api.ts`.

**Why:** Both `coach/page.tsx` and `FloatingCoachPanel.tsx` need the same `fetchConversations`, `fetchMessages`, `sendMessage` functions. Without extraction, they will be duplicated, creating a maintenance hazard.

**What to extract:**
```typescript
// src/services/coach/client-api.ts
export async function fetchConversations(): Promise<Conversation[]>
export async function createConversation(): Promise<Conversation>
export async function fetchMessages(conversationId: string): Promise<Message[]>
export async function sendMessage(data: { conversation_id: string; message: string }): Promise<Message>
```

Both `coach/page.tsx` and `FloatingCoachPanel.tsx` import from `@/services/coach/client-api`.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Floating Panel in a Page File

**What goes wrong:** Placing the FloatingCoachPanel inside `/coach/page.tsx` or any other page component.

**Why bad:** Page components re-mount on navigation. A chat panel inside a page would close and lose state every time the user clicks a link.

**Instead:** Place `FloatingCoachOverlay` in `layout-client.tsx`. It persists across all routes.

### Anti-Pattern 2: Duplicating Chat Logic

**What goes wrong:** Copy-pasting the fetch functions and mutation handlers from `coach/page.tsx` into `FloatingCoachPanel.tsx`.

**Why bad:** Two sources of truth for coach API interactions. Bug fixes in one place do not propagate.

**Instead:** Extract to `src/services/coach/client-api.ts` first, then both components import from there.

### Anti-Pattern 3: Replacing MobileNav with Bottom Tabs

**What goes wrong:** Removing the full-sidebar MobileNav overlay and replacing it entirely with 5-tab bottom navigation.

**Why bad:** Users lose access to 42 other routes. The sidebar has 47 items; 5 tabs can only cover the most important destinations.

**Instead:** Keep both. Bottom tabs are a fast-access shortcut; MobileNav remains for deep navigation. The hamburger button in Header stays.

### Anti-Pattern 4: Blocking Full Screen with Chat Panel on Desktop

**What goes wrong:** Making the FloatingCoachPanel a full-screen modal on desktop.

**Why bad:** Destroys the "ambient coach" concept. The panel should coexist with the page, not replace it.

**Instead:** On desktop, use a constrained panel (380px × 560px) anchored to the bottom-start corner. Full-screen is acceptable only on mobile viewports.

### Anti-Pattern 5: Static Context Baked into Conversation Creation

**What goes wrong:** Continuing to read `convRow.context?.text` for the coach system prompt.

**Why bad:** The context never updates as the user runs new analyses during a conversation. The coach becomes uninformed about recent work.

**Instead:** Call `buildCoachingContext()` on every POST to `/api/coach/messages`. The 4 parallelized DB queries complete well within LLM latency.

### Anti-Pattern 6: `left-*`/`right-*` CSS on Fixed Elements

**What goes wrong:** Writing `className="fixed bottom-6 right-6"` for the bubble in an RTL app.

**Why bad:** When `dir="rtl"`, "start" is the right side visually, but Tailwind `right-*` bypasses the RTL logical property. This can cause the bubble to appear on the wrong side when viewed in an LTR context or after a future direction change.

**Instead:** Always use `start-*` / `end-*` for logical positioning.

---

## Build Order (Dependency Graph)

The four features have this dependency chain:

```
1. stores/floating-coach.ts           (no deps — create first)
   └── 2. services/coach/client-api.ts  (no UI deps — extract second)
         ├── 3. FloatingCoachOverlay.tsx  (deps: store + client-api + ChatMessage + ChatInput)
         │     └── 3a. FloatingCoachBubble.tsx  (dep: store)
         │     └── 3b. FloatingCoachPanel.tsx   (dep: store + client-api)
         └── 4. coach/page.tsx update    (import client-api instead of local fns)

5. BottomTabBar.tsx                   (no deps — create independently)

6. Sidebar.tsx modification           (no deps — config change only)

7. messages/route.ts modification     (dep: context-builder.ts already exists)

8. layout-client.tsx modification     (dep: FloatingCoachOverlay + BottomTabBar must exist)
```

**Recommended build sequence:**

| Step | File | Type | Blocking |
|------|------|------|---------|
| 1 | `src/stores/floating-coach.ts` | NEW | Blocks all overlay work |
| 2 | `src/services/coach/client-api.ts` | NEW | Blocks panel + page refactor |
| 3 | `src/components/features/coach/FloatingCoachBubble.tsx` | NEW | Part of overlay |
| 4 | `src/components/features/coach/FloatingCoachPanel.tsx` | NEW | Part of overlay |
| 5 | `src/components/features/coach/FloatingCoachOverlay.tsx` | NEW | Combines 3+4 |
| 6 | `src/app/(auth)/coach/page.tsx` | MODIFY | Import from client-api |
| 7 | `src/components/layouts/BottomTabBar.tsx` | NEW | Independent |
| 8 | `src/components/layouts/Sidebar.tsx` | MODIFY | Config only |
| 9 | `src/app/api/coach/messages/route.ts` | MODIFY | Dynamic context |
| 10 | `src/app/(auth)/layout-client.tsx` | MODIFY | Wire everything together |

Step 10 (layout modification) is last because it wires in `FloatingCoachOverlay` (step 5) and `BottomTabBar` (step 7) — both must exist before the layout references them.

---

## Scalability Considerations

| Concern | Now (v1.3) | Future |
|---------|-----------|--------|
| Chat context per message | 4 parallelized queries, ~50ms total | Add 60s TTL cache if DB query volume is a concern |
| Bottom tabs hardcoded | 5 items defined as a constant | Could be user-configurable in settings |
| Floating panel message history | Limited to latest conversation | Could track unread counts per conversation |
| Sidebar item count | 47 items, 8 sections | Further simplification in v1.4 (category pages) |

---

## Sources

- Direct codebase analysis: `mystiqor-build/src/app/(auth)/layout-client.tsx` (current layout structure)
- Direct codebase analysis: `mystiqor-build/src/components/layouts/Sidebar.tsx` (357 lines, 47 items, 8 sections)
- Direct codebase analysis: `mystiqor-build/src/components/layouts/MobileNav.tsx` (overlay pattern)
- Direct codebase analysis: `mystiqor-build/src/components/layouts/Header.tsx` (fixed z-50, glass-nav)
- Direct codebase analysis: `mystiqor-build/src/app/(auth)/coach/page.tsx` (fetch functions to extract)
- Direct codebase analysis: `mystiqor-build/src/app/api/coach/messages/route.ts` (current context pattern)
- Direct codebase analysis: `mystiqor-build/src/services/coach/context-builder.ts` (buildCoachingContext)
- Direct codebase analysis: `mystiqor-build/src/lib/animations/presets.ts` (framer-motion presets)
- Direct codebase analysis: `mystiqor-build/src/app/globals.css` (glass-panel, gold-glow, mystic-card-gold utilities)
- Direct codebase analysis: `mystiqor-build/package.json` (framer-motion v12.38, zustand v5, next v16)
- `.planning/ARCHITECTURE.md` v2.0 — system-level architecture reference

---

*Architecture v1.3 — 2026-03-29*
*Focus: floating chat overlay, bottom tabs, sidebar simplification, dynamic coach context*
*Confidence: HIGH — all patterns derived from direct codebase analysis*
