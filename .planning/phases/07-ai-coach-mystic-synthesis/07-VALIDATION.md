---
phase: 7
slug: ai-coach-mystic-synthesis
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-24
---

# Phase 7 — Validation Strategy

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

**Vitest status:** Not configured. Automated gate is `tsc --noEmit` only.

---

## Sampling Rate

- **After every task commit:** Run `cd mystiqor-build && npx tsc --noEmit`
- **After every plan wave:** Run `cd mystiqor-build && npx tsc --noEmit`
- **Max feedback latency:** 12 seconds

---

## Wave 0 Requirements

Wave 0 is complete — all dependencies installed, DB tables exist.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Coach references user analyses | COCH-01 | Requires real user data + LLM | Send message, verify coach mentions natal chart/numerology |
| Chat persists across sessions | COCH-02 | Requires session state | Send messages, refresh, verify history loads |
| Journey progress tracking | COCH-04 | Multi-step interaction | Start journey, complete steps, verify progress |
| Synthesis cross-references tools | SYNT-01 | LLM output quality | Generate synthesis, verify it mentions 2+ tool types |
| Weekly report covers 7 days | SYNT-03 | Date-dependent data | Run after using tools for a week |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify commands
- [x] Sampling continuity: every task has automated verify
- [x] Wave 0 complete (deps only; Vitest deferred)
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** complete
