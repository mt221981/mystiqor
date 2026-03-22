---
phase: 1
slug: infrastructure-hardening
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-03-22
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.0 |
| **Config file** | `mystiqor-build/vitest.config.ts` |
| **Quick run command** | `cd mystiqor-build && npx vitest run tests/services/` |
| **Full suite command** | `cd mystiqor-build && npx vitest run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd mystiqor-build && npx vitest run tests/services/llm.test.ts tests/services/geocode.test.ts tests/services/upload.test.ts tests/services/usage.test.ts`
- **After every plan wave:** Run `cd mystiqor-build && npx vitest run`
- **Before `/gsd:verify-work`:** `cd mystiqor-build && npx vitest run && npx tsc --noEmit` — both must pass
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-T1 | 01 | 1 | INFRA-05 | smoke | `npx tsc --noEmit` (after migration) | ✅ | ⬜ pending |
| 01-01-T2 | 01 | 1 | INFRA-03 | unit | `npx vitest run tests/services/usage.test.ts` | ❌ W0 | ⬜ pending |
| 01-01-T3 | 01 | 1 | INFRA-04,05 | manual | Supabase project + gen types | N/A | ⬜ pending |
| 01-02-T1 | 02 | 1 | INFRA-01 | unit | `npx vitest run tests/services/llm.test.ts -t "validation"` | Partial | ⬜ pending |
| 01-02-T2 | 02 | 1 | INFRA-01 | unit | `npx vitest run tests/services/llm.test.ts -t "schema failure"` | ❌ W0 | ⬜ pending |
| 01-03-T1 | 03 | 1 | INFRA-02 | unit | `npx vitest run tests/services/upload.test.ts` | ❌ W0 | ⬜ pending |
| 01-03-T2 | 03 | 1 | INFRA-02 | unit | `npx vitest run tests/services/upload.test.ts -t "presign"` | ❌ W0 | ⬜ pending |
| 01-04-T1 | 04 | 1 | INFRA-06 | unit | `npx vitest run tests/services/geocode.test.ts -t "timezone"` | ❌ W0 | ⬜ pending |
| 01-04-T2 | 04 | 1 | INFRA-06 | unit | `npx vitest run tests/services/geocode.test.ts -t "cache"` | ❌ W0 | ⬜ pending |
| 01-04-T3 | 04 | 1 | INFRA-06 | unit | `npx vitest run tests/services/geocode.test.ts -t "timeout"` | ❌ W0 | ⬜ pending |
| 01-05-T1 | 05 | 2 | ALL | smoke | `npx tsc --noEmit && npx vitest run` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `mystiqor-build/tests/services/upload.test.ts` — stubs for INFRA-02 (magic bytes, presign, size limit)
- [ ] `mystiqor-build/tests/services/usage.test.ts` — stubs for INFRA-03 (RPC result Zod parse, limit enforcement)
- [ ] `mystiqor-build/tests/services/geocode.test.ts` — stubs for INFRA-06 (timezone_name, cache hit, timeout)
- [ ] New test cases in `mystiqor-build/tests/services/llm.test.ts` — stubs for INFRA-01 schema validation

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Supabase clients use correct client per context | INFRA-04 | Architecture constraint, not runtime behavior | `grep -r "from.*supabase/server" mystiqor-build/src/app/api/` should return all API routes; `grep -r "from.*supabase/admin" mystiqor-build/src/app/api/` should return only webhooks |
| Supabase project created with schema | INFRA-05 | Requires cloud account access | 1. Login to supabase.com 2. Create project 3. Run `supabase db push` 4. Run `supabase gen types typescript` 5. Verify types compile |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
