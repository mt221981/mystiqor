# Codebase Concerns - MystiQor

**Analysis Date:** 2026-03-20

## Critical Issues (BLOCKING)

### 1. Empty Service Layer

**Severity:** CRITICAL
**Impact:** Cannot implement business logic; all features blocked
**Files:** `src/services/` (analysis/, astrology/, drawing/, email/, numerology/)
**Current State:** Directory structure exists but zero implementation

**Problem:**
- Services directory has 5 empty subdirectories
- No exported functions to handle business logic
- All feature implementation must go here but framework missing
- Architecture requires: Typed async functions, DB access, error handling

**Fix Approach:**
1. Create `src/services/astrology/calculate.ts` - GEM logic preserved
2. Create `src/services/numerology/calculate.ts` - GEM logic preserved
3. Create `src/services/analysis/store.ts` - Save analysis results
4. Create `src/services/email/send.ts` - Transactional emails
5. Create `src/services/drawing/analyze.ts` - Image analysis
6. Pattern: Export typed async functions with full error handling
7. All use `createClient()` from `@/lib/supabase/server`

**Test:** Phase will not pass until services implemented

---

### 2. API Routes Not Implemented

**Severity:** CRITICAL
**Impact:** No endpoints; entire API missing
**Files:** All subdirectories in `src/app/api/` except `auth/callback/route.ts`
**Current State:** 34+ empty folders, 1 implemented route

**What Exists:**
- `src/app/api/auth/callback/route.ts` - OAuth callback (complete, 34 lines)

**What's Missing:**
- `/api/tools/astrology/birth-chart/route.ts` - Birth chart calculation
- `/api/tools/astrology/transits/route.ts` - Transit calculations
- `/api/tools/numerology/calculate/route.ts` - Numerology readings
- `/api/goals/route.ts` - CRUD goals
- `/api/insights/daily/route.ts` - Generate daily insights
- `/api/subscription/checkout/route.ts` - Stripe integration
- `/api/subscription/cancel/route.ts` - Cancel subscriptions
- `/api/coach/message/route.ts` - Coaching messages
- `/api/cron/daily-insights/route.ts` - Scheduled job
- `/api/upload/route.ts` - File uploads
- `/api/webhooks/stripe/route.ts` - Stripe events

**Fix Approach:**
1. Create route per feature: `POST /api/tools/[tool]/route.ts`
2. Pattern: Validate with Zod, auth check, call service, return typed response
3. Error handling: try/catch with user-friendly messages
4. All mutations checked for auth and usage limits

---

### 3. Database Connection Missing

**Severity:** CRITICAL
**Impact:** App cannot access data, all features fail
**Files:** `src/types/database.ts`
**Current State:** Placeholder types only, no actual DB schema exists

**Problem:**
- Database types are manually defined (989 lines)
- Should be auto-generated from `supabase gen types`
- Actual Supabase tables do not exist in production database
- RLS (Row-Level Security) policies not created
- No migrations executed

**What's Needed:**
1. Create Supabase database and tables (20 tables)
2. Create RLS policies (CRITICAL for security)
3. Run `supabase gen types` to generate `src/types/database.ts`
4. Set up Stripe webhook keys
5. Configure email service (Resend or SendGrid)

**Fix Approach:**
1. Execute Supabase migration script (create in `supabase/migrations/`)
2. Define RLS policies per CLAUDE.md (security requirement)
3. Regenerate types: `npx supabase gen types --lang typescript`
4. Test connection with: `const client = await createClient(); const { data } = await client.from('profiles').select('*').limit(1);`

**Blocking:** No data operations work without this

---

### 4. Logout Function Not Implemented

**Severity:** HIGH
**Impact:** Users cannot sign out; session remains active
**Files:** `src/components/layouts/Header.tsx` (line 183)
**Current State:** TODO comment, button has empty onClick handler

**Problem:**
```typescript
// Line 173-184 in Header.tsx
onClick={() => {
  setIsUserMenuOpen(false);
  // TODO: חיבור לפונקציית התנתקות מ-Supabase Auth
}}
```

**Fix Approach:**
1. Create `src/lib/supabase/auth.ts` with logout function:
```typescript
export async function signOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}
```
2. Import and call in Header.tsx onClick
3. Redirect to `/login` after signout using `useRouter().push()`
4. Clear React Query cache: `queryClient.clear()`

---

## Tech Debt & Missing Features

### 1. Placeholder Dashboard

**Severity:** MEDIUM
**Impact:** Users see incomplete interface
**Files:** `src/app/(auth)/dashboard/page.tsx`
**Current State:** Static cards with hardcoded "0" values, placeholder message

**Problem:**
- Stats cards show no real data
- "התוכן המלא ייבנה בקרוב" (Full content coming soon) message
- Needs actual React Query hooks to fetch:
  - Analysis count (from subscriptions table)
  - Active goals count
  - User streak (from mood entries)
  - Insight count

**Fix Approach:**
1. Add React Query hooks for stats
2. Replace hardcoded "0" with actual values
3. Add recent activities list
4. Add quick action buttons to main tools

---

### 2. Placeholder Sidebar Navigation

**Severity:** LOW-MEDIUM
**Impact:** Navigation works but layout incomplete
**Files:** `src/app/(auth)/layout-client.tsx` (lines 33-46)
**Current State:** Hardcoded sidebar shell, real navigation in `src/components/layouts/Sidebar.tsx`

**Problem:**
- Layout-client has inline placeholder sidebar
- Real Sidebar component exists but not integrated
- Should use Sidebar component instead of placeholder

**Fix Approach:**
1. Import Sidebar from components/layouts
2. Replace placeholder with `<Sidebar />`
3. Integrate mobile drawer for responsive

---

### 3. No Email Service Implementation

**Severity:** HIGH
**Impact:** Cannot send transactional emails (onboarding, password reset, etc)
**Files:** `src/services/email/` (empty)
**Current State:** Directory exists, no files

**Missing Emails:**
- Welcome email (post-signup)
- Email verification
- Password reset link
- Subscription confirmation
- Usage limit warnings
- Daily digest (if premium)

**Fix Approach:**
1. Create `src/services/email/send.ts`
2. Use Resend API (recommended) or SendGrid
3. Create email templates in `src/services/email/templates/`
4. Export: `sendWelcomeEmail(email: string, name: string)`
5. Call from `/api/auth/` routes after signup

---

### 4. Missing Upload Handler

**Severity:** MEDIUM
**Impact:** Cannot handle file uploads (drawings, documents)
**Files:** `src/app/api/upload/route.ts` (empty)
**Current State:** Directory only

**Needed For:**
- Drawing tool (upload images for analysis)
- Document tool (upload PDFs)
- Profile avatar upload

**Fix Approach:**
1. Create `src/app/api/upload/route.ts` with POST handler
2. Validate: file type, size (max 10MB)
3. Scan for viruses (optional but recommended)
4. Upload to Supabase Storage bucket
5. Return signed URL
6. Validate on client: Check MIME types before upload

---

## Migration Risks from temp_source/

### 1. BASE44-Specific Code

**Risk:** Code tied to BASE44 framework will not work in Next.js
**Location:** `temp_source/base44/` and `temp_source/src/`
**Approach:** Extract only business logic (calculations, formulas), rebuild UI/API

**Gems to Preserve:**
- Astrology calculations (GEM 8)
- Numerology algorithms
- Tarot card interpretations
- Dream analysis rules
- Graphology analysis logic

**Do Not Port:**
- BASE44 components
- BASE44 routing
- BASE44 form system
- BASE44-specific styling

---

### 2. Missing Configuration

**Risk:** Environment variables, API keys not set up
**Current:** `.env.local` not in repo (correct, secrets)
**Needed:**
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
STRIPE_PUBLIC_KEY=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
RESEND_API_KEY=... (or SendGrid key)
OPENAI_API_KEY=...
NEXT_PUBLIC_SITE_URL=...
```

**Fix:** Create `.env.local.example` documenting all required vars

---

### 3. Type Safety Issues

**Risk:** Using `placeholder-not-used` value in forms could mask bugs
**Files:** `src/app/(public)/login/login-forms.tsx` (line 121)
**Current:**
```typescript
defaultValues: { email: '', password: 'placeholder-not-used' }
```

**Problem:** Password field has dummy value - could mask validation issues
**Fix:** Use empty string: `password: ''`

---

## Performance Concerns

### 1. Sidebar Navigation Size

**Severity:** LOW
**Impact:** Large navigation object in memory
**Files:** `src/components/layouts/Sidebar.tsx`
**Current State:** NAV_SECTIONS constant with 50+ items

**Issue:** Full navigation always rendered, should paginate on mobile
**Fix:** Use scroll area on mobile, lazy load sections

---

### 2. No Image Optimization

**Severity:** MEDIUM
**Impact:** Large unoptimized images slow page load
**Files:** All pages using images
**Current State:** Not using Next.js Image component

**Fix:** Replace `<img>` with `<Image>` from `next/image` with optimization

---

## Security Concerns

### 1. Missing RLS Policies

**Severity:** CRITICAL
**Impact:** Unauthorized access to data possible
**Files:** Database (not in repo)
**Requirement:** Per CLAUDE.md - "RLS policies on EVERY Supabase table — no exceptions"

**Current:** No policies created
**Fix Approach:**
1. Create policy for `profiles` table: users can only read/update own profile
2. Create policy for `subscriptions`: users can only read own
3. Create policy for `analyses`: users can only read own
4. Create policy for `analyses`: restrict by user_id
5. All data tables: Add WHERE clause filtering by user_id

**Example:**
```sql
CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
USING (auth.uid() = id);
```

---

### 2. No Input Sanitization on All Routes

**Severity:** MEDIUM
**Impact:** XSS attacks on user-generated content (journal, mood notes)
**Files:** All API routes handling text input
**Current State:** `src/lib/utils/sanitize.ts` exists but not used everywhere

**Risk Areas:**
- Journal entry content (could contain HTML/JS)
- Mood notes
- Goal descriptions
- Custom question input

**Fix:** Validate all text input with DOMPurify before storing

---

### 3. No Rate Limiting

**Severity:** MEDIUM
**Impact:** Brute force attacks on login, API abuse
**Files:** API routes (all)
**Current State:** No rate limiting implemented

**Missing:**
- Login endpoint: Max 5 attempts per 15 minutes
- API endpoints: Rate limit per user
- Signup: Rate limit per IP

**Fix:** Use `Ratelimit` from `@upstash/ratelimit`

---

## Testing Gaps

**Severity:** HIGH
**Impact:** No coverage of business logic, easy to introduce bugs

**Missing:**
- Zero test files in codebase
- No unit tests for services
- No integration tests for API routes
- No E2E tests

**Recommended:**
- Add vitest for unit tests (services, utils)
- Add integration tests for API routes
- Consider Playwright for E2E

---

## Documentation

**Severity:** LOW
**Impact:** Developers unclear on patterns

**Missing:**
- README.md for feature development
- API documentation
- Database schema documentation
- Component documentation

**Recommended:**
- Add JSDoc to all exported functions (required by CLAUDE.md)
- Create CONTRIBUTING.md
- Document all API endpoints

---

## Summary Table

| Issue | Severity | Blocking | Fix Time |
|-------|----------|----------|----------|
| Empty services layer | CRITICAL | YES | 40h |
| Missing API routes | CRITICAL | YES | 60h |
| No database setup | CRITICAL | YES | 20h |
| No logout function | HIGH | YES | 2h |
| Missing RLS policies | CRITICAL | YES | 4h |
| No email service | HIGH | NO | 8h |
| No input sanitization | MEDIUM | NO | 4h |
| No rate limiting | MEDIUM | NO | 6h |
| Missing tests | HIGH | NO | 40h |
| Dashboard placeholder | MEDIUM | NO | 4h |
| Upload handler | MEDIUM | NO | 6h |

**Critical Path (Must Complete First):**
1. Create/migrate Supabase tables + RLS policies
2. Implement services layer (analysis, astrology, numerology)
3. Implement API routes (tools, subscription, insights)
4. Add logout functionality
5. Add email service
6. Then: Implement all tool pages

---

*Concerns audit: 2026-03-20*
