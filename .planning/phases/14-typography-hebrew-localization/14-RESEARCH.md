# Phase 14: Typography & Hebrew Localization — Research

**Researched:** 2026-03-27
**Domain:** Next.js font loading (next/font/google), Tailwind CSS typography utilities, RTL string replacement
**Confidence:** HIGH

---

## Summary

Phase 14 is a targeted text-correction pass — no new screens, no new components, no backend changes. Two distinct concerns must be addressed:

**TYPO-01 (Font):** Heebo is already loaded via `next/font/google` with `variable: '--font-hebrew'`, and `tailwind.config.ts` maps `font-body` to `['var(--font-hebrew)', 'Heebo', ...]`. The `<body>` tag already carries `className="font-body"`. The infrastructure is correct. The only risk is individual components that override `font-body` with `font-sans` (the Tailwind default system font stack). A grep audit of the entire `src/` tree for `font-sans` returned zero matches — meaning TYPO-01 requires verification and documentation, but likely zero code changes.

**TYPO-02 (Terms):** Three English terms appear in JSX display strings across eight files. The replacement mapping is fully defined in the approved UI-SPEC. The critical discipline is scoping: replace only visible text in JSX return values — never code identifiers, URL slugs, TypeScript names, or code comments. `src/lib/constants/tool-names.ts` already has the correct Hebrew values and must not be touched.

**Primary recommendation:** Execute as two clearly separated tasks — Task 1: verify Heebo font propagation (confirm zero `font-sans` overrides, document the `--font-hebrew` variable chain); Task 2: systematic string replacement across the eight confirmed files, respecting the do-not-replace rules exactly as specified in the UI-SPEC.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| TYPO-01 | פונט Heebo טעון ומוצג בכל טקסט עברי באפליקציה (body + headings) | Font already loaded via `next/font/google`; `--font-hebrew` CSS variable chain confirmed; `font-body` on `<body>` confirmed; zero `font-sans` overrides found in grep |
| TYPO-02 | שלושה מונחים אנגליים ("Human Design", "Solar Return", "HTP + Koppitz") מוחלפים בעברית בכל מקום ב-UI | Eight files confirmed with display string occurrences; term mapping defined in UI-SPEC; `tool-names.ts` already correct |
</phase_requirements>

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `next/font/google` | bundled with Next.js 16.x | Self-hosted Google Fonts with CSS variable injection | Zero FOUT, auto-subset, performance optimized |
| Tailwind CSS | 3.4.x | Font utility classes (`font-body`, `font-headline`, `font-label`) | Already configured and in use |

### No New Dependencies

This phase requires zero new package installations. All tooling is already in place.

**Installation:** None required.

**Version verification (from package.json):**
- next: ^16.2.0 (installed)
- tailwindcss: ^3.4.1 (installed)

---

## Architecture Patterns

### Font Loading Pattern (already implemented)

```
layout.tsx
├── Imports: Plus_Jakarta_Sans, Inter, Manrope, Heebo from 'next/font/google'
├── Each font → CSS variable (--font-headline, --font-body, --font-label, --font-hebrew)
├── All variables injected on <html> className
└── <body className="font-body"> → resolves to ['var(--font-hebrew)', 'Heebo', ...]
```

### Tailwind fontFamily mapping (tailwind.config.ts line 27):

```typescript
fontFamily: {
  headline: ['var(--font-headline)', 'Plus Jakarta Sans', 'sans-serif'],
  body: ['var(--font-hebrew)', 'Heebo', 'var(--font-body)', 'Inter', 'sans-serif'],
  label: ['var(--font-label)', 'Manrope', 'sans-serif'],
},
```

The `font-body` utility resolves Heebo as the first font, with Inter as fallback. This is correct and complete. No changes needed in `tailwind.config.ts` or `layout.tsx`.

### SVG font override — known edge case

`HumanDesignCenters.tsx` line 107 contains an inline `fontFamily="sans-serif"` attribute on a `<text>` SVG element. This is an SVG attribute (not a Tailwind class) and is considered acceptable for SVG rendering. However, it warrants explicit consideration: the `<text>` elements display Hebrew center names — if Heebo should apply there too, the attribute should be changed to `fontFamily="Heebo, sans-serif"`. The UI-SPEC does not mandate SVG font changes, so this is left as a documented observation. The planner should make a deliberate keep/change decision here.

### String Replacement Pattern

Replace only JSX display strings. A JSX display string is one that appears:
- Directly inside JSX return value markup (e.g., `>Human Design<`)
- In string properties that become visible text (e.g., `description="..."`, `title="..."`, `label="..."`)
- In template literals rendered into JSX

Do NOT replace:
- Lines starting with `*`, `//`, `/**` (comments)
- TypeScript interface/type names
- Import paths
- `id` properties (data identifiers like `{ id: 'htp_basics' }`)
- `prompt` properties (text sent to AI, not shown to user directly)
- Function/variable names

---

## Term Replacement: Exact File Inventory

### Human Design → עיצוב אנושי

| File | Line | Type | Action |
|------|------|------|--------|
| `src/app/(auth)/tools/human-design/page.tsx` | Lines 4, 37, 56, 67 | JSDoc comments only | NO ACTION — comments acceptable as English |
| `src/components/features/astrology/HumanDesignCenters.tsx` | Line 52 | `aria-label` on `<svg>` = "מפת מרכזי Human Design" | REPLACE: "מפת מרכזי עיצוב אנושי" |
| `src/components/forms/BirthDataForm.tsx` | Line 4 | JSDoc comment only | NO ACTION |

**Note on `human-design/page.tsx`:** The page already displays "עיצוב אנושי" in Hebrew (line 113: `title="עיצוב אנושי"`, line 116: `{ label: 'עיצוב אנושי' }`). Only comment lines contain English "Human Design". No display string changes needed in this file.

**Note on `HumanDesignCenters.tsx`:** The only display string is the `aria-label` on the SVG. All other "Human Design" occurrences are in JSDoc comments.

### Solar Return → חזרת שמש

| File | Line | Type | Action |
|------|------|------|--------|
| `src/app/(auth)/learn/astrology/page.tsx` | Line 27 | `label: 'חזרת שמש'` — ALREADY CORRECT | NO ACTION |
| `src/components/forms/BirthDataForm.tsx` | Line 4 | JSDoc comment only | NO ACTION |

**Finding:** "Solar Return" in display strings is already Hebrew everywhere checked. The term appears parenthetically inside an AI prompt string (`prompt: 'מהי חזרת שמש (Solar Return) ומה אפשר ללמוד ממנה?'`) — this parenthetical context is a prompt sent to the AI tutor and is acceptable to retain.

### HTP / Koppitz → בית-עץ-אדם / קופיץ

This requires the most nuanced treatment. "HTP" and "Koppitz" are proper names of psychological tests. The UI-SPEC maps `HTP + Koppitz` → `בית-עץ-אדם`. However after reviewing actual display strings:

| File | Occurrence | Context | Action |
|------|-----------|---------|--------|
| `src/app/(auth)/tools/drawing/page.tsx` line 50 | `description="ניתוח פסיכולוגי של ציורים HTP — בית, עץ, אדם — עם מדדי Koppitz ו-FDM"` | PageHeader description (visible text) | REPLACE: `description="ניתוח פסיכולוגי של ציורים (בית-עץ-אדם) — עם מדדי קופיץ ו-FDM"` |
| `src/app/(auth)/learn/drawing/page.tsx` line 23 | `label: 'מה זה HTP?'` | Button label (visible) | REPLACE: `label: 'מה זה בית-עץ-אדם?'` |
| `src/app/(auth)/learn/drawing/page.tsx` line 24 | `label: 'ציון Koppitz'` | Button label (visible) | REPLACE: `label: 'ציון קופיץ'` |
| `src/app/(auth)/learn/tutorials/page.tsx` line 61 | `description: 'יסודות HTP, ניקוד Koppitz, מודל FDM וצבעים'` | Visible description | REPLACE: `description: 'יסודות בית-עץ-אדם, ניקוד קופיץ, מודל FDM וצבעים'` |
| `src/app/(auth)/learn/tutorials/page.tsx` line 64 | `name: 'יסודות HTP'` | Topic name (visible) | REPLACE: `name: 'יסודות בית-עץ-אדם'` |
| `src/app/(auth)/learn/tutorials/page.tsx` line 65 | `name: 'ניקוד Koppitz'` | Topic name (visible) | REPLACE: `name: 'ניקוד קופיץ'` |
| `src/components/features/drawing/DrawingConceptCards.tsx` line 34 | `title: 'מהו מבחן HTP?'` | Card title (visible) | REPLACE: `title: 'מהו מבחן בית-עץ-אדם?'` |
| `src/components/features/drawing/DrawingConceptCards.tsx` line 37 | `'מבחן HTP (בית-עץ-אדם) פותח...'` | Card description (visible) | REPLACE: remove "HTP" abbrev, keep full Hebrew name |
| `src/components/features/drawing/DrawingConceptCards.tsx` line 43 | `title: 'מדדי Koppitz'` | Card title (visible) | REPLACE: `title: 'מדדי קופיץ'` |
| `src/components/features/drawing/DrawingConceptCards.tsx` line 44 | `subtitle: 'Koppitz Emotional Indicators'` | Card subtitle (visible) | KEEP — this is the official English academic name, used as subtitle to the Hebrew title; acceptable |
| `src/components/features/drawing/DrawingConceptCards.tsx` line 46 | `'ציון Koppitz גבוה...'` inside Hebrew prose | Inline in Hebrew description | REPLACE: `'ציון קופיץ גבוה...'` |
| `src/components/features/drawing/KoppitzVisualization.tsx` line 59 | `<span>מדדי Koppitz</span>` | Card title text (visible) | REPLACE: `<span>מדדי קופיץ</span>` |
| `src/components/features/drawing/DrawingCompare.tsx` line 147 | `ציון Koppitz` | Label text (visible) | REPLACE: `ציון קופיץ` |
| `src/components/features/drawing/DrawingCompare.tsx` line 300 | `שינוי ציון Koppitz:` | Label text (visible) | REPLACE: `שינוי ציון קופיץ:` |

**Keep as-is (not display strings):**
- `KoppitzDelta` function name (line 76) — code identifier
- `koppitz_score` variable/property names — code identifiers
- `koppitzScore` prop names — code identifiers
- Comment lines mentioning HTP/Koppitz in JSDoc — acceptable English in comments
- `id: 'htp_basics'`, `id: 'koppitz_scoring'` — data identifiers, not display text
- `prompt:` properties (AI prompts) — not user-facing display strings

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Font self-hosting | Manual @font-face CSS | `next/font/google` (already in use) | Automatic subset, zero CLS, cache headers |
| String replacement | Runtime i18n system | Static search-and-replace in JSX source | Phase is a one-time correction, no runtime switching needed |

---

## Common Pitfalls

### Pitfall 1: Over-replacing — touching code identifiers
**What goes wrong:** Replacing `koppitz_score` property name or `id: 'koppitz_scoring'` breaks TypeScript types and DB queries.
**Why it happens:** A global find-and-replace doesn't distinguish JSX text from code.
**How to avoid:** Review every match manually. Replace only strings rendered into the DOM.
**Warning signs:** TypeScript errors after replacement; broken API calls.

### Pitfall 2: Replacing inside prompt strings sent to AI
**What goes wrong:** Changing `prompt: 'הסבר לי את שיטת HTP...'` may confuse the AI tutor since "HTP" is the internationally recognized term.
**Why it happens:** `prompt` keys look like display strings but are AI system input.
**How to avoid:** `prompt:` property values are AI instructions — treat like code, not UI copy.

### Pitfall 3: Replacing JSDoc comments when not needed
**What goes wrong:** Wastes time, creates noise in diffs.
**Why it happens:** English comments like `/** דף Human Design */` look like they need updating.
**How to avoid:** Per UI-SPEC and CLAUDE.md: English in legacy JSDoc comments is acceptable. Skip all comment lines.

### Pitfall 4: Breaking the font chain by editing tailwind.config.ts
**What goes wrong:** Changing the `body` fontFamily array breaks Heebo loading.
**Why it happens:** Desire to "clean up" the multi-font fallback chain.
**How to avoid:** Do not touch `tailwind.config.ts` or `layout.tsx`. They are correct as-is.

### Pitfall 5: Treating SVG `fontFamily` attribute as `font-sans` override
**What goes wrong:** Spending time on SVG text element font attributes that aren't causing the described problem.
**Why it happens:** `fontFamily="sans-serif"` in `HumanDesignCenters.tsx` line 107 looks like a font mismatch.
**How to avoid:** This is an SVG attribute on a visualization component, not a Heebo propagation failure. Treat separately and only change if explicitly required.

---

## Code Examples

### Verified: font-body chain (from layout.tsx + tailwind.config.ts)

```typescript
// Source: mystiqor-build/src/app/layout.tsx line 42-47
const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-hebrew',
  display: 'swap',
});

// Source: mystiqor-build/tailwind.config.ts line 27
body: ['var(--font-hebrew)', 'Heebo', 'var(--font-body)', 'Inter', 'sans-serif'],
```

### Verified: aria-label replacement pattern

```tsx
// BEFORE (HumanDesignCenters.tsx line 52)
<svg viewBox="0 0 500 500" className="w-full max-w-sm" aria-label="מפת מרכזי Human Design">

// AFTER
<svg viewBox="0 0 500 500" className="w-full max-w-sm" aria-label="מפת מרכזי עיצוב אנושי">
```

### Verified: card title replacement pattern

```tsx
// BEFORE (KoppitzVisualization.tsx line 59)
<span>מדדי Koppitz</span>

// AFTER
<span>מדדי קופיץ</span>
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual `@font-face` in CSS | `next/font/google` with `variable` | Next.js 13+ | Zero FOUT, automatic preload, reduced LCP |
| Separate Hebrew font CSS file | Inline CSS variable via `next/font` | 2023 | Single source of truth, no network waterfall |

---

## Open Questions

1. **SVG fontFamily attribute in HumanDesignCenters.tsx**
   - What we know: Line 107 has `fontFamily="sans-serif"` on SVG `<text>` elements that render Hebrew center names.
   - What's unclear: The UI-SPEC does not explicitly address SVG font attributes. Is this within TYPO-01 scope?
   - Recommendation: Planner should make an explicit keep/change decision. If changed, use `fontFamily="Heebo, sans-serif"`. If kept, document as out-of-scope.

2. **`Koppitz` in card subtitle (DrawingConceptCards.tsx line 44)**
   - What we know: `subtitle: 'Koppitz Emotional Indicators'` is the official English academic name of the test methodology.
   - What's unclear: Should academic English subtitles be replaced with Hebrew?
   - Recommendation: Keep as-is. This is an internationally recognized proper name used as a clarifying subtitle beneath the Hebrew title. Replacing it would harm discoverability for users who know the technical term.

---

## Environment Availability

Step 2.6: SKIPPED — Phase is purely source-code string replacement and font class verification. No external tools, services, databases, or CLIs beyond the existing Next.js build are required.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.x + @testing-library/react 16.x |
| Config file | `mystiqor-build/vitest.config.ts` |
| Quick run command | `cd mystiqor-build && npx vitest run tests/` |
| Full suite command | `cd mystiqor-build && npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TYPO-01 | `font-body` class on `<body>` renders Heebo | unit (component render) | `npx vitest run tests/components/layout.test.tsx` | ❌ Wave 0 |
| TYPO-02 | English terms absent from rendered output | unit (snapshot/text check) | `npx vitest run tests/components/localization.test.tsx` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `cd mystiqor-build && npx vitest run tests/`
- **Per wave merge:** `cd mystiqor-build && npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `tests/components/layout.test.tsx` — covers TYPO-01: verifies `<body>` has `font-body` class and that `--font-hebrew` variable is set
- [ ] `tests/components/localization.test.tsx` — covers TYPO-02: renders affected components, asserts English terms ("Human Design", "Koppitz", "HTP") are absent from DOM text content, Hebrew terms present

*(Existing tests in `tests/components/` — `onboarding.test.tsx`, `tool-grid.test.tsx` — cover different features and remain unaffected.)*

---

## Sources

### Primary (HIGH confidence)

- Direct file reads: `mystiqor-build/src/app/layout.tsx` — font loading confirmed
- Direct file reads: `mystiqor-build/tailwind.config.ts` — fontFamily mapping confirmed
- Direct file reads: `mystiqor-build/src/lib/constants/tool-names.ts` — Hebrew term mapping confirmed correct
- Direct file reads: 8 source files containing English display strings — occurrences verified line-by-line
- `.planning/phases/14-typography-hebrew-localization/14-UI-SPEC.md` — design contract and replacement scope

### Secondary (MEDIUM confidence)

- `next/font/google` pattern knowledge — verified against existing `layout.tsx` implementation which is already working

### Tertiary (LOW confidence)

- None — all claims verified against actual source files.

---

## Project Constraints (from CLAUDE.md)

| Directive | Impact on Phase 14 |
|-----------|-------------------|
| TypeScript strict — no `any`, no `@ts-ignore` | String replacements must not introduce type errors |
| Max 300 lines per file | No files modified in this phase approach that limit |
| Hebrew labels, errors, placeholders | Reinforces TYPO-02 goal — all user-visible text must be Hebrew |
| `dir="rtl"` on root layout | Already in place; no change needed |
| Code that works — do not touch | `tailwind.config.ts`, `layout.tsx`, `tool-names.ts` are working correctly — do not change |
| Naming — camelCase functions, PascalCase components | No new functions/components introduced in this phase |
| JSDoc in Hebrew | New code comments should be Hebrew; legacy English comments are acceptable |
| **NEVER rewrite something that already works** | Heebo font loading infrastructure is complete — no refactoring |

---

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — verified against actual installed packages and existing code
- Architecture: HIGH — read directly from layout.tsx and tailwind.config.ts
- Pitfalls: HIGH — identified from direct code inspection, not hypothetical
- Term inventory: HIGH — every file grep'd, every occurrence classified

**Research date:** 2026-03-27
**Valid until:** 2026-04-27 (stable config, no third-party dependencies changing)
