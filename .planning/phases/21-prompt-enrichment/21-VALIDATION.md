---
phase: 21
slug: prompt-enrichment
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-29
---

# Phase 21 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | TypeScript build check (`tsc --noEmit`) + manual smoke test |
| **Config file** | `mystiqor-build/tsconfig.json` |
| **Quick run command** | `cd mystiqor-build && npx tsc --noEmit` |
| **Full suite command** | `cd mystiqor-build && npm run build` |
| **Estimated runtime** | ~20 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd mystiqor-build && npx tsc --noEmit`
- **After every plan wave:** Run `cd mystiqor-build && npm run build`
- **Before `/gsd:verify-work`:** Build green + manual review of enriched prompts
- **Max feedback latency:** 20 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 21-01-01 | 01 | 1 | PROMPT-01 | build | `npx tsc --noEmit` | tsconfig exists | ⬜ pending |
| 21-02-01 | 02 | 2 | PROMPT-01 | build | `npx tsc --noEmit` | tsconfig exists | ⬜ pending |
| 21-03-01 | 03 | 2 | PROMPT-01 | build | `npx tsc --noEmit` | tsconfig exists | ⬜ pending |
| 21-04-01 | 04 | 3 | PROMPT-02 | build+manual | `npx tsc --noEmit` + manual API check | tsconfig exists | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

None — no test file scaffolding needed. This phase modifies server-side prompts only. TypeScript strict mode + build check is the quality gate.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Prompts address user by first name | PROMPT-01 | LLM output inspection | Trigger any tool, verify response uses first name |
| Prompts use Kabbalistic/spiritual language | PROMPT-01 | LLM output quality | Check systemPrompt text includes spiritual references |
| Daily insights differ per user | PROMPT-02 | Two-user comparison | Call daily-insights with 2 different users, compare output |
| Daily insights reference zodiac + life path | PROMPT-02 | LLM output inspection | Check prompt includes zodiac sign + life path number |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 20s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
