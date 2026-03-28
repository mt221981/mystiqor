---
phase: 18
slug: tarot-card-library
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-28
---

# Phase 18 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.0 |
| **Config file** | `mystiqor-build/vitest.config.ts` |
| **Quick run command** | `cd mystiqor-build && npx vitest run tests/services/tarot.test.ts` |
| **Full suite command** | `cd mystiqor-build && npx vitest run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd mystiqor-build && npx vitest run tests/services/tarot.test.ts`
- **After every plan wave:** Run `cd mystiqor-build && npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 18-01-01 | 01 | 1 | TAROT-01 | smoke/manual | `SELECT COUNT(*) FROM tarot_cards` | N/A — DB | ⬜ pending |
| 18-01-02 | 01 | 1 | TAROT-02 | smoke/manual | `SELECT COUNT(*) FROM tarot_cards WHERE element IS NULL` | N/A — DB | ⬜ pending |
| 18-01-03 | 01 | 1 | TAROT-01 | unit | `npx vitest run tests/services/tarot.test.ts` | Partial | ⬜ pending |
| 18-02-01 | 02 | 2 | TAROT-03 | unit | `npx vitest run tests/components/SpreadSelector.test.tsx` | ❌ W0 | ⬜ pending |
| 18-02-02 | 02 | 2 | TAROT-03 | unit | `npx vitest run tests/components/SpreadLayout.test.tsx` | ❌ W0 | ⬜ pending |
| 18-02-03 | 02 | 2 | TAROT-02 | integration | manual-only — requires live Supabase | — | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/components/SpreadSelector.test.tsx` — stubs for TAROT-03 (4 spreads rendered)
- [ ] `tests/components/SpreadLayout.test.tsx` — stubs for TAROT-03 (position count per spread)
- [ ] Update `tests/services/tarot.test.ts` — add test for drawCards(cards, 10) returns 10 (TAROT-01 + TAROT-03)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 78 cards exist in DB with name_he | TAROT-01 | DB state verification | Run `SELECT COUNT(*) FROM tarot_cards` — expect 78 |
| All meta fields populated for major arcana | TAROT-02 | DB state verification | Run `SELECT COUNT(*) FROM tarot_cards WHERE element IS NULL AND arcana='major'` — expect 0 |
| API returns rich fields in drawn array | TAROT-02 | Requires live Supabase auth | POST /api/tools/tarot with spreadCount=3, verify response includes element, astrology, kabbalah |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
