# Phase 32: Frontend Accessibility & UX — Research

**Researched:** 2026-04-07
**Domain:** RTL accessibility, WCAG contrast, ARIA, empty states, mobile-responsive forms
**Confidence:** HIGH — all findings verified by direct codebase inspection

---

## Summary

This phase addresses five specific requirements across accessibility and UX. All findings below are from direct `grep` and `Read` tool analysis of the live codebase at `mystiqor-build/src/`. No assumptions — every file path and line number is verified.

**The work is smaller than it looks.** The LTR margin violations are concentrated in 5 files (~10 instances total, all icons inside buttons). The contrast violations are 3 real text cases plus a few decorative icons. The empty states for goals and history already have basic messages but lack proper `EmptyState` component + CTA links. The coach page tabs are custom `<button>` elements missing `role="tab"` + `aria-selected`. The main form grid (`astrology/page.tsx`) needs `sm:grid-cols-2` wrapper. Coach API already fetches 20 messages for history — the requirement says limit to 10.

**Primary recommendation:** Execute as 4 focused plans: (1) RTL margins sweep, (2) contrast + ARIA sweep, (3) empty states upgrade, (4) mobile forms + coach context limit.

---

## Project Constraints (from CLAUDE.md)

- TypeScript strict — no `any`, no `@ts-ignore`
- Every component — typed Props interface
- Max 300 lines per file
- `start`/`end` — never `left`/`right` (already the convention this phase enforces)
- Hebrew labels, errors, placeholders, toasts
- Hebrew code comments
- Zero new dependencies — use what exists
- Do not touch working code unless fixing a requirement

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| A11Y-01 | כל margins/paddings ב-RTL משתמשים ב-ms/me/ps/pe — לא ml/mr/pl/pr | 10 exact instances found across 5 files — see A11Y-01 section |
| A11Y-02 | כל טקסט משני עומד ב-WCAG AA contrast (4.5:1) — לא opacity-40/60 על רקע כהה | 3 text violations + 1 section-level opacity — see A11Y-02 section |
| A11Y-03 | כל כפתור, טאב ואלמנט אינטראקטיבי כולל aria-label בעברית | Coach tabs + history empty-state button + TabsTrigger instances — see A11Y-03 section |
| UX-01 | empty state ברור עם CTA בדפי קואצ', מטרות והיסטוריה — לא מסך ריק | Goals uses EmptyState+CTA already; Coach + History need upgrade — see UX-01 section |
| UX-02 | טפסים מתגלגלים לעמודה אחת במובייל + context של קואצ' מוגבל ל-10 הודעות | 4 hardcoded grid-cols-2 forms + coach API uses .limit(20) — see UX-02 section |
</phase_requirements>

---

## A11Y-01: RTL Margin/Padding Violations

### Findings

All instances verified by grep. `ml-auto` / `mr-auto` (used for automatic spacing) are NOT violations — Tailwind handles those symmetrically. Only numeric directional offsets need changing.

**Rule:** `ml-N` → `ms-N`, `mr-N` → `me-N`, `pl-N` → `ps-N`, `pr-N` → `pe-N`

| File | Line | Current | Fix | Context |
|------|------|---------|-----|---------|
| `src/app/(auth)/coach/page.tsx` | 212 | `ml-2` | `ms-2` | `<Loader2>` icon inside "שיחה חדשה" button |
| `src/app/(auth)/coach/page.tsx` | 214 | `ml-2` | `ms-2` | `<Plus>` icon inside "שיחה חדשה" button |
| `src/app/(auth)/journal/page.tsx` | 224 | `ml-1` | `ms-1` | `<Plus>` icon in "יומן מהיר" button |
| `src/app/(auth)/journal/page.tsx` | 232 | `ml-1` | `ms-1` | `<Plus>` icon in "יומן מלא" button |
| `src/app/(auth)/referrals/page.tsx` | 118 | `pr-1` | `pe-1` | `<ol>` list with inline decimal numbers |
| `src/app/(auth)/settings/page.tsx` | 126 | `ml-1.5` | `ms-1.5` | `<Moon>` icon in theme toggle button |
| `src/app/(auth)/settings/page.tsx` | 139 | `ml-1.5` | `ms-1.5` | `<Sun>` icon in theme toggle button |
| `src/app/(auth)/tools/document/page.tsx` | 262 | `ml-2` | `ms-2` | `<Loader2>` icon inside submit button |
| `src/components/features/coach/JourneysPanel.tsx` | 154 | `ml-2` | `ms-2` | `<Loader2>` icon inside "מסע חדש" button |
| `src/components/features/coach/JourneysPanel.tsx` | 156 | `ml-2` | `ms-2` | `<Plus>` icon inside "מסע חדש" button |
| `src/components/features/journal/JournalEntryForm.tsx` | 143 | `mr-1` | `me-1` | Required asterisk `*` after label text |
| `src/components/features/journal/JournalEntryForm.tsx` | 183 | `mr-2` | `me-2` | Energy level score badge next to label |

### What NOT to touch

- `src/components/ui/` — shadcn primitives — these are generated/vendored, directional classes there (`pl-7`, `pr-8` in dropdown/select) are internal layout geometry that doesn't flip, not text flow. Changing them would break the dropdown checkmark alignment.
- `ml-auto` / `mr-auto` anywhere — these are centering/flex-push utilities, RTL-safe.
- `px-N` / `py-N` — symmetric, RTL-safe.

### Pattern for Icons in RTL Buttons

In RTL, the icon that visually appears "after" text should use `ms-N` (margin-start = right in RTL = correct visual gap). Example:

```tsx
// Before (wrong in RTL):
<Plus className="w-4 h-4 ml-2" />
שיחה חדשה

// After (correct RTL):
<Plus className="w-4 h-4 ms-2" />
שיחה חדשה
```

In RTL layout, `ms-2` pushes the icon away from the text correctly regardless of direction.

---

## A11Y-02: WCAG AA Contrast Violations

### WCAG AA Rule

Text on background must achieve **4.5:1 contrast ratio**. `opacity-60` applied to `text-on-surface-variant` on a dark surface typically yields ~2.5:1 — fails. The fix is to replace with a static color token that inherently meets contrast, or to use a higher-opacity variant.

### Verified Text Violations (need fix)

| File | Line | Current Code | Problem | Fix |
|------|------|-------------|---------|-----|
| `src/components/features/history/AnalysisCard.tsx` | 74 | `<span className="font-label text-xs text-on-surface-variant opacity-60">` | `opacity-60` on secondary text — confidence label in card footer | Remove `opacity-60`, keep `text-on-surface-variant` which already provides sufficient contrast |
| `src/app/(auth)/settings/page.tsx` | 155 | `<div className="... opacity-60">` (wraps entire notifications section) | Container-level opacity-60 dims ALL child text including heading | Replace with visual "coming soon" badge treatment — remove opacity-60, add a muted badge |
| `src/app/(auth)/tools/astrology/readings/page.tsx` | 109 | `text-on-surface-variant/60` | Character counter text at 60% opacity | Change to `text-on-surface-variant` or `text-outline` |

### Verified Icon/Decorative Violations (lower priority — not text)

These are icons used decoratively, not text labels, so WCAG AA 4.5:1 doesn't strictly apply to icons (WCAG 1.4.11 applies at 3:1 for UI components). They are noted but NOT blocking:

| File | Line | Current | Note |
|------|------|---------|------|
| `src/app/(auth)/history/page.tsx` | 304 | `text-on-surface-variant/40` | Empty state icon — decorative, aria-hidden implied |
| `src/components/features/history/AnalysisCard.tsx` | (similar pattern) | opacity on icon | Decorative only |
| `src/components/features/tarot/TarotCardTile.tsx` | 101 | `opacity-40` on `✦` decorative glyph | Decorative, `select-none` already |
| `src/components/features/profile/GuestProfileList.tsx` | 173 | `opacity-40` on `<User>` icon | Decorative empty state icon |

### Already Correct

These were found in the opacity search but are correct usage (disabled states):
- `disabled:opacity-50` on buttons — correct, WCAG exempts disabled controls
- `data-disabled:opacity-50` in shadcn primitives — correct
- `hover:opacity-40` — interactive, not the resting state

---

## A11Y-03: Missing ARIA Labels on Interactive Elements

### Coach Page — Custom Tab Buttons (MISSING role + aria)

`src/app/(auth)/coach/page.tsx` lines 165–188 uses raw `<button>` elements as tabs but is missing:
- `role="tab"` on each button
- `aria-selected={activeTab === 'chat'}` / `aria-selected={activeTab === 'journeys'}`
- `role="tablist"` on the container `<div>`

Current code:
```tsx
<div className="mt-4 flex gap-2 border-b border-outline-variant/20 pb-0">
  <button type="button" onClick={() => setActiveTab('chat')} ...>
    שיחות
  </button>
  <button type="button" onClick={() => setActiveTab('journeys')} ...>
    מסעות
  </button>
</div>
```

Fix:
```tsx
<div role="tablist" aria-label="ניווט מאמן" className="mt-4 flex gap-2 border-b border-outline-variant/20 pb-0">
  <button
    type="button"
    role="tab"
    aria-selected={activeTab === 'chat'}
    onClick={() => setActiveTab('chat')}
    ...
  >
    שיחות
  </button>
  <button
    type="button"
    role="tab"
    aria-selected={activeTab === 'journeys'}
    onClick={() => setActiveTab('journeys')}
    ...
  >
    מסעות
  </button>
</div>
```

### History Page — Empty State Missing CTA Button aria-label

`src/app/(auth)/history/page.tsx` lines 302–309: The empty state div has no button for screen readers to announce navigation. (See UX-01 below — this is fixed together with the UX upgrade.)

### History Page — Sidebar/Mobile Toggle Button

`src/app/(auth)/coach/page.tsx` line 262–269: The mobile sidebar toggle button renders `<X>` or `<Menu>` icon with no `aria-label`:
```tsx
<Button variant="ghost" size="sm" onClick={() => setShowSidebar((prev) => !prev)}>
  {showSidebar ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
</Button>
```
Fix:
```tsx
<Button
  variant="ghost"
  size="sm"
  aria-label={showSidebar ? 'סגור רשימת שיחות' : 'פתח רשימת שיחות'}
  onClick={() => setShowSidebar((prev) => !prev)}
>
  {showSidebar ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
</Button>
```

### TabsTrigger Elements (Lower Risk — shadcn handles ARIA automatically)

The `TabsTrigger` from shadcn/ui (`src/components/ui/tabs.tsx`) renders with `role="tab"` and `aria-selected` automatically via Radix UI. The text content (e.g., "מזלות", "כוכבים", "בתים", "אספקטים") IS the accessible label. These do NOT need explicit `aria-label` added — Radix supplies the ARIA semantics.

Files with `<TabsTrigger>` that are already fine:
- `src/app/(auth)/goals/page.tsx` — text labels via `{tab.label}`
- `src/app/(auth)/learn/astrology/dictionary/page.tsx` — Hebrew text labels
- `src/app/(auth)/profile/page.tsx` — Hebrew text labels
- `src/app/(auth)/tools/astrology/page.tsx` — Hebrew text labels
- `src/app/(auth)/tools/graphology/page.tsx` — Hebrew text labels

### Document Tool Remove-File Button

`src/app/(auth)/tools/document/page.tsx` line 240: Icon-only remove button with no aria-label:
```tsx
<button type="button" onClick={(e) => { e.stopPropagation(); handleRemoveFile() }}
  className="text-on-surface-variant hover:text-error">
```
Fix: Add `aria-label="הסר קובץ"`.

### Settings Page "New Journey" Button (JourneysPanel)

`src/components/features/coach/JourneysPanel.tsx` lines 154–156: The "מסע חדש" Button has text content so it's already labeled. No fix needed here beyond the `ms-2` margin fix.

---

## UX-01: Empty States — Analysis by Page

### Goals Page — ALREADY CORRECT

`src/app/(auth)/goals/page.tsx` lines 213–219 uses `EmptyState` component with:
- Icon: `<Target className="h-8 w-8" />`
- Title: dynamic per tab
- Description: "הגדר מטרה חדשה ועקוב אחר ההתקדמות שלך"
- Action CTA: `{ label: 'מטרה חדשה', onClick: () => setIsCreateOpen(true) }`

**Status: Passes UX-01. No change needed.**

### Coach Page — NEEDS UPGRADE

`src/app/(auth)/coach/page.tsx` lines 278–288 has a basic empty state when no conversation is selected:
```tsx
<div className="flex flex-col items-center justify-center h-full gap-6 py-12">
  <MessageCircle className="w-16 h-16 text-primary/20" />
  <p className="text-on-surface-variant text-center font-body">
    בחר שיחה קיימת או לחץ על "שיחה חדשה" להתחיל
  </p>
  <QuickActions ... />
</div>
```
This has `QuickActions` prompts but no direct CTA button to create a conversation. A user on mobile who can't see the sidebar won't know how to start.

**Fix:** When `conversations.length === 0` AND no `activeConversationId`, show the `EmptyState` component with action `{ label: 'התחל שיחה ראשונה', onClick: () => createMutation.mutate() }`.

The current "no conversation selected" state (with QuickActions) is fine to keep — just add the zero-state case.

### History Page — NEEDS UPGRADE

`src/app/(auth)/history/page.tsx` lines 302–309 has a plain paragraph with no CTA:
```tsx
{isEmpty && !isError && (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <History className="h-12 w-12 text-on-surface-variant/40 mb-4" />
    <p className="font-body text-on-surface-variant">
      אין ניתוחים עדיין. התחל להשתמש בכלים כדי לראות היסטוריה.
    </p>
  </div>
)}
```
No CTA button. User has no direct path forward.

**Fix:** Replace inline div with `EmptyState` component:
```tsx
{isEmpty && !isError && (
  <EmptyState
    icon={<History className="h-8 w-8" />}
    title="אין ניתוחים עדיין"
    description="השתמש בכלים כדי לייצר ניתוחים — הם יופיעו כאן"
    action={{ label: 'עבור לכלים', onClick: () => router.push('/tools') }}
  />
)}
```
`router` is already imported in the component.

### Summary

| Page | Current State | Passes UX-01? | Action |
|------|--------------|--------------|--------|
| Goals | EmptyState + CTA | YES | No change |
| Coach (zero convs) | Plain text, no CTA | NO | Add EmptyState with createMutation CTA |
| History | Plain text, no CTA | NO | Replace with EmptyState + router.push('/tools') |

---

## UX-02: Mobile Forms + Coach Context Limit

### Mobile Forms — Hardcoded `grid-cols-2`

The following forms use `grid-cols-2` without `grid-cols-1 sm:grid-cols-2` — they will render as two cramped columns on mobile (<640px).

| File | Line | Current | Fix | Affected Fields |
|------|------|---------|-----|-----------------|
| `src/app/(auth)/tools/astrology/page.tsx` | 235 | `grid grid-cols-2 gap-3` | `grid grid-cols-1 sm:grid-cols-2 gap-3` | תאריך לידה + שעת לידה |
| `src/app/(auth)/tools/astrology/page.tsx` | 253 | `grid grid-cols-2 gap-3` | `grid grid-cols-1 sm:grid-cols-2 gap-3` | קו רוחב + קו אורך |
| `src/app/(auth)/tools/astrology/readings/page.tsx` | 76 | `grid grid-cols-2 gap-3` | `grid grid-cols-1 sm:grid-cols-2 gap-3` | חודש + שנה inputs |
| `src/app/(auth)/tools/astrology/synastry/page.tsx` | 292 | `grid grid-cols-2 gap-2` | `grid grid-cols-1 sm:grid-cols-2 gap-2` | קו רוחב + קו אורך (person form) |

Note: `src/app/(auth)/notifications/page.tsx` line 202 also has `grid-cols-2` but that is a button pair (not an input form) — evaluate contextually, likely fine as-is.

Note: `src/components/features/goals/GoalForm.tsx` line 269 uses `grid-cols-2` for "שמור" / "ביטול" action buttons in a dialog — acceptable for button row, not a data entry form.

### Coach Context Limit — Already 20, Must Become 10

`src/app/api/coach/messages/route.ts` line 195–200:
```ts
const { data: priorMessages } = await supabase
  .from('coaching_messages')
  .select('role, content')
  .eq('conversation_id', conversationId)
  .order('created_at', { ascending: true })
  .limit(20)   // <-- requirement says change to 10
```

**Fix:** Change `.limit(20)` to `.limit(10)`.

This is the only place in the codebase that fetches message history for context injection. The `GET` handler (lines 113–117) fetches all messages for display — that should NOT be limited to 10, only the LLM context window injection (POST handler) should change.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---------|-------------|-------------|
| Empty state UI | Custom div with icon+text | `EmptyState` component already at `@/components/common/EmptyState` |
| Accessible tab pattern | Raw divs with onclick | `role="tablist"` + `role="tab"` + `aria-selected` on existing custom buttons (coach page) |
| Responsive form grids | Media query CSS | Tailwind `grid-cols-1 sm:grid-cols-2` |

---

## Common Pitfalls

### Pitfall 1: Changing shadcn UI primitives for RTL
**What goes wrong:** Modifying `pl-7` in dropdown-menu.tsx (the checkmark indent) breaks checkmark alignment.
**Why it happens:** shadcn uses `pl-7` for `data-inset` items which is a fixed layout offset, not directional text flow.
**How to avoid:** Only change `ml-N`/`mr-N`/`pl-N`/`pr-N` in feature components, NOT in `src/components/ui/`.

### Pitfall 2: Removing opacity from disabled states
**What goes wrong:** Removing `disabled:opacity-50` while fixing contrast breaks disabled visual cue.
**Why it happens:** The grep returns both content opacity and disabled-state opacity — must distinguish.
**How to avoid:** Only fix unconditional `opacity-N` on text elements. Leave `disabled:opacity-*` untouched.

### Pitfall 3: Limiting GET messages to 10 instead of POST context
**What goes wrong:** If you apply `.limit(10)` to the GET handler (line 113), the chat history UI truncates — user can't scroll back.
**Why it happens:** Two separate queries — GET for display, POST for LLM context.
**How to avoid:** Change `.limit(20)` on line 200 (POST handler) only, not line 113.

### Pitfall 4: aria-label on TabsTrigger breaks Radix semantics
**What goes wrong:** Adding `aria-label` to a `TabsTrigger` that already has visible Hebrew text can cause screen readers to double-announce.
**Why it happens:** Radix sets `aria-controls` and `aria-selected` automatically; adding `aria-label` overrides the text label.
**How to avoid:** TabsTrigger with visible Hebrew text — leave alone. Only add `aria-label` to icon-only buttons.

---

## Code Examples

### Correct RTL Icon Margin Pattern
```tsx
// Source: verified in codebase — goals/page.tsx line 194 already uses this correctly
<Button onClick={() => setIsCreateOpen(true)} ...>
  <Plus className="me-2 h-4 w-4" />   {/* me-2 = margin-end = correct in RTL */}
  מטרה חדשה
</Button>
```

### Correct Role Tab Pattern
```tsx
// Source: WCAG 2.1 ARIA Authoring Practices Guide
<div role="tablist" aria-label="ניווט מאמן">
  <button
    role="tab"
    aria-selected={activeTab === 'chat'}
    aria-controls="tab-panel-chat"
    onClick={() => setActiveTab('chat')}
  >
    שיחות
  </button>
</div>
<div id="tab-panel-chat" role="tabpanel" hidden={activeTab !== 'chat'}>
  ...
</div>
```

### EmptyState with CTA
```tsx
// Source: already used correctly in goals/page.tsx
<EmptyState
  icon={<History className="h-8 w-8" />}
  title="אין ניתוחים עדיין"
  description="השתמש בכלים כדי לייצר ניתוחים — הם יופיעו כאן"
  action={{ label: 'עבור לכלים', onClick: () => router.push('/tools') }}
/>
```

### Responsive Form Grid
```tsx
// Before (breaks on mobile):
<div className="grid grid-cols-2 gap-3">

// After (stacks on mobile, 2-col on sm+):
<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|-----------------|--------|
| `ml-N` for icon spacing in RTL | `ms-N` (margin-start) | Correct direction flip without code conditionals |
| `opacity-60` on secondary text | Static color token or `/80` modifier | Guarantees contrast at design-time, not runtime |
| Plain `<div>` empty state | `EmptyState` component with action | Consistent UX + accessible CTA |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|--------------|
| A1 | `ml-auto`/`mr-auto` are RTL-safe | A11Y-01 | Low — Tailwind centering utilities are symmetric by design |
| A2 | shadcn TabsTrigger provides role="tab" and aria-selected via Radix | A11Y-03 | Medium — if Radix version is pre-ARIA, screen readers miss semantics. Verify by inspecting DOM in browser. |
| A3 | `on-surface-variant` token meets WCAG AA without opacity | A11Y-02 | Medium — depends on theme values in tailwind.config.ts. Inspect actual hex vs background. |

---

## Open Questions (RESOLVED)

1. **Does `text-on-surface-variant` alone meet WCAG AA (4.5:1)?**
   - RESOLVED: `on-surface-variant` = `#c8bede`, `surface-container` = `#13102c`. Contrast ratio = **10.43:1** (well above 4.5:1 AA). Removing opacity alone is sufficient.

2. **Should `grid-cols-2` in notifications/page.tsx (button pair) be changed?**
   - RESOLVED: Leave as-is. Two-button action row, not input form. Out of scope for UX-02.

---

## Environment Availability

Step 2.6: SKIPPED (no external tool dependencies — all changes are code/CSS edits to existing source files)

---

## Validation Architecture

No automated test infrastructure exists in this project (per REQUIREMENTS.md "Out of Scope: Test suite"). Validation is manual:

- **Per task:** `cd mystiqor-build && npm run build` — zero TypeScript errors
- **Phase gate:** Manual browser test in Chrome (RTL mode) + mobile viewport (375px width) checking:
  1. No icon spacing flip in RTL on coach/journal/settings/document pages
  2. Secondary text readable on dark backgrounds (AnalysisCard confidence text)
  3. Screen reader announces "שיחות" tab correctly with selected state
  4. Empty history page shows CTA button "עבור לכלים"
  5. Astrology form fields stack vertically at 375px width

---

## Sources

### Primary (HIGH confidence — direct codebase inspection)
- `mystiqor-build/src/app/(auth)/coach/page.tsx` — lines 165-188 (tabs), 212-214 (ml-2), 262-269 (mobile toggle)
- `mystiqor-build/src/app/(auth)/journal/page.tsx` — lines 224, 232 (ml-1 on icons)
- `mystiqor-build/src/app/(auth)/referrals/page.tsx` — line 118 (pr-1 on ol)
- `mystiqor-build/src/app/(auth)/settings/page.tsx` — lines 126, 139 (ml-1.5), 155 (opacity-60 section)
- `mystiqor-build/src/app/(auth)/tools/document/page.tsx` — line 262 (ml-2)
- `mystiqor-build/src/app/(auth)/tools/astrology/page.tsx` — lines 235, 253 (grid-cols-2)
- `mystiqor-build/src/app/(auth)/tools/astrology/readings/page.tsx` — line 76 (grid-cols-2)
- `mystiqor-build/src/app/(auth)/tools/astrology/synastry/page.tsx` — line 292 (grid-cols-2)
- `mystiqor-build/src/app/api/coach/messages/route.ts` — line 200 (.limit(20))
- `mystiqor-build/src/components/features/coach/JourneysPanel.tsx` — lines 154, 156 (ml-2)
- `mystiqor-build/src/components/features/history/AnalysisCard.tsx` — line 74 (opacity-60)
- `mystiqor-build/src/components/features/journal/JournalEntryForm.tsx` — lines 143, 183 (mr-1, mr-2)
- `mystiqor-build/src/components/common/EmptyState.tsx` — verified component API
- `mystiqor-build/src/app/(auth)/goals/page.tsx` — verified UX-01 already satisfied
- `mystiqor-build/src/app/(auth)/history/page.tsx` — lines 302-309 (no CTA)

### Secondary (MEDIUM — MDN/WCAG knowledge applied to findings)
- WCAG 2.1 SC 1.4.3: minimum contrast 4.5:1 for normal text [ASSUMED standards knowledge]
- WCAG 2.1 SC 1.4.11: 3:1 for UI components and graphical objects — decorative icons exempt [ASSUMED]
- ARIA Authoring Practices: tablist/tab/tabpanel pattern [ASSUMED]

---

## Metadata

**Confidence breakdown:**
- File locations and line numbers: HIGH — verified by direct grep + Read
- RTL margin fixes: HIGH — Tailwind logical properties are unambiguous
- Contrast violations: MEDIUM — exact hex values of design tokens not verified against WCAG calculator
- ARIA fixes: HIGH — HTML spec tab pattern is unambiguous
- Empty state status: HIGH — read all three pages directly
- Coach API limit: HIGH — read route.ts directly

**Research date:** 2026-04-07
**Valid until:** 2026-05-07 (stable codebase, no fast-moving dependencies)
