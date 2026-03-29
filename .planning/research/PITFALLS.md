# Domain Pitfalls — v1.3 Mystical UX & Coach Prominence

**Domain:** Adding mystical animations, floating AI coach, simplified navigation, and text contrast fixes to an existing production Next.js app
**Researched:** 2026-03-29
**Evidence basis:** Direct inspection of mystiqor-build source — layout-client.tsx, Sidebar.tsx, MobileNav.tsx, Header.tsx, globals.css, tailwind.config.ts, layout.tsx. Codebase has 308 source files, ~27,300 LOC, PWA, RTL Hebrew.
**Scope:** Integration pitfalls when ADDING features to existing working system. Not a migration or new-build document.

---

## Critical Pitfalls

Mistakes in this category break existing working functionality, cause production regressions, or require rewriting code that already works.

---

### Pitfall 1: Animation Layers Stack on Top of Three Existing Animated Backgrounds

**What goes wrong:** `layout-client.tsx` already renders three animated CSS blob elements (`animate-[pulse_8s...]`, `animate-[pulse_12s...]`, `animate-[pulse_10s...]`) plus the root div carries both `stars-bg` and `aurora-bg` CSS classes. `globals.css` already defines `sparkle-drift` (20s), `aurora-shift` (15s), `stars-twinkle` (8s), `shimmer-rotate` (6s), `float-gentle`, and `pulse-glow`. Adding a particle system or additional animation layer on top of this means the browser is simultaneously animating 8+ CSS keyframe sequences on every authenticated page. On a mid-range Android device, this combines with glassmorphism `backdrop-filter: blur(20px) saturate(1.5)` in `.glass-nav` and `.glass-panel` to produce continuous GPU work. The result is dropped frames and battery drain — not just on mobile but on budget laptops.

**Why it happens:** Each animation layer looks harmless in isolation. The cumulative load is invisible until tested on real hardware.

**Consequences:** Frame rate drops to 30fps or below on mid-range devices. Battery drain on mobile is measurable within 10 minutes of use. PWA users notice the heat from their phone. Mystical atmosphere — the whole goal — is undermined by jank.

**Prevention:**
- Audit existing animation budget before adding anything. The current baseline already exceeds what most budget devices handle well.
- New cosmic/particle effects must be additive only for devices that can handle it. Use `@media (prefers-reduced-motion: no-preference)` as a gate — not just `prefers-reduced-motion: reduce`.
- Preferred approach: replace existing blob animations in layout-client.tsx with CSS-only, non-animated alternatives (static radial gradients), then redirect the saved budget to the new effects. Net GPU load stays the same; perceived mystical quality improves because the new effects are more visible.
- If adding JavaScript-driven particles (Canvas API, three.js), cap particle count by device memory: `navigator.deviceMemory < 4` means no particles. This API is available in Chrome/Edge but not Safari — use feature detection with a fallback.
- Never add `backdrop-filter` to a floating chat widget. The existing `.glass-nav` and `.glass-panel` already saturate GPU compositing. A third blurred layer causes compositing layer explosion.

**Warning signs:** New CSS `@keyframes` added without removing or throttling an existing one. Any `backdrop-filter: blur(...)` on the floating chat bubble. GPU frame timeline in DevTools showing compositor frame budget exceeded.

**Phase:** Address animation budget audit before adding any mystical visual effects. This is a prerequisite, not a nice-to-have.

---

### Pitfall 2: No `prefers-reduced-motion` Handling in Entire Codebase

**What goes wrong:** `globals.css` defines six `@keyframes` blocks. None are wrapped in `@media (prefers-reduced-motion: no-preference)`. The existing `stars-bg`, `aurora-bg`, `sparkle-float`, and `shimmer-border` classes all animate unconditionally. Adding more animations without introducing reduced-motion support means the app fails WCAG 2.3.3 (Animation from Interactions) for users who have enabled reduced motion in iOS/Android/macOS accessibility settings. This is not a minor UX issue — it causes physical discomfort (vertigo, nausea) for users with vestibular disorders.

**Why it happens:** Reduced-motion is an afterthought in most animation-heavy UIs. The existing codebase has not addressed it.

**Consequences:** Users with vestibular disorders (a significant minority — approx. 35% of adults experience some vestibular dysfunction) are excluded. App fails basic accessibility compliance. If MystiQor targets an audience interested in wellness and self-awareness (it does), this demographic overlap is especially important.

**Prevention:**
- Add a single root-level `@media (prefers-reduced-motion: reduce)` block in globals.css that disables all non-essential animations:
  ```css
  @media (prefers-reduced-motion: reduce) {
    .stars-bg, .aurora-bg, .sparkle-float, .shimmer-border { animation: none; }
    .mystic-hover { transition: none; }
    * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
  }
  ```
- The floating chat bubble's entrance animation must respect this. No bounce, no spring — instant appearance.
- This one block is a 10-line fix that retroactively protects all existing animations plus every new one added in v1.3.

**Warning signs:** Any new `@keyframes` added to globals.css without a corresponding `prefers-reduced-motion` exception. Floating chat bubble using a spring/bounce animation without a conditional check. Any Framer Motion usage without `useReducedMotion()` hook.

**Phase:** Add the reduced-motion media query block as the very first task of the mystical animations phase. It protects everything that comes after.

---

### Pitfall 3: Floating Chat Widget z-index Collision with Existing Fixed Elements

**What goes wrong:** The current `Header` is `fixed top-0 z-50`. The `MobileNav` overlay background is `fixed inset-0 z-50`. The `MobileNav` panel is `fixed inset-y-0 end-0 z-50`. All three compete at the same stacking level. A floating chat bubble placed at `fixed bottom-4 end-4 z-50` will be visually behind the mobile nav overlay when the hamburger menu is open. If the developer bumps the chat to `z-60`, the chat bubble then appears on top of the mobile nav panel — the user cannot dismiss the mobile menu because the chat bubble intercepts tap events.

**Why it happens:** z-index is managed per-component with no global stacking context registry. The Header, MobileNav, and future floating chat were not designed together.

**Consequences:** Chat bubble appears on top of open mobile menu. Tap events on the bottom of the open menu sidebar are intercepted by the invisible chat bubble hitbox. On RTL layout with the panel sliding from `end-0` (right edge), the chat bubble in the bottom-right corner is directly in the slide path.

**Prevention:**
- Define a global z-index scale as CSS custom properties (or Tailwind config extensions) before adding the floating widget:
  ```
  --z-base: 0
  --z-dropdown: 10
  --z-sticky: 20
  --z-fixed: 30          (header)
  --z-mobile-overlay: 40 (MobileNav backdrop)
  --z-mobile-panel: 50   (MobileNav panel)
  --z-floating: 60       (chat bubble — above nav panel)
  --z-modal: 70          (modals, dialogs)
  --z-toast: 80          (Sonner toasts)
  ```
- The floating chat bubble MUST NOT overlap the mobile nav panel. Options: (a) hide the chat bubble while mobile nav is open, (b) position the bubble above the panel at a higher z-index and set `pointer-events: none` on the bubble when the panel is open.
- The cleanest solution: share `isMobileNavOpen` state from `layout-client.tsx` into the floating chat via a Zustand store (already used in this codebase). When nav is open, chat bubble hides or dims (`opacity-0 pointer-events-none`).
- Update `Header` from `z-50` Tailwind class to a custom property so the scale is centrally managed.

**Warning signs:** Floating chat component defining its own z-index constant independently. Any `z-[number]` inline styles in the floating chat. No test of chat bubble during open mobile nav state.

**Phase:** Must be designed before the floating chat component is coded, not retrofitted after.

---

### Pitfall 4: Mobile Virtual Keyboard Pushes Fixed Chat Bubble and Blocks Input

**What goes wrong:** When the floating chat widget contains an input field and the user taps it on iOS or Android, the virtual keyboard rises and shrinks the viewport. On iOS Safari, `position: fixed` elements do not reliably stay in place when the keyboard opens — fixed elements can scroll up with the page or appear beneath the keyboard. The chat input at `bottom: 4px` becomes covered by the keyboard. The user cannot see what they are typing. This is especially pronounced in PWA mode (standalone display mode), where the iOS WKWebView handles keyboard differently from the Safari browser.

**Why it happens:** iOS Safari's viewport resizing behavior when the virtual keyboard opens has been inconsistent for years. The `visualViewport` API partially addresses this but requires explicit handling. Next.js App Router has no built-in mechanism for this.

**Consequences:** In PWA mode (which MystiQor supports), the chat input is inaccessible on iOS when the keyboard is open. Users see their text input covered. Frustrating enough to make users abandon the chat feature entirely.

**Prevention:**
- Use the `visualViewport` API to track keyboard appearance and reposition the chat widget:
  ```typescript
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const handler = () => {
      const offset = window.innerHeight - viewport.height;
      setChatBottomOffset(offset > 100 ? offset : 0);
    };
    viewport.addEventListener('resize', handler);
    return () => viewport.removeEventListener('resize', handler);
  }, []);
  ```
- Apply `bottom: calc(1rem + {chatBottomOffset}px)` as an inline style that overrides the default Tailwind class.
- Alternatively: instead of a truly floating widget, implement the chat as a bottom sheet that uses `position: sticky` within a scrollable container — this sidesteps the fixed-position keyboard problem entirely.
- Test specifically in iOS Safari PWA mode (add to home screen), not just in the browser. Behavior differs.

**Warning signs:** Chat widget tested only in Chrome DevTools mobile emulation. No `visualViewport` usage anywhere in the component. Input visible in browser but covered in PWA mode.

**Phase:** Must be verified on a physical iOS device in standalone (home screen) mode before the phase is considered complete.

---

### Pitfall 5: Adding Bottom Tab Navigation Creates Three Competing Navigation Systems

**What goes wrong:** The current architecture has:
1. Desktop sidebar (264px wide, 8 collapsible sections, 47 items, always visible on md+)
2. Mobile hamburger menu (full clone of sidebar, opens from right edge as a sheet)
3. New: bottom tab bar (proposed for mobile)

If a bottom tab bar is added alongside the existing hamburger system without removing the hamburger, mobile users now have two navigation entry points that both claim to be "the" navigation. The hamburger opens the full 47-item sidebar. The bottom tabs show 4-5 priority destinations. Users cannot tell which system is authoritative. Worse: if a user navigates to a route via the sidebar that is not in the bottom tabs, the bottom tab active state shows nothing — no tab is highlighted, creating a "lost" feeling.

**Why it happens:** It is tempting to add the bottom tabs as a purely additive enhancement. Removing the hamburger feels risky because it means changing working navigation. The result is no decision being made.

**Consequences:** Navigation state is split across two systems. Active route highlighting is inconsistent (sidebar shows one active item, bottom tabs may show none or the wrong one). Mobile layout needs bottom padding to account for the tabs — `main` currently uses `pt-16` for the header but has no bottom padding. Without adding `pb-[72px]` to the main content area, the bottom tab bar overlaps the last card on every page.

**Prevention:**
- Make a firm architectural decision: bottom tabs replace the hamburger on mobile, not supplement it. The hamburger `<Menu>` button in `Header.tsx` becomes `hidden` on mobile when bottom tabs are present.
- The 5 bottom tab destinations (Home/Dashboard, Tools, Coach, Journal/Mood, Profile) must have clear active state logic that handles sub-routes: `/tools/astrology` should activate the Tools tab, `/coach` activates the Coach tab.
- Add `pb-[env(safe-area-inset-bottom)+72px]` to the `<main>` element in `layout-client.tsx`. The existing `env(safe-area-inset-bottom)` is applied to `body` padding in globals.css, but this conflicts with the tab bar needing its own safe-area clearance.
- The `Sidebar` component (desktop) is unaffected — it renders only on `md:` breakpoint. Only `MobileNav` is retired on mobile.

**Warning signs:** Mobile layouts showing both a hamburger icon in the header and a bottom tab bar simultaneously. No `pb-` update to main content area. Bottom tab active state using exact `pathname` match instead of `pathname.startsWith()` prefix match.

**Phase:** Navigation simplification must be planned as a replacement strategy, not an addition strategy.

---

### Pitfall 6: Text Contrast Fixes That Break Existing Components Using the Same Token

**What goes wrong:** The reported contrast problem is `on-surface-variant: #c8bede` on `surface: #0d0b1e`. This token is used extensively throughout the codebase for secondary text. In `Sidebar.tsx` alone it appears in nav item text, category headers, and usage bar labels. In `Header.tsx` it colors the icon buttons. In many feature pages it is the default muted text color. A naive fix — changing the token value in `tailwind.config.ts` — immediately affects every element using `text-on-surface-variant`, including borders, icon backgrounds, and hover states that intentionally use the dim color for subtle effects.

**Actual contrast values:**
- `#c8bede` on `#0d0b1e`: contrast ratio approximately 6.5:1 — passes WCAG AA (4.5:1 minimum for normal text, 3:1 for large text). The reported "problematic" issue may be specifically about specific usage contexts, not the token itself.
- The real problem is likely where `text-on-surface-variant/60` or `/70` opacity modifiers are applied (Tailwind's opacity modifier syntax). `text-gold-dim/60` (`rgba(184, 145, 62, 0.6)`) on `#0d0b1e` drops to approximately 2.8:1 — fails WCAG AA. Similarly, sidebar category headers use `text-gold-dim/70` which is marginal.

**Why it happens:** The codebase uses both direct token colors and opacity-modified variants (the `/60`, `/70` Tailwind syntax). The base token may pass contrast requirements, but the opacity-reduced versions fail. Fixing "the contrast" without identifying which specific usage patterns fail is imprecise.

**Consequences:** If `on-surface-variant` is made brighter globally, it breaks the intentional subtle styling on decorative elements (borders, inactive nav items, muted labels) that are NOT meant to be read as primary content. If opacity-modified classes are fixed individually, there are potentially 50+ usage sites to update.

**Prevention:**
- Run a contrast audit first: identify each failing class specifically. The failures are likely in:
  - `text-gold-dim/60`, `text-gold-dim/70` in Sidebar.tsx
  - `text-on-surface-variant/60` in `UsageBar` and similar muted labels
  - Any text over the `glass-nav` or `glass-panel` backgrounds (which are `rgba(10, 9, 28, 0.85)` — slightly lighter than `#0d0b1e`)
- Fix strategy: introduce new token `text-on-surface-dim` at a higher absolute value rather than modifying existing tokens. This lets existing usages stay unchanged while new explicit usages use the accessible token.
- Do not change the base `on-surface-variant` token value — it is used in too many places. Add a new, accessible-specific token.
- For `text-gradient-gold` (uses `-webkit-text-fill-color: transparent`) — gradient text cannot be measured by standard contrast tools. This must be tested manually with color pickers at the rendered pixel level.

**Warning signs:** Changing a token value in `tailwind.config.ts` without auditing all usage sites. Fixing contrast on one page and introducing regression on another. Any contrast "fix" applied to a class used for both decorative and functional text.

**Phase:** Contrast audit must precede any token changes. Fix must be validated with a contrast checker tool (browser DevTools accessibility panel or axe) on every page that uses the modified tokens.

---

## Moderate Pitfalls

### Pitfall 7: Scroll Blocking Propagation From Chat Overlay to Main Content

**What goes wrong:** The existing `MobileNav` already uses `document.body.style.overflow = 'hidden'` to block background scroll when the nav is open. If the floating chat widget opens as an expanded overlay (chat history panel), it may also need scroll locking. If two components independently set and unset `document.body.style.overflow`, the race condition causes scroll to remain locked after the overlay closes. This is a documented React cleanup problem: if MobileNav is closed first (its `useEffect` cleanup fires, sets `overflow: ''`), then the chat overlay is still open and no longer holds the lock.

**Prevention:**
- Use a single centralized scroll-lock store (Zustand already exists) that counts how many overlays are requesting scroll lock. Only unlock when the count reaches zero:
  ```typescript
  // In Zustand store
  addScrollLock: () => set((s) => ({ scrollLockCount: s.scrollLockCount + 1 })),
  removeScrollLock: () => set((s) => ({ scrollLockCount: Math.max(0, s.scrollLockCount - 1) })),
  ```
- Apply `document.body.style.overflow = lockCount > 0 ? 'hidden' : ''` in a single root effect.
- This is a 30-line refactor but prevents an entire class of scroll-stuck bugs.

**Warning signs:** Multiple components calling `document.body.style.overflow` independently. Body remaining scroll-locked after closing any overlay. MobileNav cleanup and chat overlay cleanup not coordinated.

**Phase:** Implement before adding the floating chat overlay behavior.

---

### Pitfall 8: Sidebar Simplification Breaks Active State on Sub-Routes

**What goes wrong:** The current Sidebar active state logic is:
```typescript
const isActive = currentPath === item.href ||
  (item.href !== '/' && currentPath.startsWith(item.href));
```
This logic is sound for the current flat-ish structure. But under the simplification goal (fewer sidebar items), routes that were previously direct sidebar items may be grouped under a single parent entry. For example, if "אסטרולוגיה מתקדמת" section is collapsed into a single "אסטרולוגיה" entry pointing to `/tools/astrology`, then navigating to `/tools/astrology/transits` will match the shortened link correctly. But if the Sidebar item is removed entirely and the user navigates there via a link inside the astrology page, the sidebar shows nothing active — all sections collapse to their default state. The user has no sense of where they are.

**Prevention:**
- Before removing any sidebar item, verify that its route is reachable via other nav and has a `PageHeader` with a breadcrumb that indicates location.
- Map every removed item to a parent that will remain in the sidebar and whose `href` is a prefix of the removed route. The `startsWith` logic will then correctly highlight the parent.
- Keep the "מסע אישי" section items (Coach, Goals, Mood, Journal, Daily Insights) in the sidebar OR in the bottom tabs — not neither.

**Warning signs:** A page route with no matching sidebar item and no bottom tab. `PageHeader` breadcrumb showing the full path but sidebar showing no active item.

**Phase:** Navigation simplification phase.

---

### Pitfall 9: Glassmorphism Plus New Background Layers Cause Compositing Layer Explosion

**What goes wrong:** The root layout div already has `stars-bg aurora-bg` CSS classes. `layout-client.tsx` has three `position: fixed` blur blobs (`blur-[120px]`, `blur-[100px]`). The `glass-nav` and `glass-panel` classes apply `backdrop-filter: blur(20px)`. Each element with `backdrop-filter` forces the browser to create a separate GPU compositing layer for everything behind it. Adding a floating chat widget with `backdrop-filter` (or even `backdrop-blur` via Tailwind) creates another compositing layer. The browser then must composite Header layer + Sidebar layer + Chat bubble layer + three blob layers, each requiring GPU texture memory.

**Prevention:**
- The floating chat bubble must use a solid or semi-transparent background WITHOUT `backdrop-filter`. Use the existing `.mystic-card` class or a variant using `rgba(14, 12, 35, 0.92)` — opaque enough that no blur is needed.
- If a "glass" look is desired for the chat bubble, achieve it through a dark semi-transparent background with a gradient border using `box-shadow` inset — not `backdrop-filter`.
- Verify in Chrome DevTools Layers panel that adding the chat bubble does not increase the compositing layer count beyond what existed before.

**Warning signs:** `backdrop-blur` on the floating chat component. Compositing layer count visibly increasing in DevTools after adding chat widget. Chat bubble using any `backdrop-filter` variant.

**Phase:** Floating chat implementation.

---

### Pitfall 10: Bottom Tab Safe Area Conflict With Existing `body` Safe Area Padding

**What goes wrong:** `globals.css` already applies `env(safe-area-inset-*)` padding to the `body` element via `@supports`:
```css
body {
  padding-bottom: env(safe-area-inset-bottom);
}
```
On iPhone with a home indicator (iPhone X and later), `safe-area-inset-bottom` is 34px. The body already pushes content up by 34px. If the bottom tab bar is placed at the bottom with `h-16` (64px), the total required clearance for main content is 34px (safe area) + 64px (tab height) = 98px. But `main` currently has no `padding-bottom` — only `pt-16` for the header. Adding a bottom tab bar without also adding `pb-[calc(4rem+env(safe-area-inset-bottom))]` to main content means the last item on every page is hidden under the tab bar.

Additionally, the bottom tab bar itself should have its own `padding-bottom: env(safe-area-inset-bottom)` on its inner container (not the outer position wrapper) to push its content above the home indicator. If this is applied to the wrong element, the bar appears too tall on devices without a home indicator.

**Prevention:**
- The bottom tab bar root element: `position: fixed; bottom: 0; height: calc(4rem + env(safe-area-inset-bottom)); padding-bottom: env(safe-area-inset-bottom)`.
- The `<main>` element in `layout-client.tsx`: add `pb-[calc(4rem+env(safe-area-inset-bottom))]` Tailwind class on mobile, but only when bottom tabs are visible (`md:pb-0`).
- The `body` `@supports` block in globals.css should be reviewed — once bottom tabs handle their own safe area, the body `padding-bottom` may cause double-spacing on mobile.

**Warning signs:** Page content hidden under tab bar on any screen. Tab bar icon/label clipped by home indicator on iPhone. Body and tab bar both adding `safe-area-inset-bottom` independently.

**Phase:** Navigation simplification phase.

---

### Pitfall 11: Glowing Text Effects Break When Applied Over Gradient Text

**What goes wrong:** The codebase already uses `.text-gradient-gold` and `.text-gradient-mystic` which set `-webkit-text-fill-color: transparent` and use `background-clip: text`. Adding a CSS glow (`text-shadow`) to gradient text has no effect — `text-shadow` is applied to the text stroke, but gradient clip text renders the text as a background clip with a transparent fill. The text shadow has nothing to attach to and is invisible. Developers add `filter: drop-shadow(...)` instead, which works but applies to the entire element including padding, creating glow halos larger than intended.

**Prevention:**
- For glowing text effects on mystical headings, use `filter: drop-shadow(0 0 8px rgba(221, 184, 255, 0.6))` on the element — not `text-shadow`. Adjust blur radius to avoid halo on surrounding elements.
- Do not add `text-shadow` to any element that uses `background-clip: text` — it silently does nothing, wastes CSS, and creates confusion when the visual effect doesn't appear.
- Test glowing effects on Sidebar's `text-gradient-gold` heading (`MystiQor` logo). The `filter` approach works here; `text-shadow` does not.

**Warning signs:** `text-shadow` applied to any element with `.text-gradient-gold` or `.text-gradient-mystic`. `filter: drop-shadow` with radius > 16px causing visible halo effect on surrounding content.

**Phase:** Mystical atmosphere/animations phase.

---

### Pitfall 12: Service Worker Caches Old Navigation HTML After Route Changes

**What goes wrong:** MystiQor has a registered service worker (`/public/sw.js`). When the navigation structure changes (routes renamed, new bottom tab routes added, hamburger menu routes removed from the sidebar), the service worker may serve cached versions of HTML that reference old navigation structure. A user who visited the app before the navigation update and is offline or in a flaky network will see the old sidebar/navigation on the new pages. If a route is removed entirely and a user navigates to a cached old link, the service worker serves the old page — a route that no longer exists in the new nav.

**Prevention:**
- When deploying v1.3 navigation changes, increment the service worker cache version key. This invalidates all cached navigation HTML.
- The `sw.js` registration in `layout.tsx` is fire-and-forget (`catch(() => {})`). Add a `message` event listener to force the SW to update immediately: `navigator.serviceWorker.controller?.postMessage({ type: 'SKIP_WAITING' })`.
- After adding bottom tabs or changing route structure, test with DevTools Network tab set to Offline to verify the user sees a sensible error, not a broken cached page.
- If the navigation HTML is served with long cache headers, ensure the SW uses a network-first strategy for navigation requests (`/` and all HTML document requests), not cache-first.

**Warning signs:** Service worker `CACHE_VERSION` not incremented after nav changes. Testing only in online mode. No offline fallback page registered.

**Phase:** Final integration test of each navigation change phase.

---

## Minor Pitfalls

### Pitfall 13: RTL Direction Inversion on Floating Widget Position

**What goes wrong:** A floating chat bubble is conventionally positioned `bottom-right` in LTR layouts. In RTL (Hebrew), `end` is the right edge — `bottom: 1rem; end: 1rem` in CSS logical properties places the bubble in the bottom-right corner, which is visually bottom-left in RTL reading direction but physically correct for "end of line." However, if Tailwind classes are used (`bottom-4 right-4` instead of `bottom-4 end-4`), in RTL the bubble is still physically at the right — which is the start of the reading direction in Hebrew. This may feel wrong for some users who expect the floating action to be near the start of their reading flow.

**Prevention:**
- Always use logical properties: `bottom-4 end-4` (Tailwind) or `bottom: 1rem; inset-inline-end: 1rem` (CSS). Never `right-4` or `left-4` for positioned elements in this RTL app.
- Verify the chat bubble position feels natural in the Hebrew reading context. Bottom-right (physical) / bottom-start (logical) for RTL places it at the left edge of the screen — this is where Hebrew readers end a line, making it a natural position for "continue the conversation."
- The existing `MobileNav` correctly uses `end-0` — follow this pattern.

**Warning signs:** Any `right-4` or `left-4` used for the floating chat bubble. Chat bubble position not tested with the full RTL layout.

**Phase:** Floating chat implementation.

---

### Pitfall 14: Sidebar "All Sections Open" Default Creates 47-Item Scroll on Every Page Load

**What goes wrong:** `Sidebar.tsx` initializes all 8 sections as open:
```typescript
const [openSections, setOpenSections] = useState<Record<string, boolean>>(
  () => Object.fromEntries(NAV_SECTIONS.map((section) => [section.title, true]))
);
```
This means every page load renders all 47 navigation links immediately. This is not persisted to `localStorage`, so user preferences reset on every page refresh. For simplification, if the goal is to reduce visual clutter, collapsing non-primary sections by default is more effective than removing items. But this requires persisting user preference — if the user manually opens "אסטרולוגיה מתקדמת" it should remain open until they close it.

**Prevention:**
- Store open section state in `localStorage` (not Zustand — Zustand resets on page load without persistence middleware). Read initial state from storage, write on every toggle.
- Default open only the most-used sections: "ראשי" and "מסע אישי". Default-close "אסטרולוגיה מתקדמת", "מתקדם", "למידה", "היסטוריה ואנליטיקה", "חשבון".
- This effectively simplifies the sidebar without removing any items — reducing initial cognitive load from 47 to ~9 visible items.

**Warning signs:** Sidebar open state not persisted. All sections open on every refresh despite user closing them. localStorage key conflicts with any existing app storage.

**Phase:** Navigation simplification phase.

---

### Pitfall 15: Coach Floating Bubble Opens Full Coach Page Instead of Quick-Chat

**What goes wrong:** The goal is a "floating chat bubble in every page." If clicking the bubble navigates to `/coach` (the existing coach page), the user loses their context on the current page — they were on the astrology forecast and wanted to ask a quick question. Navigation-based coach access is not a floating widget; it is just a shortcut link. A true floating chat needs the conversation UI to expand in-place on the current page without navigation.

**Prevention:**
- The floating chat must render its own conversation state, separate from the full coach page. Use a Zustand store for the floating chat messages and conversation ID — this can share the same API endpoints (`/api/coach/messages`) as the full coach page.
- The floating chat shows the last 3-5 messages and an input. Full conversation history is still at `/coach`.
- Share conversation context between the floating chat and the full page by using the same `conversation_id` in the Zustand store. If a user opens `/coach` after using the floating chat, they see the same conversation continue.
- Do not duplicate the `ChatMessage` and `ChatInput` components — import them from `src/components/features/coach/`. The floating chat is a wrapper, not a new chat system.

**Warning signs:** Floating chat clicking navigates to `/coach` URL. Floating chat state is siloed and not shared with the main coach page. Duplicate chat component code in the floating widget.

**Phase:** Floating chat implementation.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|----------------|------------|
| Mystical animations | GPU overload from stacking on existing 8+ animations | Audit existing budget first; replace blob animations before adding new effects |
| Mystical animations | No prefers-reduced-motion support in any existing animation | Add global `@media (prefers-reduced-motion: reduce)` block as first task |
| Mystical animations | Gradient text with text-shadow silently fails | Use `filter: drop-shadow` instead |
| Floating chat widget | z-index collision with Header (z-50) and MobileNav (z-50) | Define global z-index scale before coding the widget |
| Floating chat widget | iOS virtual keyboard covers input in PWA mode | Implement `visualViewport` resize handler |
| Floating chat widget | backdrop-filter on bubble compounds GPU compositing load | Use solid/semi-opaque background on bubble, no blur |
| Floating chat widget | Scroll lock race with existing MobileNav scroll lock | Centralize scroll lock in Zustand store |
| Floating chat widget | Bubble is a nav link to /coach, not inline chat | Build in-place conversation with shared Zustand state |
| Navigation simplification | Bottom tabs + hamburger = three nav systems | Remove hamburger on mobile when bottom tabs are active |
| Navigation simplification | Main content bottom not padded for tab bar | Add `pb-[calc(4rem+env(safe-area-inset-bottom))]` to main on mobile |
| Navigation simplification | Active state broken for removed sidebar items | Map removed items to parent routes; verify breadcrumbs exist |
| Navigation simplification | Sidebar state resets on every refresh | Persist open/closed state to localStorage |
| Text contrast fixes | Changing a token breaks all its usages globally | Audit all usage sites; introduce new accessible token rather than modifying existing |
| Text contrast fixes | Opacity-modified classes fail where base token passes | Find `/60` and `/70` usage patterns — these are the actual failing cases |
| All visual changes | PWA service worker serves stale cached nav after changes | Increment cache version in sw.js for every nav structure change |
| All RTL elements | Physical position (right/left) used instead of logical (start/end) | Enforce `end-*` not `right-*` in all positioned elements |

---

## Sources

- `D:\AI_projects\MystiQor\mystiqor-build\src\app\(auth)\layout-client.tsx` — Existing animation layers, scroll lock pattern, z-index setup
- `D:\AI_projects\MystiQor\mystiqor-build\src\components\layouts\Sidebar.tsx` — 47-item nav, all-open default state, active route logic
- `D:\AI_projects\MystiQor\mystiqor-build\src\components\layouts\MobileNav.tsx` — z-50, scroll lock, RTL panel position
- `D:\AI_projects\MystiQor\mystiqor-build\src\components\layouts\Header.tsx` — z-50 fixed header, hamburger trigger
- `D:\AI_projects\MystiQor\mystiqor-build\src\app\globals.css` — Animation definitions, safe-area padding, no prefers-reduced-motion
- `D:\AI_projects\MystiQor\mystiqor-build\tailwind.config.ts` — Token values: on-surface-variant (#c8bede), surface (#0d0b1e), gold-dim (#b8913e)
- `D:\AI_projects\MystiQor\mystiqor-build\src\app\layout.tsx` — PWA service worker registration
- `D:\AI_projects\MystiQor\.planning\PROJECT.md` — v1.3 goals, existing system state
- Confidence: HIGH for pitfalls derived from direct source code inspection; MEDIUM for iOS PWA keyboard behavior and service worker patterns (based on well-documented browser behavior as of August 2025 cutoff)
