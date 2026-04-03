# Phase 14: Typography & Hebrew Localization - Context

**Gathered:** 2026-04-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Polish typography across all existing pages — enforce Heebo font rules for Hebrew text, correct line-heights, remove tracking on Hebrew, ensure font roles match the UI-SPEC contract, and prevent CLS during font loading. No new features or pages.

</domain>

<decisions>
## Implementation Decisions

### Hebrew Body Text Global Overrides
- **D-01:** Add `line-height: 1.7` on `.font-body` in `globals.css` — global override, no per-component changes needed. Hebrew body text gets correct spacing automatically.
- **D-02:** Add `letter-spacing: 0` on `.font-body` AND `.font-label` in `globals.css` — prevents tracking utilities from affecting Hebrew text. Latin headings using `.font-headline` keep their existing tracking.
- **D-03:** Add `font-variant-numeric: tabular-nums` on `.font-body` in `globals.css` — all numeric values in Hebrew context (gematria, scores, dates, stats) are tabular-aligned. No per-component `tabular-nums` utilities needed.

### Font Loading & CLS Prevention
- **D-04:** Enable `adjustFontFallback` on all `next/font/google` declarations in `layout.tsx` — auto-generates size-adjusted fallback fonts that match Heebo/Inter/Manrope metrics. Zero component changes, prevents FOUT-induced CLS.

### Cleanup Pass
- **D-05:** After global overrides are in place, audit and remove now-redundant per-component `leading-relaxed` / `leading-[1.7]` classes on Hebrew text elements — they are superseded by the global `.font-body` rule.
- **D-06:** Audit and remove `tracking-tight` / `tracking-wider` / `tracking-widest` from elements that render Hebrew text. Keep tracking on `.font-headline` elements that render Latin text (Plus Jakarta Sans).

### Claude's Discretion
- Ordering of cleanup (global overrides first, then per-component audit) is implementation detail
- Whether to add a `leading-hebrew` custom Tailwind utility as a convenience — not required but allowed if it aids clarity
- Which specific `leading-*` instances to remove vs keep — use judgment based on whether the element renders Hebrew or Latin content

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Typography Spec
- `.planning/phases/14-typography-hebrew-localization/14-UI-SPEC.md` — Full typography contract: font roles, sizes, weights, line-heights, Hebrew-specific rules, color tokens, spacing scale, component inventory

### Font Configuration
- `src/app/layout.tsx` — Font declarations (Heebo, Plus Jakarta Sans, Inter, Manrope) with CSS variables
- `tailwind.config.ts` — fontFamily definitions (`font-headline`, `font-body`, `font-label`)
- `src/app/globals.css` — CSS variables, existing typography rules

### Component Inventory (from UI-SPEC)
- `src/components/forms/FormInput.tsx` — Verify Heebo on Hebrew placeholder/label
- `src/components/forms/BirthDataForm.tsx` — Hebrew error messages font-body weight 400
- `src/components/features/insights/ExplainableInsight.tsx` — AI-generated Hebrew text line-height
- `src/components/features/numerology/NumberCard.tsx` — Gematria values tabular-nums
- `src/components/features/history/AnalysisHistory.tsx` — Hebrew timestamps DD/MM/YYYY
- `src/app/(auth)/onboarding/` — Step titles Hebrew font-headline weight 600
- `src/app/(auth)/dashboard/` — Stat captions Hebrew font-label weight 500
- `src/components/layouts/Header.tsx` — Nav items Hebrew font-label no tracking

### Known Tracking Violations
- `src/components/layouts/StandardSectionHeader.tsx` — `tracking-tight` on Hebrew page titles
- `src/components/layouts/PageHeader.tsx` — `tracking-tight` on Hebrew page titles
- `src/components/layouts/Sidebar.tsx` — `tracking-wider` on Hebrew section labels
- `src/components/features/dashboard/DailyInsightCard.tsx` — `tracking-wider` on Hebrew label text

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `font-body`, `font-headline`, `font-label` Tailwind classes already in use across ~30+ components
- `globals.css` already has CSS variable structure for typography overrides
- `next/font/google` already configured for all 4 fonts with CSS variables

### Established Patterns
- Components use Tailwind font classes (`font-headline`, `font-body`, `font-label`) not inline styles
- `leading-relaxed` is the de facto Hebrew line-height (~1.625) — needs global upgrade to 1.7
- Body element already has `font-body` class — global override will cascade

### Integration Points
- `src/app/layout.tsx` line 112: `<body className="font-body ...">` — the global cascade root
- `src/app/globals.css` — where the `.font-body` overrides will live
- `tailwind.config.ts` — fontFamily definitions (no changes expected, already correct)

</code_context>

<specifics>
## Specific Ideas

User consistently chose the "global override" pattern for all typography decisions — minimize per-component changes, let CSS cascade do the work. This phase should be compact: a small globals.css change, a layout.tsx tweak, and a cleanup audit.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 14-typography-hebrew-localization*
*Context gathered: 2026-04-03*
