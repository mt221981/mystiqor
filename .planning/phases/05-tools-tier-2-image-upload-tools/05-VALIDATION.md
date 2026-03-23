---
phase: 5
slug: tools-tier-2-image-upload-tools
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-23
---

# Phase 5 — Validation Strategy

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

Phase 5 is image upload tools + canvas + compatibility. TypeScript is the automated gate. Browser testing validates image upload flows and canvas interaction.

**Vitest status:** Vitest is NOT configured for this phase. No plan creates or configures a test runner. All `<automated>` verify commands use `tsc --noEmit` (type-checking only). Behavioral correctness is validated manually (see Manual-Only Verifications below). Vitest setup is deferred to a future phase dedicated to test infrastructure.

---

## Sampling Rate

- **After every task commit:** Run `cd mystiqor-build && npx tsc --noEmit`
- **After every plan wave:** Run `cd mystiqor-build && npx tsc --noEmit`
- **Before `/gsd:verify-work`:** `tsc --noEmit` must be green + manual smoke tests
- **Max feedback latency:** 12 seconds

---

## Wave 0 Requirements

Wave 0 is complete — all dependencies already installed (sharp, openai vision, recharts). No test framework setup is included in Wave 0; `wave_0_complete` refers to dependency installation only, not test runner configuration.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Drawing canvas works in-browser | DRAW-01 | Canvas API interaction | Draw on canvas, verify strokes render |
| Image upload + LLM vision analysis | DRAW-02, GRPH-01 | Requires real file + LLM | Upload image, verify AI interpretation |
| Koppitz/FDM indicators render | GRPH-03 | Visual component check | Submit graphology, verify indicator charts |
| Compatibility dual-input form | TOOL-04 | Requires 2 birth data sets | Enter 2 people, verify combined analysis |
| SubscriptionGuard on all tools | All | Requires subscription state | Free user, verify upgrade prompt |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify commands
- [x] Sampling continuity: every task has automated verify
- [x] Wave 0 complete (dependencies only; Vitest deferred)
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** complete
