# MystiQor — Retrospective

Living retrospective across milestones. Captures what worked, what didn't, and patterns to carry forward.

---

## Milestone: v1.4 — UI Polish & Visual Identity

**Shipped:** 2026-04-07
**Phases:** 5 | **Plans:** 7

### What Was Built
- Unified Lucide icon system — 36 files migrated from react-icons/gi, centralized mapping
- Holistic sidebar redesign — backdrop-blur, MystiQorLogo SVG, dramatic gradient active/hover states
- Dashboard ToolCard with tool.name + tool.description for all variants
- Dead code cleanup — orphaned tool-icons.ts and stale exports removed

### What Worked
- **Retroactive verification pattern** — Phase 30 proved that verifying existing code is faster than re-building. The gap closure pattern (audit → verify → clean) was efficient.
- **Integration checker** — Caught that HeroToolCard.tsx didn't exist and that ToolCard already rendered names, saving a wasted plan execution.
- **Icon migration as distinct phase** — Clean separation: Phase 26 = icons, Phase 27 = sidebar. No scope creep.

### What Was Inefficient
- **Phase 27 executed outside GSD flow** — Code changes landed in Sidebar.tsx without formal execution tracking, causing audit gaps. Required retroactive SUMMARY.md.
- **Phases 28/29 planned against stale research** — Phase 29 Plan 01 targeted non-existent HeroToolCard.tsx. Research should have verified actual file structure before planning.
- **Phase 28 never created** — Listed in roadmap but no directory was ever made. Requirements were already satisfied by existing code.
- **Dual icon libraries persisted** — tools.ts uses Phosphor while sidebar uses Lucide. Not a bug, but architectural inconsistency that could confuse future work.

### Patterns Established
- **Retroactive verification** — When code is complete but docs are missing, a gap closure phase can verify and document without re-executing.
- **Superseded phases** — Phases whose requirements are already met by existing code can be marked superseded rather than executed.
- **3-source cross-reference** — VERIFICATION.md + SUMMARY frontmatter + REQUIREMENTS.md traceability table provides robust coverage assurance.

### Key Lessons
- Always verify actual file structure before writing plans — stale research causes wasted plans
- Phases executed outside GSD flow should get SUMMARY.md immediately, not retroactively
- Integration checker is essential before executing plans that target specific files

### Cost Observations
- Model mix: ~70% sonnet (subagents), ~30% opus (orchestration)
- Sessions: 2 (planning + execution/audit/completion)
- Notable: Phase 30 gap closure was very efficient — 10 min for 5 tasks (all verification/cleanup)

---

## Milestone: v1.5 — System Hardening

**Shipped:** 2026-04-07
**Phases:** 2 | **Plans:** 4

### What Was Built
- Usage quota guard (checkUsageQuota) wired into all 24 tool routes before LLM calls
- OpenAI timeout 9s + retry 2x + 5 typed Hebrew error mappings in llm.ts
- Zod LLM response validation on tarot, palmistry, dream
- DB insert error handling on 22 routes — no more silent data loss
- RTL margin sweep (12 fixes), WCAG AA contrast (3 fixes), ARIA roles on coach tabs
- EmptyState with CTA for coach + history, mobile-responsive form grids

### What Worked
- **2-phase structure** — Backend (STAB) vs Frontend (A11Y+UX) split was clean. No cross-phase dependencies, both phases could focus independently.
- **Research-driven planning** — Researcher found exact file/line targets before planner ran. Phase 31 researcher counted all 24 routes and identified 6 OpenAI error classes from installed SDK.
- **Plan checker caught real issues** — Blocker in 31-02 (missing daily-insights from frontmatter) would have caused executor to miss a file. Blocker in 32-01 (settings badge already exists) prevented double-insertion.
- **OpenAI SDK native features** — timeout + maxRetries on constructor = zero custom code. SDK handles exponential backoff automatically.

### What Was Inefficient
- **SUMMARY frontmatter missing requirements_completed** — All 4 summaries lacked this field, making 3-source cross-reference fall back to 2 sources. Executor should populate this.
- **Plan 31-02 scope** — 24 routes in one task is at the limit. Worked because pattern was mechanical, but a single executor context handling 24 file edits is fragile.

### Patterns Established
- **Usage guard as shared helper** — `checkUsageQuota()` with discriminated union return type. Clean pattern for pre-LLM validation.
- **Hebrew error mapping via instanceof** — OpenAI SDK typed errors make this reliable without string matching.
- **Contrast verification workflow** — Check tailwind.config.ts hex values, compute ratio, record in RESEARCH.md before planning.

### Key Lessons
- OpenAI SDK v4 has built-in timeout/retry — always check SDK capabilities before writing custom code
- Plan checker is worth the time — caught 4 blockers across 2 phases that would have caused executor failures
- When touching 20+ files with same pattern, verify with grep count after each task

### Cost Observations
- Model mix: ~80% sonnet (research/planning/execution), ~20% opus (orchestration)
- Sessions: 1 (entire milestone in single session)
- Notable: v1.5 was the fastest milestone — 2 phases, 4 plans, ~20 min total execution

---

## Cross-Milestone Trends

| Metric | v1.0 | v1.1 | v1.2 | v1.3 | v1.4 | v1.5 |
|--------|------|------|------|------|------|------|
| Phases | 12 | 5 | 4 | 4 | 5 | 2 |
| Plans | 66 | 7 | 13 | 10 | 7 | 4 |
| Requirements | 50+ | 16 | 5 | 15 | 8 | 10 |
| Duration | ~14 days | ~3 days | ~3 days | ~2 days | ~3 days | ~1 day |

**Trend:** v1.5 is the smallest milestone yet (2 phases, 4 plans) but delivered 10 requirements — all hardening, no new features. The research → plan → check → execute pipeline is now well-calibrated for both feature and hardening work.

---
*Last updated: 2026-04-07 after v1.5*
