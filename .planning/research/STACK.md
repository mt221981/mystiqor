# Technology Stack

**Project:** MystiQor — Mystical/Psychological Analysis Platform
**Migration:** BASE44 (React/Vite/Deno) → Next.js + TypeScript + Supabase
**Researched:** 2026-03-22

---

## Context: This Is a Migration, Not a Greenfield Build

The `mystiqor-build/` directory already contains a Phase 0 foundation with 127 files,
a clean compile, and all major stack decisions already implemented and validated.
This STACK.md documents the confirmed stack — what exists, why it works, and what
still needs attention.

**Source of truth for versions:** `mystiqor-build/package.json` (read directly — not inferred).

---

## Confirmed Stack (Locked Decisions)

### Core Framework

| Technology | Version (package.json) | Purpose | Status |
|------------|------------------------|---------|--------|
| Next.js | `^16.2.0` | App Router, SSR, API routes, middleware | LOCKED — already bootstrapped |
| React | `^19.2.4` | UI rendering | LOCKED |
| TypeScript | `^5` | strict mode, `noUncheckedIndexedAccess` | LOCKED — tsconfig.json confirms strict |

**Note on Next.js version:** The project CLAUDE.md says "Next.js 14+" but the actual
installed version is `^16.2.0`. Next.js 15 was released October 2024 (confirmed via
official blog) and is the current stable. Next 16 appears to be a canary/unreleased
semver range — the `^16.2.0` may be resolving to a prerelease build. Roadmap should
flag this for verification: `npm list next` to confirm what's actually installed.
Functionally the App Router API used in the codebase matches Next.js 15 patterns
(async cookies, async params, `next.config.ts`).

**Confidence:** HIGH for Next.js 15 App Router as the real baseline. MEDIUM on the
exact installed minor version — needs `npm list next` confirmation.

### Database & Auth

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `@supabase/supabase-js` | `^2.99.3` | DB queries, auth, storage, realtime | PostgreSQL + Auth + RLS + Storage in one platform — replaces BASE44's proprietary entities |
| `@supabase/ssr` | `^0.9.0` | Cookie-based auth for Next.js SSR | Required for SSR auth — `createServerClient` / `createBrowserClient` pattern already implemented in `src/lib/supabase/` |

**Pattern in use:** Three-file Supabase pattern is complete:
- `lib/supabase/client.ts` — browser client
- `lib/supabase/server.ts` — server component client (async cookies, Next.js 15 pattern)
- `lib/supabase/middleware.ts` — session refresh on every request

**Database schema:** 20 tables fully typed in `src/types/database.ts`. Migrations exist
in `supabase/migrations/`. The type file is manually authored (placeholder note says
"until Supabase CLI auto-generates"). This is a migration risk: manual types drift from
actual DB schema. Phase 1 of the roadmap must run `supabase gen types` to replace the
manual file.

**Confidence:** HIGH — patterns are correct, implementation is solid.

### Payments

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `stripe` | `^20.4.1` | Server-side Stripe SDK | Webhook handling, checkout sessions |
| `@stripe/stripe-js` | `^8.11.0` | Client-side Stripe | Payment element loading |
| `@stripe/react-stripe-js` | `^5.6.1` | React components for Stripe | Payment UI |

**Note:** These versions are the latest major releases as of early 2025. Stripe
versioning is aggressive — the SDK major version (20) is an API versioning scheme, not
semver breaking change frequency. The `api/webhooks/` route exists in the build.

**Confidence:** HIGH — Stripe + Next.js is a standard, well-documented pattern.

### AI / LLM

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `openai` | `^4.104.0` | OpenAI SDK | All analysis (numerology, astrology, drawing, graphology, coaching) goes through `services/analysis/llm.ts` |

**Pattern in use:** Single `invokeLLM()` abstraction in `src/services/analysis/llm.ts`.
- `gpt-4o-mini` for text analysis (cost-efficient)
- `gpt-4o` for image analysis (vision: drawing analysis, graphology)
- Server-side only — `OPENAI_API_KEY` never touches client code
- Input sanitization via `sanitizeForLLM()` before every call

**Confidence:** HIGH — implementation is complete and follows correct server-only pattern.

### State Management

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `@tanstack/react-query` | `^5.91.2` | Server state (fetch, cache, sync) | Replaces BASE44's built-in data layer — handles loading/error/stale states |
| `zustand` | `^5.0.12` | Client state (UI, theme, onboarding) | Lightweight, already used for `ThemeStore` and `OnboardingStore` |

**Pattern in use:**
- React Query for all Supabase data (profiles, analyses, subscriptions)
- Zustand with `persist` middleware for theme (localStorage sync confirmed in `stores/theme.ts`)
- Cache configuration in `lib/query/cache-config.ts`

**Confidence:** HIGH — both libraries installed and in active use.

### Forms & Validation

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `react-hook-form` | `^7.71.2` | Form state, registration, submission | Performance-first form library |
| `@hookform/resolvers` | `^5.2.2` | Bridge between RHF and Zod | Required adapter |
| `zod` | `^4.3.6` | Schema validation (forms + API routes) | TypeScript-first validation — used in `lib/validations/` (auth, profile, goals, etc.) |

**Note:** Zod 4 is a significant breaking change from Zod 3. The version installed
(`^4.3.6`) is current. Zod 4 changed several APIs (`z.string().min()`, error shape).
Any code copied from BASE44 or older tutorials that used Zod 3 syntax will need updates.
This is a real migration pitfall — flag for every validation file ported.

**Confidence:** HIGH for the pattern. MEDIUM for migration — Zod 4 API differences
will surface when porting BASE44 validation logic.

### Styling & UI

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Tailwind CSS | `^3.4.1` | Utility-first CSS | Already in BASE44 source, standard in Next.js ecosystem |
| `shadcn/ui` (CLI) | `^4.1.0` | Component library scaffolding | Already used in BASE44 source — RTL compatible via `dir="rtl"` on root |
| `tailwind-merge` | `^3.5.0` | Class conflict resolution | Required for `cn()` utility |
| `class-variance-authority` | `^0.7.1` | shadcn variant logic | Required by shadcn |
| `tailwindcss-animate` | `^1.0.7` | Animation utilities | shadcn accordion animations |
| `tw-animate-css` | `^1.4.0` | Extended animation classes | |
| `framer-motion` | `^12.38.0` | Complex animations | GEM 11 (animation presets) uses this |
| `lucide-react` | `^0.577.0` | Icon library | shadcn default icon set |
| `sonner` | `^2.0.7` | Toast notifications | Replaces BASE44's notification system |

**RTL implementation:** Confirmed correct — `dir="rtl"` on `<html>` in `app/layout.tsx`.
Font: `Assistant` (Google Fonts, supports Hebrew + Latin) confirmed in layout.
shadcn components use logical CSS properties (start/end) which work correctly with RTL.

**Confidence:** HIGH — full stack confirmed in actual files.

### Data Visualization

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `recharts` | `^3.8.0` | Charts (mood trends, biorhythm, Big Five radar) | Used in BASE44 source — standard React charting library |

**Confidence:** HIGH — confirmed in package.json, used in BASE44 source for the same
features being migrated.

### Email

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `resend` | `^4.8.0` | Transactional email | Modern email API — replaces BASE44's email. Service files exist in `services/email/` (welcome, payment-failed, usage-limit) |

**Confidence:** HIGH — service layer is already scaffolded.

### Content Rendering

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `react-markdown` | `^10.1.0` | Render LLM markdown output | AI Coach and analysis results contain markdown |
| `remark-gfm` | `^4.0.1` | GitHub Flavored Markdown plugin | Tables, strikethrough in markdown |

**Confidence:** HIGH — necessary for AI response rendering.

### Security

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `dompurify` | `^3.3.3` | XSS sanitization | Used in `sanitizeForLLM()` — prevents prompt injection from user input |

**Confidence:** HIGH — already in use and correctly placed on the LLM path.

### Dates

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `date-fns` | `^4.1.0` | Date manipulation | Astrology/numerology require precise date arithmetic. Lightweight, tree-shakeable |

**Note:** date-fns v4 is a breaking change from v3 — uses a different import style.
Any BASE44 date-fns code that uses v3 imports will need updating.

**Confidence:** HIGH for library choice. MEDIUM — v4 API changes need attention during migration.

### Geocoding

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| External API (no npm package) | — | Address to lat/lon for astrology birth place | `services/geocode.ts` exists — uses external geocoding API (Nominatim/Google Maps — confirm in source) |

**Confidence:** MEDIUM — service exists but external API provider needs confirmation.

### Testing

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `vitest` | `^4.1.0` | Test runner | Vite-compatible, fast, jsdom support |
| `@testing-library/react` | `^16.3.2` | Component testing | Standard React testing |
| `@testing-library/user-event` | `^14.6.1` | User interaction simulation | |
| `@testing-library/jest-dom` | `^6.9.1` | DOM matchers | |
| `jsdom` | `^29.0.1` | Browser environment simulation | |

**Configuration:** `vitest.config.ts` confirms jsdom environment, `@/` path alias,
tests in `tests/` directory.

**Confidence:** HIGH — fully configured.

### Deployment

| Technology | Purpose | Why |
|------------|---------|-----|
| Vercel | Hosting + edge functions + CDN | Next.js native deployment. Supabase + Stripe + Vercel is the standard production triad for 2025 SaaS |

**Confidence:** HIGH — stated constraint, industry standard.

---

## Alternatives Considered (and rejected)

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Backend BaaS | Supabase | Firebase | PostgreSQL + RLS + typed schema — better fit for relational mystical data |
| Backend BaaS | Supabase | PlanetScale | PlanetScale dropped free tier; Supabase has Auth + Storage built in |
| Auth | Supabase Auth | NextAuth (Auth.js) | Supabase Auth is already integrated — separate auth provider adds complexity |
| State (server) | TanStack Query | SWR | TanStack Query v5 has better TypeScript support, more features |
| State (client) | Zustand | Jotai | Zustand already in use and team familiar with it |
| Forms | React Hook Form | Formik | RHF is faster (uncontrolled), smaller, better TypeScript |
| Validation | Zod | Yup | Zod is TypeScript-first, better type inference, standard in 2025 |
| Email | Resend | SendGrid | Resend is simpler, modern API, better DX |
| Charts | Recharts | Victory / Chart.js | Already in BASE44 source — no reason to switch |
| Styling | Tailwind + shadcn | Chakra UI / MUI | Already in BASE44 source — RTL works, no migration needed |
| Testing | Vitest | Jest | Faster, no config needed with Vite-adjacent projects |
| AI | OpenAI SDK | Anthropic / Vercel AI SDK | BASE44 source used OpenAI — 34 backend functions already built around it |

---

## What NOT to Use

**Server Components for everything:** Complex interactive features (AI Coach chat,
drawing upload with preview, form-heavy onboarding) need `'use client'`. Don't force
Server Components where they don't fit — the LLM calls are server-side but the UI
is client-interactive.

**`any` types:** Zero `any`, zero `@ts-ignore`. The tsconfig has `strict: true` +
`noUncheckedIndexedAccess`. Don't bypass this — it's the whole point of the migration.

**Direct DB access in client components:** All Supabase queries go through the service
layer (`src/services/`) or Server Components. Never import `createBrowserClient` in a
server component or vice versa.

**`json_object` response_format for structured LLM output:** The current `llm.ts` uses
`json_object` which requires the word "JSON" in the prompt. Consider upgrading to
`response_format: { type: 'json_schema', json_schema: ... }` (available in GPT-4o) for
more reliable structured output in future phases.

**Zod 3 syntax in ported code:** `z.string().email().nonempty()` → `z.string().email().min(1)`.
Check all ported validation files.

---

## Installation Reference

Everything in `package.json` is already installed. For new phases, additions needed:

```bash
# PDF export (not yet installed — needed for graphology/analysis export)
npm install @react-pdf/renderer

# Rate limiting (not yet installed — needed for API protection)
npm install @upstash/ratelimit @upstash/redis

# Potential addition for astrology calculations (verify BASE44 approach)
# The BASE44 source uses server functions — may need a dedicated astrology library
# or keep using LLM-based interpretation (current approach)
```

---

## Critical Version Flags for Roadmap

These are breaking change areas that will surface during migration of BASE44 code:

| Library | Breaking Change | Migration Risk | Phase Impact |
|---------|----------------|----------------|--------------|
| Zod 4 (vs 3) | `nonempty()` removed, error shape changed | HIGH | Every validation file ported |
| date-fns 4 (vs 3) | Import style changed | MEDIUM | Astrology date calculations |
| Next.js 15 async APIs | `cookies()`, `params` are now async | HIGH | All server components ported |
| React 19 | `useContext` changes, `ref` as prop | LOW | Most code unaffected |
| `@supabase/supabase-js` v2.99+ | `PostgrestVersion: '12'` required in Database type | LOW | Already handled in `database.ts` |

---

## Sources

- Next.js 15 release blog: https://nextjs.org/blog/next-15 (accessed 2026-03-22) — HIGH confidence
- `mystiqor-build/package.json` — direct file read — HIGH confidence
- `mystiqor-build/src/**` — direct file reads — HIGH confidence
- `mystiqor-build/tsconfig.json` — direct file read — HIGH confidence
- Supabase SSR docs pattern — matches `@supabase/ssr` implementation in codebase — HIGH confidence
- Zod v4 migration: training data knowledge, flagged MEDIUM until verified against official docs
- date-fns v4 migration: training data knowledge, flagged MEDIUM until verified
