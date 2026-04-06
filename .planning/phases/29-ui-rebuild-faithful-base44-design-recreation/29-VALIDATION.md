---
phase: 29
slug: ui-rebuild-faithful-base44-design-recreation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-06
---

# Phase 29 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest / next build |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx next build 2>&1 \| tail -5` |
| **Full suite command** | `npx next build && npx vitest run --reporter=verbose` |
| **Estimated runtime** | ~60 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx next build 2>&1 | tail -5`
- **After every plan wave:** Run full suite
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------|-------------------|--------|
| 29-01-01 | 01 | 1 | UI-LAYOUT | build | `npx next build` | ⬜ pending |
| 29-01-02 | 01 | 1 | UI-SIDEBAR | visual | manual browser check | ⬜ pending |
| 29-01-03 | 01 | 1 | UI-DASHBOARD | visual | manual browser check | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements — this is a UI-only rebuild.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Sidebar matches BASE44 design | UI-SIDEBAR | Visual comparison | Compare sidebar to github-source/src/Layout.jsx screenshots |
| Dashboard matches BASE44 design | UI-DASHBOARD | Visual comparison | Compare dashboard to github-source/src/pages/Home.jsx screenshots |
| Tool cards display correctly | UI-TOOLS | Visual comparison | Check all 6 hero cards and 10 tool grid cards |
| Logo displays with star trail | UI-LOGO | Visual comparison | Check sidebar logo renders without background artifacts |

---

## Validation Sign-Off

- [ ] All tasks have automated verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
