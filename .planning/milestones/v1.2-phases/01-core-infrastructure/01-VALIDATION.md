---
phase: 1
slug: core-infrastructure
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-20
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (not yet installed — Wave 0) |
| **Config file** | none — Wave 0 installs |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run && npx tsc --noEmit` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx tsc --noEmit`
- **After every plan wave:** Run `npx vitest run && npx tsc --noEmit`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01 | 01 | 1 | INFRA-01 | unit | `npx vitest run src/services/numerology` | ❌ W0 | ⬜ pending |
| 01-02 | 01 | 1 | INFRA-01 | unit | `npx vitest run src/services/astrology` | ❌ W0 | ⬜ pending |
| 01-03 | 01 | 1 | INFRA-03 | unit | `npx vitest run src/services/geocode` | ❌ W0 | ⬜ pending |
| 01-04 | 01 | 1 | INFRA-02 | unit | `npx vitest run src/services/analysis` | ❌ W0 | ⬜ pending |
| 02-01 | 02 | 2 | INFRA-05 | integration | `npx vitest run src/hooks/useSubscription` | ❌ W0 | ⬜ pending |
| 02-02 | 02 | 2 | INFRA-07 | component | `npx vitest run src/components/forms` | ❌ W0 | ⬜ pending |
| 03-01 | 03 | 3 | INFRA-10 | integration | `npx vitest run src/app/api` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest` + `@testing-library/react` + `@testing-library/jest-dom` — install test framework
- [ ] `vitest.config.ts` — test configuration with path aliases
- [ ] `tests/setup.ts` — shared test setup (jsdom environment)
- [ ] `openai` — LLM provider package (service dependency)
- [ ] `resend` — email service package (service dependency)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| LocationSearch Nominatim results | INFRA-07 | Requires real API call | Enter "תל אביב", verify dropdown results |
| SubscriptionGuard visual block | INFRA-08 | Visual UI verification | Log in as free user, try premium tool, verify modal |

---

## Validation Sign-Off

- [ ] All tasks have automated verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
