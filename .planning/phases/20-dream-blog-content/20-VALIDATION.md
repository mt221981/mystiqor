---
phase: 20
slug: dream-blog-content
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-29
---

# Phase 20 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.x |
| **Config file** | `mystiqor-build/vitest.config.ts` |
| **Quick run command** | `cd mystiqor-build && npx vitest run tests/services/dream.test.ts tests/services/blog.test.ts` |
| **Full suite command** | `cd mystiqor-build && npx vitest run` |
| **Estimated runtime** | ~12 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd mystiqor-build && npx vitest run`
- **After every plan wave:** Run `cd mystiqor-build && npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 12 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 20-01-01 | 01 | 1 | DREAM-01 | unit | `npx vitest run tests/services/dream.test.ts` | ❌ W0 | ⬜ pending |
| 20-01-02 | 01 | 1 | DREAM-01 | unit | `npx vitest run tests/components/EmotionGrid.test.tsx` | ❌ W0 | ⬜ pending |
| 20-02-01 | 02 | 1 | BLOG-01 | unit | `npx vitest run tests/services/blog.test.ts` | ❌ W0 | ⬜ pending |
| 20-02-02 | 02 | 1 | BLOG-02 | smoke/manual | Browser: /learn/blog shows seeded articles | — | ⬜ pending |
| 20-03-01 | 03 | 2 | BLOG-01 | visual/manual | Browser: /learn/blog/[slug] shows formatted article | — | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/services/blog.test.ts` — validates blog seed data shape (BLOG-01)
- [ ] `tests/components/EmotionGrid.test.tsx` — validates toggle behavior (DREAM-01)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Blog page shows seeded articles | BLOG-02 | Requires live Supabase | Navigate to /learn/blog, verify 3 articles displayed |
| Article page shows formatted content | BLOG-01 | Visual rendering | Navigate to /learn/blog/[slug], verify Markdown renders |
| Emotion grid displays 12 toggles | DREAM-01 | Visual rendering | Navigate to /tools/dream, verify 12 emoji buttons |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 12s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
