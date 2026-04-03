# Phase 27: First-Pass UI Audit & Dead Code Cleanup - Context

**Gathered:** 2026-04-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Audit all 6 first-pass UI phases (15, 16, 17, 19, 23, 24), delete all 12 orphaned components/hooks/services, and create full VERIFICATION.md for each first-pass phase.

</domain>

<decisions>
## Implementation Decisions

### Orphan Disposition
- **D-01:** Delete ALL orphaned components, hooks, and services — no exceptions. Clean slate approach.
- **D-02:** Components to delete:
  - `src/components/ui/nebula-button.tsx` (38 lines, 0 imports)
  - `src/components/ui/glass-input.tsx` (32 lines, 0 imports)
  - `src/components/ui/glass-card.tsx` (38 lines, 1 import — TarotCardDetailModal must be updated to remove import)
  - `src/components/features/insights/ExplainableInsight.tsx` (168 lines, 0 page imports)
  - `src/components/features/shared/AnalysisHistory.tsx` (122 lines, 0 page imports)
  - `src/components/features/shared/ToolPageHero.tsx` (127 lines, untracked by git)
  - `src/components/forms/BirthDataForm.tsx` (120 lines, 0 page imports)
- **D-03:** Hooks to delete:
  - `src/hooks/useMobile.ts` (35 lines, 0 imports)
  - `src/hooks/useAnalytics.ts` (64 lines — usePageTracking + useToolEvent, never called)
- **D-04:** Services to delete:
  - `src/services/analysis/rule-engine.ts` (142 lines — GEM 3, migrated but never wired)
- **D-05:** Server actions to delete:
  - `src/app/actions/auth.ts` signOut action (Header uses `@/lib/supabase/auth` instead)
- **D-06:** When deleting GlassCard, update TarotCardDetailModal to remove its import and replace with a plain div or existing component.

### Verification Depth
- **D-07:** Full VERIFICATION.md for EACH of the 6 first-pass phases (15, 16, 17, 19, 23, 24) — same depth as Phase 01/02 verification. Individual reports per phase.
- **D-08:** Each verification should check: files exist, imports work, visual features present, no broken references, anti-pattern scan.

### Claude's Discretion
- Order of operations (delete first then verify, or verify first then delete)
- How to handle GlassCard's single consumer (TarotCardDetailModal) — replace with what
- Whether to combine small deletions into single commits or one-per-file
- Verification report format — follow Phase 01/02 gold standard but adapt for first-pass phases that have no formal plans/must_haves

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone Audit
- `.planning/v1.2-MILESTONE-AUDIT.md` — Integration checker results with full orphan inventory and adoption data

### First-Pass Phase Summaries
- `.planning/phases/15-icons-migration/15-01-SUMMARY.md` — Icons migration work
- `.planning/phases/16-css-interaction-polish/16-01-SUMMARY.md` — CSS polish work
- `.planning/phases/17-loading-reveal-animations/17-01-SUMMARY.md` — Animation work
- `.planning/phases/19-astrology-knowledge-base/19-01-SUMMARY.md` — Astrology KB
- `.planning/phases/19-astrology-knowledge-base/19-02-SUMMARY.md` — Astrology KB part 2
- `.planning/phases/23-floating-coach-bottom-tabs/23-03-SUMMARY.md` — Floating coach
- `.planning/phases/24-atmospheric-depth-sweep/24-02-SUMMARY.md` — Atmospheric effects
- `.planning/phases/24-atmospheric-depth-sweep/24-03-SUMMARY.md` — Atmospheric effects part 2

### Verification Format Reference
- `.planning/phases/01-core-infrastructure/01-VERIFICATION.md` — Gold standard format
- `.planning/phases/02-core-features/02-VERIFICATION.md` — Gold standard format

### Project Standards
- `./CLAUDE.md` — Scoring system and code standards

</canonical_refs>

<code_context>
## Existing Code Insights

### Files to Delete (12 orphans)
- `src/components/ui/nebula-button.tsx` — 0 imports anywhere
- `src/components/ui/glass-input.tsx` — 0 imports anywhere
- `src/components/ui/glass-card.tsx` — 1 import (TarotCardDetailModal)
- `src/components/features/insights/ExplainableInsight.tsx` — 0 page imports
- `src/components/features/shared/AnalysisHistory.tsx` — 0 page imports
- `src/components/features/shared/ToolPageHero.tsx` — untracked by git
- `src/components/forms/BirthDataForm.tsx` — 0 page imports
- `src/hooks/useMobile.ts` — 0 imports
- `src/hooks/useAnalytics.ts` — 0 imports from pages/layout
- `src/services/analysis/rule-engine.ts` — 0 imports from API routes
- `src/app/actions/auth.ts` — orphaned, Header uses different import

### Dependency to Handle
- TarotCardDetailModal imports GlassCard — needs update when GlassCard is deleted

### First-Pass Phase Adoption (from integration checker)
- Phase 15 (icons): react-icons/gi adopted across all tool pages — GOOD
- Phase 16 (CSS): text-gradient-gold in 7 files, celestial-glow in 4, glass-panel in 4 — GOOD. NebulaButton/GlassInput/GlassCard orphaned.
- Phase 17 (animations): MysticSkeleton in 24 files, animations presets in 28 — EXCELLENT. ProgressiveReveal in 3 — LOW.
- Phase 19 (astrology KB): Content data consumed by dictionary components — GOOD
- Phase 23 (floating coach): FloatingCoachBubble + Panel in layout, Zustand store, coach API — GOOD
- Phase 24 (atmospheric): MysticLoadingText in 17 pages — EXCELLENT

</code_context>

<specifics>
## Specific Ideas

No specific requirements — follow the established VERIFICATION.md format from Phase 01/02 for each first-pass phase, adapting for the fact that first-pass phases have no formal PLAN.md must_haves (use SUMMARY.md claims as the verification baseline instead).

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 27-ui-audit-dead-code-cleanup*
*Context gathered: 2026-04-03*
