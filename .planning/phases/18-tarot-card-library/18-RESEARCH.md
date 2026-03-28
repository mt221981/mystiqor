# Phase 18: Tarot Card Library - Research

**Researched:** 2026-03-28
**Domain:** DB schema migration + data sync script + UI component build (Next.js 14 / Supabase / React)
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** סנכרון מטא-דאטה מ-`tarot-data.ts` ל-DB — סקריפט שמעדכן את טבלת `tarot_cards` מהקובץ הקיים (לא seed SQL ידני)
- **D-02:** הוספת עמודות חדשות לטבלה: `element`, `astrology`, `kabbalah`, `archetype`, `upright_keywords`, `reversed_keywords`, `numerology_value`
- **D-03:** כל 78 הקלפים כבר קיימים ב-`TAROT_CARD_META` — סנכרון אוטומטי, לא הזנה ידנית
- **D-04:** צלב קלטי — פריסה קלאסית עם צלב (6 קלפים בצלב + 4 בעמודה ימנית), לא grid פשוט
- **D-05:** אנימציית היפוך קלף (card flip) — 3D flip animation בעת שליפת קלפים
- **D-06:** בחירת פריסה דרך כפתורים (buttons) עם שם, תיאור ומספר קלפים — 4 כפתורי פריסה (מחליפים את 3 הכפתורים הנוכחיים 1/3/5)
- **D-07:** 4 פריסות: קלף בודד (1), שלושה קלפים (3), יחסים (5), צלב קלטי (10) — כבר מוגדרות ב-`TAROT_SPREADS`
- **D-08:** סקציות מתקפלות (collapsible) — שם + ארקנה + מילות מפתח גלויים תמיד, לחיצה על הקלף פותחת את המטא-דאטה העשירה
- **D-09:** באדג'ים צבעוניים לקשרים — אלמנט אש=אדום, מים=כחול, אוויר=צהוב, אדמה=ירוק
- **D-10:** אין קלפים הפוכים בשליפה — כל הקלפים תמיד upright
- **D-11:** הדאטה של `reversed_keywords` עדיין נשמר ב-DB (דרישת TAROT-02) אבל לא בשימוש בפריסה

### Claude's Discretion

- רזולוציית הצלב הקלטי ב-responsive (mobile vs desktop) — קלוד מחליט
- סדר הצגת שדות המטא-דאטה בסקציה המתקפלת — קלוד מחליט
- הגדרת ערכי numerology_value לכל קלף — קלוד מחליט לפי מספר הקלף המסורתי

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| TAROT-01 | 78 קלפי טארוט מלאים ב-DB כולל 40 Minor Arcana (Ace-10 לכל סוט) עם משמעויות עבריות | DB migration (Wave 1) + sync script (Wave 2) syncs all 78 from TAROT_CARD_META |
| TAROT-02 | כל קלף כולל: התאמה אסטרולוגית, ערך נומרולוגי, נתיב קבלה, ארכיטיפ, מילות מפתח (upright + reversed) | D-02 adds 7 columns; sync script populates all fields from existing TAROT_CARD_META source |
| TAROT-03 | 4 פריסות טארוט (קלף בודד, 3 קלפים, יחסים, צלב קלטי 10 עמדות) מוגדרות ב-UI | TAROT_SPREADS already defined; SpreadSelector + SpreadLayout components to build |
</phase_requirements>

---

## Summary

Phase 18 is a data-enrichment + UI-upgrade phase on top of a working tarot system. The core reading flow (DB → shuffle → AI interpretation → display) already works. The gaps are: (1) 40 Minor Arcana pip cards (Ace-10) are missing from the seed — the seed only has 22 Major + 16 Court cards = 38 total; (2) the `tarot_cards` table is missing 7 rich-metadata columns; (3) the UI shows 3 basic spread buttons instead of 4 full spreads with layout rendering; (4) there is no card-flip animation or collapsible meta panel.

The work splits cleanly into three streams: DB migration (new columns), data sync script (populate 78 cards with meta from `TAROT_CARD_META`), and UI upgrade (SpreadSelector, SpreadLayout, TarotCardTile, TarotCardMeta, TarotCardDetailModal, card-flip animation). These can be planned as sequential waves because UI depends on DB columns being available first.

**Primary recommendation:** Wave 1 = DB migration. Wave 2 = sync script + API route upgrade. Wave 3 = UI components. Wave 4 = page wiring + integration.

---

## Standard Stack

### Core (already installed — verified from package.json)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | ^16.2.0 | App Router, API routes | Project framework |
| TypeScript | ^5 | Strict types | Project requirement |
| Supabase JS | ^2.99.3 | DB client (client + server) | Project database |
| Framer Motion | ^12.38.0 | Card flip + reveal animations | Already in use — ProgressiveReveal |
| Zod | ^4.3.6 | Input validation in API route | Already in use — TarotInputSchema |
| shadcn/ui | installed | Tabs, Dialog, Badge, Card, ScrollArea, Tooltip | Already in use |
| react-icons | ^5.6.0 | GiCardRandom and thematic icons | Project icon library |
| Tailwind CSS | ^3.4.1 | Styling | Project standard |
| TanStack Query | ^5.91.2 | useMutation for API calls | Already in use — tarot page |
| sonner | ^2.0.7 | Toast notifications | Already in use |

### No new dependencies required

All libraries needed for Phase 18 are already installed. The card-flip animation uses Framer Motion (already present). The Celtic Cross layout uses CSS grid + Tailwind (no library needed). Collapsible sections can use the existing `accordion.tsx` shadcn component or a simple `useState` toggle — no new install needed.

---

## Architecture Patterns

### Recommended Project Structure for Phase 18

```
src/
├── components/features/tarot/
│   ├── SpreadSelector.tsx          # 4-tab/button spread chooser
│   ├── TarotCardTile.tsx           # Single drawn card with flip animation
│   ├── TarotCardMeta.tsx           # Collapsible rich metadata panel
│   ├── SpreadLayout.tsx            # Positional layout renderer
│   └── TarotCardDetailModal.tsx    # Full card detail in Dialog
├── app/(auth)/tools/tarot/
│   └── page.tsx                    # UPGRADE: replace SPREAD_OPTIONS + add new components
├── app/api/tools/tarot/
│   └── route.ts                    # UPGRADE: spreadCount accepts 10, returns rich meta fields
├── types/
│   └── database.ts                 # UPGRADE: add 7 new columns to TarotCardRow
└── supabase/
    └── migrations/
        └── 007_tarot_enrich.sql    # ADD: 7 columns to tarot_cards
```

### Pattern 1: Supabase SQL Migration (ALTER TABLE)

**What:** Add 7 nullable TEXT/INTEGER columns to the existing `tarot_cards` table. Use `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` to be safe on re-run.

**When to use:** Any time new DB columns are needed on an existing table.

```sql
-- Source: Supabase migration pattern — migrations/001_schema.sql reference
ALTER TABLE tarot_cards
  ADD COLUMN IF NOT EXISTS element TEXT,
  ADD COLUMN IF NOT EXISTS astrology TEXT,
  ADD COLUMN IF NOT EXISTS kabbalah TEXT,
  ADD COLUMN IF NOT EXISTS archetype TEXT,
  ADD COLUMN IF NOT EXISTS upright_keywords TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS reversed_keywords TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS numerology_value INTEGER;
```

No RLS change needed — `tarot_cards` already has `CREATE POLICY "Public read tarot cards" ON tarot_cards FOR SELECT USING (true)` and it is read-only (no user writes).

### Pattern 2: Sync Script (TypeScript Node script)

**What:** A standalone script that reads `TAROT_CARD_META` and upserts all 78 rows into `tarot_cards`. Uses Supabase service-role key via `.env.local`.

**When to use:** D-01 locked this approach — no manual SQL seed.

```typescript
// Pattern: upsert by card_number (the stable key from TAROT_CARD_META)
// Supabase upsert with onConflict on 'number' column for Major Arcana
// For Minor Arcana pip cards: insert new rows (they don't exist yet in DB)
const { error } = await supabase
  .from('tarot_cards')
  .upsert(rows, { onConflict: 'id' })  // id = SERIAL, known after first seed
```

**Key insight:** The existing seed (tarot_cards.sql) uses `SERIAL` id — it doesn't set ids explicitly. The sync script must match on a stable key. The best approach is to match on `(name_en, arcana)` pair or `number` (for major arcana). For minor arcana pip cards (which are new rows), the script inserts them fresh. The `TAROT_CARD_META` uses `cardNumber` 0–77 as its record key. A reliable sync strategy: upsert using `name_en` as the conflict target since it is unique per card and present in both the existing seed rows and the TAROT_CARD_META.

**Alternative safe approach:** Run the sync as UPDATE for existing rows + INSERT for new rows:
1. SELECT all existing `tarot_cards` grouped by `name_en`
2. For cards in TAROT_CARD_META that exist in DB: UPDATE with rich fields
3. For cards in TAROT_CARD_META that are new (pip cards): INSERT

### Pattern 3: CSS 3D Card Flip (Framer Motion)

**What:** 3D flip using `rotateY` from 180deg to 0deg. Card back shown first, front revealed after flip.

**When to use:** D-05 locked this — card flip animation on draw.

```tsx
// Source: Framer Motion animate prop — verified in project (framer-motion ^12.38.0)
// Card back = card drawn but not yet revealed; front = card content
const flipVariants = {
  back:  { rotateY: 180, transition: { duration: 0.6, ease: 'easeInOut' } },
  front: { rotateY: 0,   transition: { duration: 0.6, ease: 'easeInOut' } },
}

// Parent: perspective + transformStyle preserve-3d (inline style)
// Back face: rotateY(180deg) absolute overlay (backfaceVisibility hidden)
// Front face: default (backfaceVisibility hidden)
```

CSS required on the wrapper:
```tsx
style={{ perspective: '1000px' }}
// inner div:
style={{ transformStyle: 'preserve-3d', position: 'relative' }}
```

**Tailwind note:** `backface-visibility: hidden` is not a Tailwind utility in v3. Use inline style `style={{ backfaceVisibility: 'hidden' }}` on both card faces.

### Pattern 4: Celtic Cross Grid Layout

**What:** 10-position tarot spread using CSS grid with sparse placement. Classic layout: center cross (positions 1-6) + right column (positions 7-10).

**When to use:** D-04 locked this — classical cross shape, not flat grid.

Classic Celtic Cross position mapping to CSS grid (5 cols × 5 rows):

```
Col:   1    2    3    4    5
Row 1:           [3]
Row 2:      [5] [1] [6]  [10]
Row 3: [2 rotated over 1] or [4]   [2]  [7]
       Actually standard:
Row 1:            [3]
Row 2:  [5]  [1/2 cross]  [6]  |  [10]
Row 3:            [4]           |  [ 9]
                                |  [ 8]
                                |  [ 7]
```

Practical implementation: use `grid-template-columns: repeat(5, 1fr)` and `grid-column` / `grid-row` placement per position slot. Position 2 (the challenge card) is traditionally displayed rotated 90deg over position 1.

**Responsive:** On mobile (`< sm`), flatten to a numbered list (no grid). On desktop, show the cross layout. This is Claude's discretion per CONTEXT.md.

### Pattern 5: API Route Upgrade

**What:** The existing `route.ts` `TarotInputSchema` only allows `spreadCount` of `1 | 3 | 5`. Must add `10`.

```typescript
// BEFORE:
spreadCount: z.union([z.literal(1), z.literal(3), z.literal(5)]).default(3)

// AFTER:
spreadCount: z.union([z.literal(1), z.literal(3), z.literal(5), z.literal(10)]).default(3)
```

Also: the SELECT query must include new columns. Change `.select('*')` (already used) — this automatically includes new columns once they exist in DB. The `TarotResult.drawn` type must reference the updated `TarotCardRow`.

### Pattern 6: TypeScript Types Update

**What:** Add 7 new fields to `tarot_cards` Row, Insert, and Update in `database.ts`.

```typescript
// New fields to add to tarot_cards Row:
element: string | null;
astrology: string | null;
kabbalah: string | null;
archetype: string | null;
upright_keywords: string[];
reversed_keywords: string[];
numerology_value: number | null;
```

Insert defaults: `upright_keywords?: string[]`, `reversed_keywords?: string[]` — optional with empty array default.

### Anti-Patterns to Avoid

- **Hardcoding spread positions in page.tsx:** Build `SpreadLayout` to accept a spread config and render positions — do not inline layout per spread in the page.
- **Mutating TAROT_CARD_META:** It is a readonly const — the sync script reads from it but never modifies it.
- **Using `left`/`right` in Celtic Cross layout:** Use `ms-`, `me-`, `ps-`, `pe-` Tailwind utilities only.
- **Re-seeding instead of migrating:** The existing 38 cards have user-facing data in `analyses` table linked by card id/name. Don't truncate and re-seed — UPDATE existing rows, INSERT only new rows.
- **Blocking UI during card flip:** All 78 cards are drawn from DB in one query. The flip animation plays after data arrives — do not wait for animation to complete before showing cards.
- **Using `any` for card metadata:** The new `TarotRichCard` type (extending `TarotCardRow`) must be fully typed.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Collapsible metadata section | Custom collapse component | shadcn `Accordion` or `useState` toggle | Already in `src/components/ui/accordion.tsx` |
| Card flip animation | Custom CSS keyframes | Framer Motion `animate` prop with `rotateY` | Framer Motion is installed and used elsewhere |
| Spread tab switching | Custom tab state | shadcn `Tabs` + `TabsList` + `TabsTrigger` | Already in use, already imported in UI-SPEC |
| Card detail modal | Custom modal from scratch | shadcn `Dialog` + `DialogContent` | Already installed: `src/components/ui/dialog.tsx` |
| Scroll container (Celtic Cross mobile) | Custom overflow div | shadcn `ScrollArea` | Already installed: `src/components/ui/scroll-area.tsx` |
| Position name tooltips | Custom tooltip | shadcn `Tooltip` | Already installed: `src/components/ui/tooltip.tsx` |
| Loading shimmer | Custom CSS animation | `MysticSkeleton` | Already built: `src/components/ui/mystic-skeleton.tsx` |
| Staggered reveal | Custom animation | `ProgressiveReveal` + `RevealItem` | Already built and used on tarot page |

**Key insight:** This project has a rich component library already in place. The correct approach is component composition, not construction.

---

## Runtime State Inventory

> This phase does not rename anything — it adds columns and inserts new rows. However, the DB state must be inventoried because the existing `tarot_cards` table is live.

| Category | Items Found | Action Required |
|----------|-------------|-----------------|
| Stored data | `tarot_cards` table — 38 rows (22 Major + 16 Court cards only). Seed file `tarot_cards.sql` was applied at v1.0 init. | DB migration to add 7 columns + sync script to populate meta + insert 40 missing pip cards |
| Live service config | Supabase project — RLS policy "Public read tarot cards" already covers SELECT for all columns (using `true`). No change needed. | None — new columns auto-covered by existing RLS policy |
| OS-registered state | None — no OS-level registrations for tarot data | None |
| Secrets/env vars | `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` — needed by sync script to bypass RLS for UPDATE/INSERT. Already exists. | None — key unchanged, just used by sync script |
| Build artifacts | None relevant | None |

**Critical data gap found:** The existing seed only has 38 cards. TAROT-01 requires 78. The 40 missing pip cards (Ace-10 for each of the 4 suits = 40 cards) exist in `TAROT_CARD_META` (card numbers 22–77) but not in the DB. The sync script must INSERT these 40 new rows.

**Field mapping between TAROT_CARD_META and DB:**

| `TAROT_CARD_META` field | DB column (new) | Notes |
|-------------------------|-----------------|-------|
| `element` | `element` | 'fire'/'water'/'air'/'earth' |
| `astrology` | `astrology` | String e.g. 'Aries', 'Moon' |
| `kabbalah` | `kabbalah` | Optional — undefined for Minor Arcana |
| `archetype` | `archetype` | Hebrew string |
| `uprightKeywords` | `upright_keywords` | TEXT[] |
| `reversedKeywords` | `reversed_keywords` | TEXT[] |
| `cardNumber` | `numerology_value` | The canonical card number (0-77) |

**The `name_he` issue for pip cards:** The seed has Hebrew names for Court cards (e.g. 'ג''ק שרביטים') and Major Arcana. The pip cards (Ace-10) in `TAROT_CARD_META` have no `name_he` — only `archetype` (which serves as the Hebrew display name e.g. 'שניים בגביעים'). The sync script must derive `name_he` from `archetype` for pip cards.

**English names for pip cards:** The DB requires `name_en`. Standard English names follow the pattern: "Ace of Wands", "Two of Wands", etc. The sync script must map card numbers to English names. These are deterministic from card number + suit.

---

## Common Pitfalls

### Pitfall 1: Upsert conflict on SERIAL id

**What goes wrong:** Using `upsert` with `onConflict: 'id'` fails for new rows (no id yet) and accidentally conflicts on wrong rows for existing ones if the SERIAL sequence has gaps.

**Why it happens:** `tarot_cards.id` is SERIAL — its value depends on insertion order. The sync script doesn't know the DB-assigned id for existing rows without querying first.

**How to avoid:** Query all existing `tarot_cards` rows into a Map keyed by `name_en` before syncing. Then branch: if `name_en` exists → UPDATE by id. If not → INSERT new row. Never use blind upsert on SERIAL id.

**Warning signs:** Upsert with no error but row count doesn't match expected 78.

### Pitfall 2: Zod v4 union syntax

**What goes wrong:** The project uses `zod ^4.3.6`. In Zod v4, `z.union([...])` works but `z.enum([1, 3, 5, 10])` does NOT work for numbers (enum is string-only). The literal union pattern must be kept.

**Why it happens:** Zod v4 changed some API surface — `z.union([z.literal(1), ...])` remains correct. Attempting `z.enum` with numbers throws at runtime.

**How to avoid:** Keep the `z.union([z.literal(1), z.literal(3), z.literal(5), z.literal(10)])` pattern exactly.

### Pitfall 3: CSS 3D flip requires explicit perspective

**What goes wrong:** `rotateY` animation with Framer Motion appears flat (no depth) if `perspective` is not set on a parent container.

**Why it happens:** CSS 3D transforms require a perspective context on an ancestor element. Framer Motion's `animate` prop does not automatically add perspective.

**How to avoid:** Add `style={{ perspective: '1000px' }}` to the parent wrapper div of the flip card. Add `style={{ transformStyle: 'preserve-3d' }}` to the animating inner div.

### Pitfall 4: Tailwind `backface-visibility` not available

**What goes wrong:** `backface-hidden` is not a Tailwind v3 utility class (it was added only in some Tailwind v4 discussions). Using it as a class does nothing.

**Why it happens:** Tailwind v3.4.1 (project version) does not ship `backface-visibility` utilities.

**How to avoid:** Use inline style `style={{ backfaceVisibility: 'hidden' }}` directly on both card-face divs.

### Pitfall 5: Missing pip card `name_en` and `name_he`

**What goes wrong:** TAROT_CARD_META does not include English or Hebrew card names for pip cards — only archetype (Hebrew label). Inserting rows without `name_en` violates `NOT NULL` constraint.

**Why it happens:** `tarot-data.ts` was designed as meta-enrichment, not as the primary name source. The seed SQL handles names; TAROT_CARD_META handles meta only.

**How to avoid:** Build a static name map in the sync script. Standard pip card names follow deterministic rules:
- English: `{rank} of {suit}` where rank ∈ {Ace, Two, Three, Four, Five, Six, Seven, Eight, Nine, Ten}
- Hebrew: can be derived from `archetype` field (e.g. `archetype: 'שניים בגביעים'` → `name_he: 'שניים בגביעים'`)

### Pitfall 6: Celtic Cross position 2 rotation

**What goes wrong:** Applying CSS `rotate(90deg)` to position 2 card inside a CSS grid cell shifts the card outside its cell bounds, breaking the layout.

**Why it happens:** CSS rotation does not affect layout flow. The rotated element overflows its grid cell.

**How to avoid:** Give the position 2 slot a wider grid cell or use absolute positioning within a fixed-size container for the cross group. Alternatively, skip the 90deg rotation for the MVP and rely on a numbered badge to indicate the "crossing" card — the UI-SPEC does not mandate the rotation.

### Pitfall 7: `spreadCount` type mismatch between page and API

**What goes wrong:** After adding `10` to the API Zod schema, the page's `useState<1 | 3 | 5>` type still excludes `10`. TypeScript compile error.

**Why it happens:** The page has a hard-coded union type `1 | 3 | 5` for `spreadCount` that must be updated in sync with the API schema.

**How to avoid:** Update the page's type declaration to `1 | 3 | 5 | 10` at the same time as the API schema change. Both changes go in the same task.

---

## Code Examples

### Migration file pattern (matches project conventions)

```sql
-- supabase/migrations/007_tarot_enrich.sql
-- Phase 18: הוספת עמודות מטא-דאטה עשירה לטבלת tarot_cards
-- Source: 001_schema.sql ALTER TABLE patterns

ALTER TABLE tarot_cards
  ADD COLUMN IF NOT EXISTS element TEXT,
  ADD COLUMN IF NOT EXISTS astrology TEXT,
  ADD COLUMN IF NOT EXISTS kabbalah TEXT,
  ADD COLUMN IF NOT EXISTS archetype TEXT,
  ADD COLUMN IF NOT EXISTS upright_keywords TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS reversed_keywords TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS numerology_value INTEGER;
```

### database.ts tarot_cards Row extension (7 new fields)

```typescript
// In database.ts — tarot_cards Row block (REFINE, not rebuild)
Row: {
  id: number;
  name_en: string;
  name_he: string;
  arcana: Arcana;
  suit: TarotSuit | null;
  number: number | null;
  meaning_upright: string;
  meaning_reversed: string;
  keywords: string[];
  image_url: string | null;
  // New in Phase 18:
  element: string | null;
  astrology: string | null;
  kabbalah: string | null;
  archetype: string | null;
  upright_keywords: string[];
  reversed_keywords: string[];
  numerology_value: number | null;
};
```

### Card flip animation (Framer Motion pattern)

```tsx
// TarotCardTile.tsx — 3D card flip on reveal
// Requires perspective on parent, preserve-3d on inner div
<div style={{ perspective: '1000px' }}>
  <motion.div
    style={{ transformStyle: 'preserve-3d', position: 'relative' }}
    initial={{ rotateY: 180 }}
    animate={{ rotateY: isRevealed ? 0 : 180 }}
    transition={{ duration: 0.6, ease: 'easeInOut' }}
  >
    {/* Card back */}
    <div style={{ backfaceVisibility: 'hidden' }} className="absolute inset-0">
      {/* card back design */}
    </div>
    {/* Card front */}
    <div style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
      {/* card content */}
    </div>
  </motion.div>
</div>
```

### Spread selector using existing Button pattern

```tsx
// SpreadSelector.tsx — replaces SPREAD_OPTIONS with TAROT_SPREADS
import { TAROT_SPREADS } from '@/lib/constants/tarot-data'

{TAROT_SPREADS.map((spread) => (
  <Button
    key={spread.id}
    variant={selectedId === spread.id ? 'default' : 'outline'}
    onClick={() => onSelect(spread)}
    className={selectedId === spread.id
      ? 'bg-gradient-to-br from-primary-container to-secondary-container text-white font-label'
      : 'border-outline-variant/20 text-on-surface-variant'
    }
  >
    <span className="font-label">{spread.name}</span>
    <span className="text-xs text-on-surface-variant/70 ms-1">({spread.cardCount})</span>
  </Button>
))}
```

### Element badge color mapping (D-09)

```typescript
// לפי D-09 — אלמנטים בצבעים
const ELEMENT_COLOR: Record<string, string> = {
  fire:  'bg-red-500/20 text-red-300 border-red-500/30',
  water: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  air:   'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  earth: 'bg-green-500/20 text-green-300 border-green-500/30',
}
```

### Numerology value assignment (Claude's Discretion)

Per tarot tradition, numerology values follow the card's canonical number:
- Major Arcana: `numerology_value = cardNumber` (0–21)
- Minor Arcana pip cards: `numerology_value = rank` (1–10 where Ace=1)
- Court cards (Page, Knight, Queen, King): `numerology_value = null` (no standard numerology number)

This is the industry-standard mapping used in most tarot numerology systems.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `SPREAD_OPTIONS` array (3 hardcoded counts) | `TAROT_SPREADS` from tarot-data.ts (4 rich spread objects with positions) | Phase 18 | SpreadSelector uses rich config, not just count |
| Basic seed with 38 cards (no meta) | 78 cards with 7 meta fields synced from TAROT_CARD_META | Phase 18 | API returns full rich data per card |
| `TarotInputSchema` allows 1\|3\|5 | Allows 1\|3\|5\|10 | Phase 18 | Celtic Cross (10 cards) becomes valid input |
| Card grid (simple 3-col) | SpreadLayout with positional rendering | Phase 18 | 4 distinct layouts per spread type |
| No card detail depth | Collapsible meta + Dialog modal | Phase 18 | Rich metadata accessible on tap |

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Sync script execution | Yes | v24.12.0 | — |
| Supabase CLI | DB migration push | Unknown — not checked on machine | — | Apply SQL directly via Supabase Dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | Sync script (bypass RLS for writes) | Assumed in `.env.local` (project uses it elsewhere) | — | Cannot sync without it |
| Framer Motion | Card flip animation | Yes (installed) | ^12.38.0 | — |
| All shadcn components | UI build | Yes (all required components exist) | — | — |

**Missing dependencies with no fallback:**
- `SUPABASE_SERVICE_ROLE_KEY` must be present in `.env.local` for sync script. If absent, script cannot write to `tarot_cards` table (RLS blocks anon writes). Planner should add a verification step.

**Missing dependencies with fallback:**
- Supabase CLI: if not installed, the migration SQL (`007_tarot_enrich.sql`) can be executed via the Supabase Dashboard SQL editor. Planner should note this as the fallback path.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 |
| Config file | `mystiqor-build/vitest.config.ts` |
| Quick run command | `cd mystiqor-build && npx vitest run tests/services/tarot.test.ts` |
| Full suite command | `cd mystiqor-build && npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TAROT-01 | 78 cards present in DB with name_he and meaning_upright | smoke/manual | Manual DB count: `SELECT COUNT(*) FROM tarot_cards` | N/A — DB |
| TAROT-01 | drawCards handles count=10 without crash | unit | `npx vitest run tests/services/tarot.test.ts` | Partial — existing test covers 3 cards |
| TAROT-02 | All new meta fields populated (non-null for major arcana) | smoke/manual | Manual DB check: `SELECT COUNT(*) FROM tarot_cards WHERE element IS NULL` | N/A — DB |
| TAROT-02 | API returns rich fields (element, astrology, etc.) in drawn array | integration | manual-only — requires live Supabase | — |
| TAROT-03 | SpreadSelector renders 4 spread buttons | unit | `npx vitest run tests/components/` | ❌ Wave 0 gap |
| TAROT-03 | Celtic Cross layout renders 10 position slots | unit | `npx vitest run tests/components/` | ❌ Wave 0 gap |
| TAROT-03 | SpreadLayout renders correct count per spread | unit | `npx vitest run tests/components/` | ❌ Wave 0 gap |

### Sampling Rate

- **Per task commit:** `cd mystiqor-build && npx vitest run tests/services/tarot.test.ts`
- **Per wave merge:** `cd mystiqor-build && npx vitest run`
- **Phase gate:** Full suite green + TypeScript build `cd mystiqor-build && npx tsc --noEmit` before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `tests/components/SpreadSelector.test.tsx` — covers TAROT-03 (4 spreads rendered)
- [ ] `tests/components/SpreadLayout.test.tsx` — covers TAROT-03 (position count per spread)

Update existing test:
- [ ] `tests/services/tarot.test.ts` — add Test 3 for `drawCards(cards, 10)` returns 10 cards (TAROT-01 + TAROT-03 Celtic Cross)

---

## Audit of Files to Touch

```
📄 supabase/migrations/007_tarot_enrich.sql (NEW)
├── Completeness:    0/10 — does not exist yet
├── STATUS:          🆕 BUILD

📄 src/types/database.ts (tarot_cards Row section)
├── Completeness:    6/10 — missing 7 new columns
├── Type Safety:     5/10 — new columns will be `any` until updated
├── STATUS:          🔧 REFINE
└── TASK:            Add 7 new fields to Row, Insert, Update blocks

📄 supabase/seed/tarot_cards.sql (reference only — do not modify)
├── STATUS:          ✅ DONE (38 cards for initial seed — sync script takes over)

📄 scripts/sync-tarot-meta.ts (NEW — sync script)
├── STATUS:          🆕 BUILD

📄 src/app/api/tools/tarot/route.ts
├── Completeness:    7/10 — works but missing spreadCount=10 and rich meta
├── Type Safety:     8/10 — typed TarotCardRow (will auto-improve with DB types update)
├── STATUS:          🔧 REFINE
└── TASK:            Add z.literal(10) to schema; SELECT already uses * (auto-includes new cols)

📄 src/app/(auth)/tools/tarot/page.tsx
├── Completeness:    5/10 — basic spread selector, no spread layouts, no card flip, no meta
├── STATUS:          🔨 COMPLETE
└── TASK:            Replace SPREAD_OPTIONS with SpreadSelector; add SpreadLayout; wire card flip

📄 src/components/features/tarot/ (ALL NEW)
├── SpreadSelector.tsx    🆕 BUILD
├── TarotCardTile.tsx     🆕 BUILD
├── TarotCardMeta.tsx     🆕 BUILD
├── SpreadLayout.tsx      🆕 BUILD
└── TarotCardDetailModal.tsx 🆕 BUILD
```

---

## Open Questions

1. **Is Supabase CLI available on the execution machine?**
   - What we know: The migration files exist (`001–006`) which suggests CLI was used at setup.
   - What's unclear: Whether it is installed and authenticated now.
   - Recommendation: Planner should include a step to attempt `supabase db push` and document the Supabase Dashboard SQL editor as the fallback.

2. **Do 38 existing card rows have the correct `number` field for Major Arcana?**
   - What we know: The seed SQL sets `number` for Major Arcana (0–21). Court cards have `number = NULL`.
   - What's unclear: Whether the sync script can reliably match existing DB rows to `TAROT_CARD_META` entries using `number` alone, given that pip cards have no `number` field in the current schema.
   - Recommendation: Match Major Arcana by `number`, Court cards by `name_en` string match. Build a deterministic name-to-cardNumber mapping in the sync script for robustness.

3. **Celtic Cross position 2 (crossing card) — rotate or not?**
   - What we know: Classically the crossing card is rotated 90 degrees over card 1.
   - What's unclear: CSS rotation inside grid cell may cause overflow. The UI-SPEC doesn't mandate it.
   - Recommendation: For MVP, skip the rotation and indicate position 2 with a gold numbered badge. This is Claude's discretion per CONTEXT.md.

---

## Sources

### Primary (HIGH confidence)

- Direct file reads — `src/lib/constants/tarot-data.ts` — all 78 TAROT_CARD_META entries + TAROT_SPREADS definitions verified
- Direct file reads — `supabase/migrations/001_schema.sql` — confirmed current tarot_cards schema (8 columns, SERIAL id, no meta fields)
- Direct file reads — `supabase/seed/tarot_cards.sql` — confirmed 38 cards only (22 Major + 16 Court)
- Direct file reads — `src/app/api/tools/tarot/route.ts` — confirmed current API schema (1|3|5 only)
- Direct file reads — `src/app/(auth)/tools/tarot/page.tsx` — confirmed SPREAD_OPTIONS with 3 options
- Direct file reads — `src/types/database.ts` — confirmed current TarotCardRow type (8 fields)
- Direct file reads — `package.json` — confirmed all required libraries present, no new installs needed
- Direct file reads — `vitest.config.ts` + `tests/services/tarot.test.ts` — test framework confirmed

### Secondary (MEDIUM confidence)

- Framer Motion 3D flip pattern — based on confirmed installed version (^12.38.0) and project usage patterns; standard rotateY animation approach
- Zod v4 literal union pattern — confirmed from existing `TarotInputSchema` in `route.ts`
- Tailwind v3 backface-visibility limitation — based on Tailwind v3.4.1 docs knowledge; use inline style as verified workaround

### Tertiary (LOW confidence)

- Supabase CLI availability — not verified; fallback documented

---

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — all packages verified from package.json
- Architecture: HIGH — based on direct code reads of all canonical ref files
- DB migration pattern: HIGH — matches existing migrations 001–006
- Card flip animation: MEDIUM — Framer Motion API verified, CSS 3D in RTL context not tested
- Pitfalls: HIGH — derived from direct code analysis of existing files

**Research date:** 2026-03-28
**Valid until:** 2026-04-28 (stable stack, 30-day validity)
