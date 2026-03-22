---
phase: 2
slug: auth-onboarding
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-22
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | TypeScript compilation (`tsc --noEmit`) — no unit test framework needed |
| **Config file** | `mystiqor-build/tsconfig.json` (existing) |
| **Quick run command** | `cd mystiqor-build && npx tsc --noEmit` |
| **Full suite command** | `cd mystiqor-build && npx tsc --noEmit` |
| **Estimated runtime** | ~10 seconds |

Phase 2 is auth/UI flow code. All requirements are verified by TypeScript compilation (type safety gate) plus manual browser smoke tests (functional gate). Unit tests are not valuable for this phase — the behaviors are auth redirects, form submissions, and API route request/response cycles that require a real Supabase session.

---

## Sampling Rate

- **After every task commit:** Run `cd mystiqor-build && npx tsc --noEmit`
- **After every plan wave:** Run `cd mystiqor-build && npx tsc --noEmit`
- **Before `/gsd:verify-work`:** `tsc --noEmit` must be green + manual smoke tests pass
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------|-------------------|--------|
| 02-01-01 | 01 | 1 | AUTH-04 | compilation | `cd mystiqor-build && npx tsc --noEmit` | pending |
| 02-01-02 | 01 | 1 | AUTH-01, AUTH-02, AUTH-03, AUTH-05 | compilation | `cd mystiqor-build && npx tsc --noEmit` | pending |
| 02-02-01 | 02 | 1 | ONBD-01 | compilation | `cd mystiqor-build && npx tsc --noEmit` | pending |
| 02-02-02 | 02 | 1 | ONBD-01, ONBD-02, ONBD-03 | compilation | `cd mystiqor-build && npx tsc --noEmit` | pending |
| 02-03-01 | 03 | 2 | AUTH-04, ONBD-03 | compilation | `cd mystiqor-build && npx tsc --noEmit` | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

Wave 0 is complete — no test framework installation needed.

TypeScript compilation (`npx tsc --noEmit`) is the automated gate for all tasks. The `tsconfig.json` already exists with strict mode enabled. No additional setup required.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions | Plan/Task |
|----------|-------------|------------|-------------------|-----------|
| Protected route redirect to /login | AUTH-04 | Requires real browser + middleware | Visit /dashboard while logged out, verify redirect | 02-03 Task 2 Test 1 |
| Sign up + immediate session redirect | AUTH-01 | Requires Supabase auth + browser | Register, verify redirect to /onboarding if email confirmation disabled | 02-03 Task 2 Test 2 |
| Session persists across refresh | AUTH-02 | Requires real browser + Supabase session | Login, refresh, verify still logged in | 02-03 Task 2 Test 3 |
| Logout from any page | AUTH-03 | Requires real browser + cookie clearing | Click logout in sidebar, verify redirect to /login | 02-03 Task 2 Test 6 |
| Onboarding guard blocks un-onboarded users | AUTH-04 | Requires real auth session + profile query | Login without onboarding, try /dashboard | 02-03 Task 2 Test 4 |
| Onboarding completion creates profile + subscription | ONBD-01, ONBD-02 | Requires real Supabase writes | Complete wizard, check DB | 02-03 Task 2 Test 5 |
| Returning user bypasses onboarding | ONBD-03 | Requires existing profile row | Login with completed profile, verify /dashboard access | 02-03 Task 2 Test 7 |
| Magic link callback flow | AUTH-05 | Requires real email + Supabase auth | Trigger magic link, click, verify session + redirect | 02-03 Task 2 Test 8 |

All manual verifications are consolidated in Plan 02-03 Task 2 (checkpoint:human-verify).

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify commands (`npx tsc --noEmit`)
- [x] Sampling continuity: every task has automated verify
- [x] Wave 0 complete — no setup needed (tsc already available)
- [x] No watch-mode flags
- [x] Feedback latency < 15s (~10s for tsc)
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** complete
