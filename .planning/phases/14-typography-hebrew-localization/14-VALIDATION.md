---
phase: 14
slug: typography-hebrew-localization
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-27
---

# Phase 14 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | mystiqor-build/vitest.config.ts or none — Wave 0 installs |
| **Quick run command** | `cd mystiqor-build && npx vitest run --reporter=verbose` |
| **Full suite command** | `cd mystiqor-build && npx vitest run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd mystiqor-build && npx vitest run --reporter=verbose`
- **After every plan wave:** Run `cd mystiqor-build && npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 14-01-01 | 01 | 1 | TYPO-01 | grep | `grep -q 'font-body' mystiqor-build/src/app/layout.tsx` | ✅ | ⬜ pending |
| 14-01-02 | 01 | 1 | TYPO-02 | grep | `grep -rn 'עיצוב אנושי\|חזרת שמש\|בית-עץ-אדם' mystiqor-build/src/` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Verify vitest is available or install
- [ ] Confirm grep-based verification commands work on Windows (use git bash)

*Existing font infrastructure covers TYPO-01. String replacements for TYPO-02 are verified via grep.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Heebo renders visually in browser | TYPO-01 | Font rendering is visual | Open app in browser, inspect body text font-family |
| Hebrew strings display correctly in RTL | TYPO-02 | RTL visual layout | Check sidebar, tool pages, and card headings in browser |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
