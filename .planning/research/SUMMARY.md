# Project Research Summary

**Project:** MystiQor — Mystical/Psychological Analysis Platform
**Domain:** Self-knowledge platform via mystical and psychological synthesis (astrology, numerology, drawing analysis, graphology, tarot, AI coaching)
**Researched:** 2026-03-22
**Confidence:** HIGH

## Executive Summary

MystiQor is a migration project, not a greenfield build. A fully functional 53-page, 100+ component BASE44 application (React/Vite/Deno) already exists and is being moved to Next.js 15 / TypeScript / Supabase. The destination stack is already partially built: a Phase 0 foundation with 127 files and clean compilation exists in `mystiqor-build/`, including auth, middleware, database types, core services, shadcn/ui components, and 5 tool API routes. The primary challenge is not technology selection — all decisions are locked — but completing the migration of a complex domain-specific application with strict ordering constraints, RTL Hebrew requirements, and multiple integration surfaces (Stripe, OpenAI, Supabase Realtime, file uploads).

The recommended approach is a dependency-ordered migration following a 9-phase build order documented in ARCHITECTURE.md. The platform's core differentiator — Mystic Synthesis combining astrology, numerology, drawing analysis, and graphology through a cross-tool AI layer — must be preserved exactly. The subscription system and SubscriptionGuard pattern must be validated end-to-end before tool features ship, because the business model depends on plan-enforced usage limits. Two features (Transits and Human Design) contain mocked or LLM-simulated calculations in the source and must be explicitly rebuilt with real ephemeris data before launch.

Key risks are concentrated in Phase 1 infrastructure: LLM response validation (20+ call sites with no Zod response schemas), file upload architecture (Vercel 4.5MB body limit will break graphology and drawing analysis if not routed through Supabase Storage correctly), atomic usage counter increments (race condition allows free-tier bypass), and Stripe webhook idempotency (duplicate subscription creation on retries). All 6 critical pitfalls are preventable with patterns already established in the codebase — the risk is skipping them under time pressure.

---

## Key Findings

### Recommended Stack

The stack is confirmed and locked. All libraries are installed in `mystiqor-build/package.json` and active in the codebase. No technology decisions remain open.

**Core technologies:**
- **Next.js 15 App Router** — framework; async cookies/params pattern required; verify `npm list next` to confirm exact installed version (package.json shows `^16.2.0` which may be a prerelease range resolving to Next 15)
- **TypeScript 5 strict + noUncheckedIndexedAccess** — zero `any`, zero `@ts-ignore`; enforced in tsconfig.json
- **Supabase (PostgreSQL + Auth + Storage + Realtime)** — three-client pattern complete (browser/server/admin); 20-table schema typed in `src/types/database.ts`
- **Stripe (stripe v20 + @stripe/stripe-js + @stripe/react-stripe-js)** — webhook route exists; needs idempotency check
- **OpenAI SDK v4** — server-side only; single `invokeLLM()` abstraction in `services/analysis/llm.ts`; gpt-4o-mini for text, gpt-4o for vision
- **TanStack Query v5 + Zustand v5** — React Query for server state, Zustand for UI state (theme, onboarding)
- **React Hook Form v7 + Zod v4** — Zod 4 breaks Zod 3 API (`nonempty()` removed); any ported BASE44 validation code must be audited
- **Tailwind CSS v3 + shadcn/ui** — RTL confirmed via `dir="rtl"` on `<html>` in layout.tsx; Assistant font (Hebrew + Latin)
- **Recharts v3** — charts (dashboard, biorhythm, Big Five radar)
- **Resend v4** — transactional email; service layer scaffolded (welcome, payment-failed, usage-limit)
- **date-fns v4** — v4 breaks v3 import style; all ported date code needs audit
- **Vitest v4 + Testing Library** — fully configured with jsdom

**Not yet installed (needed for later phases):**
- `@react-pdf/renderer` — PDF export
- `@upstash/ratelimit @upstash/redis` — API rate limiting

---

### Expected Features

All features already exist in the BASE44 source. This is a migration, not a discovery exercise. Features are ordered by migration priority.

**P0 — Must work from day one:**
- Auth (login / logout / signup) via Supabase Auth
- User profile + multi-step onboarding (name, birth date/time/place, gender, consent)
- Subscription checkout + plan enforcement via SubscriptionGuard
- Dashboard (entry point with Recharts, biorhythm, goals, mood)
- Astrology natal chart + AI interpretation (most-used tool)
- Daily insights (multi-source: tarot + numerology + astrology)
- Analysis history

**P1 — Must work in first sprint after launch:**
- Numerology (life path, destiny, soul, gematria)
- Mood tracker (5-point scale, energy level, trend charts)
- Personal journal (with AI insights)
- Goals + progress tracking
- AI Coach (conversational, knows all user analyses)
- Mystic Synthesis (cross-tool AI summary)

**P2 — Core differentiators (week 2):**
- Drawing analysis (HTP test, digital canvas, Koppitz/FDM scoring, annotations)
- Graphology (9 components, PDF, comparison, progress tracking, reminders)
- Tarot
- Compatibility (astrology + numerology)
- Human Design / Palmistry

**P3 — Value-adds (week 3+):**
- Timing tools, Solar Return, Synastry, Transits (needs real ephemeris rebuild)
- Career guidance, Relationship analysis
- Blog, Tutorials, Astrology Tutor, Drawing Tutor
- PDF export, Social sharing, Referral program, PWA

**Explicit anti-features (do not build):**
- Native mobile app (PWA covers mobile)
- Multi-language / i18n scaffolding (Hebrew only in v1)
- Real-time collaboration (solo tool)
- Admin CMS panel
- IconGenerator, TestStripe, LanguageToggle pages from BASE44 (dev tools — do not migrate)
- Multiple toast systems (consolidate to Sonner + shadcn toast)

---

### Architecture Approach

The system topology is Next.js 15 on Vercel with Supabase as the data/auth/storage/realtime backend, OpenAI for all AI calls (server-side only), Stripe for payments, Nominatim for geocoding, and Resend for email. All protected routes live under `app/(auth)/` with a two-layer layout: a Server Component that validates the Supabase session and redirects unauthenticated users, and a Client Component that provides React Query, toasts, and the sidebar shell. All tool mutations go through API route handlers (auth check + Zod validation + usage increment + service call + DB save) — client components never write to Supabase directly.

**Major components and responsibilities:**
1. **`src/lib/supabase/` (browser/server/admin/middleware)** — auth client selection; wrong client in wrong context causes silent data failures
2. **`src/app/api/tools/[tool]/route.ts`** — standard 7-step template: auth → validate → usage check → compute → LLM → save → return
3. **`src/services/`** — pure computation layer (astrology, numerology, drawing, LLM abstraction, email, geocoding); pages call services, never reimplement
4. **`src/components/features/*/`** — decomposed tool UIs; original BASE44 monoliths (500-1300 lines) split into form + loading + results + history
5. **`SubscriptionGuard`** — wraps every tool form; checks plan limits client-side, backed by atomic server-side increment in DB
6. **`src/components/features/astrology/BirthChart/`** — 922-line original split into 4 SVG sub-components (ZodiacRing, PlanetPositions, AspectLines, HouseOverlay)
7. **Supabase Realtime** — AI Coach chat streaming; every channel must be user-filtered and cleaned up in useEffect

**Current build status (as of 2026-03-22):**
- Phase 0 (Foundation): COMPLETE — 127 files, clean compile
- Phase 2 (Core Data + Auth): 3/9 tasks complete
- 40+ pages still missing (see full migration map in ARCHITECTURE.md)

---

### Critical Pitfalls

1. **SSR auth client mismatch** — Using browser Supabase client in Server Components or API routes causes silent auth failures (RLS returns zero rows, usage increment never fires). Prevention: three-client rule is already established; enforce it via code review. Phase 0.

2. **LLM response shape assumed stable** — 20+ LLM call sites have no Zod response schemas; one malformed response crashes the analysis and wastes the usage increment. Prevention: add Zod validation for every LLM response shape before any feature uses the LLM layer. Phase 1.

3. **File upload hits Vercel 4.5MB body limit** — Sending graphology/drawing images as base64 JSON body exceeds Vercel's limit. Prevention: Supabase Storage client-side upload + server-side URL confirmation pattern; `src/app/api/upload/route.ts` must use `request.formData()` with magic-byte content validation. Phase 1.

4. **Stripe webhook processes events twice** — No idempotency check causes duplicate subscriptions on retry. Prevention: insert `stripe_event_id` to `processed_webhook_events` on receipt; use `request.text()` (not `request.json()`) for signature verification. Phase 4.

5. **Transits and Human Design carry mocked/LLM-simulated data** — `calculateTransits` is explicitly mocked (score 23/50); `calculateHumanDesign` uses LLM guesswork. Migrating these as-is ships incorrect results. Prevention: mark both as `REBUILD` tasks requiring real ephemeris (Swiss Ephemeris WASM or `astronomia` npm package). Phase 5.

6. **Usage counter race condition** — Two simultaneous submissions pass the limit check and both increment, letting free users exceed their plan. Prevention: atomic PostgreSQL `UPDATE ... WHERE analyses_used < analyses_limit RETURNING analyses_used` — no row updated means limit hit. Phase 1.

---

## Implications for Roadmap

The build order is already designed and partially implemented. The roadmap must follow the dependency graph from ARCHITECTURE.md. The following phase structure reflects that research and adds research flags.

### Phase 1: Core Infrastructure Hardening
**Rationale:** Three infrastructure concerns must be locked before any feature is built on top of them. LLM response validation, file upload architecture, and atomic usage counting each affect every subsequent phase. Getting these wrong creates compounding debt.
**Delivers:** Validated LLM service layer with Zod response schemas; production-ready upload endpoint with Supabase Storage; atomic usage counter; Hebrew text normalization in Zod schemas; tarot card data seeded to database.
**Addresses:** Table stakes features (auth, subscription guard) depend on correct usage infrastructure.
**Avoids:** Pitfalls 4 (LLM response), 6 (file upload), 8 (race condition), 11 (Hebrew Zod), 14 (hardcoded tarot).

### Phase 2: Core Data + Auth Completion (6 remaining tasks)
**Rationale:** 3/9 tasks are done. The remaining 6 (Goals CRUD, Mood tracker, Journal, Daily insights, Profile edit, Onboarding completion server-side) are prerequisites for the dashboard to be meaningful. Onboarding consent must be server-validated — client-side flags are a legal risk.
**Delivers:** Working user lifecycle from signup through onboarding to active profile; mood/journal/goals data flowing to dashboard.
**Uses:** Zustand onboarding store (already built), React Query patterns established in Phase 0.
**Avoids:** Pitfall 16 (onboarding consent bypass — must be server-side validated).
**Research flag:** None needed — standard CRUD patterns throughout.

### Phase 3: Tools Tier 1 (Foundational, Most-Used)
**Rationale:** Numerology (done), Tarot (done), Dream (done), Human Design (done) are partially complete. Astrology natal chart is missing and is the platform's most complex feature — it blocks Transits, Solar Return, Synastry, and Timing Tools. The BirthChart SVG decomposition pattern must be applied here.
**Delivers:** All 5 Tier 1 analysis tools functional; Astrology natal chart with SVG decomposition; subscription gate enforced on all tools.
**Implements:** BirthChart 4-component split (ZodiacRing, PlanetPositions, AspectLines, HouseOverlay); SubscriptionGuard wrapping all forms.
**Avoids:** Pitfall 13 (monolith migration — split before porting, not after).
**Research flag:** Astrology natal chart SVG rendering may benefit from phase-level research to evaluate if an existing React astrology chart library is worth adopting versus completing the custom SVG approach already partially built.

### Phase 4: Tools Tier 2 (Image Upload Features)
**Rationale:** Graphology, Drawing Analysis, and Palmistry all require the file upload architecture from Phase 1. Compatibility requires the BirthDataForm pattern for two people. These features are complex (9 graphology components, DigitalCanvas) but do not block other phases.
**Delivers:** Drawing analysis with digital canvas, annotation viewer, Koppitz scoring; full graphology suite (comparison, PDF, progress tracking, reminders); Compatibility; Personality Analysis.
**Uses:** Upload endpoint from Phase 1; BirthDataForm extended for two-person input.
**Avoids:** Pitfall 6 (file upload architecture); Pitfall 15 (PDF export using pdf-lib, not puppeteer).
**Research flag:** DigitalCanvas implementation (HTML5 Canvas + touch events + base64 export) may need research if the BASE44 implementation has gaps. Graphology PDF export must be validated against Vercel timeout limits.

### Phase 5: Tools Tier 3 (Ephemeris-Dependent)
**Rationale:** Transits, Solar Return, Synastry, and Astrology readings all depend on the natal chart (Phase 3) and real ephemeris data. Transits MUST be rebuilt — the BASE44 version is explicitly mocked. This is the highest technical risk phase.
**Delivers:** Full astrology suite including transits (real ephemeris), synastry (dual chart), Solar Return, Astrology Readings (8 modes), AstroCalendar, Timing Tools.
**Avoids:** Pitfall 5 (mocked transits — use Swiss Ephemeris WASM or `astronomia` npm package, cache per UTC day).
**Research flag:** NEEDS RESEARCH — ephemeris library selection (swisseph WASM vs astronomia vs external API), Human Design deterministic algorithm, caching strategy for computed planetary positions.

### Phase 6: AI Coach + Mystic Synthesis
**Rationale:** AI Coach requires Supabase Realtime and depends on the user having completed analyses (all prior phases). Mystic Synthesis requires at minimum 2 tool types to be done. These are the highest-value differentiators and the most complex AI interactions.
**Delivers:** AI Coach with streaming chat, Coaching Journeys, Mystic Synthesis (cross-tool), Ask Question, Career Guidance.
**Implements:** Supabase Realtime channel per user (with filter and useEffect cleanup); streaming LLM responses.
**Avoids:** Pitfall 9 (realtime subscription leak); Pitfall 12 (prompt injection — XML delimiters on all user input).
**Research flag:** Supabase Realtime streaming patterns with Next.js App Router — confirm channel configuration for production.

### Phase 7: Growth + Monetization
**Rationale:** Stripe checkout flow, webhooks, referrals, and subscription management are the business backbone. The webhook route exists but needs idempotency. Referral system and email flows are scaffolded.
**Delivers:** Complete Stripe checkout, subscription management, referral program, transactional email (welcome, payment-failed, usage-limit), Analytics Dashboard.
**Avoids:** Pitfall 3 (Stripe webhook idempotency — implement before going live with payments).
**Research flag:** Vercel cron configuration for monthly usage reset and daily insight batch — confirm timeout limits for Hobby vs Pro plan.

### Phase 8: Learning + Analytics
**Rationale:** Tutorials, Astrology Tutor, Drawing Tutor, and the self-analytics dashboard are value-adds that increase retention but do not block core functionality. Analysis history and compare features depend on analyses table having sufficient data.
**Delivers:** Tutorial system, Astrology Tutor, Drawing Tutor, Analysis History with compare, Analytics Dashboard.
**Research flag:** None needed — content-driven features with standard patterns.

### Phase 9: Infrastructure + PWA
**Rationale:** Rate limiting, cron jobs, PDF export, social sharing, PWA, notifications, and accessibility audit are final polish. Cron jobs need the queue pattern to avoid timeout issues.
**Delivers:** Rate limiting (Upstash Redis), cron jobs (queue pattern, unique constraint on user+date), PDF export (pdf-lib), PWA manifest + service worker, social sharing, notifications, accessibility audit.
**Avoids:** Pitfall 10 (cron timeout — queue pattern with per-user locks); Pitfall 15 (PDF timeout — pdf-lib not puppeteer).
**Research flag:** Upstash Redis rate limiting integration with Vercel middleware; service worker strategy for Hebrew RTL PWA.

---

### Phase Ordering Rationale

- **Phase 1 before everything:** LLM response validation, upload architecture, and atomic counters affect all 20+ tool call sites. Establishing these first prevents compounding rework.
- **Phase 2 before tools:** Onboarding and profile data are prerequisites for all analysis tools — nothing can be pre-filled without a completed profile.
- **Phase 3 before Phase 4:** Astrology natal chart is prerequisite for Synastry, Solar Return, and Timing Tools. The BirthDataForm pattern established in Phase 3 is reused in Phase 4 for two-person inputs.
- **Phase 5 isolated:** Ephemeris rebuild is the highest risk item and is isolated from other features. It does not block Phase 6 (AI Coach) or Phase 7 (monetization).
- **Phase 6 after Phase 3-5:** Mystic Synthesis requires analyses from multiple tools to exist before it can meaningfully synthesize.
- **Phase 7 relatively early:** Stripe webhooks and subscription management protect revenue. Even though it's Phase 7, the webhook idempotency fix should be validated in a pre-launch QA pass.

---

### Research Flags

**Needs phase-level research during planning:**
- **Phase 3:** Astrology SVG chart — evaluate existing React astrology chart libraries vs completing custom SVG (one-time decision with significant implementation impact)
- **Phase 5:** Ephemeris library selection — Swiss Ephemeris WASM vs `astronomia` npm vs external API; Human Design deterministic calculation algorithm
- **Phase 6:** Supabase Realtime streaming configuration for Next.js App Router
- **Phase 9:** Upstash Redis rate limiting; PWA service worker strategy for RTL

**Standard patterns — skip research phase:**
- **Phase 1:** Core infrastructure hardening — all patterns documented and partially implemented
- **Phase 2:** CRUD features — Goals, Mood, Journal follow established patterns
- **Phase 4:** Image upload + graphology — architecture established in Phase 1
- **Phase 7:** Stripe integration — well-documented, existing webhook route to improve
- **Phase 8:** Content/tutorial features — no novel patterns

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All libraries confirmed via direct package.json read; all patterns confirmed via direct code inspection; only open question is exact Next.js installed version (verify with `npm list next`) |
| Features | HIGH | All features derived from direct source code examination of 53 pages and 100+ components; no assumptions |
| Architecture | HIGH | Architecture design in 03_ARCHITECTURE.md confirmed against actual mystiqor-build/ implementation; build order dependency graph is deterministic |
| Pitfalls | HIGH for pitfalls from direct code inspection; MEDIUM for Next.js-specific mitigations | 12 of 16 pitfalls derived from documented source issues; Next.js 15 mitigation patterns based on framework knowledge (August 2025 cutoff) |

**Overall confidence:** HIGH

### Gaps to Address

- **Next.js exact version:** `npm list next` in `mystiqor-build/` to confirm whether `^16.2.0` resolves to a Next.js 15 stable or a prerelease — affects which async API patterns are safe.
- **Geocoding provider:** `services/geocode.ts` exists but external API provider (Nominatim vs Google Maps) is not confirmed in research; confirm before implementing birth-place-dependent features.
- **Transits ephemeris library selection:** This decision must be made before Phase 5 begins. Swiss Ephemeris WASM runs in Node.js (not Edge Runtime); `astronomia` is pure JavaScript but less precise. External API avoids the bundle size issue but adds latency and cost. Not resolvable without a proof-of-concept.
- **Human Design deterministic algorithm:** No established npm library was identified for Human Design chart calculation; this may require custom implementation or an external service. Must be researched before Phase 5.
- **Zod v4 API changes:** All ported validation logic from BASE44 must be audited for Zod 3 → 4 API differences (`nonempty()` removed, error shape changed). This is a mechanical task but risks silent validation failures if missed.
- **date-fns v4 import changes:** All astrology date calculation code ported from BASE44 must be audited for date-fns v3 → v4 import style differences.

---

## Sources

### Primary (HIGH confidence)
- `d:/AI_projects/MystiQor/mystiqor-build/package.json` — confirmed stack versions
- `d:/AI_projects/MystiQor/mystiqor-build/src/**` — direct code inspection (Phase 0 + Phase 2 partial)
- `d:/AI_projects/MystiQor/github-source/src/pages/` — all 53 BASE44 source pages
- `d:/AI_projects/MystiQor/github-source/src/components/` — 100+ BASE44 source components
- `d:/AI_projects/MystiQor/02_REVERSE_ENGINEERING.md` — feature scoring + technical debt
- `d:/AI_projects/MystiQor/02b_GEMS.md` — 14 documented improvement patterns
- `d:/AI_projects/MystiQor/03_ARCHITECTURE.md` — system architecture design
- `d:/AI_projects/MystiQor/.planning/PROJECT.md` — requirements and constraints

### Secondary (MEDIUM confidence)
- Next.js 15 official release blog — async cookies/params API confirmation
- Supabase SSR documentation — three-client pattern validation
- Zod v4 migration notes — API differences from v3
- date-fns v4 migration notes — import style changes
- Stripe webhook best practices — idempotency pattern

---

*Research completed: 2026-03-22*
*Ready for roadmap: yes*
