---
phase: 19
slug: astrology-knowledge-base
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-28
---

# Phase 19 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + jsdom |
| **Config file** | `mystiqor-build/vitest.config.ts` |
| **Quick run command** | `cd mystiqor-build && npx vitest run tests/services/astrology-data.test.ts` |
| **Full suite command** | `cd mystiqor-build && npx vitest run` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd mystiqor-build && npx vitest run tests/services/astrology-data.test.ts`
- **After every plan wave:** Run `cd mystiqor-build && npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 19-01-01 | 01 | 1 | ASTRO-01 | unit | `npx vitest run tests/services/astrology-data.test.ts` | ❌ W0 | ⬜ pending |
| 19-01-02 | 01 | 1 | ASTRO-02 | unit | `npx vitest run tests/services/astrology-data.test.ts` | ❌ W0 | ⬜ pending |
| 19-01-03 | 01 | 1 | ASTRO-03 | unit | `npx vitest run tests/services/astrology-data.test.ts` | ❌ W0 | ⬜ pending |
| 19-01-04 | 01 | 1 | ASTRO-04 | unit | `npx vitest run tests/services/astrology-data.test.ts` | ❌ W0 | ⬜ pending |
| 19-02-01 | 02 | 2 | ASTRO-01..04 | visual | manual-only | — | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/services/astrology-data.test.ts` — data completeness checks for ASTRO-01 through ASTRO-04
- [ ] Verify `src/components/ui/accordion.tsx` exists — if missing, add via `npx shadcn add accordion`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Dictionary page renders all 4 tabs | ASTRO-01..04 | Visual/layout | Navigate to /learn/astrology/dictionary, verify 4 tabs load |
| Zodiac grid shows 12 signs with emoji, color, description | ASTRO-01 | Visual rendering | Click מזלות tab, verify 12 cards |
| Planet list shows 10 entries with symbol | ASTRO-02 | Visual rendering | Click כוכבים tab, verify 10 entries |
| Houses accordion shows 12 entries | ASTRO-03 | Visual rendering | Click בתים tab, verify 12 accordion items |
| Aspects list shows 7 with strength bars | ASTRO-04 | Visual rendering | Click אספקטים tab, verify 7 items with bars |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
