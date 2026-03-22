# Phase 1: Infrastructure Hardening - Context

**Gathered:** 2026-03-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Harden the existing infrastructure layer so every subsequent feature phase can build on validated, safe foundations. LLM calls validate response shapes with Zod per call site. File uploads handle multipart with magic-byte validation. Usage increments are atomic. DB types are generated from the live schema. Geocoding resolves birth places to coordinates.

**Key finding from codebase scout:** Phase 1 is ~85% already built. All 6 INFRA requirements have working implementations scoring 44-48/50. The main gap is per-call-site Zod response schemas for LLM calls and creating the actual Supabase cloud project.

</domain>

<decisions>
## Implementation Decisions

### Supabase Project Setup
- **D-01:** User has a Supabase account but no project created yet
- **D-02:** Phase 1 includes creating the Supabase project, running migrations from `supabase/migrations/`, and generating TypeScript types via `supabase gen types`
- **D-03:** The manual `src/types/database.ts` (1012 lines) will be replaced by auto-generated types once the DB is provisioned
- **D-04:** Migration SQL files already exist: `001_schema.sql`, `002_functions.sql`

### LLM Response Validation
- **D-05:** Use Zod schema per call site — every invokeLLM call defines its expected response structure
- **D-06:** The existing `forceToString`/`forceToNumber`/`forceToArray` helpers remain as fallbacks for text extraction, but structured JSON responses must be validated against their Zod schema before use
- **D-07:** If a response fails Zod validation, return a typed LLMValidationError (not crash) with the raw response preserved for debugging
- **D-08:** Response schemas are co-located with their service file (e.g., `services/analysis/astrology.ts` defines its own response schemas)

### File Upload (Existing — Refinement Only)
- **D-09:** Existing upload route at `api/upload/route.ts` works (score 44/50). Refinements: add magic-byte validation (not just MIME type), strip EXIF metadata for privacy
- **D-10:** Vercel 4.5MB body limit handled by streaming to Supabase Storage directly — not buffering entire body

### Usage Counter (Existing — Verification Only)
- **D-11:** Atomic `increment_usage()` RPC function already works (score 46/50). Tighten the type assertion on RPC result from `as { success: boolean }` to proper Zod parse

### Geocoding (Existing — Minor Refinement)
- **D-12:** Existing geocoding service uses Nominatim (OpenStreetMap). Add in-memory cache (Map with 1-hour TTL) to reduce API load
- **D-13:** Add timeout handling (5s) — Nominatim can be slow

### Claude's Discretion
- Exact Zod schema shapes for each LLM call site (determined per-service during implementation)
- Whether to add structured logging at this phase or defer
- Cache implementation details (Map vs LRU)
- Error tracking integration (Sentry) timing

</decisions>

<specifics>
## Specific Ideas

- The existing `llm.ts` service already supports JSON schema responses via `json_schema` field — Zod schemas should define the expected shape, and validation happens after the LLM returns
- Migration SQL files in `supabase/migrations/` define 20 tables matching the manual `database.ts` types — verify 1:1 match before replacing
- The three Supabase client files (client.ts, server.ts, admin.ts) score 48/50 — do NOT touch them

</specifics>

<canonical_refs>
## Canonical References

### Supabase Configuration
- `mystiqor-build/src/lib/supabase/client.ts` — Browser client (DO NOT MODIFY)
- `mystiqor-build/src/lib/supabase/server.ts` — Server client (DO NOT MODIFY)
- `mystiqor-build/src/lib/supabase/admin.ts` — Admin client (DO NOT MODIFY)
- `mystiqor-build/src/lib/supabase/middleware.ts` — Session middleware (DO NOT MODIFY)
- `mystiqor-build/supabase/migrations/001_schema.sql` — DB schema migration
- `mystiqor-build/supabase/migrations/002_functions.sql` — DB functions migration

### LLM Service
- `mystiqor-build/src/services/analysis/llm.ts` — LLM invocation service (base to extend)
- `mystiqor-build/src/lib/utils/llm-response.ts` — Response normalization helpers (GEM 5)
- `mystiqor-build/src/lib/utils/sanitize.ts` — Input sanitization

### File Upload
- `mystiqor-build/src/app/api/upload/route.ts` — Existing upload route

### Usage Counter
- `mystiqor-build/src/app/api/subscription/usage/route.ts` — Existing usage endpoint
- `mystiqor-build/src/lib/validations/subscription.ts` — Subscription Zod schemas
- `mystiqor-build/src/types/subscription.ts` — Subscription types

### Geocoding
- `mystiqor-build/src/services/geocode.ts` — Geocoding service
- `mystiqor-build/src/app/api/geocode/route.ts` — Geocoding API route

### Database Types
- `mystiqor-build/src/types/database.ts` — Manual types (1012 lines, to be replaced by generated)

### Research
- `.planning/research/STACK.md` — Stack decisions and version info
- `.planning/research/PITFALLS.md` — Migration pitfalls including Zod v4 breaking changes

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `invokeLLM<T>()` — Generic LLM call function, already supports JSON schema responses. Extend with Zod validation post-response
- `forceToString()`, `forceToNumber()`, `forceToArray()` — LLM response normalization helpers (keep as fallbacks)
- `sanitizeForLLM()` — Input sanitization (keep as-is)
- All 7 Zod validation files in `lib/validations/` — established pattern to follow

### Established Patterns
- API route pattern: create client → auth check → Zod parse → business logic → NextResponse.json
- All error messages in Hebrew
- All API routes return consistent status codes (200, 400, 401, 429, 500)
- Supabase RPC calls for atomic operations

### Integration Points
- `invokeLLM<T>()` is called by every analysis service — schema validation must be non-breaking
- `increment_usage()` RPC is called by every tool API route before LLM calls
- File upload route is called by drawing analysis and graphology forms
- Geocoding is called by onboarding and astrology tools

</code_context>

<deferred>
## Deferred Ideas

- Rate limiting on API endpoints — Phase 8 (INFRA-07)
- Email service setup — Phase 8 (INFRA-08)
- Sentry/error tracking integration — evaluate during Phase 3
- Structured logging — evaluate during Phase 3

</deferred>

---

*Phase: 01-infrastructure-hardening*
*Context gathered: 2026-03-22*
