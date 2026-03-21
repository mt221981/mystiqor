---
phase: 01-core-infrastructure
plan: "06"
subsystem: hooks+forms
tags: [subscription, forms, rtl, gem-7, react-hook-form, zod]
dependency_graph:
  requires: [01-05]
  provides: [useSubscription, FormInput, LocationSearch, BirthDataForm]
  affects: [01-07, Phase 2 tool pages]
tech_stack:
  added: []
  patterns:
    - React Query useMutation with optimistic updates
    - React Hook Form with Zod resolver
    - useDebounce(400ms) for LocationSearch
key_files:
  created:
    - src/hooks/useSubscription.ts
    - src/components/forms/FormInput.tsx
    - src/components/forms/LocationSearch.tsx
    - src/components/forms/BirthDataForm.tsx
  modified: []
metrics:
  completed_date: "2026-03-20"
  tasks: 2
  files_created: 4
---

# Phase 01 Plan 06: useSubscription Hook (GEM 7) + Form Components — Summary

**One-liner:** useSubscription hook with optimistic updates (GEM 7 pattern) + 3 reusable form components (FormInput, LocationSearch with Nominatim debounce, BirthDataForm with RHF+Zod).

## Tasks Completed

### Task 1: useSubscription Hook (GEM 7)

Built `src/hooks/useSubscription.ts` — React Query hook wrapping Supabase subscription data. Returns { subscription, planInfo, hasUsageLeft, canUseFeature, incrementUsage, isLoading }. incrementUsage mutation uses cancelQueries + optimistic update + onError rollback pattern from GEM 7.

### Task 2: Form Components

Built 3 reusable RTL form components:
- **FormInput** — RHF-compatible input with dir=rtl and Hebrew error messages
- **LocationSearch** — Nominatim autocomplete with useDebounce(400ms), calls geocode API
- **BirthDataForm** — Full birth data form with React Hook Form + Zod resolver, exposes control prop

## Self-Check: PASSED

All 4 files created and compiled with tsc --noEmit = 0 errors.
