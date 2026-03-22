---
phase: 03-ux-shell-profile-dashboard-tracking
plan: 05
subsystem: profile
tags: [profile, guest-profiles, settings, api-routes, react-query, rhf, zod]
dependency_graph:
  requires:
    - "03-01 (app shell)"
    - "02-03 (auth + onboarding)"
  provides:
    - "PATCH /api/profile — profile update"
    - "GET /api/profile — profile read"
    - "GET/POST /api/guest-profiles — guest profile CRUD with subscription limit"
    - "PATCH/DELETE /api/guest-profiles/[id] — individual guest profile management"
    - "Profile page at /profile with two tabs"
    - "Settings page at /settings with theme toggle"
  affects:
    - "03-06 through 03-09 (dashboard, mood, journal, goals can use profile data)"
tech_stack:
  added: []
  patterns:
    - "React Hook Form partial Zod schema for profile edit form"
    - "Subscription limit enforcement at API level before DB insert"
    - "ProfileEditFormData = z.infer<profileSchema.partial()> for type-safe partial updates"
key_files:
  created:
    - mystiqor-build/src/app/api/profile/route.ts
    - mystiqor-build/src/app/api/guest-profiles/route.ts
    - "mystiqor-build/src/app/api/guest-profiles/[id]/route.ts"
    - mystiqor-build/src/components/features/profile/ProfileEditForm.tsx
    - mystiqor-build/src/components/features/profile/GuestProfileList.tsx
    - "mystiqor-build/src/app/(auth)/profile/page.tsx"
    - "mystiqor-build/src/app/(auth)/settings/page.tsx"
  modified: []
decisions:
  - "profileSchema.partial() used for edit resolver — all profile fields optional on update"
  - "GUEST_LIMITS fallback chain: subscription.guest_profiles_limit ?? GUEST_LIMITS[plan_type] ?? 1"
  - "ProfileEditFormData separate type alias from ProfileFormData to avoid resolver mismatch"
  - "GuestProfileList uses Dialog (not AlertDialog) for delete confirmation — AlertDialog not in UI kit"
  - "Settings page theme selector uses setTheme() + toggleTheme() from useThemeStore (Zustand + localStorage)"
metrics:
  duration: "~20min"
  completed: "2026-03-22"
  tasks: 2
  files: 7
---

# Phase 03 Plan 05: Profile, Guest Profiles, and Settings Summary

**One-liner:** Profile edit page with tabbed guest profile management + subscription-enforced API limits and Zustand-persisted theme settings page.

## What Was Built

### Task 1 — API Routes (PROF-01, PROF-02)

Three API route files implementing the full server-side profile and guest profiles backend.

**`/api/profile`** (GET + PATCH):
- GET fetches current user's profile via Supabase server client
- PATCH validates with `profileSchema.partial().safeParse()` — all fields optional on edit
- Updates `updated_at` timestamp on every write
- Auth guard on both methods

**`/api/guest-profiles`** (GET + POST):
- POST enforces subscription limits at API level (D-12):
  - First checks `guest_profiles_limit` column on subscriptions table
  - Falls back to `GUEST_LIMITS[plan_type]` map (free=1, basic=3, premium=8)
  - Returns 403 with Hebrew error when at limit
- GET returns ordered list for current user

**`/api/guest-profiles/[id]`** (PATCH + DELETE):
- Both methods include `.eq('user_id', user.id)` ownership guard
- PATCH uses `GuestProfileUpdateSchema.partial()` (all fields optional)
- DELETE is clean with no body required

### Task 2 — UI Components + Pages (PROF-01, PROF-02, PROF-03)

**`ProfileEditForm.tsx`**:
- Separate `profileEditSchema = profileSchema.partial()` to avoid resolver type mismatch
- Pre-fills from profile data (handles null DB values via ProfileData interface)
- Tag-style inputs for disciplines, focus_areas, personal_goals with shadcn Select + free-text input
- Gender Select using Controller + field.onChange
- Hebrew labels throughout

**`GuestProfileList.tsx`**:
- Shows `{count}/{limit} פרופילים אורחים` counter
- Add button disabled at limit with amber warning message
- Add/edit via Dialog with GuestFormFields helper component
- Delete via Dialog with confirmation (no AlertDialog — not in UI kit)
- zodResolver(GuestFormSchema) on both add and edit forms

**`profile/page.tsx`**:
- Two Tabs: "הפרופיל שלי" + "פרופילים אורחים"
- Tab 1: useQuery for profile → ProfileEditForm, useMutation PATCH + invalidate + toast
- Tab 2: useQuery for guest profiles + subscription, GuestProfileList with all 3 mutations
- ErrorBoundary + Breadcrumbs (לוח בקרה > פרופיל)
- Skeleton loading states

**`settings/page.tsx`**:
- Theme section: setTheme('dark') / setTheme('light') buttons + toggleTheme() button
- Notifications section: disabled toggles with "בקרוב" badge (deferred to Phase 8)
- AI preferences section: Switch wired to `PATCH /api/profile { ai_suggestions_enabled }`
- ErrorBoundary + Breadcrumbs (לוח בקרה > הגדרות)

## Verification

- TypeScript: `npx tsc --noEmit` exits 0 (zero errors)
- All 7 files exist and compile
- Guest profile limit enforced at API level (D-12)
- Profile edit form uses profileEditSchema with zodResolver
- Settings page toggles theme via useThemeStore + persists via localStorage

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Type Bug] ProfileFormData resolver mismatch**
- **Found during:** Task 2, ProfileEditForm.tsx
- **Issue:** `useForm<ProfileFormData>` with `profileSchema.partial()` resolver caused TS error — partial schema infers different type than full schema
- **Fix:** Introduced `profileEditSchema = profileSchema.partial()` and `ProfileEditFormData = z.infer<typeof profileEditSchema>` — separate type for the edit form
- **Files modified:** ProfileEditForm.tsx

**2. [Rule 2 - Missing] ProfileData interface for nullable DB values**
- **Found during:** Task 2, profile page passing profile row to ProfileEditForm
- **Issue:** ProfileRow has `birth_time: string | null` but ProfileFormData expects `birth_time?: string | undefined` — null not assignable
- **Fix:** Created `ProfileData` interface on the form props that accepts nullable DB values
- **Files modified:** ProfileEditForm.tsx

**3. [Rule 1 - Bug] AlertDialog not in UI kit**
- **Found during:** Task 2, GuestProfileList
- **Issue:** GuestProfileList originally used `AlertDialog` from `@/components/ui/alert-dialog` which does not exist
- **Fix:** Replaced with standard `Dialog` component for delete confirmation
- **Files modified:** GuestProfileList.tsx

**4. [Rule 1 - Bug] Select onValueChange returns string | null**
- **Found during:** Task 2, ProfileEditForm
- **Issue:** `@base-ui/react/select` `onValueChange` returns `string | null` not `string`
- **Fix:** Added null guards: `val && addTag(...)` pattern
- **Files modified:** ProfileEditForm.tsx

## Known Stubs

- **`settings/page.tsx` — Notification toggles:** Disabled toggles for email notifications and reminders. Intentional — deferred to Phase 8 per 03-CONTEXT.md.
- **`profile/page.tsx` — GuestProfileList subscription limit:** Falls back to `DEFAULT_GUEST_LIMIT = 1` if subscription query returns null. Intentional — handles new users without subscription row.

## Self-Check: PASSED

Files confirmed to exist:
- mystiqor-build/src/app/api/profile/route.ts — FOUND
- mystiqor-build/src/app/api/guest-profiles/route.ts — FOUND
- mystiqor-build/src/app/api/guest-profiles/[id]/route.ts — FOUND
- mystiqor-build/src/components/features/profile/ProfileEditForm.tsx — FOUND
- mystiqor-build/src/components/features/profile/GuestProfileList.tsx — FOUND
- mystiqor-build/src/app/(auth)/profile/page.tsx — FOUND
- mystiqor-build/src/app/(auth)/settings/page.tsx — FOUND

TypeScript: npx tsc --noEmit exits 0 (confirmed)
