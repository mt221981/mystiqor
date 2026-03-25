# Phase 13: Onboarding Fix - Context

**Gathered:** 2026-03-25
**Status:** Ready for planning
**Mode:** Auto-generated (infrastructure phase — discuss skipped)

<domain>
## Phase Boundary

תיקון OnboardingWizard השבור — משתמש חדש יכול להשלים onboarding מלא ולהגיע לדשבורד ללא תקלות. הבעיה: העמוד מרנדר ריק (content area blank, sidebar visible).

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion — pure infrastructure/bug-fix phase. The OnboardingWizard component likely has a hydration issue with framer-motion or Zustand store initialization. Debug and fix without breaking existing functionality.

</decisions>

<code_context>
## Existing Code Insights

### Key Files
- `src/app/(auth)/onboarding/page.tsx` — Server component that checks auth and renders OnboardingWizard
- `src/components/features/onboarding/OnboardingWizard.tsx` — Client component with 4-step wizard
- `src/stores/onboarding-store.ts` — Zustand store for wizard state
- `src/components/features/onboarding/steps.tsx` — Individual step components
- `src/app/api/onboarding/complete/route.ts` — API route that saves profile

### Known Issue
The OnboardingWizard renders blank. Server component wrapper works (sidebar visible). Likely causes: framer-motion hydration mismatch, Zustand SSR issue, or missing CSS classes preventing visibility.

</code_context>

<specifics>
## Specific Ideas

No specific requirements — infrastructure/bug-fix phase. Fix the rendering issue.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>
