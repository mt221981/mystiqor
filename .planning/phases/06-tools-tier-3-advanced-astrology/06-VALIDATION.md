---
phase: 6
slug: tools-tier-3-advanced-astrology
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-23
---

# Phase 6 — Validation Strategy

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

Phase 6 is ephemeris integration + advanced astrology tools + LLM-only tools. TypeScript is the automated gate. Browser testing validates chart rendering and ephemeris accuracy.

**Vitest status:** Not configured. Automated gate is `tsc --noEmit` only. Behavioral correctness validated manually.

---

## Sampling Rate

- **After every task commit:** Run `cd mystiqor-build && npx tsc --noEmit`
- **After every plan wave:** Run `cd mystiqor-build && npx tsc --noEmit`
- **Max feedback latency:** 12 seconds

---

## Wave 0 Requirements

Wave 0 is complete — `astronomy-engine` install is part of Plan 06-01 Task 1 (the first executable task).

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Transits show real positions | ASTR-03 | Requires ephemeris accuracy check | Compare planet positions with known date |
| Solar return chart renders | ASTR-04 | Visual SVG check | Submit birth data, verify chart + interpretation |
| Synastry dual-chart works | ASTR-05 | Requires 2 birth data sets | Enter 2 people, verify inter-aspects |
| Birth chart no longer approximate | ASTR-01 | Regression check | Verify isApproximate disclaimer removed |
| Timing tools show dates | TOOL-05 | Calendar interaction | Select activity, verify favorable dates |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify commands
- [x] Sampling continuity: every task has automated verify
- [x] Wave 0 complete (astronomy-engine installed in first task)
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** complete
