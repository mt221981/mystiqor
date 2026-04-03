---
phase: 01-core-infrastructure
plan: "04"
subsystem: services/astrology/prompts, services/drawing, services/email, lib/supabase/auth
tags: [astrology, prompts, email, auth, gem-12, resend, supabase]
dependency_graph:
  requires: [01-01]
  provides:
    - buildInterpretationPrompt (GEM 12 v6.0 Hebrew astrology prompt)
    - buildSolarReturnPrompt (annual prediction prompt)
    - buildTransitsPrompt (current transits prompt)
    - buildDrawingAnalysisPrompt + extractDrawingFeatures (HTP drawing analysis)
    - sendWelcomeEmail + sendPaymentFailedEmail + sendUsageLimitEmail (Resend email services)
    - signOut + getSession (Supabase auth helpers)
  affects:
    - src/components/layouts/Header.tsx (logout now functional)
    - All LLM service calls in Phase 2+ (use interpretation.ts)
tech_stack:
  added:
    - resend (npm) — transactional email
  patterns:
    - Hebrew prompt engineering with interpolated chart data
    - RTL HTML email templates
    - Placeholder async function with console.warn for Phase 2 implementation
key_files:
  created:
    - src/services/astrology/prompts/interpretation.ts
    - src/services/astrology/prompts/solar-return.ts
    - src/services/astrology/prompts/transits.ts
    - src/services/drawing/analysis.ts
    - src/services/email/welcome.ts
    - src/services/email/payment-failed.ts
    - src/services/email/usage-limit.ts
    - src/lib/supabase/auth.ts
  modified:
    - src/components/layouts/Header.tsx
decisions:
  - "GEM 12 prompt split into INTERPRETATION_SYSTEM_PROMPT constant + buildInterpretationPrompt function — allows system prompt reuse across solar-return and transits prompts"
  - "PlanetPositions interface defined inline in transits.ts — not added to types/astrology.ts to avoid scope creep; can be promoted in Phase 2"
  - "extractDrawingFeatures returns DEFAULT_DRAWING_FEATURES with console.warn — correct Phase 1 placeholder pattern, Vision API is Phase 2 scope"
  - "Header.tsx logout handler made async — required for await signOut() call"
metrics:
  duration_minutes: 20
  completed_date: "2026-03-20"
  tasks_completed: 2
  files_created: 8
  files_modified: 1
---

# Phase 01 Plan 04: Service Layer — Astrology Prompts, Drawing Analysis, Email, Auth

**One-liner:** GEM 12 v6.0 Hebrew astrology interpretation prompt (40-45 insights, 5 groups), HTP drawing analysis service, 3 Resend RTL email services, Supabase auth helpers, and Header.tsx logout fix.

## Objective

Built the service layer for astrology prompt templates (GEM 12 migration), drawing analysis (HTP/Machover/Koppitz), email services (welcome, payment-failed, usage-limit), and fixed the critical Header.tsx logout TODO that was blocking manual testing.

## What Was Built

### Task 1: Astrology Prompts + Drawing Analysis (4 files)

**`src/services/astrology/prompts/interpretation.ts`** — GEM 12 v6.0 migration
- `InterpretationInput` interface with sun/moon/ascendant/planets/aspects/elementDistribution/northNode/chiron
- `INTERPRETATION_SYSTEM_PROMPT` constant — reusable system role Hebrew string
- `buildInterpretationPrompt(input)` — returns full GEM 12 Hebrew prompt with:
  - All 5 insight groups (קבוצת א through ה)
  - 40-45 insight target count
  - JSON output format matching `Insight` type from `src/types/analysis.ts`
  - Hebrew planet names from PLANET_SYMBOLS (GEM 6)
  - Element distribution with percentages

**`src/services/astrology/prompts/solar-return.ts`**
- `SolarReturnPromptInput` interface
- `buildSolarReturnPrompt(input)` — 15-20 annual predictions prompt with ascending comparison, JSON output with predictions/themes/challenges/opportunities

**`src/services/astrology/prompts/transits.ts`**
- `PlanetPositions` interface — current planet positions at a point in time
- `TransitPromptInput` interface
- `buildTransitsPrompt(input)` — outer planets first, Hebrew date formatting, JSON output

**`src/services/drawing/analysis.ts`**
- `DrawingFeatures` interface — 10 HTP features with typed unions
- `buildDrawingAnalysisPrompt(imageDescription, features)` — Machover+Koppitz based Hebrew prompt
- `extractDrawingFeatures(imageUrl)` — placeholder returning defaults with console.warn

### Task 2: Email Services + Auth (4 files + 1 modified)

**`src/services/email/welcome.ts`**
- `sendWelcomeEmail(email, name)` — RTL Hebrew HTML, branded MystiQor design

**`src/services/email/payment-failed.ts`**
- `sendPaymentFailedEmail(email, name, amount)` — Hebrew RTL, subscription URL link, 7-day warning

**`src/services/email/usage-limit.ts`**
- `sendUsageLimitEmail(email, name, planName)` — Hebrew RTL, plan comparison cards, upgrade CTA

**`src/lib/supabase/auth.ts`**
- `signOut()` — calls supabase.auth.signOut() with Hebrew error message
- `getSession()` — returns current session or null

**`src/components/layouts/Header.tsx`** (modified)
- Added `import { useRouter } from 'next/navigation'`
- Added `import { signOut } from '@/lib/supabase/auth'`
- Added `const router = useRouter()` hook
- Replaced TODO comment with actual `async onClick` calling `signOut()` then `router.push('/login')`
- TODO removed

## Verification

All acceptance criteria passed:
- `grep "אסטרולוג פסיכולוגי" src/services/astrology/prompts/interpretation.ts` — FOUND (line 88)
- `grep "insights" src/services/astrology/prompts/interpretation.ts` — FOUND (line 258: JSON output instruction)
- `grep "DrawingFeatures" src/services/drawing/analysis.ts` — FOUND (exported interface, line 13)
- `grep "new Resend" src/services/email/welcome.ts` — FOUND (line 8)
- `grep "dir=\"rtl\"" src/services/email/welcome.ts` — FOUND (line 22)
- `grep "signOut" src/lib/supabase/auth.ts` — FOUND (export + supabase call)
- `grep "signOut" src/components/layouts/Header.tsx` — FOUND (import + await call)
- `grep "TODO" src/components/layouts/Header.tsx` — NOT FOUND (resolved)

TypeScript: `npx tsc --noEmit` — zero errors in the 8 new files + Header.tsx. Only pre-existing error: `src/hooks/useAnalytics.ts` (out of scope for this plan, logged as deferred).

## Deviations from Plan

### Auto-fixed Issues

None — plan executed exactly as written.

### Deferred Items (out of scope)

**Pre-existing TypeScript error in `src/hooks/useAnalytics.ts`** (lines 28, 53)
- Error type: Supabase `analytics_events` table returns `never` type
- Out of scope for this plan — not caused by any change in Plan 04
- Logged to deferred-items for Phase 1 cleanup

## File Score Assessment (per CLAUDE.md mandatory scoring)

**`interpretation.ts`** — 85/100
- TypeScript: 9 — strict typing, no any, proper interfaces
- Error Handling: 7 — pure function, no errors to handle
- Validation: 8 — typed input, partial filtering
- Documentation: 9 — full JSDoc in Hebrew
- Clean Code: 9 — well-structured helpers, UPPER_SNAKE constant
- Security: 8 — no secrets, pure function
- Performance: 8 — no N+1, pure string building
- Accessibility: N/A — server-side
- RTL: 10 — full Hebrew prompt, all labels Hebrew
- Edge Cases: 8 — handles missing northNode/chiron
Score: 76/90 = **84%** (above 78% threshold)

**Email services (average)** — 83/100
- TypeScript: 9
- Error Handling: 8 — throws with Hebrew error message
- Validation: 8 — types enforced
- Documentation: 8 — JSDoc Hebrew
- Clean Code: 9
- Security: 9 — no secrets in HTML, env-based URLs
- Performance: 7 — could batch but single send is correct here
- Accessibility: 7 — HTML email, basic a11y
- RTL: 10 — full dir="rtl" HTML
- Edge Cases: 8 — NEXT_PUBLIC_SITE_URL fallback
Score: 83/100 = **83%** (above 78% threshold)

**`auth.ts`** — 88/100
All criteria above threshold. Clean, minimal, typed.

## Self-Check

### Files Created Verification
- [x] D:\AI_projects\mystiqor-build\src\services\astrology\prompts\interpretation.ts — EXISTS
- [x] D:\AI_projects\mystiqor-build\src\services\astrology\prompts\solar-return.ts — EXISTS
- [x] D:\AI_projects\mystiqor-build\src\services\astrology\prompts\transits.ts — EXISTS
- [x] D:\AI_projects\mystiqor-build\src\services\drawing\analysis.ts — EXISTS
- [x] D:\AI_projects\mystiqor-build\src\services\email\welcome.ts — EXISTS
- [x] D:\AI_projects\mystiqor-build\src\services\email\payment-failed.ts — EXISTS
- [x] D:\AI_projects\mystiqor-build\src\services\email\usage-limit.ts — EXISTS
- [x] D:\AI_projects\mystiqor-build\src\lib\supabase\auth.ts — EXISTS
- [x] D:\AI_projects\mystiqor-build\src\components\layouts\Header.tsx — MODIFIED (TODO removed)

### Commits
Note: Git commit commands were blocked by sandbox restrictions during execution.
Files are written to disk and ready for commit. Task commits should be created manually or on next execution:
- `feat(01-04): GEM 12 astrology prompts, drawing analysis service (Task 1)`
- `feat(01-04): Resend email services, Supabase auth helpers, Header logout fix (Task 2)`

## Self-Check: PASSED (files) / PENDING (commits)

- All 9 files (8 new + 1 modified) verified to exist on disk with correct content
- TypeScript: zero errors in all plan-04 files (verified by tsc --noEmit before Bash permissions were restricted)
- All acceptance criteria verified via Grep tool:
  - "אסטרולוג פסיכולוגי" found in interpretation.ts line 88
  - "insights" found in interpretation.ts line 258
  - "DrawingFeatures" found in drawing/analysis.ts line 13
  - "new Resend" found in all 3 email service files
  - `dir="rtl"` found in welcome.ts line 22
  - "signOut" found in auth.ts (export) and Header.tsx (import + await)
  - TODO NOT found in Header.tsx (removed)
- Git commits pending — git commands blocked by sandbox; manual commit required with the commit messages documented in this SUMMARY
