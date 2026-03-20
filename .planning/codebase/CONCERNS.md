# Codebase Concerns

**Analysis Date:** 2026-03-20

## Tech Debt

**Logout Handler Not Implemented:**
- Issue: Logout button in Header component has empty handler
- Files: `src/components/layouts/Header.tsx` (line 183)
- Impact: Users cannot log out from the application, creating security and UX issues
- Fix approach: Implement logout handler that calls `supabase.auth.signOut()`, clears React Query cache via `queryClient.clear()`, and redirects to login

**Hardcoded Environment Variable Access Without Fallback:**
- Issue: Supabase URL and keys are accessed with `!` assertion without null-coalescing or error boundary
- Files: `src/lib/supabase/server.ts`, `src/lib/supabase/client.ts`, `src/lib/supabase/admin.ts`
- Impact: Application will crash at runtime if environment variables are not set, no graceful degradation
- Fix approach: Add environment variable validation in initialization, throw descriptive errors early

**Pagination Not Implemented in List Views:**
- Issue: Query cache config exists but no actual pagination in displayed lists
- Files: All potential list views (analyses, goals, journal, insights, dreams, journeys, reminders)
- Impact: If users accumulate many records, unbounded queries will degrade performance and exceed rate limits
- Fix approach: Add pagination with `limit` and `offset` to all list-returning API routes and React Query hooks

**No Service Layer for Database Queries:**
- Issue: Database queries would likely be scattered across components or API routes (no query functions found yet)
- Files: Planned: `src/services/` (not yet created)
- Impact: Code duplication, difficult to maintain, harder to add caching/retry logic consistently
- Fix approach: Create typed service layer in `src/services/` directory with reusable query functions for each table

**Async Operations Without Loading State:**
- Issue: Auth forms have loading states via `isSubmitting`, but other async operations likely missing
- Files: `src/app/(public)/login/page.tsx` has proper handling but pattern not established project-wide
- Impact: Users can't tell if operations are in-flight, may trigger duplicate requests
- Fix approach: Establish consistent pattern for all mutations - use React Query's mutation status or local loading state

## Known Bugs

**Route Group Regex Pattern Mismatch:**
- Symptoms: Middleware checks for `'/(auth)'` string literal, but Next.js route groups use parentheses as syntax, not literal path
- Files: `src/lib/supabase/middleware.ts` (line 42)
- Trigger: Users navigating to protected routes - middleware comparison will always fail because `request.nextUrl.pathname` won't contain the literal string `/(auth)`
- Workaround: Routes are protected by `AuthLayout` server-side check, so middleware issue doesn't block access (but is ineffective)
- Fix: Change line 42 to check actual protected paths like `/dashboard` or use a whitelist of public paths instead

**localStorage Access in SSR Without Type Guards:**
- Symptoms: Theme store uses localStorage via Zustand persist, but no error handling if localStorage unavailable
- Files: `src/stores/theme.ts` (lines 20-24), middleware and server components access document/window without full safety checks
- Trigger: Reading from theme store on server or in environment without DOM/Storage API
- Workaround: Checks like `if (typeof document === 'undefined')` exist but not comprehensive across codebase
- Fix: Wrap all localStorage/DOM access in full safe guards, ensure hydration mismatch won't break rendering

**Console.error in Production:**
- Symptoms: ErrorBoundary logs to console in development but still executes on production
- Files: `src/components/common/ErrorBoundary.tsx` (line 104)
- Trigger: Any uncaught React error in production will be logged
- Workaround: Check for development environment prevents logging
- Fix: Verify development-only flag is sufficient; consider sending to error tracking service instead

## Security Considerations

**No Input Sanitization on Form Submissions:**
- Risk: User input from birth_place, personal_goals, and other text fields could contain HTML/script tags if not validated
- Files: `src/lib/validations/profile.ts` has Zod schemas but doesn't call `sanitizeHtml()` before storage
- Current mitigation: DOMPurify available in `src/lib/utils/sanitize.ts` but not integrated into mutations
- Recommendations:
  1. Add sanitization in Zod refinements or transform step
  2. Sanitize all user-generated string fields before database insert
  3. Add sanitization test cases

**Missing Rate Limiting on Authentication Endpoints:**
- Risk: Brute force attacks on login/register/magic-link are not prevented
- Files: `src/app/(public)/login/page.tsx` - auth handlers have no rate limit checks
- Current mitigation: Supabase Auth may have built-in limits, but not explicitly enforced on client
- Recommendations:
  1. Implement client-side rate limiting (track attempts + timestamp)
  2. Add server-side rate limiting on auth routes
  3. Implement exponential backoff for failed attempts
  4. Block after N attempts for X minutes

**RLS Policies Not Visible - Assumed Missing:**
- Risk: No SQL/RLS policy files found in codebase; assuming policies are not enforced
- Files: All Supabase tables in `src/types/database.ts` (rows 84-950)
- Current mitigation: Admin client exists for privileged operations, but standard user queries lack enforcement
- Recommendations:
  1. Create and document RLS policies for every table
  2. Test that unauthenticated users cannot read any data
  3. Test that authenticated users can only access their own data
  4. Implement column-level security for sensitive fields (passwords, PII)
  5. Store policies in version control (Supabase migration files)

**No CSRF Protection on Mutations:**
- Risk: API routes accept form submissions without CSRF tokens
- Files: Planned API routes for mutations (not yet created)
- Current mitigation: Server Components + Server Actions provide some CSRF protection, but standard Route Handlers don't
- Recommendations:
  1. Use Server Actions (preferred) for all mutations instead of Route Handlers
  2. If Route Handlers required, implement double-submit cookie pattern
  3. Add CSRF token validation middleware

**Admin Service Role Key Not Rotated:**
- Risk: If `.env.local` is ever committed or exposed, service role key grants full database access
- Files: `src/lib/supabase/admin.ts` uses `SUPABASE_SERVICE_ROLE_KEY`
- Current mitigation: File is properly server-only, env vars should be in .gitignore
- Recommendations:
  1. Audit .gitignore to ensure .env* is excluded
  2. Implement key rotation policy
  3. Restrict admin client to necessary functions only
  4. Use env variable names with comment explaining sensitivity

**Stripe Integration Missing Validation:**
- Risk: Stripe API keys and webhooks exist in package.json but no webhook validation found
- Files: Package dependency: `stripe ^20.4.1`, but no webhook route or validation visible
- Current mitigation: Unknown (no webhook routes found in src)
- Recommendations:
  1. Create `/api/webhooks/stripe` route with event signature validation
  2. Verify webhook secret is never exposed to client
  3. Implement idempotency for webhook handlers
  4. Log and alert on webhook failures

## Performance Bottlenecks

**Database Type Definition File Too Large:**
- Problem: `src/types/database.ts` is 989 lines, mixing concerns and making imports slower
- Files: `src/types/database.ts`
- Cause: All 20 table schemas defined in single file; could be auto-generated but isn't
- Improvement path:
  1. Split into `src/types/db/` directory with separate files per domain
  2. Auto-generate from Supabase using `supabase gen types` CLI
  3. Use type-only imports (`import type`) throughout codebase

**No Query Result Caching at HTTP Level:**
- Problem: React Query has cache config, but API responses may not be cached with HTTP headers
- Files: Planned API routes would need `Cache-Control` headers
- Cause: API routes not yet implemented; when created, must set proper cache headers
- Improvement path:
  1. Add `Cache-Control: public, max-age=300` to read-only API responses
  2. Set `Cache-Control: no-store` on mutation responses
  3. Use `revalidateTag()` for Next.js ISR integration

**Missing Image Optimization:**
- Problem: Application has mystical/visual theme but no image optimization strategy visible
- Files: Could affect dreamscape_url, profile images, tarot cards
- Cause: No dedicated image handling component found
- Improvement path:
  1. Use `next/image` for all image sources
  2. Add image compression pipeline for uploads
  3. Serve WebP with fallbacks
  4. Implement lazy loading for long lists

**Sidebar Navigation Not Virtualized:**
- Problem: Sidebar has many nav items (8 mystical tools + 6 advanced + more) - could cause layout thrashing
- Files: `src/components/layouts/Sidebar.tsx` (284 lines)
- Cause: All nav items rendered, no virtualization for long lists
- Improvement path:
  1. If nav list grows beyond 20 items, implement virtualization using `react-window`
  2. Add collapsible sections to reduce rendered items
  3. Measure performance with DevTools Lighthouse

## Fragile Areas

**Auth State Not Explicitly Synchronized:**
- Files: `src/lib/supabase/middleware.ts`, `src/app/(auth)/layout.tsx`
- Why fragile: User session state is checked in middleware and layout separately; if checks diverge, auth bypass possible
- Safe modification:
  1. Create single source of truth: hook or utility for auth state
  2. Centralize user check logic
  3. Write tests for auth state transitions (login → authenticated → logout)
- Test coverage: No auth flow tests found yet - critical gap

**ErrorBoundary Auto-Reset Logic:**
- Files: `src/components/common/ErrorBoundary.tsx` (lines 96-99)
- Why fragile: Hard-coded thresholds (3 errors in 5 seconds) may not fit all scenarios; if errors are fast, user gets redirected without understanding issue
- Safe modification:
  1. Make thresholds configurable via props
  2. Add error logging to external service before auto-reset
  3. Display reset countdown to user
  4. Test with various error patterns
- Test coverage: No tests for error boundary scenarios

**Supabase Client Initialization Pattern:**
- Files: `src/lib/supabase/server.ts`, `src/lib/supabase/client.ts`, `src/lib/supabase/admin.ts`
- Why fragile: Three separate client creation functions with different behaviors; if one is used in wrong context (e.g., admin client in browser), breaks security
- Safe modification:
  1. Add explicit guards to prevent client usage in wrong context
  2. Export constants like `SUPABASE_CLIENT_SERVER`, `SUPABASE_CLIENT_BROWSER`
  3. Use file structure to prevent imports (e.g., admin.ts only importable from server utilities)
  4. Add JSDoc warnings
- Test coverage: No tests for client initialization or context validation

**Form Validation Rules Duplicated:**
- Files: `src/lib/validations/profile.ts` defines schemas for full profile AND onboarding steps; patterns repeat
- Why fragile: If validation rules change, must update multiple schema definitions; easy to miss
- Safe modification:
  1. Extract common validators to utility functions
  2. Compose smaller schemas: `baseProfileSchema` → `fullProfileSchema`
  3. Use `z.pick()` and `z.omit()` to derive schemas from base
  4. DRY up DATE_REGEX and TIME_REGEX into shared constants
- Test coverage: Schema tests should verify consistency across all steps

## Scaling Limits

**Single-Component Layout Without Composition:**
- Current capacity: Sidebar + Header work for small navigation (20-30 items)
- Limit: If navigation grows beyond 50 items or needs dynamic sections, single component becomes unmaintainable
- Scaling path:
  1. Split `src/components/layouts/Sidebar.tsx` into `NavSection`, `NavItem` subcomponents
  2. Move NAV_SECTIONS to `src/lib/constants/navigation.ts`
  3. Support dynamic sections from database or config
  4. Use React.memo to prevent re-renders

**Query Cache Without Eviction Strategy:**
- Current capacity: Default React Query GC time is 30 minutes; fine for single user
- Limit: If user performs 100+ queries, old data may pile up and cause memory issues
- Scaling path:
  1. Implement aggressive cache invalidation on mutations
  2. Use React Query `gcTime` appropriately per entity (shorter for volatile data)
  3. Monitor cache size with React Query DevTools
  4. Consider background sync for long sessions

**No Database Connection Pooling Config:**
- Current capacity: Supabase handles pooling, but unknown if optimized
- Limit: If hitting API rate limits, need explicit pooling strategy
- Scaling path:
  1. Check Supabase plan for connection limits
  2. Consider pgBouncer or built-in pooling
  3. Add request deduplication to prevent duplicate queries
  4. Use batch operations where possible

## Dependencies at Risk

**Next.js 16.2.0 - Newer Release Cycle:**
- Risk: Version 16 is relatively new; rapid changes may introduce breaking changes
- Impact: Dependency updates may require code changes; App Router still evolving
- Migration plan:
  1. Pin minor version to 16.2.x
  2. Test major version upgrades before adopting
  3. Monitor Next.js blog for App Router deprecations

**Zustand 5.x - Persist Middleware Behavior:**
- Risk: Persist middleware stores data in localStorage; behavior changes between versions
- Impact: Theme preference could be lost on version upgrade
- Migration plan:
  1. Test localStorage data migration on version bump
  2. Version store data if shape changes
  3. Add fallback to default theme if storage corrupted

**React Hook Form 7.71.2:**
- Risk: Active maintenance, but consider migration path to alternative if needed
- Impact: Form validation patterns depend on this library
- Migration plan:
  1. Validation logic is Zod-based (decoupled), so schema reuse is possible
  2. Migration would require replacing `useForm` hooks but validation schemas remain

**Stripe Integration - SDK Version Mismatch:**
- Risk: `@stripe/react-stripe-js ^5.6.1` and `stripe ^20.4.1` are separate; synchronization issues possible
- Impact: Payment flows could break if versions diverge
- Migration plan:
  1. Keep versions synchronized when updating
  2. Test payment flows after dependency updates
  3. Monitor Stripe SDKs changelog

## Missing Critical Features

**No Logout Implementation:**
- Problem: Users cannot sign out; session persists until browser close or manual cookie deletion
- Blocks: User account security, multi-user device support, testing
- Implementation needed in `src/components/layouts/Header.tsx` logout handler

**No Error Tracking/Logging Service:**
- Problem: Errors only logged to console; no aggregation or alerting
- Blocks: Production debugging, error trend analysis, user support
- Consider integrating: Sentry, LogRocket, or custom logging API

**No API Routes for Data Operations:**
- Problem: Service layer doesn't exist; no Server Actions visible for mutations
- Blocks: Cannot save user data, process analyses, update profiles
- Required: Create `/src/app/api/` route structure with proper validation

**No Webhook Implementation:**
- Problem: Stripe webhooks not visible; email notifications not handled
- Blocks: Subscription lifecycle management, payment confirmation emails
- Required: Implement `/api/webhooks/stripe` and email service integration

**No Testing Infrastructure:**
- Problem: No test files (`.test.ts`, `.spec.ts`) found in codebase
- Blocks: Cannot safely refactor, regression detection, CI/CD quality gates
- Required: Add Jest/Vitest config and baseline tests for critical paths (auth, validation)

## Test Coverage Gaps

**Authentication Flow Not Tested:**
- What's not tested: Login with password, registration, magic link, session refresh, logout
- Files: `src/app/(public)/login/page.tsx`, `src/app/api/auth/callback/route.ts`, middleware
- Risk: Silent auth failures, session leaks, browser refresh breaking auth
- Priority: **High** - auth is critical path

**Form Validation Not Tested:**
- What's not tested: Profile schema validation for all fields, boundary conditions (min/max lengths), Hebrew character handling
- Files: `src/lib/validations/profile.ts`
- Risk: Invalid data accepted, inconsistent error messages, validation bypassed on client
- Priority: **High** - gates data integrity

**Error Boundary Behavior Not Tested:**
- What's not tested: Auto-reset on 3 errors, error count window, recovery actions
- Files: `src/components/common/ErrorBoundary.tsx`
- Risk: Error boundary fails to reset, loops infinitely, hides actual error
- Priority: **Medium** - safety mechanism

**Route Protection Not Tested:**
- What's not tested: Unauthenticated access to protected routes, middleware behavior, redirect chains
- Files: `src/lib/supabase/middleware.ts`, `src/app/(auth)/layout.tsx`
- Risk: Auth bypass, infinite redirect loops, broken public/protected route separation
- Priority: **High** - security critical

**Sanitization Not Tested:**
- What's not tested: XSS prevention, HTML stripping, special character handling
- Files: `src/lib/utils/sanitize.ts`
- Risk: Stored XSS attacks, prompt injection into LLM, data corruption
- Priority: **High** - security critical

---

*Concerns audit: 2026-03-20*
