---
phase: 4
slug: tools-tier-1
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-22
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | TypeScript compilation (`tsc --noEmit`) |
| **Config file** | `mystiqor-build/tsconfig.json` (existing) |
| **Quick run command** | `cd mystiqor-build && npx tsc --noEmit` |
| **Full suite command** | `cd mystiqor-build && npx tsc --noEmit` |
| **Estimated runtime** | ~12 seconds |

Phase 4 is tool page assembly + SVG components + API routes. TypeScript compilation is the automated gate. Browser testing validates visual/functional correctness (especially SVG chart rendering).

---

## Sampling Rate

- **After every task commit:** Run `cd mystiqor-build && npx tsc --noEmit`
- **After every plan wave:** Run `cd mystiqor-build && npx tsc --noEmit`
- **Before `/gsd:verify-work`:** `tsc --noEmit` must be green + manual smoke tests
- **Max feedback latency:** 12 seconds

---

## Wave 0 Requirements

Wave 0 is complete — TypeScript, Recharts, and all dependencies already installed.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| SVG natal chart renders correctly | ASTR-01 | Visual SVG rendering | Birth data → verify zodiac ring, planets, aspect lines visible |
| AI interpretation references placements | ASTR-02 | LLM output quality | Submit chart → verify AI mentions specific planets/signs |
| Daily insights change each day | TRCK-05 | Date-dependent content | Check today vs tomorrow (or change system date) |
| Personality radar chart renders | TOOL-06 | Recharts RadarChart visual | Complete questionnaire → verify 5-axis radar |
| SubscriptionGuard on all tools | TOOL-07 | Requires subscription state | Free user with 3+ analyses → verify upgrade prompt |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify commands
- [x] Sampling continuity: every task has automated verify
- [x] Wave 0 complete
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** complete
