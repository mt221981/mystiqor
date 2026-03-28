# Phase 19: Astrology Knowledge Base - Research

**Researched:** 2026-03-28
**Domain:** Static reference dictionary — data already exists in constants, UI-only work
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ASTRO-01 | מילון 12 מזלות עם סמל, אלמנט, צבע, כוכב שולט, תיאור מפורט בעברית — מוצג ב-UI | `ZODIAC_SIGNS` in `astrology-data.ts` already contains all fields: key, emoji, color, name, element, ruler, description |
| ASTRO-02 | מילון 10 כוכבי לכת עם סמל, צבע, משמעות מפורטת בעברית — מוצג ב-UI | `PLANETS` in `astrology-data.ts` already contains all fields: key, symbol, name, color, meaning, description |
| ASTRO-03 | 12 בתים אסטרולוגיים עם פרשנות מפורטת בעברית — מוצג ב-UI | `HOUSES` in `astrology-data.ts` already contains all fields: number, name, meaning, description |
| ASTRO-04 | 7 אספקטים עם חוזק, צבע, משמעות מפורטת בעברית — מוצג ב-UI | `ASPECTS` in `astrology-data.ts` already contains all fields: key, name, color, strength, meaning, description |
</phase_requirements>

---

## Summary

Phase 19 is almost entirely a UI work phase — the data is already done. The four astrology data structures (zodiac signs, planets, houses, aspects) were extracted from the BASE44 system and placed into `src/lib/constants/astrology-data.ts` during earlier work. Every field required by ASTRO-01 through ASTRO-04 is already populated in full Hebrew, with proper types, descriptions, colors, and symbols.

The work reduces to: (1) building 4 display components — `ZodiacGrid`, `PlanetGrid`, `HouseList`, `AspectDictionary` — that render the existing constant data; (2) creating a new page at `/learn/astrology/dictionary` (or upgrading the existing `/learn/astrology` page) that hosts all four sections; (3) adding a navigation entry to the Sidebar for the dictionary page.

There is one data duplication issue to resolve: two files define overlapping astrology constants. `astrology.ts` defines `ZODIAC_SIGNS` (without ruler/description) and `PLANET_SYMBOLS` (without description), while `astrology-data.ts` defines richer `ZODIAC_SIGNS` and `PLANETS` with all required fields. The UI components should import from `astrology-data.ts`. No DB migration is needed — this is entirely static data rendered client-side.

**Primary recommendation:** One plan, two waves. Wave 1 = 4 dictionary display components (pure presentational). Wave 2 = page assembly + Sidebar nav entry.

---

## Project Constraints (from CLAUDE.md)

- TypeScript strict — zero `any`, zero `@ts-ignore`
- Every function — JSDoc in Hebrew
- Every component — typed Props interface
- Imports — absolute `@/` paths only
- Max 300 lines per file
- Naming — PascalCase components, camelCase functions, UPPER_SNAKE constants
- RTL: `dir="rtl"` on interactive containers, `start`/`end` not `left`/`right`
- Hebrew labels, comments, placeholders
- Existing code preserved — do not rewrite what already works
- No new dependencies unless essential (none needed here)
- Scoring mandatory — File Score threshold 78%, Phase Score threshold 52/60

---

## Standard Stack

### Core (all already installed — verified from package.json)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | ^16.2.0 | App Router, page routing | Project framework |
| TypeScript | ^5 | Strict types | Project requirement |
| Tailwind CSS | ^3.4.1 | Utility styling | Project standard |
| shadcn/ui | installed | Card, Badge, Tabs, ScrollArea, Accordion | Already in use throughout |
| react-icons/gi | ^5.6.0 | Thematic mystic icons for headers | Phase 15 standard |
| framer-motion | ^12.38.0 | Fade-in reveal animations | Already in use |
| Heebo font | loaded | Hebrew text rendering | Phase 14 standard |

### No new dependencies required

All needed capabilities exist. The dictionary is pure read-only display — no React Query, no mutations, no forms.

---

## Data Inventory (CRITICAL FINDING)

### What already exists

**File:** `mystiqor-build/src/lib/constants/astrology-data.ts`

This file contains **all data required by ASTRO-01 through ASTRO-04**, fully populated:

| Constant | Type | Count | Fields present |
|----------|------|-------|----------------|
| `ZODIAC_SIGNS` | `Record<string, ZodiacSign>` | 12 | key, emoji, color, name, element, ruler, description |
| `PLANETS` | `Record<string, PlanetInfo>` | 10 | key, symbol, name, color, meaning, description |
| `HOUSES` | `readonly AstroHouse[]` | 12 | number, name, meaning, description |
| `ASPECTS` | `Record<string, AspectInfo>` | 7 | key, name, color, strength, meaning, description |

**Interfaces also exported:** `ZodiacSign`, `PlanetInfo`, `AstroHouse`, `AspectInfo`

### Duplicate data warning

`astrology.ts` also exports `ZODIAC_SIGNS` and `PLANET_SYMBOLS` — but these are **thinner** versions used by the birth chart calculation components (`PlanetTable`, `AspectList`). They lack `ruler` and `description` fields. The Phase 19 UI components must import from `astrology-data.ts`, not `astrology.ts`.

Do NOT consolidate these files — `astrology.ts` is imported by existing working components. Touching it risks breaking `PlanetTable` and `AspectList`.

### Aspect count: 7 confirmed

`ASPECTS` in `astrology-data.ts` has exactly 7 keys: `Conjunction`, `Opposition`, `Trine`, `Square`, `Sextile`, `Quincunx`, `Semi-sextile`. This matches ASTRO-04 requirement.

---

## Architecture Patterns

### Recommended Page Location

The natural location for the astrology dictionary is a new sub-route under the existing learn section:

```
src/app/(auth)/learn/astrology/
├── page.tsx          ← existing AI tutor page (do NOT modify)
└── dictionary/
    └── page.tsx      ← NEW: the four-section dictionary page
```

The existing `/learn/astrology/page.tsx` is a working AI chat tutor — it must not be modified. The dictionary is a separate concern. A new sub-route `/learn/astrology/dictionary` is the cleanest addition.

### Recommended Component Structure

```
src/components/features/astrology/
├── [existing files — do not touch]
├── ZodiacGrid.tsx           ← 12 sign cards in grid
├── PlanetGrid.tsx           ← 10 planet cards in grid
├── HouseList.tsx            ← 12 house items in list/accordion
└── AspectDictionary.tsx     ← 7 aspects with visual strength indicator
```

### Pattern 1: Card Grid (Zodiac + Planets)

Signs and planets display well as a responsive grid of cards. Each card shows: symbol/emoji (large, colored), name, element/meaning, and expandable description. Follows the same `mystic-hover` + `bg-surface-container` + `border-outline-variant/5` pattern established in birth chart panels and tarot components.

```typescript
// Source: existing astrology/ChartInfoPanels/PlanetTable.tsx pattern
<Card className="bg-surface-container rounded-xl border border-outline-variant/5 mystic-hover">
  <CardContent>
    <span style={{ color: planetInfo.color }}>{planetInfo.symbol}</span>
    <span className="font-body text-on-surface">{planetInfo.name}</span>
  </CardContent>
</Card>
```

### Pattern 2: Accordion List (Houses)

Houses are better as an accordion — 12 items in a grid of cards would be overwhelming. Each item shows house number + name always visible; description expands on click. Use shadcn `Accordion` component (already installed).

```typescript
// Source: shadcn accordion pattern (already imported in project)
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
```

### Pattern 3: Strength Bar (Aspects)

The aspect strength (0-1) maps directly to a visual progress bar — already established in `AspectList.tsx`. Reuse the same `h-1.5 bg-surface-container-high rounded-full` bar pattern with inline `backgroundColor` from the aspect color.

### Pattern 4: Tab Navigation for Page

The dictionary page hosts 4 sections. Use shadcn `Tabs` with `dir="rtl"` to switch between מזלות / כוכבים / בתים / אספקטים. This follows the birth chart page pattern (AIInterpretation / PlanetTable / AspectList tabs).

```typescript
// Source: mystiqor-build/src/app/(auth)/tools/astrology/page.tsx
<Tabs defaultValue="signs" dir="rtl">
  <TabsList className="w-full grid grid-cols-4 bg-surface-container-high">
    <TabsTrigger value="signs">מזלות</TabsTrigger>
    <TabsTrigger value="planets">כוכבים</TabsTrigger>
    <TabsTrigger value="houses">בתים</TabsTrigger>
    <TabsTrigger value="aspects">אספקטים</TabsTrigger>
  </TabsList>
```

### Sidebar Navigation

Add a single new entry to `NAV_SECTIONS` in `Sidebar.tsx` under the `למידה` section:

```typescript
{ label: 'מילון אסטרולוגי', href: '/learn/astrology/dictionary', icon: GiAstrolabe }
```

The `GiAstrolabe` icon is already imported in Sidebar.tsx — no new import needed.

### Anti-Patterns to Avoid

- **Do not import from `astrology.ts` for display purposes** — it lacks `ruler` and `description` fields needed by ASTRO-01/02. Import from `astrology-data.ts` only.
- **Do not modify `astrology.ts`, `PlanetTable.tsx`, or `AspectList.tsx`** — they are working components used by the birth chart tool.
- **Do not create a DB table for astrology dictionary** — the data is static and already complete in constants. A DB would add complexity with zero benefit.
- **Do not put all 4 sections in one 300-line file** — split into 4 separate display components + 1 page file.
- **Do not use the existing `/learn/astrology/page.tsx`** — it is an AI chat tutor, not a reference dictionary. A new sub-route avoids conflict.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Collapsible house descriptions | Custom show/hide state | shadcn `Accordion` | Already installed, accessible, RTL-compatible |
| Strength percentage display | Custom bar component | Copy `AspectList.tsx` pattern | Already working, consistent styling |
| Tab navigation | Custom tab state | shadcn `Tabs` + `TabsList` | Already used in birth chart page |
| Color-coded badges | Custom badge | shadcn `Badge` with inline `style` | Used in `AspectList.tsx` for aspect colors |
| Responsive grid | CSS flexbox | Tailwind `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4` | No layout library needed |

**Key insight:** This phase is almost entirely wiring existing data into existing UI patterns. The job is assembly, not invention.

---

## Common Pitfalls

### Pitfall 1: Wrong import source
**What goes wrong:** Developer imports `ZODIAC_SIGNS` from `@/lib/constants/astrology` (thin version, no `ruler` or `description`) instead of `@/lib/constants/astrology-data` (rich version with all required fields).
**Why it happens:** Both files export `ZODIAC_SIGNS` — TypeScript won't error because the thin version satisfies the type if the component only uses `emoji`, `color`, `name`, `element`.
**How to avoid:** Explicitly import from `@/lib/constants/astrology-data` in all Phase 19 components. Add a comment noting why.
**Warning signs:** Component renders but `description` is `undefined`.

### Pitfall 2: Element literal type mismatch
**What goes wrong:** `astrology-data.ts` types `element` as a plain `string`, while `astrology.ts` types it as `'אש' | 'אדמה' | 'אוויר' | 'מים'`. Mixing the two causes TS errors if a component uses the union type.
**Why it happens:** Two parallel files with overlapping but differently-typed interfaces.
**How to avoid:** Phase 19 components should define their own local Props using the types from `astrology-data.ts` only. Do not import `ElementKey` from `astrology.ts`.
**Warning signs:** TS error "Type 'string' is not assignable to type 'ElementKey'".

### Pitfall 3: File line limit exceeded
**What goes wrong:** All 4 dictionary sections squeezed into one `page.tsx` file exceeds 300 lines.
**Why it happens:** 12 signs + 10 planets + 12 houses + 7 aspects as inline JSX is very verbose.
**How to avoid:** Each section is a separate component file. The page only imports and orchestrates.
**Warning signs:** File approaching 200+ lines before adding the 4th section.

### Pitfall 4: RTL tab alignment
**What goes wrong:** `TabsList` without `dir="rtl"` renders tabs in LTR order (left-to-right), making the Hebrew layout feel reversed.
**Why it happens:** shadcn Tabs default to LTR.
**How to avoid:** Always add `dir="rtl"` to `<Tabs>` wrapper, following birth chart page pattern.
**Warning signs:** Tab text appears right-aligned but tab order is visually reversed.

### Pitfall 5: Accordion import missing
**What goes wrong:** shadcn `Accordion` component files may not exist if the accordion was never added to the project.
**Why it happens:** shadcn components are installed per-project with `npx shadcn add accordion`.
**How to avoid:** Verify `src/components/ui/accordion.tsx` exists before planning to use it. If missing, Wave 0 must add it.
**Warning signs:** Import error at `@/components/ui/accordion`.

---

## Code Examples

### ZodiacGrid — card pattern

```typescript
// Source: astrology-data.ts ZodiacSign interface + PlanetTable.tsx rendering pattern
import { ZODIAC_SIGNS } from '@/lib/constants/astrology-data'

export function ZodiacGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" dir="rtl">
      {Object.values(ZODIAC_SIGNS).map((sign) => (
        <Card key={sign.key} className="bg-surface-container border-outline-variant/5 mystic-hover">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl" aria-hidden="true">{sign.emoji}</span>
              <div>
                <p className="font-headline font-semibold text-on-surface">{sign.name}</p>
                <p className="text-xs text-on-surface-variant font-label">{sign.element}</p>
              </div>
            </div>
            <Badge variant="outline" style={{ borderColor: sign.color, color: sign.color }} className="text-xs">
              {sign.ruler}
            </Badge>
            <p className="text-xs text-on-surface-variant font-body leading-relaxed line-clamp-3">
              {sign.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

### AspectDictionary — strength bar pattern

```typescript
// Source: AspectList.tsx strength bar (existing working pattern)
import { ASPECTS } from '@/lib/constants/astrology-data'

export function AspectDictionary() {
  return (
    <div className="space-y-3" dir="rtl">
      {Object.values(ASPECTS).map((aspect) => (
        <Card key={aspect.key} className="bg-surface-container border-outline-variant/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" style={{ borderColor: aspect.color, color: aspect.color }}>
                  {aspect.name}
                </Badge>
                <span className="text-xs text-on-surface-variant">{aspect.meaning}</span>
              </div>
              {/* strength bar */}
              <div className="flex items-center gap-2">
                <div className="w-20 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${aspect.strength * 100}%`, backgroundColor: aspect.color }}
                    role="progressbar"
                    aria-valuenow={Math.round(aspect.strength * 100)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
                <span className="text-xs text-on-surface-variant w-8">{Math.round(aspect.strength * 100)}%</span>
              </div>
            </div>
            <p className="text-sm text-on-surface font-body">{aspect.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

---

## Environment Availability

Step 2.6: SKIPPED (no external dependencies — pure static UI work on top of existing constants)

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest + jsdom |
| Config file | `mystiqor-build/vitest.config.ts` |
| Quick run command | `cd mystiqor-build && npx vitest run tests/services/astrology-data.test.ts` |
| Full suite command | `cd mystiqor-build && npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ASTRO-01 | `ZODIAC_SIGNS` has 12 entries with emoji, color, name, element, ruler, description | unit | `npx vitest run tests/services/astrology-data.test.ts` | ❌ Wave 0 |
| ASTRO-02 | `PLANETS` has 10 entries with symbol, color, name, meaning, description | unit | `npx vitest run tests/services/astrology-data.test.ts` | ❌ Wave 0 |
| ASTRO-03 | `HOUSES` has 12 entries with number, name, meaning, description | unit | `npx vitest run tests/services/astrology-data.test.ts` | ❌ Wave 0 |
| ASTRO-04 | `ASPECTS` has 7 entries with name, color, strength (0-1), meaning, description | unit | `npx vitest run tests/services/astrology-data.test.ts` | ❌ Wave 0 |

**Visual rendering tests** (success criteria #5: user can browse and see full info) are manual-only — no automated E2E in this project.

### Sampling Rate

- **Per task commit:** `cd mystiqor-build && npx vitest run tests/services/astrology-data.test.ts`
- **Per wave merge:** `cd mystiqor-build && npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `tests/services/astrology-data.test.ts` — covers ASTRO-01 through ASTRO-04 (data completeness checks)
- [ ] Verify `src/components/ui/accordion.tsx` exists — if missing, add via `npx shadcn add accordion` in Wave 0

*(Existing `tests/services/astrology.test.ts` covers calculation logic only — does not test constant completeness)*

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| astrology.ts thin constants (no descriptions) | astrology-data.ts rich constants with full Hebrew text | Before Phase 19 | Data already ready — no extraction work needed |
| No dictionary UI | New `/learn/astrology/dictionary` page | Phase 19 | Adds browsable reference content |

**No deprecated patterns for this phase.**

---

## Open Questions

1. **Accordion component availability**
   - What we know: shadcn `accordion.tsx` is installed in many shadcn projects
   - What's unclear: Whether it was installed in this specific project
   - Recommendation: Wave 0 task checks for `src/components/ui/accordion.tsx`. If absent, run `npx shadcn add accordion` as first task. Fallback: use simple `useState` toggle if accordion cannot be added cleanly.

2. **Page location: sub-route vs. replace tutor**
   - What we know: `/learn/astrology/page.tsx` is a working AI chat tutor with 6 quick concept buttons that reference houses, aspects, etc.
   - What's unclear: Whether users expect the dictionary at `/learn/astrology` or a separate `/learn/astrology/dictionary` URL
   - Recommendation: Use `/learn/astrology/dictionary` as a separate page. The tutor is useful and working — do not replace it. The Sidebar will link to both.

---

## Sources

### Primary (HIGH confidence)

- Direct file reads: `mystiqor-build/src/lib/constants/astrology-data.ts` — verified all 4 data structures, all fields
- Direct file reads: `mystiqor-build/src/lib/constants/astrology.ts` — verified thin duplicate constants and confirmed they differ
- Direct file reads: `mystiqor-build/src/components/features/astrology/ChartInfoPanels/AspectList.tsx` — strength bar pattern
- Direct file reads: `mystiqor-build/src/components/features/astrology/ChartInfoPanels/PlanetTable.tsx` — planet display pattern
- Direct file reads: `mystiqor-build/src/app/(auth)/tools/astrology/page.tsx` — Tabs pattern with dir="rtl"
- Direct file reads: `mystiqor-build/src/components/layouts/Sidebar.tsx` — nav section structure, GiAstrolabe already imported
- Direct file reads: `mystiqor-build/vitest.config.ts` + `mystiqor-build/tests/` — test infrastructure confirmed

### Secondary (MEDIUM confidence)

- shadcn/ui Accordion: present in many projects using this stack; presence in this project unconfirmed until Wave 0 check

---

## Metadata

**Confidence breakdown:**

- Data completeness: HIGH — directly verified all 4 constants in source file
- Standard stack: HIGH — all libraries verified in package.json
- Architecture: HIGH — follows established patterns from Phase 18 and existing astrology UI
- Pitfalls: HIGH — duplicated constants and RTL pitfalls are verified real issues
- Test infrastructure: HIGH — vitest.config.ts and tests/ directory confirmed

**Research date:** 2026-03-28
**Valid until:** 2026-04-28 (stable — no external dependencies)
