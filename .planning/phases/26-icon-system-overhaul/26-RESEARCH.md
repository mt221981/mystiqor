# Phase 26: Icon System Overhaul - Research

**Researched:** 2026-04-05
**Domain:** Icon library migration (react-icons/gi -> lucide-react)
**Confidence:** HIGH

## Summary

Phase 26 replaces all `react-icons/gi` (Game Icons) imports with `lucide-react` icons across 36 source files. The codebase currently has **42 unique Gi icon imports** spread across layout components, tool pages, dashboard widgets, and utility components. `lucide-react` v0.577.0 is already installed with 5,844 exports, covering every needed icon.

The migration is mechanical but wide: 36 files in `src/` import from `react-icons/gi`, and 1 file imports the `IconType` type from `react-icons` root. After migration, both `react-icons` and `react-icons/gi` can be fully removed from `package.json`. A centralized mapping file at `lib/constants/tool-icons.ts` will be the single source of truth for tool-to-icon associations, replacing scattered inline imports.

**Primary recommendation:** Create the centralized `tool-icons.ts` mapping first, then migrate files in three waves: (1) shared infrastructure (Sidebar, BottomTabBar, Header, tools.ts, common components), (2) tool pages, (3) learn/dashboard/insight pages. Remove `react-icons` dependency last.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Use Lucide Icons (lucide-react) -- already installed, professional, consistent 1400+ set
- Single color for all icons: text-primary (purple) with subtle glow
- Sidebar icon size: h-5 w-5 (20px)
- No tooltips needed -- names already displayed
- 17-tool icon mapping:
  - Astrology -> Orbit
  - Tarot -> Layers
  - Numerology -> Hash
  - Dream -> Moon
  - Palmistry -> Hand
  - Graphology -> PenTool
  - Drawing -> Palette
  - Human Design -> Dna
  - Compatibility -> Heart
  - Coach/Crystal Ball -> Sparkles
  - Personality -> Brain
  - Career -> Compass
  - Relationships -> Users
  - Document -> FileSearch
  - Timing -> Clock
  - Synthesis -> Merge
  - Daily Insights -> Sun
- Replace ALL gi icons across sidebar, tool pages, and headers
- Create centralized mapping at lib/constants/tool-icons.ts
- Remove react-icons/gi dependency completely after migration

### Claude's Discretion
- Mapping of secondary/utility icons (non-tool icons like GiGraduateCap, GiNewspaper, etc.) to Lucide equivalents
- Import organization and cleanup strategy

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ICON-01 | Unique small icons in sidebar -- clear, unique per tool, consistent style | Centralized mapping + all 17 tool icons verified in lucide-react. Sidebar.tsx has 25 Gi imports to replace. |
| ICON-02 | Same icons on tool page headers -- matching sidebar set | All 16+ tool pages use Gi icons in StandardSectionHeader. Centralized mapping enables single-source consistency. |
| ICON-03 | No visual duplicates -- each tool with unique, identifiable icon | All 17 mapped Lucide icons are distinct. Secondary icons also mapped to unique Lucide equivalents. |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- TypeScript strict -- no `any`, no `@ts-ignore`
- Every function -- JSDoc in Hebrew
- Max 300 lines per file
- Imports -- absolute @/ paths
- Hebrew code comments
- `start`/`end` -- never `left`/`right`
- Code that works -- do NOT touch unless required
- Code that almost works -- fix and complete
- NEVER break working code to chase a higher score
- NEVER rewrite something that already works

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| lucide-react | 0.577.0 (installed) | Icon library | Already in project, 5,844 exports, tree-shakeable, consistent 24x24 stroke style [VERIFIED: npm ls] |

### To Remove
| Library | Version | Purpose | Why Remove |
|---------|---------|---------|------------|
| react-icons | ^5.6.0 | Game Icons (gi subpackage) | Only `gi` subpackage used + 1 type import. After migration, zero usage remains. [VERIFIED: codebase grep] |

**Uninstall command:**
```bash
npm uninstall react-icons
```

## Architecture Patterns

### Recommended: Centralized Icon Mapping

Create `src/lib/constants/tool-icons.ts` as the single source of truth:

```typescript
/**
 * מיפוי סמלי כלים -- מקור אמת יחיד לאייקונים בכל האפליקציה
 * כל כלי מזוהה באייקון Lucide ייחודי
 */
import type { LucideIcon } from 'lucide-react';
import {
  Orbit, Layers, Hash, Moon, Hand, PenTool, Palette,
  Dna, Heart, Sparkles, Brain, Compass, Users,
  FileSearch, Clock, Merge, Sun,
} from 'lucide-react';

/** מיפוי מזהה כלי לאייקון Lucide */
export const TOOL_ICONS: Record<string, LucideIcon> = {
  astrology: Orbit,
  tarot: Layers,
  numerology: Hash,
  dream: Moon,
  palmistry: Hand,
  graphology: PenTool,
  drawing: Palette,
  'human-design': Dna,
  compatibility: Heart,
  coach: Sparkles,
  personality: Brain,
  career: Compass,
  relationships: Users,
  document: FileSearch,
  timing: Clock,
  synthesis: Merge,
  'daily-insights': Sun,
} as const;

/** קבל אייקון לפי מזהה כלי -- עם fallback ל-Sparkles */
export function getToolIcon(toolId: string): LucideIcon {
  return TOOL_ICONS[toolId] ?? Sparkles;
}
```

[VERIFIED: All 17 Lucide icon names confirmed to exist in lucide-react v0.577.0]

### Type Migration Pattern

Replace `IconType` from `react-icons` with `LucideIcon` from `lucide-react`:

```typescript
// BEFORE (tools.ts)
import type { IconType } from 'react-icons';
// ...
readonly Icon: IconType;

// AFTER
import type { LucideIcon } from 'lucide-react';
// ...
readonly Icon: LucideIcon;
```

[VERIFIED: `LucideIcon` type already used in 3 files: learn/page.tsx, QuickActions.tsx, LearningPathCard.tsx]

### Component Icon Prop Pattern

The `NavItem` interface in Sidebar.tsx uses `React.ComponentType<{ className?: string }>` which is compatible with both react-icons and Lucide. No interface change needed -- Lucide components also accept `className`. [VERIFIED: Sidebar.tsx line 68]

Similarly, `StandardSectionHeader` accepts `icon: ReactNode`, so JSX elements from either library work. [VERIFIED: StandardSectionHeader.tsx line 35]

### Anti-Patterns to Avoid
- **Scattered icon imports:** Do NOT import tool icons directly in each file. Import from `tool-icons.ts` or use `getToolIcon()`.
- **Mixing libraries:** After migration, NO file should import from `react-icons/*`.
- **Breaking IconType:** The `PrimaryTool` interface in `tools.ts` currently uses `IconType` from `react-icons`. Must change to `LucideIcon`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Icon type | Custom icon component type | `LucideIcon` from lucide-react | Already used in 3 files, consistent with rest of codebase |
| Tool-to-icon lookup | Inline switch/if chains | `TOOL_ICONS` record + `getToolIcon()` | Single source of truth, O(1) lookup |
| Icon sizing | Custom wrapper components | Tailwind classes (`h-5 w-5`, `h-6 w-6`) | Both libraries accept `className` prop |

## Complete File Inventory

### All 36 Files Importing from react-icons/gi

Organized by migration priority:

**Wave 1: Shared Infrastructure (7 files)**

| # | File | Gi Icons Used | Context |
|---|------|---------------|---------|
| 1 | `src/lib/constants/tools.ts` | GiAstrolabe, GiCardRandom, GiAbacus, GiHand, GiQuillInk, GiPaintBrush + `IconType` type | PRIMARY_TOOLS array -- also needs type change |
| 2 | `src/components/layouts/Sidebar.tsx` | 25 Gi icons (see full list below) | NAV_SECTIONS array -- largest single file |
| 3 | `src/components/layouts/BottomTabBar.tsx` | GiCrystalBall | Coach tab icon |
| 4 | `src/components/layouts/Header.tsx` | GiSparkles | Logo/brand sparkle |
| 5 | `src/components/common/LoadingSpinner.tsx` | GiSparkles | Spinning loading icon |
| 6 | `src/components/common/EmptyState.tsx` | GiCrystalBall | Empty state decoration |
| 7 | `src/components/features/dashboard/StatCards.tsx` | GiTargetArrows, GiFaceToFace, GiStarMedal, GiAlarmClock | Dashboard stat card icons |

**Wave 2: Tool Pages (17 files)**

| # | File | Gi Icons Used |
|---|------|---------------|
| 8 | `src/app/(auth)/tools/numerology/page.tsx` | GiAbacus |
| 9 | `src/app/(auth)/tools/astrology/page.tsx` | GiAstrolabe |
| 10 | `src/app/(auth)/tools/tarot/page.tsx` | GiCardRandom, GiCrystalBall |
| 11 | `src/app/(auth)/tools/dream/page.tsx` | GiDreamCatcher |
| 12 | `src/app/(auth)/tools/palmistry/page.tsx` | GiHand |
| 13 | `src/app/(auth)/tools/graphology/page.tsx` | GiQuillInk |
| 14 | `src/app/(auth)/tools/drawing/page.tsx` | GiPaintBrush |
| 15 | `src/app/(auth)/tools/human-design/page.tsx` | GiDna1 |
| 16 | `src/app/(auth)/tools/compatibility/page.tsx` | GiHearts, GiYinYang |
| 17 | `src/app/(auth)/tools/personality/page.tsx` | GiBrain |
| 18 | `src/app/(auth)/tools/career/page.tsx` | GiBriefcase, GiStarFormation |
| 19 | `src/app/(auth)/tools/relationships/page.tsx` | GiTwoCoins |
| 20 | `src/app/(auth)/tools/document/page.tsx` | GiScrollQuill |
| 21 | `src/app/(auth)/tools/timing/page.tsx` | GiHourglass |
| 22 | `src/app/(auth)/tools/synthesis/page.tsx` | GiAllSeeingEye |
| 23 | `src/app/(auth)/tools/daily-insights/page.tsx` | GiStarSwirl |
| 24 | `src/app/(auth)/tools/page.tsx` | GiSpellBook |

**Wave 3: Astrology Sub-Pages + Learn + Dashboard (12 files)**

| # | File | Gi Icons Used |
|---|------|---------------|
| 25 | `src/app/(auth)/tools/astrology/forecast/page.tsx` | GiMagnifyingGlass |
| 26 | `src/app/(auth)/tools/astrology/transits/page.tsx` | GiOrbital |
| 27 | `src/app/(auth)/tools/astrology/calendar/page.tsx` | GiCalendar |
| 28 | `src/app/(auth)/tools/astrology/synastry/page.tsx` | GiHearts |
| 29 | `src/app/(auth)/tools/astrology/solar-return/page.tsx` | GiSunrise |
| 30 | `src/app/(auth)/tools/astrology/readings/page.tsx` | GiSpellBook |
| 31 | `src/app/(auth)/learn/astrology/page.tsx` | GiAstrolabe |
| 32 | `src/app/(auth)/learn/drawing/page.tsx` | GiPaintBrush |
| 33 | `src/app/(auth)/learn/astrology/dictionary/page.tsx` | GiAstrolabe |
| 34 | `src/app/(auth)/learn/blog/[slug]/page.tsx` | GiSpellBook |
| 35 | `src/components/features/dashboard/DailyInsightCard.tsx` | GiSparkles |
| 36 | `src/components/features/daily-insights/InsightHeroCard.tsx` | GiSparkles, GiStarShuriken, GiLightBulb |

## Complete Gi-to-Lucide Mapping

### Primary Tool Icons (17 -- from CONTEXT.md, locked)

| Gi Icon | Lucide Icon | Tool | Verified |
|---------|-------------|------|----------|
| GiAstrolabe | Orbit | Astrology | [VERIFIED: lucide-react CJS export] |
| GiCardRandom | Layers | Tarot | [VERIFIED: lucide-react CJS export] |
| GiAbacus | Hash | Numerology | [VERIFIED: lucide-react CJS export] |
| GiDreamCatcher | Moon | Dream | [VERIFIED: lucide-react CJS export] |
| GiHand / GiHandOfGod | Hand | Palmistry | [VERIFIED: lucide-react CJS export] |
| GiQuillInk | PenTool | Graphology | [VERIFIED: lucide-react CJS export] |
| GiPaintBrush | Palette | Drawing | [VERIFIED: lucide-react CJS export] |
| GiBodyBalance / GiDna1 | Dna | Human Design | [VERIFIED: lucide-react CJS export] |
| GiHearts (compatibility) | Heart | Compatibility | [VERIFIED: lucide-react CJS export] |
| GiCrystalBall | Sparkles | Coach | [VERIFIED: lucide-react CJS export] |
| GiMirrorMirror / GiBrain | Brain | Personality | [VERIFIED: lucide-react CJS export] |
| GiBriefcase | Compass | Career | [VERIFIED: lucide-react CJS export] |
| GiLovers (relationships) | Users | Relationships | [VERIFIED: lucide-react CJS export] |
| GiScrollUnfurled / GiScrollQuill | FileSearch | Document | [VERIFIED: lucide-react CJS export] |
| GiHourglass | Clock | Timing | [VERIFIED: lucide-react CJS export] |
| GiAllSeeingEye | Merge | Synthesis | [VERIFIED: lucide-react CJS export] |
| GiLightBulb / GiStarSwirl | Sun | Daily Insights | [VERIFIED: lucide-react CJS export] |

### Secondary/Utility Icons (Claude's Discretion -- 25 unique Gi icons)

| Gi Icon | Where Used | Purpose | Recommended Lucide | Rationale |
|---------|-----------|---------|-------------------|-----------|
| GiSparkles | Header, LoadingSpinner, DailyInsightCard, InsightHeroCard | Brand sparkle / decorative | Sparkles | Direct equivalent, already in use elsewhere [VERIFIED] |
| GiCrystalBall (non-coach) | EmptyState, tarot/page | Empty state decoration, tarot secondary | Gem | Distinct from coach's Sparkles [VERIFIED] |
| GiTargetArrows | StatCards | Active goals stat | Target | Direct semantic match [VERIFIED] |
| GiFaceToFace | StatCards | Mood score stat | Smile | Already imported from lucide in codebase (BottomTabBar adjacent) [VERIFIED] |
| GiStarMedal | StatCards | Completed goals stat | Award | Direct semantic match [VERIFIED] |
| GiAlarmClock | StatCards | Pending reminders stat | AlarmClock | Direct semantic match [VERIFIED] |
| GiGraduateCap | Sidebar (learn/tutorials) | Tutorials section | GraduationCap | Direct equivalent [VERIFIED] |
| GiNewspaper | Sidebar (learn/blog) | Blog section | Newspaper | Direct equivalent [VERIFIED] |
| GiNotebook | Sidebar (journal) | Journal | NotebookPen | Pen variant distinguishes from plain notebook [VERIFIED] |
| GiTargetArrows | Sidebar (goals) | Goals | Target | Same as StatCards usage [VERIFIED] |
| GiCalendar | Sidebar, calendar/page | Astro calendar | CalendarDays | Distinct from lucide Calendar already used in timing page [VERIFIED] |
| GiSunRadiations | Sidebar (forecast, solar return) | Daily forecast, Solar return | SunDim | Distinct from Sun (daily insights) [VERIFIED] |
| GiCompass | Sidebar (transits) | Astro transits | Orbit | Reuse astrology's Orbit since transits are astrology sub-page [ASSUMED] |
| GiLovers (synastry) | Sidebar, synastry/page | Synastry (romantic astro) | HeartHandshake | Distinct from Heart (compatibility) and Users (relationships) [VERIFIED] |
| GiOrbital | transits/page | Transits page header | Orbit | Same as astrology main -- transits are a sub-feature [VERIFIED] |
| GiMagnifyingGlass | forecast/page | Forecast page header | Search | Direct semantic match [VERIFIED] |
| GiSunrise | solar-return/page | Solar return page header | Sunrise | Direct semantic match [VERIFIED] |
| GiSpellBook | readings/page, blog/[slug], tools/page | Readings, blog post, tools index | BookMarked | Mystical book with marker [VERIFIED] |
| GiStarFormation | career/page | Career secondary decoration | Star | Decorative star variant [VERIFIED] |
| GiYinYang | compatibility/page | Compatibility yin-yang decoration | CircleDot | Closest geometric approximation [VERIFIED] |
| GiTwoCoins | relationships/page | Relationships page header | Users | Reuse from centralized mapping (relationships tool) [VERIFIED] |
| GiStarSwirl | daily-insights/page | Daily insights page header | Sun | From centralized mapping [VERIFIED] |
| GiStarShuriken | InsightHeroCard | Decorative star in insight card | Asterisk | Star-like geometric shape [VERIFIED] |
| GiMountainRoad | Sidebar (DEAD IMPORT) | Not used anywhere | REMOVE | Dead import -- do not replace [VERIFIED: grep shows import only, no usage] |
| GiSparkles | Sidebar (DEAD IMPORT) | Not used in NAV_SECTIONS | REMOVE | Dead import -- do not replace [VERIFIED: grep shows import only, no usage in items] |

### Sidebar NAV_SECTIONS Complete Mapping

| Section | Item | Current Gi Icon | New Lucide Icon |
|---------|------|----------------|-----------------|
| Mystical Tools | Numerology | GiAbacus | Hash |
| Mystical Tools | Astrology | GiAstrolabe | Orbit |
| Mystical Tools | Graphology | GiQuillInk | PenTool |
| Mystical Tools | Drawing | GiPaintBrush | Palette |
| Mystical Tools | Palmistry | GiHandOfGod | Hand |
| Mystical Tools | Tarot | GiCardRandom | Layers |
| Mystical Tools | Human Design | GiBodyBalance | Dna |
| Mystical Tools | Dreams | GiDreamCatcher | Moon |
| More Tools | Daily Forecast | GiSunRadiations | SunDim |
| More Tools | Astro Calendar | GiCalendar | CalendarDays |
| More Tools | Transits | GiCompass | Orbit |
| More Tools | Solar Return | GiSunRadiations | Sunrise |
| More Tools | Synastry | GiLovers | HeartHandshake |
| More Tools | Compatibility | GiHearts | Heart |
| More Tools | Career | GiBriefcase | Compass |
| More Tools | Document | GiScrollUnfurled | FileSearch |
| More Tools | Relationships | GiLovers | Users |
| More Tools | Synthesis | GiAllSeeingEye | Merge |
| More Tools | Personality | GiMirrorMirror | Brain |
| Personal Journey | Coach | GiCrystalBall | Sparkles |
| Personal Journey | Goals | GiTargetArrows | Target |
| Personal Journey | Journal | GiNotebook | NotebookPen |
| Personal Journey | Daily Insights | GiLightBulb | Sun |
| Learn | Tutorials | GiGraduateCap | GraduationCap |
| Learn | Blog | GiNewspaper | Newspaper |
| Learn | Astro Teacher | GiAstrolabe | Orbit |
| Learn | Astro Dictionary | GiAstrolabe | Orbit |
| Learn | Drawing Teacher | GiPaintBrush | Palette |
| (dead import) | GiSparkles | -- | REMOVE |
| (dead import) | GiMountainRoad | -- | REMOVE |

**Note:** History & Account sections already use Lucide icons (History, GitCompare, BarChart3, User, Settings, CreditCard, Tag, Gift, Bell, Smile). No changes needed for those items.

## Common Pitfalls

### Pitfall 1: IconType vs LucideIcon Incompatibility
**What goes wrong:** `IconType` from `react-icons` has a slightly different signature than `LucideIcon` from `lucide-react`. Code using `IconType` will fail TypeScript checks after removing react-icons.
**Why it happens:** `tools.ts` uses `IconType` in the `PrimaryTool` interface, and `HeroToolCard` imports that type.
**How to avoid:** Change `IconType` to `LucideIcon` in `tools.ts` BEFORE changing icon imports. Both accept `className` prop.
**Warning signs:** TypeScript errors in files that didn't directly import Gi icons.

### Pitfall 2: Sidebar Dead Imports
**What goes wrong:** `GiSparkles` and `GiMountainRoad` are imported in Sidebar.tsx but never used in NAV_SECTIONS. If you search-and-replace them to Lucide equivalents, you'll add unused Lucide imports.
**Why it happens:** Previous refactoring left orphaned imports.
**How to avoid:** Remove these 2 dead imports entirely instead of replacing them.
**Warning signs:** ESLint/TypeScript warnings about unused imports.

### Pitfall 3: Duplicate Lucide Icons Across Sidebar Items
**What goes wrong:** Transits (GiCompass) and Astrology (GiAstrolabe) both map to Orbit. Solar Return (GiSunRadiations) could conflict with Daily Insights (Sun).
**Why it happens:** Sub-pages of a tool naturally share themes with the parent.
**How to avoid:** Use distinct icons where possible. Transits -> Orbit is acceptable since it's an astrology sub-page. Solar Return -> Sunrise (not Sun) keeps them distinct.
**Warning signs:** ICON-03 requirement violation (no visual duplicates).

### Pitfall 4: react-icons Root Type Import
**What goes wrong:** `npm uninstall react-icons` fails silently if `import type { IconType } from 'react-icons'` still exists anywhere.
**Why it happens:** `tools.ts` line 9 imports from the root package, not the `gi` subpackage.
**How to avoid:** Change `IconType` -> `LucideIcon` in tools.ts BEFORE uninstalling react-icons.
**Warning signs:** Build failure after uninstall.

### Pitfall 5: Heart Icon Collision
**What goes wrong:** Lucide `Heart` is already imported in several files (numerology/page, relationships/page, journal entries, etc.) for different purposes. Adding it as the compatibility tool icon could create naming collisions.
**Why it happens:** `Heart` from Lucide is a common utility icon.
**How to avoid:** In files that already import `Heart` from lucide-react for non-tool purposes, the tool icon import from `tool-icons.ts` should use the mapping function: `const CompatibilityIcon = getToolIcon('compatibility')` rather than a named import of `Heart`.
**Warning signs:** Duplicate identifier errors.

## Code Examples

### Example 1: Sidebar Migration Pattern

```typescript
// BEFORE
import {
  GiAbacus,
  GiAstrolabe,
  // ... 23 more Gi imports
} from 'react-icons/gi';

// AFTER
import {
  Hash, Orbit, PenTool, Palette, Hand, Layers, Dna, Moon,
  SunDim, CalendarDays, Sunrise, HeartHandshake, Heart,
  Compass, FileSearch, Users, Merge, Brain,
  Sparkles, Target, NotebookPen, Sun,
  GraduationCap, Newspaper,
} from 'lucide-react';
```

### Example 2: Tool Page Migration (simple case)

```typescript
// BEFORE (numerology/page.tsx)
import { GiAbacus } from 'react-icons/gi'
// ...
<StandardSectionHeader icon={<GiAbacus className="h-6 w-6" />} title="..." />

// AFTER
import { Hash } from 'lucide-react'
// OR: import { getToolIcon } from '@/lib/constants/tool-icons'
// ...
<StandardSectionHeader icon={<Hash className="h-6 w-6" />} title="..." />
```

### Example 3: tools.ts Type + Import Migration

```typescript
// BEFORE
import { GiAstrolabe, GiCardRandom, GiAbacus, GiHand, GiQuillInk, GiPaintBrush } from 'react-icons/gi';
import type { IconType } from 'react-icons';

export interface PrimaryTool {
  readonly Icon: IconType;
}

// AFTER
import { Orbit, Layers, Hash, Hand, PenTool, Palette } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface PrimaryTool {
  readonly Icon: LucideIcon;
}
```

### Example 4: BottomTabBar Migration

```typescript
// BEFORE
import { GiCrystalBall } from 'react-icons/gi';
const TABS = [
  { label: 'Noa', href: '/coach', Icon: GiCrystalBall },
];

// AFTER
import { Sparkles } from 'lucide-react';
const TABS = [
  { label: 'Noa', href: '/coach', Icon: Sparkles },
];
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-icons/gi (game-style icons) | lucide-react (clean line icons) | This phase | Consistent professional style across app |
| IconType from react-icons | LucideIcon from lucide-react | This phase | Single icon type system |
| Per-file Gi icon imports | Centralized tool-icons.ts | This phase | Single source of truth for tool icons |

**Deprecated/outdated:**
- `react-icons` package: Will be fully removed. No other subpackage (fa, md, etc.) is used.
- `IconType` type: Replaced by `LucideIcon`.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | GiCompass (transits sidebar) -> Orbit is acceptable even though it duplicates Astrology's Orbit | Sidebar Mapping | Minor -- transits is a sub-page of astrology, sharing icon is expected. Could use a different icon if needed. |
| A2 | GiFaceToFace -> Smile for mood stat card | Secondary Icons | Low -- Smile is semantically correct for mood. Could use SmilePlus if preferred. |

## Open Questions

1. **Transits Icon Duplication**
   - What we know: Transits (astrology sub-page) will share Orbit icon with astrology main page
   - What's unclear: Whether this is desirable or confusing in the sidebar where both appear
   - Recommendation: Accept duplication -- transits IS astrology. Alternative: use `RotateCcw` for transits to imply orbital motion.

2. **Tool Page Headers vs Centralized Mapping**
   - What we know: Tool pages currently import Gi icons directly and pass as JSX to StandardSectionHeader
   - What's unclear: Should tool pages import from `tool-icons.ts` or import Lucide directly?
   - Recommendation: Import from `tool-icons.ts` for the 17 primary tools. Import directly for secondary/decorative icons unique to a single page.

## Environment Availability

Step 2.6: SKIPPED (no external dependencies -- purely code/config changes with icons already installed).

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Next.js build (TypeScript strict) |
| Config file | `tsconfig.json` + `next.config.mjs` |
| Quick run command | `npx tsc --noEmit` |
| Full suite command | `npm run build` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ICON-01 | All sidebar icons are Lucide, unique per tool | manual + grep | `grep -r "react-icons/gi" src/ \| wc -l` (expect 0) | N/A -- grep check |
| ICON-02 | Tool page headers use matching icons | manual visual | `npx tsc --noEmit` (type check passes) | N/A -- visual |
| ICON-03 | No duplicate icons between tools | manual + code review | Review `tool-icons.ts` mapping values for uniqueness | N/A -- code review |

### Sampling Rate
- **Per task commit:** `npx tsc --noEmit` (type safety)
- **Per wave merge:** `npm run build` (full build verification)
- **Phase gate:** `grep -r "react-icons" src/` returns 0 results + `npm run build` green

### Wave 0 Gaps
None -- no test files needed. Validation is via TypeScript compilation + grep verification + visual check.

## Security Domain

This phase involves only icon component swaps (visual presentation layer). No user input, no data flow, no API changes, no authentication changes.

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | -- |
| V3 Session Management | no | -- |
| V4 Access Control | no | -- |
| V5 Input Validation | no | -- |
| V6 Cryptography | no | -- |

No security concerns for this phase.

## Sources

### Primary (HIGH confidence)
- lucide-react v0.577.0 CJS bundle -- verified all 17 primary icons + all secondary candidate icons exist via Node.js `exports` parsing
- `npm ls lucide-react` -- confirmed installed version 0.577.0
- `npm ls react-icons` -- confirmed installed version 5.6.0
- Codebase grep across `mystiqor-build/src/` -- complete inventory of all 36 files importing from `react-icons/gi`
- Codebase grep for `LucideIcon` type -- confirmed already used in 3 source files

### Secondary (MEDIUM confidence)
- npm registry (`npm view lucide-react version`) -- latest is 1.7.0, installed is 0.577.0. No need to upgrade for this phase as all needed icons exist.

### Tertiary (LOW confidence)
None -- all claims verified against installed package and codebase.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- lucide-react already installed, all icons verified
- Architecture: HIGH -- centralized mapping pattern is straightforward, type compatibility verified
- Pitfalls: HIGH -- identified through actual codebase grep (dead imports, type conflicts, naming collisions)
- File inventory: HIGH -- exhaustive grep of all 36 files, every Gi icon catalogued

**Research date:** 2026-04-05
**Valid until:** 2026-05-05 (stable -- icon libraries don't change frequently)
