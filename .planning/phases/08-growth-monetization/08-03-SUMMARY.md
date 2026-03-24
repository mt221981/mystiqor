---
phase: 08-growth-monetization
plan: 03
subsystem: infra
tags: [rate-limiting, upstash, redis, serverless, security]

# Dependency graph
requires:
  - phase: 08-growth-monetization
    provides: Stripe subscription and usage increment infrastructure
provides:
  - Upstash sliding window rate limiter for LLM and upload endpoints
  - checkRateLimit helper with env-guard (graceful skip when UPSTASH vars absent)
  - Usage route protected with 429 response for rate-limited requests
affects:
  - All LLM-calling routes that should adopt llmRateLimit
  - All upload routes that should adopt uploadRateLimit

# Tech tracking
tech-stack:
  added:
    - "@upstash/ratelimit@2.0.8"
    - "@upstash/redis@1.37.0"
  patterns:
    - "Env guard pattern: createLimiter returns null when UPSTASH env vars absent, checkRateLimit returns true on null — safe in all environments"
    - "Rate limit before business logic: rate check inserted after auth but before expensive RPC call"

key-files:
  created:
    - mystiqor-build/src/lib/rate-limit.ts
  modified:
    - mystiqor-build/src/app/api/subscription/usage/route.ts
    - mystiqor-build/package.json

key-decisions:
  - "Duration type imported from @upstash/ratelimit — required for type-safe slidingWindow calls (plain string rejected by TS)"
  - "llmRateLimit: 10 requests per 60s per user; uploadRateLimit: 5 requests per 60s per user"
  - "checkRateLimit returns true when limiter is null — ensures zero-friction dev environments without Upstash credentials"
  - "Rate limit check placed after auth and before increment_usage RPC — prevents abuse without breaking auth logic"

patterns-established:
  - "Env guard: if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null"
  - "Rate limit check pattern: const allowed = await checkRateLimit(limiter, user.id); if (!allowed) return 429"

requirements-completed: [INFRA-07]

# Metrics
duration: 5min
completed: 2026-03-24
---

# Phase 08 Plan 03: Rate Limiting Summary

**Upstash Redis sliding window rate limiter with env guard — LLM (10/60s) and upload (5/60s) limiters wired into usage endpoint with 429 Hebrew error response**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-24T11:54:17Z
- **Completed:** 2026-03-24T12:00:12Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Installed @upstash/ratelimit@2.0.8 and @upstash/redis@1.37.0 (--legacy-peer-deps for openai/zod conflict compatibility)
- Created src/lib/rate-limit.ts with llmRateLimit, uploadRateLimit, and checkRateLimit — all with env guard that allows all requests when Upstash vars are absent
- Wired llmRateLimit into usage route as first check after auth — returns 429 with Hebrew error before reaching RPC call

## Task Commits

Each task was committed atomically (inside mystiqor-build sub-repo):

1. **Task 1: Install Upstash packages + create rate-limit library** - `736cbb2` (feat)
2. **Task 2: Wire rate limiting into usage route** - `51f6fec` (feat)

## Files Created/Modified

- `mystiqor-build/src/lib/rate-limit.ts` - Rate limiter factory with env guard; exports llmRateLimit, uploadRateLimit, checkRateLimit
- `mystiqor-build/src/app/api/subscription/usage/route.ts` - Added rate limit check as first guard after auth
- `mystiqor-build/package.json` + `package-lock.json` - Added @upstash/ratelimit and @upstash/redis

## Decisions Made

- `Duration` type imported from `@upstash/ratelimit` — `slidingWindow` rejects plain `string` type, requires the template literal union type
- Graceful skip (return null from createLimiter) is the correct pattern for local/CI environments without Upstash credentials
- Rate limit check placed BEFORE `increment_usage` RPC to prevent expensive DB writes for blocked requests

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Duration type for slidingWindow parameter**
- **Found during:** Task 1 (TypeScript verification after creating rate-limit.ts)
- **Issue:** `window: string` parameter caused TS2345 — `Ratelimit.slidingWindow` expects `Duration` not `string`
- **Fix:** Changed function signature to `window: Duration` and added `type Duration` to import from `@upstash/ratelimit`
- **Files modified:** mystiqor-build/src/lib/rate-limit.ts
- **Verification:** `npx tsc --noEmit` exits 0 with no errors in rate-limit.ts
- **Committed in:** 736cbb2 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 — type bug)
**Impact on plan:** Fix necessary for TypeScript correctness. No scope creep.

## Issues Encountered

- Pre-existing TypeScript errors in `src/app/api/webhooks/stripe/route.ts` (unrelated to this plan) — noted as out-of-scope, not fixed. These existed before this plan and are not caused by rate-limit changes.

## User Setup Required

To activate rate limiting in production, add these environment variables to Vercel:

```
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

Without these, the rate limiter gracefully skips (allows all requests) — safe for dev/staging environments.

## Next Phase Readiness

- Rate limiting library ready for use in any LLM route: import `{ llmRateLimit, checkRateLimit }` from `@/lib/rate-limit`
- Upload routes can adopt `uploadRateLimit` using the same `checkRateLimit` pattern
- INFRA-07 requirement fulfilled

---
*Phase: 08-growth-monetization*
*Completed: 2026-03-24*
