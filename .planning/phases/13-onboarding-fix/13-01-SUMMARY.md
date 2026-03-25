---
phase: 13
plan: 1
status: complete
one_liner: "Fixed OnboardingWizard blank page — Zustand skipHydration + rehydrate pattern, removed framer-motion wrapper"
---

# Summary — 13-01: Fix OnboardingWizard hydration + blank page

## What was done
- Added `skipHydration: true` to Zustand persist config in `stores/onboarding.ts`
- Added `useEffect` with `rehydrate()` call in OnboardingWizard to handle client-side hydration
- Added hydration loading skeleton while store rehydrates
- Removed `motion.div` wrapper with `animations.fadeIn` (hydration issue source)
- Removed debug text from onboarding page
- Restored proper page wrapper with `min-h-screen` and `stars-bg`

## Files modified
- `src/stores/onboarding.ts` — skipHydration: true
- `src/components/features/onboarding/OnboardingWizard.tsx` — hydration guard + removed motion wrapper
- `src/app/(auth)/onboarding/page.tsx` — removed debug text, restored proper layout

## Requirements addressed
- ONB-01: OnboardingWizard renders step 1 after login
- ONB-02: User can complete all 4 steps and reach dashboard

## Verification
- TypeScript clean (tsc --noEmit passes)
- Hydration pattern prevents SSR/client mismatch
