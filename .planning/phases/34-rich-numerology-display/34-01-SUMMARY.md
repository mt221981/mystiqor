---
phase: 34-rich-numerology-display
plan: 01
subsystem: numerology-ui
tags: [numerology, ui, components, ai, kabbalah]
dependency_graph:
  requires: []
  provides: [NumberCard-enriched-face, MysticScroll-component, maxTokens-3000]
  affects: [tools/numerology, components/ui]
tech_stack:
  added: [mystic-scroll.tsx]
  patterns: [MysticScroll wrapper, enriched card face, mystic-card-gold CSS class]
key_files:
  created:
    - mystiqor-build/src/components/ui/mystic-scroll.tsx
  modified:
    - mystiqor-build/src/components/features/numerology/NumberCard.tsx
    - mystiqor-build/src/app/(auth)/tools/numerology/page.tsx
    - mystiqor-build/src/app/api/tools/numerology/route.ts
decisions:
  - Card/CardHeader/CardTitle imports kept in page.tsx — still used by input form and compatibility section
  - MysticScroll uses plain div (not shadcn Card) for full styling control via mystic-card-gold CSS class
  - Hebrew letter placed top-right in card face (flex justify-between with icon top-left) for RTL feel
metrics:
  duration: ~12 minutes
  completed: 2026-04-09
  tasks_completed: 2
  files_changed: 4
---

# Phase 34 Plan 01: Rich NumberCard Face + MysticScroll Component + maxTokens 3000 Summary

**One-liner:** Enriched numerology card faces with Kabbalistic data (Hebrew letter, sephira, keywords, association) + new MysticScroll golden-bordered component wrapping AI synthesis + bumped AI depth to 3000 tokens.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Enrich NumberCard face (NUM-01) | 6356698 | NumberCard.tsx |
| 2 | MysticScroll + rewrap + maxTokens 3000 (NUM-02) | f18b816 | mystic-scroll.tsx, page.tsx, route.ts |

## What Was Built

### Task 1 — NumberCard Face Enrichment (NUM-01)

Updated `CardContent` in `NumberCard.tsx` only. The Dialog block (lines 98–179) was left completely untouched.

New card face layout (top to bottom):
- Top row: `typeInfo.icon` (left) + Hebrew letter large `text-3xl text-accent` (right) via `flex justify-between`
- Large number: `text-5xl font-headline font-black text-primary` (unchanged)
- Hebrew label: `text-sm font-headline font-semibold text-on-surface` (unchanged)
- Meaning title: `text-xs font-body text-on-surface-variant/70` (unchanged)
- Sephira + association row: `text-[10px]` with `·` separator
- 3 keyword pills: `text-[9px] bg-primary/[0.08] border border-primary/15 rounded-full`
- Click hint: simplified to `▾` character

### Task 2 — MysticScroll Component + AI Synthesis Rewrap + maxTokens 3000 (NUM-02)

**mystic-scroll.tsx** — new UI component:
- `div` with `mystic-card-gold` CSS class (golden border + glow defined in globals.css)
- Top and bottom golden gradient bars (`via-accent opacity-60`)
- Scroll emoji header + `text-accent` title + gold separator line
- Radial gradient background glow (`rgba(212,168,83,0.04)`)
- Wrapped in `dir="rtl"`

**page.tsx** — replaced the `RevealItem > Card > CardHeader + CardContent` block for AI interpretation with:
```tsx
<RevealItem>
  <MysticScroll title="סינתזה מיסטית">
    <div className="prose prose-invert prose-sm max-w-none result-heading-glow">
      <ReactMarkdown>{result.interpretation}</ReactMarkdown>
    </div>
  </MysticScroll>
</RevealItem>
```
Existing Card imports retained — still used by input form and compatibility section.

**route.ts** — single-line change: `maxTokens: 2000` → `maxTokens: 3000`

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. All data flows from `getNumberMeaning(value)` which has complete data for numbers 1–9, 11, 22, 33.

## Threat Flags

None. No new network endpoints or trust boundaries introduced. The `maxTokens` increase is a server-side hardcoded value (T-34-01 accepted). Usage quota guard (`checkUsageQuota`) was pre-existing and remains in place (T-34-03 mitigated).

## Phase Score

| Criterion | /10 | Notes |
|-----------|-----|-------|
| Phase Goals Met | 10 | NUM-01 and NUM-02 fully implemented |
| Build Passes (0 errors) | 10 | npm run build clean |
| No Regressions | 10 | Dialog untouched, compatibility section untouched, Card imports preserved |
| Code Quality Average | 9 | TypeScript strict, JSDoc Hebrew, no any |
| Existing Code Preserved | 10 | Only CardContent modified; Dialog and all other components intact |
| Standards Compliance | 9 | RTL, Hebrew comments, absolute imports, typed Props |
| **TOTAL** | **58/60** | Above 52 threshold |

## Self-Check

Files exist:
- `mystiqor-build/src/components/ui/mystic-scroll.tsx` — FOUND
- `mystiqor-build/src/components/features/numerology/NumberCard.tsx` — FOUND (modified)
- `mystiqor-build/src/app/(auth)/tools/numerology/page.tsx` — FOUND (modified)
- `mystiqor-build/src/app/api/tools/numerology/route.ts` — FOUND (modified, maxTokens: 3000 confirmed)

Commits exist:
- `6356698` — feat(34-01): enrich NumberCard face with Hebrew letter, sephira, keywords
- `f18b816` — feat(34-01): MysticScroll component + rewrap AI synthesis + maxTokens 3000

## Self-Check: PASSED
