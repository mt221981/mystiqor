---
phase: 23
slug: floating-coach-bottom-tabs
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-30
---

# Phase 23 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | `mystiqor-build/vitest.config.ts` |
| **Quick run command** | `cd mystiqor-build && npx vitest run --reporter=verbose` |
| **Full suite command** | `cd mystiqor-build && npx vitest run && npx tsc --noEmit` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd mystiqor-build && npx tsc --noEmit`
- **After every plan wave:** Run `cd mystiqor-build && npx vitest run && npx tsc --noEmit`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 23-01-01 | 01 | 1 | COACH-01 | build | `cd mystiqor-build && npx tsc --noEmit` | ✅ | ⬜ pending |
| 23-01-02 | 01 | 1 | COACH-02 | build | `cd mystiqor-build && npx tsc --noEmit` | ✅ | ⬜ pending |
| 23-02-01 | 02 | 1 | COACH-03 | build | `cd mystiqor-build && npx tsc --noEmit` | ✅ | ⬜ pending |
| 23-03-01 | 03 | 2 | NAV-01 | build | `cd mystiqor-build && npx tsc --noEmit` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements. vitest + tsc already configured.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Breathing animation visible | COACH-02 | CSS animation visual check | Open any auth page, observe bubble scale 1.0→1.05 loop |
| Opener message per route | COACH-03 | Route-dependent UI text | Navigate to /tools/astrology, click bubble, verify Hebrew opener |
| Bottom tabs mobile-only | NAV-01 | Responsive breakpoint | Resize browser to <768px, verify tabs visible; >768px, verify hidden |
| Active tab glow + dot | NAV-01 | Visual indicator check | Tap dashboard tab, verify primary color + indicator dot |
| Bubble hidden on /coach | COACH-01 | Route-specific rendering | Navigate to /coach, verify no floating bubble |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
