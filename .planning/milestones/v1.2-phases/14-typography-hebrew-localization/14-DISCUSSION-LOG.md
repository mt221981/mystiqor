# Phase 14: Typography & Hebrew Localization - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-03
**Phase:** 14-typography-hebrew-localization
**Areas discussed:** Hebrew line-height approach, Tracking cleanup scope, Font loading & CLS prevention, Numeric formatting

---

## Hebrew Line-Height Approach

| Option | Description | Selected |
|--------|-------------|----------|
| Custom Tailwind utility | Define `leading-hebrew` (1.7) in tailwind.config.ts, swap all `leading-relaxed` on Hebrew text | |
| Global CSS override | Set `line-height: 1.7` on `.font-body` in globals.css — zero per-component changes | ✓ |
| Arbitrary value per-component | Replace `leading-relaxed` with `leading-[1.7]` wherever it appears | |

**User's choice:** Global CSS override
**Notes:** User preferred the approach with least per-component touch points.

---

## Tracking Cleanup Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Full codebase audit | Grep every `tracking-` usage, check if element renders Hebrew, remove/reset | |
| UI-SPEC list only | Fix only the 8 components listed in UI-SPEC component inventory | |
| Global reset + targeted Latin exceptions | Add `letter-spacing: 0` on `.font-body` and `.font-label` globally, keep `tracking-*` on `.font-headline` for Latin | ✓ |

**User's choice:** Global reset + targeted Latin exceptions
**Notes:** Consistent with global approach from line-height decision. Broadest protection against future violations.

---

## Font Loading & CLS Prevention

| Option | Description | Selected |
|--------|-------------|----------|
| Accept current FOUT | `font-display: swap` already set, do nothing extra | |
| Add `adjustFontFallback` | Configure in `next/font` declarations for auto size-adjusted fallbacks | ✓ |
| Explicit `min-height` containers | Add `min-height` to text-heavy sections to reserve space | |

**User's choice:** `adjustFontFallback` on `next/font` declarations
**Notes:** One line per font declaration, zero component changes.

---

## Numeric Formatting

| Option | Description | Selected |
|--------|-------------|----------|
| Targeted — tool output only | Apply `tabular-nums` to ~5-8 specific components | |
| Global on `.font-body` | Add `font-variant-numeric: tabular-nums` to global `.font-body` rule | ✓ |
| Utility class per-component | Use Tailwind `tabular-nums` utility manually on numeric components | |

**User's choice:** Global on `.font-body`
**Notes:** Consistent with all other decisions — global cascade pattern.

---

## Claude's Discretion

- Implementation ordering (global overrides first, then cleanup audit)
- Whether to add `leading-hebrew` custom utility as convenience
- Which `leading-*` instances to remove vs keep based on Hebrew/Latin content

## Deferred Ideas

None — discussion stayed within phase scope
