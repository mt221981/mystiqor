---
phase: 8
slug: growth-monetization
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-24
---

# Phase 8 — Validation Strategy

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

**Vitest status:** Not configured. Automated gate is `tsc --noEmit` only. Behavioral correctness validated manually (Stripe test mode, email preview, rate limiting).

---

## Sampling Rate

- **After every task commit:** Run `cd mystiqor-build && npx tsc --noEmit`
- **After every plan wave:** Run `cd mystiqor-build && npx tsc --noEmit`
- **Max feedback latency:** 12 seconds

---

## Wave 0 Requirements

Wave 0 is complete — Stripe and Resend already installed. Upstash packages installed in Plan 08-05/06 first task.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Stripe checkout redirects correctly | SUBS-01 | Requires Stripe test mode | Click upgrade → verify Stripe checkout page loads |
| Webhook processes without duplicates | SUBS-03 | Requires Stripe CLI webhook forwarding | Send test webhook twice → verify single DB update |
| Plan upgrade reflects in UI | SUBS-04 | Requires real subscription state | Upgrade → verify new limits in UsageBar |
| Referral code generates and tracks | GROW-01 | Requires 2 user accounts | Share code → sign up → verify reward applied |
| Emails delivered | INFRA-08 | Requires Resend API key | Trigger each email type → check inbox |
| Rate limiting blocks excess requests | INFRA-07 | Requires rapid API calls | Hit endpoint 11 times → verify 429 response |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify commands
- [x] Sampling continuity: every task has automated verify
- [x] Wave 0 complete (deps only; Vitest deferred)
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** complete
