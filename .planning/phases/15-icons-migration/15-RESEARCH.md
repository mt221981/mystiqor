# Phase 15: Icons Migration - Research

**Researched:** 2026-03-27
**Domain:** React icon library migration — lucide-react → react-icons/gi
**Confidence:** HIGH

## Summary

Phase 15 migrates thematic icons from generic lucide-react to react-icons/gi (Game Icons) across the MystiQor app. The goal is visual consistency: every tool-level, dashboard, and shared-component icon must match the mystical/esoteric theme already established by the Sidebar.

The Sidebar is the reference implementation. It already uses a full set of react-icons/gi icons for all tool and feature navigation items. The problem is that the pages themselves — and several shared components — still render lucide-react icons at the same visual slots (PageHeader icons, StatCard icons, dashboard hero icons). This creates an inconsistency: the nav icon and the page header icon for the same tool are different visual languages.

Both libraries are already installed (`react-icons@5.6.0`, `lucide-react@0.577.0`). No dependency changes are needed. The migration is purely a find-and-replace at the import and JSX levels.

A pre-existing 15-01-SUMMARY.md in `.planning/phases/15-icons-migration/` was written as a planning artifact during an earlier session but commit `58031dd` does not exist in git — the code has NOT been changed yet. Research confirmed the current codebase still uses lucide-react icons in all locations identified below.

**Primary recommendation:** Migrate exactly the icons listed in this research document (split into Wave 1: tool pages, Wave 2: dashboard + shared components, Wave 3: Header + remaining UI pages). Preserve all generic UI icons (Loader2, ChevronDown/Up, X, Plus, AlertTriangle, RotateCcw, etc.) as lucide-react — those are functional/structural icons, not thematic ones.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ICON-01 | כל 16 עמודי הכלים מציגים אייקוני react-icons/gi תמטיים במקום lucide-react | Confirmed: 5 tool page PageHeaders still use lucide icons; 11 already use react-icons/gi |
| ICON-02 | StatCards, DailyInsightCard, PeriodSelector בדשבורד מציגים אייקונים מיסטיים | Confirmed: StatCards uses SmilePlus, CheckCircle, Bell (lucide); DailyInsightCard already uses GiSparkles; PeriodSelector has no icons (text-only) |
| ICON-03 | MobileNav ו-Header תואמים ויזואלית ל-Sidebar עם אותם אייקוני react-icons/gi | MobileNav wraps Sidebar (already gi); Header uses only generic UI icons — partial change needed |
| ICON-04 | EmptyState, ErrorBoundary, LoadingSpinner משתמשים באייקונים מיסטיים | EmptyState already uses GiCrystalBall; LoadingSpinner already uses GiSparkles; ErrorBoundary uses AlertTriangle, RotateCcw, Home, Copy (all functional — keep or swap decorative ones) |
| ICON-05 | PageHeader בכל העמודים מציג אייקון react-icons/gi תואם לנושא העמוד | 5 tool pages + 4 learn/other pages still use lucide in their PageHeader icon prop |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- TypeScript strict — no `any`, no `@ts-ignore`
- Every component — typed Props interface (icon type is `React.ComponentType<{ className?: string }>` in Sidebar — use same pattern)
- Hebrew code comments (JSDoc)
- Max 300 lines per file
- Imports — absolute `@/` paths
- **NEVER break working code to chase a higher score**
- **NEVER rewrite something that already works** — only change the icon imports and JSX, nothing else

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-icons | 5.6.0 | Game Icons (GI) thematic icon set | Already installed; Sidebar reference uses it; gi = Game Icons = fantasy/RPG/mystical theme |
| lucide-react | 0.577.0 | Generic UI icons (kept for structural icons) | Already installed; shadcn/ui integration; Chevrons, Loaders, X, Plus etc. stay here |

### No installation needed
Both libraries are already in `package.json` and `node_modules`. This phase requires zero dependency changes.

## Architecture Patterns

### Icon Type Compatibility

react-icons components and lucide-react components share the same prop interface for `className`. Both accept `{ className?: string; size?: number; ... }`. They are drop-in replacements at the JSX level.

```typescript
// Both patterns work identically in JSX:
<GiAbacus className="h-5 w-5" />
<Hash className="h-5 w-5" />

// Icon as a prop (Sidebar pattern — works for both libraries):
readonly icon: React.ComponentType<{ className?: string }>;
```

### The Two Icon Categories

**Category A — Thematic icons (migrate to react-icons/gi):**
These appear in positions that define the mystical identity of the app: PageHeader icon prop, StatCard icons, dashboard hero icons, nav icons. They should all be react-icons/gi.

**Category B — Generic UI icons (keep as lucide-react):**
These are functional/structural: chevrons, loaders, close buttons, trash, pencil, send, check marks, alert triangles, error indicators. They are invisible to the mystical theme and should remain lucide-react.

### Sidebar Reference Icon Map (CONFIRMED — already implemented)

The Sidebar is the ground truth. Every tool page's PageHeader icon MUST match the Sidebar's icon for that route:

| Route | Sidebar Icon | Source |
|-------|-------------|--------|
| /tools/numerology | `GiAbacus` | Sidebar.tsx:13 |
| /tools/astrology | `GiAstrolabe` | Sidebar.tsx:14 |
| /tools/graphology | `GiQuillInk` | Sidebar.tsx:15 |
| /tools/drawing | `GiPaintBrush` | Sidebar.tsx:16 |
| /tools/palmistry | `GiHandOfGod` | Sidebar.tsx:17 |
| /tools/tarot | `GiCardRandom` | Sidebar.tsx:18 |
| /tools/human-design | `GiBodyBalance` | Sidebar.tsx:19 |
| /tools/dream | `GiDreamCatcher` | Sidebar.tsx:20 |
| /tools/astrology/forecast | `GiSunRadiations` | Sidebar.tsx:21 |
| /tools/astrology/calendar | `GiCalendar` | Sidebar.tsx:22 |
| /tools/astrology/transits | `GiCompass` | Sidebar.tsx:23 |
| /tools/astrology/solar-return | `GiSunRadiations` | Sidebar.tsx:24 |
| /tools/astrology/synastry | `GiLovers` | Sidebar.tsx:25 |
| /tools/compatibility | `GiHearts` | Sidebar.tsx:26 |
| /tools/career | `GiBriefcase` | Sidebar.tsx:27 |
| /tools/document | `GiScrollUnfurled` | Sidebar.tsx:28 |
| /tools/relationships | `GiLovers` | Sidebar.tsx:29 |
| /tools/synthesis | `GiAllSeeingEye` | Sidebar.tsx:30 |
| /tools/personality | `GiMirrorMirror` | Sidebar.tsx:31 |
| /tools/daily-insights | `GiLightBulb` | Sidebar.tsx:32 |

## Complete Icon Audit

### Current State: react-icons/gi Already in Place (no change needed)

These files already use react-icons/gi correctly:

| File | Icon Already Used | Status |
|------|------------------|--------|
| `components/layouts/Sidebar.tsx` | Full GI set (reference) | DONE |
| `components/common/EmptyState.tsx` | `GiCrystalBall` | DONE |
| `components/common/LoadingSpinner.tsx` | `GiSparkles` | DONE |
| `components/features/dashboard/DailyInsightCard.tsx` | `GiSparkles` | DONE |
| `components/features/dashboard/StatCards.tsx` | `GiTargetArrows` (partial — 3 others still lucide) | PARTIAL |
| `components/features/shared/ToolGrid.tsx` | Full GI set | DONE |
| `app/(auth)/tools/numerology/page.tsx` | `GiAbacus` in PageHeader | DONE |
| `app/(auth)/tools/astrology/page.tsx` | `GiAstrolabe` in PageHeader | DONE |
| `app/(auth)/tools/graphology/page.tsx` | `GiQuillInk` in PageHeader | DONE |
| `app/(auth)/tools/drawing/page.tsx` | `GiPaintBrush` in PageHeader | DONE |
| `app/(auth)/tools/palmistry/page.tsx` | `GiHandOfGod` in PageHeader | DONE |
| `app/(auth)/tools/tarot/page.tsx` | `GiCardRandom` in PageHeader | DONE |
| `app/(auth)/tools/human-design/page.tsx` | `GiBodyBalance` in PageHeader | DONE |
| `app/(auth)/tools/dream/page.tsx` | `GiDreamCatcher` in PageHeader | DONE |
| `app/(auth)/tools/astrology/forecast/page.tsx` | `GiSunRadiations` in PageHeader | DONE |
| `app/(auth)/tools/astrology/calendar/page.tsx` | `GiCalendar` in PageHeader | DONE |
| `app/(auth)/tools/astrology/transits/page.tsx` | `GiCompass` in PageHeader | DONE |
| `app/(auth)/tools/astrology/solar-return/page.tsx` | `GiSunRadiations` in PageHeader | DONE |
| `app/(auth)/tools/astrology/synastry/page.tsx` | `GiLovers` in PageHeader | DONE |
| `app/(auth)/tools/compatibility/page.tsx` | `GiHearts` in PageHeader | DONE |
| `app/(auth)/tools/career/page.tsx` | `GiBriefcase` in PageHeader | DONE |
| `app/(auth)/tools/personality/page.tsx` | `GiMirrorMirror` in PageHeader | DONE |

### Files That Need Changes

**Wave 1 — Tool PageHeader icons using lucide (5 files):**

| File | Current lucide Icon | Replace With (gi) | Sidebar Match |
|------|--------------------|--------------------|---------------|
| `app/(auth)/tools/timing/page.tsx` | `Calendar` | `GiCalendar` (or `GiHourglass` — timing themed) | No sidebar entry — use `GiHourglass` |
| `app/(auth)/tools/document/page.tsx` | `FileText` | `GiScrollUnfurled` | Sidebar: GiScrollUnfurled |
| `app/(auth)/tools/synthesis/page.tsx` | `Sparkles` | `GiAllSeeingEye` | Sidebar: GiAllSeeingEye |
| `app/(auth)/tools/daily-insights/page.tsx` | `Sparkles` | `GiLightBulb` | Sidebar: GiLightBulb |
| `app/(auth)/tools/relationships/page.tsx` | `Heart` | `GiLovers` | Sidebar: GiLovers |

**Wave 2 — Dashboard StatCards (1 file, 3 icons):**

| File | Current lucide Icons | Replace With (gi) |
|------|---------------------|-------------------|
| `components/features/dashboard/StatCards.tsx` | `SmilePlus` (mood), `CheckCircle` (completed goals), `Bell` (reminders) | `GiSmile` or `GiFaceToFace` (mood), `GiCheckMark` or `GiStarMedal` (completed), `GiBell` or `GiSpikedFence`... |

Note: react-icons/gi may not have direct equivalents for all three. Research below covers this.

**Wave 3 — Header thematic icons (1 file, 1 icon):**

| File | Current lucide Icon | Replace With (gi) | Notes |
|------|--------------------|--------------------|-------|
| `components/layouts/Header.tsx` | `Sparkles` (logo on mobile) | `GiSparkles` | Only the logo sparkle — UI icons (Sun, Moon, Menu, User, LogOut, Settings) stay lucide |

**Wave 4 — InsightHeroCard (1 file, up to 3 icons):**

| File | Current lucide Icons | Replace With (gi) |
|------|---------------------|-------------------|
| `components/features/daily-insights/InsightHeroCard.tsx` | `Sparkles`, `Star`, `Lightbulb` | `GiSparkles`, `GiStarShuriken` or `GiStaryu`, `GiLightBulb` |

**Wave 5 — Learn page PageHeaders (2 files):**

| File | Current lucide Icon | Replace With (gi) |
|------|--------------------|--------------------|
| `app/(auth)/learn/astrology/page.tsx` | `Stars` | `GiAstrolabe` |
| `app/(auth)/learn/drawing/page.tsx` | `Palette` | `GiPaintBrush` |

**ErrorBoundary — judgment call (1 file):**

The ErrorBoundary uses `AlertTriangle` (error state icon), `RotateCcw` (retry button icon), `Home` (home button icon), `Copy` (copy button icon). These are all functional/structural icons inside buttons. Per the CLAUDE.md "never break working code" principle and the phase goal (thematic icons), the decorative AlertTriangle icon at the top could become `GiDeathSkull` or `GiWarning` but this is LOW priority. Recommendation: leave ErrorBoundary as lucide-react — it's a system/error component, not a mystical feature.

### Files to Leave Unchanged (confirmed lucide-react is correct)

Generic UI icons — these are functional, not thematic:

| File | Icons | Reason to Keep |
|------|-------|---------------|
| `components/layouts/MobileNav.tsx` | `X` (close button) | Pure UI, wraps Sidebar which already has gi |
| `components/common/Breadcrumbs.tsx` | `ChevronLeft` | Navigation chevron, structural |
| `components/common/ErrorBoundary.tsx` | `AlertTriangle`, `RotateCcw`, `Home`, `Copy` | Functional/error state icons in action buttons |
| `components/features/dashboard/PeriodSelector.tsx` | (none) | Text-only component, no icons |
| All files using `Loader2`, `ChevronDown`, `ChevronUp`, `X`, `Plus`, `Trash2`, `Pencil`, `Check`, `AlertTriangle` | UI utility icons | Keep as lucide — they are structural |

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Icon abstraction layer | Don't create an `<Icon name="..." />` wrapper | Just import directly from react-icons/gi | Adds indirection, breaks tree-shaking, unnecessary complexity for a mature app |
| Icon constants file | Don't centralize icons in one ICON_MAP file | Import in each component | react-icons supports tree-shaking per icon; the Sidebar pattern (direct import) is proven |
| Custom SVG mystical icons | Don't hand-draw SVGs | react-icons/gi has 4000+ game/fantasy icons | react-icons/gi is already the source of truth in this project |

**Key insight:** The Sidebar already established the correct pattern. Every other component should follow `import { GiXxx } from 'react-icons/gi'` directly — no abstraction.

## react-icons/gi Icon Selection Guide

Game Icons (gi) are from the gameicons.net collection — they cover fantasy, RPG, occult, mystical themes thoroughly. Confirmed icons already in use in this project:

| GI Icon | Visual | Used For |
|---------|--------|---------|
| `GiAbacus` | Abacus beads | Numerology |
| `GiAstrolabe` | Navigation device | Astrology |
| `GiQuillInk` | Quill pen | Graphology |
| `GiPaintBrush` | Paint brush | Drawing |
| `GiHandOfGod` | Open hand | Palmistry |
| `GiCardRandom` | Playing card | Tarot |
| `GiBodyBalance` | Balanced figure | Human Design |
| `GiDreamCatcher` | Dream catcher | Dreams |
| `GiSunRadiations` | Sun with rays | Solar/Forecast |
| `GiCalendar` | Calendar page | Calendar/Timing |
| `GiCompass` | Compass rose | Transits |
| `GiLovers` | Two figures | Synastry/Relationships |
| `GiHearts` | Heart suit | Compatibility |
| `GiBriefcase` | Briefcase | Career |
| `GiScrollUnfurled` | Unrolled scroll | Document |
| `GiAllSeeingEye` | Eye of providence | Synthesis |
| `GiMirrorMirror` | Mirror | Personality |
| `GiSparkles` | Stars/sparkles | Daily insights/Loading/Logo |
| `GiTargetArrows` | Archery target | Goals |
| `GiNotebook` | Notebook | Journal |
| `GiLightBulb` | Light bulb | Daily insights |
| `GiGraduateCap` | Graduation cap | Tutorials |
| `GiNewspaper` | Newspaper | Blog |
| `GiMountainRoad` | Road in mountains | Journey |
| `GiCrystalBall` | Crystal ball | Empty state/Coach |

**New icons needed for this phase:**

| Use Case | Recommended GI Icon | Notes |
|----------|---------------------|-------|
| Timing/timing tool | `GiHourglass` | No sidebar entry for timing; hourglass = time |
| Mood/SmilePlus | `GiFaceToFace` or `GiSmile` | Verify these exist in gi v5 — see pitfall below |
| Completed goals/CheckCircle | `GiStarMedal` or `GiTrophyCup` | Medal for achievement |
| Reminders/Bell | `GiBell` | Direct equivalent exists in gi |
| Stars (learn/astrology) | `GiAstrolabe` | Already matches Sidebar icon for astrology |
| Palette (learn/drawing) | `GiPaintBrush` | Already matches Sidebar icon for drawing |
| Sparkles (InsightHeroCard hero) | `GiSparkles` | Already used in LoadingSpinner |
| Star (InsightHeroCard section) | `GiStarShuriken` or `GiStaryu` | Verify availability |
| Lightbulb (InsightHeroCard tip) | `GiLightBulb` | Already in Sidebar |

## Common Pitfalls

### Pitfall 1: GI Icon Name Availability
**What goes wrong:** Assuming an icon like `GiSmile` exists in react-icons/gi — it may not. react-icons/gi covers game/fantasy themes, not general UI themes like "smile face."
**Why it happens:** react-icons/gi is not a general icon set — it's game-specific.
**How to avoid:** Before using any new GI icon, verify it exists: `import { GiXxx } from 'react-icons/gi'` and check TypeScript doesn't error. The planner must confirm each new icon name compiles.
**Warning signs:** TypeScript error "Module 'react-icons/gi' has no exported member 'GiXxx'"
**Fallback strategy:** If a perfect gi equivalent doesn't exist for StatCards (mood, completed, reminders), use thematically closest: `GiHealing` for mood, `GiLaurelCrown` for completed, `GiAlarmClock` for reminders.

### Pitfall 2: Removing Needed lucide Imports
**What goes wrong:** Deleting the entire `from 'lucide-react'` import line when migrating PageHeader icon — but the file still uses other lucide icons (Loader2, ChevronDown, AlertTriangle etc.)
**Why it happens:** Find-and-replace mentality on import lines.
**How to avoid:** After removing the thematic icon from the lucide import, check if any other lucide icons are still used in the file. Only remove the import line if ALL lucide icons are replaced.
**Warning signs:** TypeScript error "cannot find name 'Loader2'" after migration.

### Pitfall 3: Breaking the PageHeader icon Size
**What goes wrong:** PageHeader wraps the icon in a `h-10 w-10` container but the icon itself should be `h-5 w-5` — using wrong size class on the icon.
**Why it happens:** Copying icon usage from Sidebar (which uses `h-[18px] w-[18px]`) into PageHeader context.
**How to avoid:** All existing PageHeader usages use `className="h-5 w-5"` on the icon component. Keep that exact class. Example: `icon={<GiScrollUnfurled className="h-5 w-5" />}`

### Pitfall 4: react-icons/gi size prop vs className
**What goes wrong:** Using `size={20}` prop instead of `className="h-5 w-5"` — causes inconsistent sizing with Tailwind.
**Why it happens:** react-icons supports both `size` prop and `className`.
**How to avoid:** Always use `className` with Tailwind classes to match the project's existing pattern. Never use the `size` prop — the rest of the codebase uses Tailwind sizing.

### Pitfall 5: StatCards icon type mismatch
**What goes wrong:** `STAT_CARD_DEFINITIONS` uses `Icon: SmilePlus` (lucide) where `SmilePlus` is a Lucide component. Replacing with react-icons/gi component should work identically since both accept `className?: string`.
**Why it happens:** Concern that the icon type in the array might be typed as `LucideIcon`.
**How to avoid:** Check current type — `STAT_CARD_DEFINITIONS` uses `Icon: GiTargetArrows` already for the first card (CONFIRMED). The type is inferred, not explicit `LucideIcon`. Direct replacement works.

## Code Examples

### Pattern: PageHeader with react-icons/gi icon
```typescript
// Source: app/(auth)/tools/numerology/page.tsx (confirmed working)
import { GiAbacus } from 'react-icons/gi'
import { PageHeader } from '@/components/layouts/PageHeader'

<PageHeader
  title="נומרולוגיה"
  description="חישוב 5 מספרים נומרולוגיים עבריים..."
  icon={<GiAbacus className="h-5 w-5" />}
  breadcrumbs={[...]}
/>
```

### Pattern: StatCard Icon in array
```typescript
// Source: components/features/dashboard/StatCards.tsx (confirmed working)
import { GiTargetArrows } from 'react-icons/gi';
// GiTargetArrows is already used in position 0 of the array.
// Pattern for adding more:
{
  key: 'currentMoodScore' as const,
  label: 'ציון מצב רוח',
  description: 'ממוצע 7 ימים',
  Icon: GiFaceToFace,  // replace SmilePlus
  format: (v: number) => (v > 0 ? `${v.toFixed(1)}/10` : '—'),
},
```

### Pattern: Sidebar icon (component type — also works for react-icons/gi)
```typescript
// Source: components/layouts/Sidebar.tsx
interface NavItem {
  readonly icon: React.ComponentType<{ className?: string }>;
}
// react-icons/gi components satisfy this interface natively
```

### Pattern: Mixed imports after migration (keep both libraries)
```typescript
// Source: pattern established in app/(auth)/tools/timing/page.tsx (before migration)
// BEFORE:
import { Calendar, Star, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'
// AFTER:
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'  // keep functional icons
import { GiHourglass } from 'react-icons/gi'  // add thematic icon
```

## Validation Architecture

nyquist_validation is enabled in config.json.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (vitest.config.ts present) |
| Config file | `mystiqor-build/vitest.config.ts` |
| Quick run command | `cd mystiqor-build && npx tsc --noEmit` |
| Full suite command | `cd mystiqor-build && npm run build` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ICON-01 | Tool pages have gi icons in PageHeader | TypeScript check | `npx tsc --noEmit` | N/A — TS compilation |
| ICON-02 | StatCards dashboard uses gi icons | TypeScript check | `npx tsc --noEmit` | N/A — TS compilation |
| ICON-03 | Header mobile logo uses gi icon | TypeScript check | `npx tsc --noEmit` | N/A — TS compilation |
| ICON-04 | EmptyState/LoadingSpinner/ErrorBoundary | Manual visual | — | N/A — already done for 2/3 |
| ICON-05 | All PageHeaders have gi icon | TypeScript check | `npx tsc --noEmit` | N/A — TS compilation |

**Note:** Icon migrations have no unit test coverage path — they are visual changes. Validation is via TypeScript compilation (zero errors) + build pass + manual visual inspection. The existing 15-01-SUMMARY.md confirms `npx tsc --noEmit` as the acceptance gate.

### Sampling Rate
- **Per task commit:** `cd mystiqor-build && npx tsc --noEmit`
- **Per wave merge:** `cd mystiqor-build && npm run build`
- **Phase gate:** Build passes + zero TypeScript errors before `/gsd:verify-work`

### Wave 0 Gaps
None — no new test files needed. Icon migration is validated by TypeScript compilation only.

## Environment Availability

Step 2.6: This phase is code-only changes with no external dependencies beyond Node.js and the already-installed packages.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| react-icons | Icon migration | Yes | 5.6.0 | — |
| lucide-react | Preserved icons | Yes | 0.577.0 | — |
| TypeScript | Compilation check | Yes | via Next.js | — |

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| lucide-react everywhere | react-icons/gi for thematic, lucide for structural | Phase 15 (this phase) | Visual consistency with mystical brand |
| Sidebar inconsistent with pages | Sidebar is reference — pages must match | Phase 15 | Cohesive navigation identity |

## Open Questions

1. **GI icon availability for StatCards**
   - What we know: `GiTargetArrows` works for "active goals". We need mood, completed goals, reminders equivalents.
   - What's unclear: `GiSmile`, `GiFaceToFace`, `GiTrophyCup`, `GiBell` — not verified in react-icons/gi v5.
   - Recommendation: During planning, specify the exact icon names AND include a TypeScript-verified fallback for each. Planner should add a Wave 2 task that explicitly checks for icon existence with `import { GiXxx } from 'react-icons/gi'` compilation test.

2. **InsightHeroCard — thematic vs structural icons**
   - What we know: `Sparkles`, `Star`, `Lightbulb` are used as section headers inside the card.
   - What's unclear: Are these prominent enough to warrant migration, or are they presentational/secondary?
   - Recommendation: Migrate `Sparkles` → `GiSparkles` (already established pattern), `Star` → `GiStarShuriken`, `Lightbulb` → `GiLightBulb`. Verify icon names compile.

3. **Header Sparkles vs GiSparkles**
   - What we know: Header uses `Sparkles` (lucide) for the mobile logo. Sidebar uses `GiSparkles` for the same logo slot.
   - What's unclear: Whether this counts as ICON-03 scope.
   - Recommendation: ICON-03 says "MobileNav and Header match Sidebar visually with same react-icons/gi icons." The logo in Header should become `GiSparkles` to match the Sidebar logo. Change only this one icon; all other Header icons (Sun, Moon, Menu, User, LogOut, Settings) stay lucide.

## Sources

### Primary (HIGH confidence)
- Direct codebase grep — all icon import lines enumerated from `src/` directory
- `Sidebar.tsx` — reference implementation, lines 11-37
- `package.json` — confirmed react-icons@5.6.0, lucide-react@0.577.0

### Secondary (MEDIUM confidence)
- react-icons/gi documentation — gi icons are from gameicons.net, 4000+ icons, all prefixed `Gi`
- Previously confirmed icon names (GiSparkles, GiLightBulb, GiHourglass, GiBell) from react-icons v4/v5 stability

### Tertiary (LOW confidence)
- Specific new icon names (GiFaceToFace, GiSmile, GiStarShuriken) — not verified via live import, should be confirmed during planning/execution with TypeScript compilation

## Metadata

**Confidence breakdown:**
- Current state audit (what files need changes): HIGH — direct grep of codebase
- Standard stack (both libraries installed): HIGH — verified in package.json and node_modules
- Icon names already in use: HIGH — confirmed in Sidebar.tsx
- New icon names for StatCards/InsightHeroCard: LOW — not verified via import
- Architecture pattern: HIGH — existing Sidebar pattern is the template

**Research date:** 2026-03-27
**Valid until:** 2026-04-27 (stable libraries, no breaking changes expected)
