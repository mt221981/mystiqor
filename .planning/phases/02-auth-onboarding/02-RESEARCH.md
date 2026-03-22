# Phase 2: Auth + Onboarding — Research

**Researched:** 2026-03-22
**Domain:** Supabase Auth (email/password + magic link), Next.js App Router protected routes, multi-step onboarding wizard, server-side profile creation
**Confidence:** HIGH — based on direct inspection of all existing mystiqor-build source files and github-source BASE44 original

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AUTH-01 | User can sign up with email and password via Supabase Auth | login/page.tsx + login-forms.tsx already implement; missing: post-signup redirect to /onboarding |
| AUTH-02 | User can log in and session persists across browser refresh | middleware.ts + supabase/middleware.ts `updateSession()` already correct; missing: validation test |
| AUTH-03 | User can log out from any page | No signOut handler exists yet — must be added to layout or nav component |
| AUTH-04 | Protected routes redirect unauthenticated users to login | (auth)/layout.tsx + middleware.ts both redirect; middleware has a path-matching bug — see pitfalls |
| AUTH-05 | Auth callback route handles OAuth/magic-link redirects | api/auth/callback/route.ts already complete and correct |
| ONBD-01 | Multi-step onboarding collecting name, birth date/time, birth place (geocoded), gender | OnboardingWizard + steps.tsx + BarnumEthicsStep + PreferencesStep all exist; missing: server action for final upsert |
| ONBD-02 | Onboarding auto-fills all analysis tools with birth data | Profile row in Supabase is the source of truth; tools must read from profiles — research pattern confirmed |
| ONBD-03 | Onboarding redirects to Home if profile already exists | onboarding/page.tsx already checks `onboarding_completed` and redirects to /tools |
</phase_requirements>

---

## Summary

Phase 2 has a very high ratio of already-built code to missing code. The core auth UI (login page with all three modes: password login, register, magic link) is complete and production-quality. The onboarding wizard (4 steps: personal info, location, Barnum ethics, preferences) is fully built as React components. The Supabase client infrastructure (browser, server, middleware, admin) and the auth callback route are complete and correct.

What is MISSING falls into four categories: (1) the sign-out action and its placement in the layout, (2) the `next` query parameter redirect-after-login flow (the callback route reads `next` but login doesn't set it), (3) the onboarding completion path — `handleComplete` in OnboardingWizard currently writes directly from the browser client, which is correct for profile data but bypasses server-side validation and subscription creation, and (4) automatic subscription record creation at onboarding completion (the BASE44 original creates a free subscription row in Onboarding.jsx step 4 — the Next.js version does not yet do this).

**Primary recommendation:** Do NOT rebuild any auth or onboarding UI. The components exist and are high-quality. The work is completing the missing flows: sign-out, redirect-after-login, server action for onboarding completion (with subscription row creation), and the middleware path-matching bug fix.

---

## Standard Stack

### Core (already installed in mystiqor-build)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@supabase/ssr` | already installed | Server-side Supabase Auth (cookies) | Required for SSR auth in Next.js App Router |
| `@supabase/supabase-js` | already installed | Browser-side Supabase client | SDK for auth + DB + Storage |
| `react-hook-form` | already installed | Form state + validation | Already used in login-forms.tsx |
| `zod` | already installed | Schema validation | Already used in auth.ts + profile.ts |
| `@hookform/resolvers` | already installed | Connects Zod to React Hook Form | Already used |
| `zustand` | already installed | Onboarding wizard state across steps | Already used in stores/onboarding.ts |
| `sonner` | already installed | Toast notifications | Already used in layout-client.tsx |
| `next/navigation` | built-in | `useRouter`, `redirect` | Already used in all auth files |

### No New Dependencies Required

This phase does not require installing any new packages. Every dependency is already present in mystiqor-build.

---

## Architecture Patterns

### Pattern 1: Three-Layer Auth Guard (already implemented — do not change)

The auth protection uses three cooperative layers:

```
Layer 1: src/middleware.ts
  → runs updateSession() on every non-static request
  → refreshes the Supabase session cookie if near-expiry
  → (BUG: does NOT redirect — see pitfalls)

Layer 2: src/app/(auth)/layout.tsx (Server Component)
  → calls supabase.auth.getUser() server-side
  → redirects to /login if no session
  → renders AuthLayoutClient if authenticated

Layer 3: API routes
  → every API route also calls supabase.auth.getUser()
  → returns 401 if no session (defense in depth)
```

The middleware's job is session refresh, NOT redirect. The layout's job is redirect. This separation is intentional and correct per Supabase SSR docs (HIGH confidence — confirmed in middleware.ts comments and supabase/middleware.ts implementation).

### Pattern 2: Redirect-After-Login Flow

The callback route already reads `?next=` but the login page does not yet SET it. The complete flow must be:

```typescript
// In (auth)/layout.tsx — capture the attempted URL BEFORE redirect
// (current code just redirects to /login without the next param)
if (!user) {
  redirect(`/login?next=${encodeURIComponent(request.nextUrl.pathname)}`);
}

// In login/page.tsx handleLogin — read next param after successful login
const searchParams = useSearchParams();
const next = searchParams.get('next') ?? '/dashboard';
router.push(next);
```

NOTE: layout.tsx is a Server Component — it uses `redirect()` from `next/navigation`, not NextResponse. It cannot read `request.nextUrl`. To pass the attempted path, the middleware must encode it OR the layout must use the `headers()` function. The simplest approach: the middleware adds a custom header `x-pathname` that the layout reads via `headers()`. Alternatively: encode the `next` param in the middleware redirect.

### Pattern 3: Onboarding Completion — Server Action Pattern

Current `OnboardingWizard.handleComplete()` writes directly to Supabase from the browser client. This is acceptable for profile data (RLS protects it, user can only write their own row) but it:
1. Does not validate server-side (only Zustand state is checked)
2. Does not create the subscription record
3. Does not call the geocoding service to enrich latitude/longitude with timezone

The correct pattern for completion is a Server Action or API Route:

```typescript
// src/app/api/onboarding/complete/route.ts
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'לא מחובר' }, { status: 401 });

  const body: unknown = await request.json();
  const parsed = onboardingCompleteSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'קלט לא תקין' }, { status: 400 });

  // 1. Upsert profile
  await supabase.from('profiles').upsert({ id: user.id, ...parsed.data, onboarding_completed: true });

  // 2. Create free subscription row (if not exists)
  const { data: existing } = await supabase.from('subscriptions').select('id').eq('id', user.id).maybeSingle();
  if (!existing) {
    await supabase.from('subscriptions').insert({
      id: user.id,
      plan_type: 'free',
      analyses_limit: 3,
      analyses_used: 0,
      guest_profiles_limit: 1,
      guest_profiles_used: 0,
    });
  }

  return NextResponse.json({ success: true });
}
```

### Pattern 4: Sign-Out Action

Sign-out must be callable from any page. The pattern is a Server Action (or a small API route) invoked from a client component in the layout:

```typescript
// src/app/actions/auth.ts
'use server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
```

```typescript
// In a client component (e.g., the sidebar or header)
'use client';
import { signOut } from '@/app/actions/auth';

<form action={signOut}>
  <button type="submit">התנתק</button>
</form>
```

This pattern avoids creating an API route just for sign-out and is idiomatic Next.js App Router.

### Pattern 5: Onboarding Guard in Middleware

After the auth check (user is logged in), the middleware should also check `onboarding_completed`. Currently it does NOT. Tools and dashboard pages should not be accessible to logged-in users who haven't completed onboarding.

The check requires a Supabase query in middleware — which is allowed but adds latency. The pragmatic approach: redirect to `/onboarding` from the `(auth)/layout.tsx` server component when `profile.onboarding_completed === false`, not from middleware. The onboarding page already does a self-check on its own page; the auth layout is the right place to enforce this globally.

```typescript
// In (auth)/layout.tsx — add onboarding check after session check
const { data: profile } = await supabase
  .from('profiles')
  .select('onboarding_completed')
  .eq('id', user.id)
  .maybeSingle();

const isOnboardingRoute = request.nextUrl?.pathname === '/onboarding';
if (!profile?.onboarding_completed && !isOnboardingRoute) {
  redirect('/onboarding');
}
```

NOTE: The layout is a Server Component and does not have access to `request.nextUrl`. It DOES have access to `headers()` to get the path. Use `headers()` from `next/headers`:

```typescript
import { headers } from 'next/headers';
const headersList = await headers();
const pathname = headersList.get('x-pathname') ?? '';
const isOnboardingRoute = pathname === '/onboarding';
```

This requires the middleware to set `x-pathname` on the request (one line addition to updateSession).

### Recommended Project Structure for Phase 2

```
src/
├── app/
│   ├── (public)/login/           DONE — login/page.tsx + login-forms.tsx
│   ├── api/
│   │   ├── auth/callback/        DONE — route.ts
│   │   └── onboarding/
│   │       └── complete/         MISSING — route.ts (server-side upsert + subscription creation)
│   ├── actions/
│   │   └── auth.ts               MISSING — signOut() server action
│   └── (auth)/
│       ├── layout.tsx            EXISTS — needs onboarding_completed check added
│       ├── layout-client.tsx     DONE
│       └── onboarding/
│           └── page.tsx          DONE — checks profile, redirects if complete
│
├── components/
│   └── features/
│       └── onboarding/
│           ├── OnboardingWizard.tsx   DONE — needs to call API route instead of direct Supabase
│           ├── BarnumEthicsStep.tsx   DONE
│           ├── PreferencesStep.tsx    DONE
│           └── steps.tsx             DONE
│
├── stores/onboarding.ts              DONE
├── lib/
│   ├── supabase/middleware.ts         EXISTS — needs x-pathname header injection
│   └── validations/
│       ├── auth.ts                   DONE
│       └── profile.ts                DONE — needs onboardingCompleteSchema for API route
```

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Session cookie management | Custom JWT parsing | `@supabase/ssr` `createServerClient` | Handles httpOnly cookies, refresh, PKCE flow |
| Auth state on server | Passing user as prop from layout | `supabase.auth.getUser()` in each server component/route | Correct — no JWT decoding in client |
| Sign-up email confirmation | Custom email service | Supabase Auth built-in email confirmation | Already configured via `emailRedirectTo` in handleRegister |
| Geocoding in onboarding | Calling Nominatim from client | `/api/geocode` route already built in Phase 1 | LocationStep already calls it correctly |
| Password reset UI | New reset form | Supabase sends reset link via email, lands on `/api/auth/callback?next=/reset-password` | Standard Supabase flow, not in Phase 2 scope |
| Form state management | Custom useState for multi-step | `useOnboardingStore` (Zustand + persist) | Already built, tested, persists across refreshes |

---

## Critical Bugs Found in Existing Code

### Bug 1: Middleware Path Matching Does Not Match Actual Route Groups

In `src/lib/supabase/middleware.ts` (line 42):

```typescript
if (!user && request.nextUrl.pathname.startsWith('/(auth)')) {
```

**The problem:** Next.js route groups like `(auth)` are NOT part of the URL path. A URL like `/dashboard` is rendered by `src/app/(auth)/dashboard/page.tsx` but its pathname is `/dashboard`, NOT `/(auth)/dashboard`. The `startsWith('/(auth)')` check will NEVER match any URL and the middleware redirect is dead code.

**The fix:** Change to check actual path prefixes that map to protected routes:

```typescript
const PROTECTED_PATHS = ['/dashboard', '/tools', '/onboarding', '/profile', '/settings', '/subscription', '/coach', '/goals', '/mood', '/journal'];
const isProtected = PROTECTED_PATHS.some(p => request.nextUrl.pathname.startsWith(p));
if (!user && isProtected) {
  const url = request.nextUrl.clone();
  url.pathname = '/login';
  return NextResponse.redirect(url);
}
```

Note: The `(auth)/layout.tsx` Server Component ALSO redirects, so the middleware bug does not cause a security hole — it only means middleware never short-circuits for static assets within protected routes. The layout is the true gate. However, fixing the middleware is correct for defense in depth and for performance (middleware redirects before the page renders).

### Bug 2: OnboardingWizard Writes Directly to Supabase Without Creating Subscription Row

`OnboardingWizard.handleComplete()` (line 111-126) calls `supabase.from('profiles').upsert(...)` from the browser client. This is functionally correct for the profile row (RLS allows the user to upsert their own row). BUT it does NOT create the subscription row.

The BASE44 original `Onboarding.jsx` (line 63-79) explicitly creates a subscription row with `plan_type: 'free', status: 'trial', analyses_limit: 3`. Without this, the user has no subscription row and the `increment_usage` DB function and SubscriptionGuard will fail on first tool use.

**The fix:** Move `handleComplete` to call a new API route `/api/onboarding/complete` that does both the profile upsert and subscription creation atomically.

### Bug 3: Post-Login Redirect Goes to /dashboard, Not to Intended URL

`login/page.tsx` (line 71): `router.push('/dashboard')` always sends the user to `/dashboard` after login, regardless of which protected page they were trying to reach. The auth callback route already reads `?next=` but the login page ignores it.

**The fix:** Read `useSearchParams()` in login page and pass the `next` param into `router.push()` after successful auth.

---

## Common Pitfalls

### Pitfall 1: Zod v4 API Differences

From STATE.md: "Zod v4 API differs from v3 — all ported BASE44 validation code must be audited."

Confirmed: `profile.ts` uses `z.enum(GENDER_VALUES, { error: 'ערך מגדר לא תקין' })`. In Zod v3, the option was `{ errorMap: () => ... }`. In Zod v4, the option is `{ error: ... }`. This file appears already written for Zod v4.

The `onboardingCompleteSchema` (to be created for the API route) must follow Zod v4 syntax.

**Check before writing any new Zod schema:** Verify the installed version with `cat mystiqor-build/package.json | grep '"zod"'`.

### Pitfall 2: Supabase `getUser()` vs `getSession()` — Use `getUser()`

Supabase SSR docs (HIGH confidence): `getSession()` returns the session from the local cookie without validating against the auth server — it is insecure for server-side auth checks. `getUser()` makes a network call to Supabase to validate the JWT. All three existing auth files (`layout.tsx`, `onboarding/page.tsx`, API routes) correctly use `getUser()`. Do not change to `getSession()`.

### Pitfall 3: `redirect()` in Server Components vs Route Handlers

`redirect()` from `next/navigation` throws a Next.js error (not a real thrown error — it's a special abort signal). Inside a try/catch block, this will be caught and silently swallowed, preventing the redirect. If the onboarding API route or server action needs to redirect, it must either use `NextResponse.redirect()` (in a Route Handler) or call `redirect()` outside of any try/catch.

### Pitfall 4: Onboarding_completed Check in Layout Needs Path Exclusion

If the `(auth)/layout.tsx` checks `onboarding_completed` and redirects to `/onboarding`, and `/onboarding` is itself inside `(auth)`, then the layout will run AGAIN for `/onboarding` and potentially create a redirect loop.

**The fix:** Exclude the `/onboarding` path from the onboarding redirect:

```typescript
const path = (await headers()).get('x-pathname') ?? '';
if (!profile?.onboarding_completed && path !== '/onboarding') {
  redirect('/onboarding');
}
```

The middleware must inject `x-pathname` for this to work. Alternatively, move the onboarding check to ONLY be in the layout-client.tsx as a client-side effect — but this is less secure and flashes content. Server-side is correct.

### Pitfall 5: Barnum Consent Must Be Server-Side Validated

Pitfall 16 from PITFALLS.md: `onboarding_completed` must be set server-side, and the two Barnum checkboxes must be validated server-side. The current `OnboardingWizard.handleComplete()` sets `onboarding_completed: true` client-side without validating that the checkboxes were checked.

The API route for `/api/onboarding/complete` must include `acceptedBarnum: true` and `acceptedTerms: true` in its Zod schema and validate them before setting `onboarding_completed: true`.

### Pitfall 6: Subscription Row ID Must Be `user.id`, Not Auto-Generated

Looking at the subscriptions table, the `id` column is the primary key AND equals `user.id` (1:1 relationship). When creating the subscription row at onboarding, pass `id: user.id` explicitly — do not let Supabase generate a new UUID.

---

## Existing Code Status Audit

| File | Status | What's Needed |
|------|--------|---------------|
| `(public)/login/page.tsx` | DONE | Add `useSearchParams()` + read `next` param after login |
| `(public)/login/login-forms.tsx` | DONE | No changes needed |
| `api/auth/callback/route.ts` | DONE | No changes needed |
| `(auth)/layout.tsx` | REFINE | Add onboarding_completed check + x-pathname header read |
| `(auth)/layout-client.tsx` | DONE | No changes needed |
| `middleware.ts` | REFINE | Fix path matching bug (startsWith('/(auth)')) |
| `lib/supabase/middleware.ts` | REFINE | Add x-pathname header injection for layout use |
| `(auth)/onboarding/page.tsx` | DONE | No changes needed |
| `components/features/onboarding/OnboardingWizard.tsx` | REFINE | Change handleComplete to call API route instead of direct Supabase |
| `components/features/onboarding/BarnumEthicsStep.tsx` | DONE | No changes needed |
| `components/features/onboarding/PreferencesStep.tsx` | DONE | No changes needed |
| `components/features/onboarding/steps.tsx` | DONE | No changes needed |
| `stores/onboarding.ts` | DONE | No changes needed |
| `lib/validations/auth.ts` | DONE | No changes needed |
| `lib/validations/profile.ts` | REFINE | Add `onboardingCompleteSchema` for API route validation |
| `types/database.generated.ts` | DONE | profiles + subscriptions tables confirmed in schema |
| `app/api/onboarding/complete/route.ts` | MISSING | Create new — profile upsert + subscription creation |
| `app/actions/auth.ts` | MISSING | Create new — signOut() server action |

---

## Code Examples

### Sign-Out Server Action

```typescript
// src/app/actions/auth.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

/** מתנתק מהמערכת ומנתב לדף ההתחברות */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
```

### x-pathname Header Injection in Middleware

```typescript
// In updateSession() — add before return
const requestHeaders = new Headers(request.headers);
requestHeaders.set('x-pathname', request.nextUrl.pathname);

supabaseResponse = NextResponse.next({
  request: { headers: requestHeaders },
});
```

### Onboarding Complete Schema (Zod v4)

```typescript
// Add to src/lib/validations/profile.ts
export const onboardingCompleteSchema = z.object({
  full_name: z.string().min(2).max(100),
  birth_date: z.string().regex(DATE_REGEX).refine(d => new Date(d) < new Date()),
  birth_time: z.string().regex(TIME_REGEX).optional().or(z.literal('')),
  birth_place: z.string().max(200).optional().or(z.literal('')),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  gender: z.enum(GENDER_VALUES).optional(),
  disciplines: z.array(z.string()).default([]),
  focus_areas: z.array(z.string()).default([]),
  ai_suggestions_enabled: z.boolean().default(true),
  accepted_barnum: z.literal(true, { error: 'יש לאשר הבנת הניתוחים' }),
  accepted_terms: z.literal(true, { error: 'יש לאשר תנאי השימוש' }),
});

export type OnboardingCompleteData = z.infer<typeof onboardingCompleteSchema>;
```

### profiles Table Shape (from database.generated.ts)

The profiles row for insert requires:
- `id: string` (= user.id, NOT auto-generated)
- `birth_date: string` (required, YYYY-MM-DD)
- `full_name: string` (required)
- All others optional: `birth_time`, `birth_place`, `latitude`, `longitude`, `gender`, `disciplines`, `focus_areas`, `ai_suggestions_enabled`, `onboarding_completed`, `timezone_name`, `personal_goals`, `profile_completion_score`

The `timezone_name` field is available (populated by the geocoding service which returns IANA timezone). The onboarding completion route should include it if coordinates are provided.

### subscriptions Table Key Fields (for free tier creation)

From `database.generated.ts` (subscriptions Insert type, lines 841-890):
- `id: string` (= user.id — 1:1 relationship)
- `plan_type: string` → use `'free'`
- `analyses_limit: number`
- `analyses_used: number` → set to 0
- `guest_profiles_limit: number`
- `guest_profiles_used: number` → set to 0

---

## Validation Architecture

nyquist_validation is enabled in config.json.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | No test framework detected in mystiqor-build |
| Config file | None found |
| Quick run command | `npx tsc --noEmit` (TypeScript compilation as proxy for correctness) |
| Full suite command | `npx tsc --noEmit && npx next build` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTH-01 | Sign up creates session + redirects to onboarding | manual smoke test | navigate to /login, register, confirm email | N/A |
| AUTH-02 | Session persists across browser refresh | manual smoke test | login, refresh, verify still on /dashboard | N/A |
| AUTH-03 | Sign-out redirects to /login | manual smoke test | click sign out, verify redirect | N/A |
| AUTH-04 | Protected route redirects to /login when logged out | manual smoke test | visit /dashboard while logged out | N/A |
| AUTH-05 | Magic link callback exchanges code for session | manual smoke test | trigger magic link email, click link | N/A |
| ONBD-01 | Wizard collects all 4 data types + geocodes | manual smoke test | complete onboarding wizard | N/A |
| ONBD-02 | Birth data available to tools after onboarding | TypeScript type check | `npx tsc --noEmit` | ❌ Wave 0 |
| ONBD-03 | Completed profile redirects to /tools | manual smoke test | visit /onboarding with complete profile | N/A |

No existing test files were found. All Phase 2 requirements are auth/UI flows that are manual-only smoke tests. TypeScript compilation (`tsc --noEmit`) is the practical automated gate.

### Wave 0 Gaps

- [ ] Verify `npx tsc --noEmit` passes clean after all Phase 2 code changes
- [ ] No test framework setup needed — this phase is UI/auth flows, verified by TypeScript compilation + manual smoke testing

---

## Open Questions

1. **Should sign-up redirect to /onboarding immediately or wait for email confirmation?**
   - What we know: `supabase.auth.signUp()` with email confirmation sends a verification email. The user is NOT logged in until they click the link. `handleRegister` currently shows a success message but does NOT redirect.
   - What's unclear: Supabase project settings — is email confirmation enabled or disabled? If disabled, sign-up creates an immediate session and should redirect to `/onboarding`.
   - Recommendation: Check the Supabase dashboard setting. If confirmation is enabled (typical for production), the current behavior (show message, wait) is correct. The callback route after email confirmation should redirect to `/onboarding` (not `/dashboard`) for new users.

2. **Should the geocoding service also be called at onboarding completion (server-side) to get the timezone?**
   - What we know: The geocoding route (`/api/geocode`) was built in Phase 1 and returns `{ lat, lon, timezone_name }`. The LocationStep currently only calls `/api/geocode?q=` for search results (display_name + lat/lon). The `timezone_name` from the profile row is available in `database.generated.ts`.
   - What's unclear: Whether the LocationStep stores the `timezone_name` alongside lat/lon, or only stores coordinates and the completion route must re-geocode.
   - Recommendation: The completion route should accept `latitude` and `longitude` from the client (already geocoded and confirmed), plus optionally call the geocoding service one more time server-side to get `timezone_name` and store it. Alternatively, have LocationStep also capture and send `timezone_name` through the Zustand store.

3. **What is the auth callback URL for email confirmation — should it redirect to /onboarding for new users?**
   - What we know: `api/auth/callback/route.ts` reads `?next=` and defaults to `/dashboard`. New users who just confirmed their email have no profile yet — they should go to `/onboarding`, not `/dashboard`.
   - Recommendation: Change the callback default from `/dashboard` to `/onboarding`. The onboarding page already redirects to `/tools` if `onboarding_completed === true`, so existing users clicking a magic link will bounce through onboarding and out to tools automatically.

---

## Sources

### Primary (HIGH confidence)

- Direct inspection of `mystiqor-build/src/app/(public)/login/page.tsx` — complete login page implementation
- Direct inspection of `mystiqor-build/src/app/(public)/login/login-forms.tsx` — complete form components
- Direct inspection of `mystiqor-build/src/app/api/auth/callback/route.ts` — complete callback handler
- Direct inspection of `mystiqor-build/src/app/(auth)/layout.tsx` — server-side auth guard
- Direct inspection of `mystiqor-build/src/middleware.ts` — middleware entry point
- Direct inspection of `mystiqor-build/src/lib/supabase/middleware.ts` — session refresh + path matching bug
- Direct inspection of `mystiqor-build/src/app/(auth)/onboarding/page.tsx` — onboarding page
- Direct inspection of `mystiqor-build/src/components/features/onboarding/OnboardingWizard.tsx` — wizard orchestrator
- Direct inspection of `mystiqor-build/src/components/features/onboarding/steps.tsx` — steps 1+2
- Direct inspection of `mystiqor-build/src/components/features/onboarding/BarnumEthicsStep.tsx` — step 3
- Direct inspection of `mystiqor-build/src/components/features/onboarding/PreferencesStep.tsx` — step 4
- Direct inspection of `mystiqor-build/src/stores/onboarding.ts` — Zustand store
- Direct inspection of `mystiqor-build/src/lib/validations/auth.ts` — Zod auth schemas
- Direct inspection of `mystiqor-build/src/lib/validations/profile.ts` — Zod profile schemas
- Direct inspection of `mystiqor-build/src/types/database.generated.ts` (profiles + subscriptions rows)
- Direct inspection of `github-source/src/pages/Onboarding.jsx` — original BASE44 onboarding (subscription creation pattern)
- `.planning/research/ARCHITECTURE.md` — confirmed patterns
- `.planning/research/PITFALLS.md` — confirmed Pitfall 16 (Barnum consent)

### Secondary (MEDIUM confidence)

- Supabase SSR auth patterns (`getUser()` vs `getSession()`, cookie handling) — corroborated by existing code structure which follows current Supabase SSR docs patterns

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages already installed, versions confirmed in package.json
- Architecture: HIGH — existing code directly inspected, patterns confirmed working
- Bug identification: HIGH — bugs directly observed in source code
- Pitfalls: HIGH — sourced from direct code inspection + existing PITFALLS.md research
- Zod v4 API compatibility: MEDIUM — observed in existing files but should verify installed version

**Research date:** 2026-03-22
**Valid until:** 2026-06-22 (90 days — Supabase SSR API is stable)
