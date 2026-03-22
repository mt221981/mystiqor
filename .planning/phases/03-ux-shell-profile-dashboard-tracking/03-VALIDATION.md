---
phase: 3
slug: ux-shell-profile-dashboard-tracking
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-22
---

# Phase 3 — Validation Strategy

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

Phase 3 is UI assembly + API routes. TypeScript compilation is the automated gate. Browser testing validates visual/functional correctness.

---

## Sampling Rate

- **After every task commit:** Run `cd mystiqor-build && npx tsc --noEmit`
- **After every plan wave:** Run `cd mystiqor-build && npx tsc --noEmit`
- **Before `/gsd:verify-work`:** `tsc --noEmit` must be green + manual smoke tests pass
- **Max feedback latency:** 12 seconds

---

## Wave 0 Requirements

Wave 0 is complete — TypeScript and all dependencies already installed. No additional setup needed.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| RTL layout renders correctly | UX-01 | Visual check | Verify all text/elements flow right-to-left, no LTR leakage |
| Theme toggle persists | UX-02 | Requires browser + localStorage | Toggle theme, refresh, verify persistence |
| Mobile responsive | UX-03 | Requires viewport resize | Test at 375px, 768px breakpoints |
| Dashboard charts render with data | DASH-01-06 | Requires Supabase data | Log mood entries, verify charts update |
| Mood entry appears in dashboard | TRCK-01 | Requires real data flow | Log mood, check dashboard trend |
| Profile edit reflects immediately | PROF-01 | Requires real Supabase update | Edit name, verify sidebar/header update |
| Error boundary recovery | UX-07 | Requires simulated error | Trigger render error, verify recovery UI |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify commands (`npx tsc --noEmit`)
- [x] Sampling continuity: every task has automated verify
- [x] Wave 0 complete — no setup needed
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** complete
