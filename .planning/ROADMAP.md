# Roadmap — v1.2 Gap Closure

**Milestone:** v1.2 Gap Closure
**Source:** v1.2-MILESTONE-AUDIT.md (2026-04-03)
**Phases:** 3 (gap closure)

---

## Phase 25: Critical Integration Fixes
**Goal:** Fix user-facing broken links and middleware gaps identified by integration checker
**Gap Closure:** INT-01-BOTTOMTAB-404, INT-02-MIDDLEWARE-PATHS, FLOW-MOBILE-INSIGHTS-404
**Requirements:** FIX-01, FIX-02
**UI hint:** no
**Depends on:** none
**Plans:** 1/1 plans complete

Plans:
- [x] 25-01-PLAN.md — Fix BottomTabBar 404 href and add missing PROTECTED_PATHS entries

---

## Phase 26: Infrastructure Retroactive Verification
**Goal:** Create formal VERIFICATION.md for Phase 01 (core-infrastructure) — the foundation layer that was executed but never verified
**Gap Closure:** PHASE-01-VERIFICATION
**Requirements:** VER-01
**UI hint:** no
**Depends on:** none
**Plans:** 1/1 plans complete

Plans:
- [x] 26-01-PLAN.md — Verify all Phase 01 must_haves and write 01-VERIFICATION.md

---

## Phase 27: First-Pass UI Audit & Dead Code Cleanup
**Goal:** Audit all first-pass UI phases (15-24), verify completeness, resolve 12 orphaned components, wire or document deferred integrations
**Gap Closure:** PHASE-15 through PHASE-24 verification gaps, INT-03-GEM3-ORPHANED, INT-04-ANALYTICS-UNWIRED
**Requirements:** AUDIT-01, AUDIT-02, AUDIT-03
**UI hint:** no
**Depends on:** Phase 25
**Plans:** 3/3 plans complete

Plans:
- [x] 27-01-PLAN.md — Delete all 11 orphaned files and update TarotCardDetailModal
- [x] 27-02-PLAN.md — Create VERIFICATION.md for phases 15, 16, 17
- [x] 27-03-PLAN.md — Create VERIFICATION.md for phases 19, 23, 24
