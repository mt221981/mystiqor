# Phase 23: Floating Coach & Bottom Tabs - Research

**Researched:** 2026-03-30
**Domain:** React floating UI, Framer Motion animations, Zustand state, RTL layout integration
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Floating Bubble (FAB)**
- D-01: Icon — GiCrystalBall (react-icons/gi), already used in Sidebar.tsx
- D-02: Position — bottom-inline-start (RTL-aware), above bottom tabs on mobile
- D-03: Style — gradient purple/gold + celestial-glow + breathing animation (scale 1.0→1.05, 4-second cycle)
- D-04: Size — 56px (w-14 h-14)
- D-05: z-index — var(--z-floating) = 60
- D-06: Hidden when pathname === '/coach'

**Chat Panel (Mini)**
- D-07: Slide-up with AnimatePresence, ~380px height, glass-panel background
- D-08: Shows last 3-5 messages + input row + "open full conversation" link to /coach
- D-09: Uses existing API routes — /api/coach/conversations + /api/coach/messages — no new API
- D-10: z-index — var(--z-panel) = 55

**Context-Aware Opener Messages**
- D-11: Path-to-message mapping (Hebrew, UI-only, not sent to API):
  - /tools/astrology → "ראיתי שקיבלת מפת לידה, רוצה לחקור יחד?"
  - /tools/tarot → "קריאת טארוט מרתקת! רוצה שנצלול לתובנות?"
  - /tools/numerology → "המספרים שלך מספרים סיפור, בוא נפענח"
  - /dashboard → "מה נעשה היום? אני כאן בשבילך"
  - default → "שלום! איך אפשר לעזור?"
- D-12: Opener shown as first text in panel (UI only — not sent to API)

**Bottom Tab Bar**
- D-13: 5 tabs — /dashboard | /coach | /daily-insights | /tools (grid) | /profile
- D-14: "Tools" opens /tools page (grid of tool cards), not the sidebar
- D-15: Visible only on mobile (md:hidden)
- D-16: z-index — var(--z-tabs) = 40
- D-17: glass-nav style (backdrop-filter blur with transparency)
- D-18: Active tab marked with primary color + indicator

**Layout Integration**
- D-19: FloatingCoachBubble + FloatingCoachPanel + BottomTabBar added to layout-client.tsx as siblings
- D-20: main content gets pb-20 md:pb-0 for tab bar clearance on mobile
- D-21: Zustand store (useFloatingCoachStore) manages: isOpen, activeConversationId, messages[], isLoading

**Coach API Extraction**
- D-22: Extract fetchMessages, sendMessage, createConversation from coach/page.tsx → services/coach/api.ts for shared use

### Claude's Discretion
- Animation spring config and duration for panel slide-up
- Whether panel supports creating a new conversation or only continues the last one (recommendation: continue last, create new if none exists)
- Tools page grid layout (2-column or 3-column, card sizing)
- Tab bar Lucide icons

### Deferred Ideas (OUT OF SCOPE)
- Real-time chat streaming (v1.4)
- Unread message badge on bubble (v1.4)
- Keyboard shortcut to open coach (Cmd+K)
- Tools tab as bottom sheet instead of page
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| COACH-01 | Floating bubble on every authenticated page (hidden on /coach), opens mini chat panel | Layout integration via layout-client.tsx; usePathname() already available |
| COACH-02 | Breathing animation (scale 1.0→1.05, 4-second cycle) that makes bubble feel "alive" | framer-motion `animate` keyframes with `repeat: Infinity, repeatType: "reverse"` |
| COACH-03 | Tool-specific opener message on panel open (not generic greeting, not sent to API) | usePathname() for route detection; UI-only state in Zustand store |
| NAV-01 | 5 bottom tabs on mobile (md:hidden), active tab visually marked; hamburger not primary mobile nav | glass-nav CSS class exists; usePathname() for active detection |
</phase_requirements>

---

## Summary

Phase 23 adds two UI systems to the authenticated layout: a floating AI coach bubble (FAB) with a mini chat panel, and a mobile bottom tab bar. Both mount in `layout-client.tsx` as siblings of the main content. The codebase is already 80% prepared — framer-motion, Zustand, the coach API, ChatMessage, and ChatInput are all installed and functional. The key work is composing them correctly into new components, not building infrastructure.

The z-index scale was established in Phase 22 and is fully defined in globals.css: `--z-tabs: 40`, `--z-panel: 55`, `--z-floating: 60`. These values are final and must be referenced via CSS custom properties using inline style `{ zIndex: 'var(--z-floating)' }` (established pattern from Phase 22).

The only genuinely new file needed beyond components is `services/coach/api.ts` (extraction of functions already in coach/page.tsx) and `app/(auth)/tools/page.tsx` (the tools grid, which has a ready-made `ToolGrid` component but no route). The `BottomTabBar` also needs the `pb-20 md:pb-0` applied to the layout's main element.

**Primary recommendation:** Build in this order: (1) extract shared coach API service, (2) create Zustand store, (3) FloatingCoachBubble, (4) FloatingCoachPanel, (5) BottomTabBar, (6) tools/page.tsx, (7) wire everything into layout-client.tsx.

---

## Standard Stack

### Core (all already installed — zero new packages)

| Library | Installed Version | Purpose | Usage in Phase |
|---------|------------------|---------|----------------|
| framer-motion | 12.38.0 | Animations (bubble breathing, panel slide-up) | `motion.div`, `AnimatePresence` |
| zustand | 5.0.12 | Global floating coach state | `useFloatingCoachStore` |
| @tanstack/react-query | 5.91.2 | Server state (messages, conversations) | `useQuery`, `useMutation` in panel |
| react-icons/gi | 5.6.0 | GiCrystalBall icon on bubble | Already used in Sidebar.tsx |
| lucide-react | 0.577.0 | Tab bar icons | LayoutDashboard, Brain, Lightbulb, Grid, User |
| next/navigation | (Next.js 16.2) | usePathname for active state and opener messages | Already used in Sidebar |

### No New Installations Required

Confirmed by inspection of package.json. Every library the plan needs is already installed. The CONTEXT.md and STATE.md both record: "Zero new npm packages needed — framer-motion, Zustand, ReactDOM.createPortal all installed."

---

## Architecture Patterns

### Recommended File Structure (new files only)

```
src/
├── stores/
│   └── floating-coach.ts           # Zustand store — useFloatingCoachStore
├── services/
│   └── coach/
│       └── api.ts                  # Extracted: fetchConversations, fetchMessages, sendMessage, createConversation
├── components/
│   └── features/
│       └── floating-coach/
│           ├── FloatingCoachBubble.tsx   # FAB button with breathing animation
│           └── FloatingCoachPanel.tsx    # Slide-up mini chat panel
│   └── layouts/
│       └── BottomTabBar.tsx        # 5-tab mobile navigation
└── app/
    └── (auth)/
        ├── tools/
        │   └── page.tsx            # Tools grid page (uses existing ToolGrid component)
        └── layout-client.tsx       # MODIFIED: add 3 new siblings + pb-20 on main
```

### Files Modified (not created)

```
src/app/(auth)/layout-client.tsx    # Add FloatingCoachBubble, FloatingCoachPanel, BottomTabBar; add pb-20 md:pb-0 to main
src/app/(auth)/coach/page.tsx       # Import API functions from services/coach/api.ts instead of defining locally
```

### Pattern 1: Zustand Store for Floating Coach

```typescript
// src/stores/floating-coach.ts
import { create } from 'zustand';

interface Message {
  id?: string;
  role: string;
  content: string;
  created_at?: string | null;
}

interface FloatingCoachState {
  isOpen: boolean;
  activeConversationId: string | null;
  messages: Message[];
  isLoading: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setActiveConversationId: (id: string | null) => void;
  setMessages: (msgs: Message[]) => void;
  addMessage: (msg: Message) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useFloatingCoachStore = create<FloatingCoachState>((set) => ({
  isOpen: false,
  activeConversationId: null,
  messages: [],
  isLoading: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  setActiveConversationId: (id) => set({ activeConversationId: id }),
  setMessages: (msgs) => set({ messages: msgs }),
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  setIsLoading: (loading) => set({ isLoading: loading }),
}));
```

**Note:** No `persist` middleware — panel state resets on navigation, which is intentional (each page visit shows fresh opener message).

### Pattern 2: Framer Motion Breathing Animation

```typescript
// FloatingCoachBubble.tsx — breathing animation
<motion.button
  animate={{
    scale: [1, 1.05, 1],
    boxShadow: [
      '0 0 40px rgba(143, 45, 230, 0.25)',
      '0 0 60px rgba(143, 45, 230, 0.4), 0 0 20px rgba(212, 168, 83, 0.15)',
      '0 0 40px rgba(143, 45, 230, 0.25)',
    ],
  }}
  transition={{
    duration: 4,
    repeat: Infinity,
    repeatType: 'reverse',
    ease: 'easeInOut',
  }}
  // reduced-motion: framer-motion respects prefers-reduced-motion automatically
  // when using the `animate` prop with motion values
/>
```

**Note:** framer-motion automatically respects `prefers-reduced-motion` when using `MotionConfig reducedMotion="user"`. The existing globals.css already handles this via CSS `@media (prefers-reduced-motion: reduce)`, but framer-motion's `animate` prop will still run. Wrap the layout with `<MotionConfig reducedMotion="user">` in layout-client.tsx, OR manually check `useReducedMotion()` hook from framer-motion in the bubble component.

### Pattern 3: Panel Slide-Up with AnimatePresence

```typescript
// FloatingCoachPanel.tsx
import { AnimatePresence, motion } from 'framer-motion';

<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed bottom-0 inset-inline-start-0 inset-inline-end-0 md:inset-inline-start-auto md:inset-inline-end-4 md:w-96 glass-panel rounded-t-2xl md:rounded-2xl md:bottom-20"
      style={{ zIndex: 'var(--z-panel)' }}
    >
      {/* panel content */}
    </motion.div>
  )}
</AnimatePresence>
```

**Spring config rationale (Claude's discretion):** `stiffness: 300, damping: 30` gives a snappy but not jarring slide — feels physical. Duration ~0.3-0.4s perceived. This is the same spring range used by shadcn/ui Sheet components.

### Pattern 4: Context-Aware Opener Message

```typescript
// FloatingCoachPanel.tsx
import { usePathname } from 'next/navigation';

const OPENER_MESSAGES: Record<string, string> = {
  '/tools/astrology': 'ראיתי שקיבלת מפת לידה, רוצה לחקור יחד?',
  '/tools/tarot': 'קריאת טארוט מרתקת! רוצה שנצלול לתובנות?',
  '/tools/numerology': 'המספרים שלך מספרים סיפור, בוא נפענח',
  '/dashboard': 'מה נעשה היום? אני כאן בשבילך',
};
const DEFAULT_OPENER = 'שלום! איך אפשר לעזור?';

// In component:
const pathname = usePathname();
const openerMessage = OPENER_MESSAGES[pathname] ?? DEFAULT_OPENER;
```

**Implementation note (D-12):** The opener message is a UI string rendered as the first "chat bubble" when the panel opens. It is **not** added to `messages[]` in the store, and **not** sent to the API. It is purely presentational — rendered as a conditional `<div>` above the messages list when `messages.length === 0`.

### Pattern 5: Bottom Tab Bar with RTL-Correct Active Indicator

```typescript
// BottomTabBar.tsx
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const TABS = [
  { label: 'לוח בקרה', href: '/dashboard', icon: LayoutDashboard },
  { label: 'מאמן AI',  href: '/coach',     icon: Brain },          // or GiCrystalBall
  { label: 'תובנות',  href: '/daily-insights', icon: Lightbulb },
  { label: 'כלים',    href: '/tools',      icon: Grid2x2 },
  { label: 'פרופיל',  href: '/profile',    icon: User },
] as const;

// Active detection: exact match OR startsWith for nested routes
const isActive = (href: string) =>
  pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
```

**Icon choices (Claude's discretion):** From `lucide-react` v0.577.0:
- Dashboard: `LayoutDashboard`
- Coach: `Brain` (clear AI association; or keep `GiCrystalBall` from react-icons for mystical feel — same icon as bubble creates visual link)
- Daily Insights: `Lightbulb`
- Tools: `Grid2x2` (grid implies collection)
- Profile: `User`

**RTL positioning:** Tab bar spans full width at bottom. Content is `flex flex-row-reverse` because RTL Hebrew convention puts rightmost tab as the "first" (most primary) item — but user direction in the app is RTL so standard flex with `dir="rtl"` handles ordering.

### Pattern 6: z-index Application (Phase 22 established pattern)

Use inline style with CSS variable — never Tailwind arbitrary `z-[60]`:
```typescript
style={{ zIndex: 'var(--z-floating)' }}   // bubble
style={{ zIndex: 'var(--z-panel)' }}       // panel
style={{ zIndex: 'var(--z-tabs)' }}        // tab bar
```

### Pattern 7: Shared Coach API Service

Extract from `coach/page.tsx` lines 50-86 to `services/coach/api.ts`:

```typescript
// services/coach/api.ts — publicly exported types and functions

export interface Conversation {
  id: string;
  title: string | null;
  last_message_at: string | null;
  message_count: number | null;
  created_at: string | null;
}

export interface Message {
  id?: string;
  role: string;
  content: string;
  created_at?: string | null;
}

export async function fetchConversations(): Promise<Conversation[]> { ... }
export async function fetchMessages(conversationId: string): Promise<Message[]> { ... }
export async function sendMessage(data: { conversation_id: string; message: string }): Promise<Message> { ... }
export async function createConversation(): Promise<Conversation> { ... }
```

**coach/page.tsx after extraction:** Replace inline function definitions with imports from `@/services/coach/api`. Types become shared. No logic changes — pure extraction.

### Anti-Patterns to Avoid

- **Portal for panel:** ReactDOM.createPortal is available but NOT needed here. Mounting components as children of layout-client.tsx with correct z-index is sufficient and simpler. The panel is position:fixed so it escapes layout stacking context.
- **Arbitrary Tailwind z-index:** Never use `z-[60]` — always use CSS custom properties (`var(--z-floating)`).
- **Sending opener message to API:** The opener is UI-only (D-12). Adding it to the messages array before sending user input would corrupt the chat history.
- **Persisting store state across routes:** The floating-coach Zustand store should NOT use `persist` middleware. State reset on navigation is correct behavior.
- **shadcn/ui Sheet for panel:** MobileNav.tsx notes "ישודרג כשיותקן" (upgraded when installed) — shadcn Sheet may not be fully set up. Use framer-motion AnimatePresence directly as decided in D-07. This is simpler and more controllable.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Slide-up animation | CSS transition or custom keyframe | framer-motion AnimatePresence | Exit animation requires AnimatePresence; CSS can't animate unmounted elements |
| Global isOpen state | useState in layout | Zustand useFloatingCoachStore | Panel and bubble are siblings — need shared state; context would require wrapper restructuring |
| Route-based active tab | Custom matcher | usePathname() + startsWith | Already the pattern in Sidebar.tsx |
| Breathing animation | CSS @keyframes | framer-motion `animate` array | Simpler reduced-motion handling via `useReducedMotion()` hook |
| Tools grid | New component from scratch | Existing `ToolGrid` at components/features/shared/ToolGrid.tsx | The component is already built and tested |

**Key insight:** The existing `ToolGrid` component at `src/components/features/shared/ToolGrid.tsx` only shows 6 core tools. The `/tools/page.tsx` will use it as the primary content — Claude's discretion decides whether to expand it to all tools or keep the 6-tool focus.

---

## Common Pitfalls

### Pitfall 1: iOS Safe Area and Bottom Tab Bar Overlap
**What goes wrong:** The bottom tab bar sits at `bottom-0` but on iOS Safari/PWA, the home indicator (safe-area-inset-bottom) is ~34px. The tab bar gets occluded.
**Why it happens:** iOS doesn't automatically add safe-area padding to fixed elements.
**How to avoid:** Add `pb-[env(safe-area-inset-bottom)]` to the tab bar container, or add it via CSS:
```css
/* In globals.css — already has @supports (padding: env(...)) block */
.bottom-tab-bar {
  padding-bottom: env(safe-area-inset-bottom);
}
```
Or inline: `style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}`.
**Warning signs:** Tab bar icons cut off on iPhone during QA.

### Pitfall 2: FAB Blocks Bottom Tab Bar
**What goes wrong:** The floating bubble at `bottom: <value>` on mobile overlaps with the bottom tab bar at `bottom-0`.
**Why it happens:** Both are position:fixed. The bubble's `inset-block-end` (bottom in physical pixels) needs offset.
**How to avoid:** On mobile, add `bottom-20` (80px = height of 5-tab bar ~56px + some gap) to bubble positioning. On desktop, `bottom-6`.
```typescript
// In FloatingCoachBubble
className="fixed bottom-20 md:bottom-6 ..."
```
D-02 in CONTEXT.md already specifies "above the bottom tabs on mobile."

### Pitfall 3: Panel Width on Desktop vs Mobile
**What goes wrong:** A panel that spans full width on mobile is ugly on desktop.
**Why it happens:** The panel is `position: fixed` and defaults to the full viewport width if not constrained.
**How to avoid:** On mobile: `inset-x-0` (full width, slide up). On desktop: `end-4 w-96 bottom-20` (right-anchored, fixed width, above bottom of screen). Use responsive classes:
```
className="fixed inset-x-0 bottom-0 md:inset-x-auto md:end-4 md:w-96 md:bottom-20"
```
**RTL note:** Use `end-4` not `right-4` for correct RTL positioning.

### Pitfall 4: Opener Message Leaks into API Context
**What goes wrong:** Developer adds the opener message to the store's messages[] array, which then gets fetched as history by the API on the next message send.
**Why it happens:** It's tempting to unify the display logic.
**How to avoid:** The opener is ONLY a string stored in the component (derived from usePathname). It renders as a conditional element when `messages.length === 0 && isOpen`. It is never in the store, never fetched, never sent.

### Pitfall 5: Framer Motion `animate` Array Not Respecting prefers-reduced-motion
**What goes wrong:** The breathing animation runs even when the user has requested reduced motion.
**Why it happens:** The CSS `@media (prefers-reduced-motion: reduce)` block in globals.css targets CSS animations but NOT framer-motion JS-driven animations.
**How to avoid:** Use framer-motion's `useReducedMotion()` hook:
```typescript
import { useReducedMotion } from 'framer-motion';
const shouldReduceMotion = useReducedMotion();
// Then pass empty/static `animate` when true:
animate={shouldReduceMotion ? {} : { scale: [1, 1.05, 1], ... }}
```
**Warning signs:** QA with `prefers-reduced-motion: reduce` in browser devtools shows bubble still breathing.

### Pitfall 6: Panel z-index Collision with MobileNav
**What goes wrong:** FloatingCoachPanel (`--z-panel: 55`) appears behind MobileNav overlay (`--z-overlay: 50`) but MobileNav panel itself also uses `--z-panel: 55`.
**Why it happens:** MobileNav uses `--z-panel` for its slide-in panel. Both panels would be at z-index 55.
**How to avoid:** The FloatingCoachPanel only shows when MobileNav is closed. Add logic in FloatingCoachBubble to close the floating panel when MobileNav opens, or accept that they won't overlap (user can't trigger both simultaneously in normal flow). This is LOW risk — confirm during implementation.

### Pitfall 7: Type Safety — `Conversation` and `Message` Defined in Two Places
**What goes wrong:** Types defined in coach/page.tsx and re-defined in floating-coach components diverge over time.
**Why it happens:** Copy-paste without sharing the type source.
**How to avoid:** D-22 extraction creates `services/coach/api.ts` as the single source. Both coach/page.tsx and FloatingCoachPanel.tsx import from there.

---

## Code Examples

### FloatingCoachBubble — Minimal Structural Pattern
```typescript
// src/components/features/floating-coach/FloatingCoachBubble.tsx
'use client';

import { usePathname } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { GiCrystalBall } from 'react-icons/gi';
import { useFloatingCoachStore } from '@/stores/floating-coach';

export function FloatingCoachBubble() {
  const pathname = usePathname();
  const { toggle } = useFloatingCoachStore();
  const shouldReduceMotion = useReducedMotion();

  // מוסתר בעמוד המאמן המלא
  if (pathname === '/coach') return null;

  return (
    <motion.button
      onClick={toggle}
      className="fixed bottom-20 md:bottom-6 start-4 w-14 h-14 rounded-full celestial-glow
                 bg-gradient-to-br from-primary to-accent flex items-center justify-center
                 text-primary-foreground cursor-pointer"
      style={{ zIndex: 'var(--z-floating)' }}
      animate={shouldReduceMotion ? {} : {
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut',
      }}
      aria-label="פתח מאמן AI"
      aria-expanded={/* isOpen */false}
    >
      <GiCrystalBall className="w-7 h-7" />
    </motion.button>
  );
}
```

### BottomTabBar — Active State Pattern
```typescript
// src/components/layouts/BottomTabBar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
// icons imported from lucide-react

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 md:hidden glass-nav border-t border-border/20
                 flex items-center justify-around"
      style={{
        zIndex: 'var(--z-tabs)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        height: '56px',
      }}
      aria-label="ניווט ראשי"
    >
      {TABS.map(({ label, href, Icon }) => {
        const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors min-w-[56px]',
              active ? 'text-primary' : 'text-on-surface-variant'
            )}
            aria-current={active ? 'page' : undefined}
          >
            <Icon className={cn('w-5 h-5', active && 'drop-shadow-[0_0_6px_rgba(221,184,255,0.6)]')} />
            <span className="text-[10px] font-label font-medium">{label}</span>
            {active && (
              <span className="absolute bottom-0 w-1 h-1 rounded-full bg-primary" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
```

### layout-client.tsx Modification Pattern
```typescript
// Add these imports
import { FloatingCoachBubble } from '@/components/features/floating-coach/FloatingCoachBubble';
import { FloatingCoachPanel } from '@/components/features/floating-coach/FloatingCoachPanel';
import { BottomTabBar } from '@/components/layouts/BottomTabBar';

// Inside the JSX — modify main element and add siblings:
<main className="flex-1 overflow-auto pt-16 pb-20 md:pb-0">  {/* pb-20 for tab bar */}
  ...
</main>

{/* Floating coach — after MobileNav closing tag */}
<FloatingCoachBubble />
<FloatingCoachPanel />
<BottomTabBar />
```

### Existing ToolGrid — Already Built
```typescript
// src/components/features/shared/ToolGrid.tsx — ALREADY EXISTS
// Shows 6 tools in a 2-col (mobile) / 3-col (desktop) grid
// Usage in /tools/page.tsx:
import { ToolGrid } from '@/components/features/shared/ToolGrid';

export default function ToolsPage() {
  return (
    <div dir="rtl">
      <PageHeader title="כלים מיסטיים" ... />
      <ToolGrid />
    </div>
  );
}
```

---

## State of the Art

| Old Approach | Current Approach | Impact for Phase 23 |
|--------------|------------------|---------------------|
| CSS transitions for mount/unmount | framer-motion AnimatePresence | Exit animations work correctly on panel close |
| `right: X` for RTL positioning | `inset-inline-end` / Tailwind `end-X` | Correct RTL behavior across LTR/RTL contexts |
| z-index magic numbers | CSS custom properties (`--z-floating`) | Team-readable, collision-proof (Phase 22) |
| Global state via prop drilling | Zustand | Bubble and Panel are siblings — must share isOpen without restructuring the tree |

**Deprecated in this project:**
- `left`/`right` positioning: Never use. Use `start`/`end` (Tailwind) or `inset-inline-start`/`inset-inline-end` (CSS).
- Arbitrary Tailwind z-index (`z-[60]`): Never use. Use CSS custom property inline styles.

---

## Open Questions

1. **ToolGrid scope on /tools page**
   - What we know: `ToolGrid` shows only 6 core tools (numerology, astrology, graphology, drawing, palmistry, tarot)
   - What's unclear: Should /tools page show all 17+ tools (full Sidebar inventory) or only the 6 core tools from ToolGrid?
   - Recommendation: Use existing `ToolGrid` (6 tools) for phase 23. Expanding to all tools is a larger design decision — defer to Phase 25 or as a follow-up. Keeps this phase scoped.

2. **Conversation continuation logic in panel (Claude's discretion)**
   - What we know: D-21 says store manages `activeConversationId`
   - Recommendation: On panel open, fetch last conversation (`fetchConversations()` → take `[0]`). If exists, set as active. If none, `activeConversationId` stays null and sending first message creates one via `createConversation()`. This mirrors the exact flow already in `coach/page.tsx handleSendMessage`.

3. **GiCrystalBall vs Brain for Coach tab in BottomTabBar**
   - What we know: D-01 locks GiCrystalBall for the bubble. BottomTabBar icons are Claude's discretion.
   - Recommendation: Use `GiCrystalBall` for the Coach tab too — creates a visual link between the tab and the floating bubble. The icon is already imported in Sidebar.tsx, confirming it renders well at small sizes.

4. **Panel on desktop — does it slide from bottom or appear differently?**
   - Recommendation: On desktop (md+), the panel positions bottom-right as a 384px-wide floating card (not full-width slide). Animate with `opacity: 0→1, y: 20→0` instead of `y: 100%→0`. The mobile pattern (full-width bottom sheet) looks wrong on desktop.

---

## Environment Availability

Step 2.6: SKIPPED — Phase 23 is purely code/component additions. No new external tools, services, databases, or CLI utilities are needed beyond what's already installed.

---

## Project Constraints (from CLAUDE.md)

All of the following CLAUDE.md directives apply to every file created or modified in this phase:

| Directive | Applied To |
|-----------|-----------|
| TypeScript strict — no `any`, no `@ts-ignore` | All new .ts/.tsx files |
| Every function — JSDoc in Hebrew | All exported functions and components |
| Every component — typed Props interface | FloatingCoachBubble, FloatingCoachPanel, BottomTabBar |
| Max 300 lines per file | Panel logic must be split if it approaches limit |
| Imports — absolute `@/` paths | All imports |
| `dir="rtl"` in layout, `start`/`end` for positioning | Tab bar, bubble position |
| Hebrew labels, errors, placeholders, toasts | All visible text |
| Hebrew code comments | Inline code comments |
| No `any` — use typed service layer | Coach API types from services/coach/api.ts |
| Existing code preserved — coach/page.tsx extraction is non-breaking | Import from api.ts, keep behavior identical |
| File Score threshold ≥ 78/100 | All new/modified files |
| Phase Score threshold ≥ 52/60 | Phase gate before /gsd:verify-work |
| `next/dynamic` for heavy components | FloatingCoachPanel should be lazy-loaded (heavy, not needed on initial paint) |

**Critical constraint:** "Never break working code to chase a higher score." The extraction of `services/coach/api.ts` must be purely mechanical — same function signatures, same fetch logic. If `coach/page.tsx` passes TypeScript before extraction, it must pass after.

---

## Validation Architecture

nyquist_validation is enabled (config.json: `"nyquist_validation": true`).

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 + @testing-library/react 16.3.2 |
| Config file | `mystiqor-build/vitest.config.ts` |
| Quick run command | `cd mystiqor-build && npx vitest run tests/stores/floating-coach.ts tests/components/BottomTabBar.test.tsx` |
| Full suite command | `cd mystiqor-build && npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| COACH-01 | FloatingCoachBubble renders on non-/coach routes, null on /coach | unit | `npx vitest run tests/components/FloatingCoachBubble.test.tsx` | ❌ Wave 0 |
| COACH-02 | Bubble has breathing animation props (scale array, repeat Infinity) | unit | same | ❌ Wave 0 |
| COACH-03 | Panel shows correct opener message per route | unit | `npx vitest run tests/components/FloatingCoachPanel.test.tsx` | ❌ Wave 0 |
| NAV-01 | BottomTabBar renders 5 tabs, active tab has aria-current="page" | unit | `npx vitest run tests/components/BottomTabBar.test.tsx` | ❌ Wave 0 |
| (store) | useFloatingCoachStore toggle opens/closes, addMessage appends | unit | `npx vitest run tests/stores/floating-coach.ts` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** Run the specific test file for that task
- **Per wave merge:** `npx vitest run` (full suite, currently ~15 tests)
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `tests/stores/floating-coach.ts` — covers store open/close/addMessage
- [ ] `tests/components/FloatingCoachBubble.test.tsx` — covers COACH-01 (null on /coach) and COACH-02 (animation props)
- [ ] `tests/components/FloatingCoachPanel.test.tsx` — covers COACH-03 (opener message per route)
- [ ] `tests/components/BottomTabBar.test.tsx` — covers NAV-01 (5 tabs, aria-current)

**Mock pattern established** (from tests/setup.ts):
```typescript
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/dashboard'),   // override per test
  ...
}))
vi.mock('framer-motion', () => ({
  motion: { button: ({ children, ...p }) => <button {...p}>{children}</button> },
  AnimatePresence: ({ children }) => <>{children}</>,
  useReducedMotion: vi.fn(() => false),
}))
```

---

## Sources

### Primary (HIGH confidence)
- Direct inspection of `mystiqor-build/src/` source tree — all patterns verified against actual files
- `mystiqor-build/package.json` — version numbers confirmed from lock-file-adjacent source
- `mystiqor-build/src/app/globals.css` — z-index values and CSS classes confirmed
- `mystiqor-build/src/stores/theme.ts` — Zustand v5 pattern confirmed
- `mystiqor-build/src/app/(auth)/coach/page.tsx` — API functions to extract confirmed
- `mystiqor-build/src/components/features/shared/ToolGrid.tsx` — confirmed exists and is complete
- `mystiqor-build/vitest.config.ts` + `tests/setup.ts` — test infrastructure confirmed

### Secondary (MEDIUM confidence)
- framer-motion v12 `useReducedMotion` hook — training knowledge, consistent with the library's documented API pattern; version 12.x is installed and this API has been stable since v6
- iOS safe-area-inset-bottom behavior — well-established cross-platform pattern, globals.css already contains the `@supports (padding: env(...))` block confirming awareness of this

### Tertiary (LOW confidence)
- None — all critical claims verified against actual project source

---

## Metadata

**Confidence breakdown:**
- Standard Stack: HIGH — verified against package.json; zero new packages
- Architecture: HIGH — patterns verified against existing Zustand store, Framer Motion usage, and API route structure
- Pitfalls: HIGH — derived from actual code inspection (MobileNav z-index, opener message leak, safe-area)
- Test Plan: HIGH — vitest infrastructure confirmed; mock patterns extracted from setup.ts

**Research date:** 2026-03-30
**Valid until:** 2026-04-30 (stable stack; framer-motion, Zustand, Next.js APIs unlikely to change at patch level)
