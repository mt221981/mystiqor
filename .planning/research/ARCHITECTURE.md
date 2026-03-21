# Architecture Patterns

**Domain:** Mystical/psychological analysis platform — BASE44 to Next.js 14+ migration
**Researched:** 2026-03-22
**Source confidence:** HIGH — analysis based on 03_ARCHITECTURE.md (designed 2026-03-20), actual mystiqor-build/ code (Phase 0 + partial Phase 2), and github-source/ (53-page BASE44 original)

---

## Current State: What Already Exists

The mystiqor-build/ directory is NOT a blank slate. Phase 0 (Foundation) is complete with 127 files and clean compilation. Phase 2 is 3/9 done. The architecture design is already finalized in 03_ARCHITECTURE.md. This research maps what is built, what is missing, and what the build order must be.

### Already Built (Do Not Touch)
- Root layout with RTL, Hebrew font (Assistant), dark mode — `src/app/layout.tsx`
- Auth layout: server-side session check + redirect to /login — `src/app/(auth)/layout.tsx`
- Auth layout client: QueryClientProvider + Toaster + sidebar shell — `src/app/(auth)/layout-client.tsx`
- Supabase client/server/middleware/admin clients — `src/lib/supabase/*.ts`
- Middleware: session refresh on every non-static request — `src/middleware.ts`
- API: analysis CRUD (`/api/analysis/`, `/api/analysis/[id]/`) — typed, Zod-validated
- API: subscription status (`/api/subscription/`) — plan info integrated
- API: subscription usage (`/api/subscription/usage/`)
- API tools: numerology, tarot, palmistry, dream, human-design — all with auth + Zod + LLM + DB save
- API: geocode, upload
- Auth callback route — OAuth flow complete
- Dashboard page — React Query + parallel Supabase queries + Recharts chart
- Onboarding page — multi-step wizard (Zustand store)
- Tool pages: numerology, tarot, palmistry, dream, human-design (stubs or partial)
- DB types (`src/types/database.ts`) — generated from Supabase schema
- Domain types: analysis, astrology, numerology, subscription
- Zod schemas: auth, profile, analysis, subscription, goals, mood, journal
- Services: numerology calculations/gematria/compatibility, astrology chart/aspects/solar-return, drawing analysis, LLM invocation, geocode, email (welcome, payment-failed, usage-limit)
- Components: all shadcn/ui base (30+ primitives), layout shells (Sidebar, Header, MobileNav, PageHeader), common (LoadingSpinner, EmptyState, ErrorBoundary, PageTransition, Breadcrumbs), forms (FormInput, LocationSearch, BirthDataForm), feature components (UsageBar, PlanCard, SubscriptionGuard, ConfidenceBadge, ExplainableInsight, ToolGrid, AnalysisHistory, AnalysesChart, OnboardingWizard, NumberCard, HumanDesignCenters)
- Zustand stores: theme, onboarding
- Constants: astrology zodiac, plans/pricing, tool categories, animation presets
- Cache config: React Query stale times per entity type

---

## Recommended Architecture

### System Topology

```
VERCEL (CDN + Edge Network)
  |
  +-- Next.js 14+ App Router (mystiqor-build/)
       |
       +-- (public)/           Public routes (no auth)
       |     home, pricing, blog, login
       |
       +-- (auth)/             Protected routes (auth required)
       |     layout.tsx        Server Component: session check -> redirect
       |     layout-client.tsx Client: QueryClientProvider + Toaster + Sidebar
       |     dashboard, tools/*, coach, goals, mood, journal,
       |     daily-insights, notifications, history, learn, profile,
       |     settings, subscription, referrals
       |
       +-- api/                Route Handlers (server-only)
             auth/, tools/, analysis/, coach/, goals/, insights/,
             subscription/, geocode, upload, webhooks/stripe, cron/
  |
  +-- SUPABASE
       PostgreSQL + RLS
       Auth (GoTrue / email+password)
       Storage (images, handwriting scans, PDFs)
       Realtime (AI Coach chat streaming)
  |
  +-- EXTERNAL SERVICES
       LLM (OpenAI/Anthropic) -- server-side only, never in client
       Stripe -- checkout, webhooks, subscription management
       Nominatim -- geocoding for birth place (free, no key)
       Resend -- transactional email
```

### Component Boundaries

| Layer | Component | Responsibility | Communicates With |
|-------|-----------|---------------|-------------------|
| **Routing** | `app/(auth)/layout.tsx` | Server: validate Supabase session, redirect unauthenticated | Supabase server client |
| **Routing** | `app/(auth)/layout-client.tsx` | Client: provide QueryClient, Toaster, Sidebar layout | React Query, Sidebar |
| **Routing** | `app/middleware.ts` | Refresh session cookie on every non-static request | Supabase middleware client |
| **Page** | `app/(auth)/tools/[tool]/page.tsx` | Feature entrypoint — "use client", compose form + result | API route handler via fetch |
| **Page** | `app/(auth)/dashboard/page.tsx` | Stats overview — parallel Supabase queries via React Query | Supabase browser client |
| **API Route** | `app/api/tools/[tool]/route.ts` | Validate input (Zod) → call service → save analysis → return | Service layer, Supabase server client |
| **API Route** | `app/api/webhooks/stripe/route.ts` | Receive Stripe events → update subscription via admin client | Supabase admin client, Stripe SDK |
| **Service** | `services/analysis/llm.ts` | Abstract LLM provider — one call site for all AI | OpenAI/Anthropic SDK |
| **Service** | `services/astrology/chart.ts` | Pure computation: VSOP87, houses, aspects | No external calls |
| **Service** | `services/numerology/calculations.ts` | Pure computation: life path, destiny, gematria | No external calls |
| **Component** | `components/features/*/` | Feature UI — forms, result displays, charts | React Query hooks, Supabase browser client |
| **Component** | `components/layouts/Sidebar.tsx` | Navigation shell — reads user profile, subscription | React Query (useQuery) |
| **Component** | `components/features/subscription/SubscriptionGuard.tsx` | Blocks tool access when limit reached | Subscription React Query hook |
| **Store** | `stores/theme.ts` | Dark/light mode preference | localStorage via Zustand persist |
| **Store** | `stores/onboarding.ts` | Multi-step onboarding state | Form state only, flushes to API on complete |
| **DB** | Supabase RLS policies | Enforce per-user data isolation at DB level | Runs on every query regardless of app logic |

### Data Flow

```
1. USER SUBMITS TOOL FORM
   User action
     -> Tool page (Client Component, "use client")
     -> React Hook Form validates with Zod schema
     -> useMutation (React Query) calls fetch('/api/tools/[tool]', { method: 'POST', body })
     -> API Route Handler (Server Component boundary)
          -> createClient() [server Supabase, reads cookies]
          -> supabase.auth.getUser() [verify session]
          -> ZodSchema.safeParse(body) [validate input]
          -> increment_usage() [Supabase DB function, checks limit]
          -> Service function (pure computation or LLM call)
          -> supabase.from('analyses').insert(row) [save result]
          -> NextResponse.json({ data }) [return]
     -> React Query cache updated
     -> Result component renders

2. AUTH FLOW
   User visits /(auth)/* route
     -> Next.js middleware.ts runs updateSession()
        -> Supabase middleware client refreshes cookie if near-expiry
     -> app/(auth)/layout.tsx (Server Component)
        -> createClient() + supabase.auth.getUser()
        -> No session? -> redirect('/login')
        -> Has session? -> render AuthLayoutClient (Client Component)
     -> AuthLayoutClient provides QueryClientProvider + Toaster
     -> Page Server Component renders (may prefetch data)
     -> Client Component hydrates

3. SUBSCRIPTION GATE
   User submits analysis
     -> SubscriptionGuard component (Client Component)
        -> useQuery(['subscription']) fetches /api/subscription
        -> If analyses_used >= analyses_limit: show upgrade modal
        -> If OK: render children (the tool form)
     -> On API route: increment_usage() DB function double-checks limit
        -> If limit reached server-side: returns 402 Payment Required
     -> useMutation onError: show toast "הגעת למגבלת הניתוחים"

4. AI ANALYSIS
   API Route receives validated input
     -> invokeLLM({ userId, systemPrompt, prompt, maxTokens })
        -> Selects provider (env var: OPENAI_API_KEY or ANTHROPIC_API_KEY)
        -> Server-side HTTP call to LLM API
        -> forceToString(response) normalizes output (GEM 5)
        -> Returns { data: string }
     -> Analysis saved to DB with results JSONB
     -> Analysis ID returned to client

5. FILE UPLOAD (Drawing / Graphology / Palmistry)
   User selects image
     -> Client: fetch('/api/upload', FormData)
     -> /api/upload/route.ts:
        -> Auth check
        -> Validate file type (image/jpeg, image/png, image/webp)
        -> Validate file size (max 10MB)
        -> supabase.storage.from('uploads').upload(path, file)
        -> Return public URL
     -> Client stores URL, submits with tool form
     -> API tool route receives URL, passes to LLM as image input

6. REALTIME COACH CHAT
   User sends message to AI Coach
     -> Client: Supabase Realtime subscription on coaching_messages
     -> POST /api/coach/message
        -> Save user message
        -> Stream LLM response
        -> Save assistant message
     -> Realtime broadcasts new message to subscribed clients
     -> ChatMessage component renders new bubble
```

---

## Patterns to Follow

### Pattern 1: Server/Client Split for Auth

Every protected page uses a two-layer layout:
- Server layer (`layout.tsx`): reads Supabase session, redirects if missing — zero JS shipped for auth check
- Client layer (`layout-client.tsx`): provides React Query + toasts + interactive shell

```typescript
// Server Component (layout.tsx) — NO "use client"
export default async function AuthLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient(); // server client reads cookies
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  return <AuthLayoutClient>{children}</AuthLayoutClient>;
}
```

### Pattern 2: API Route Handler Template

All tool API routes follow this exact structure. Do not deviate.

```typescript
// app/api/tools/[tool]/route.ts
export async function POST(request: NextRequest) {
  try {
    // 1. Auth
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'לא מחובר' }, { status: 401 });

    // 2. Validate
    const body: unknown = await request.json();
    const parsed = ToolInputSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'קלט לא תקין', details: parsed.error.flatten() }, { status: 400 });

    // 3. Check/increment usage (via Supabase DB function)
    const { error: usageError } = await supabase.rpc('increment_usage', { p_user_id: user.id });
    if (usageError) return NextResponse.json({ error: 'הגעת למגבלת הניתוחים' }, { status: 402 });

    // 4. Compute (pure service function)
    const computed = toolService(parsed.data);

    // 5. LLM interpretation (server-side only)
    const llmResponse = await invokeLLM({ userId: user.id, systemPrompt, prompt });

    // 6. Save
    const { data: analysis } = await supabase.from('analyses').insert(row).select('id').single();

    // 7. Return
    return NextResponse.json({ data: { ...computed, interpretation: String(llmResponse.data), analysis_id: analysis?.id } });
  } catch {
    return NextResponse.json({ error: 'שגיאה פנימית' }, { status: 500 });
  }
}
```

### Pattern 3: React Query for Client Data

Client components never call Supabase directly for reads — they use React Query with the browser Supabase client. Writes go through API routes (for Zod validation + server-side logic), not direct Supabase from client.

```typescript
// READ: React Query + Supabase browser client (no server validation needed for reads)
const { data } = useQuery({
  queryKey: ['analyses', toolType],
  queryFn: async () => {
    const supabase = createClient(); // browser client
    const { data } = await supabase.from('analyses').select('*').eq('tool_type', toolType);
    return data;
  },
  staleTime: CACHE_TIMES.MEDIUM,
});

// WRITE: React Query mutation -> API route (server validation)
const mutation = useMutation({
  mutationFn: (input: ToolInput) => fetch('/api/tools/numerology', { method: 'POST', body: JSON.stringify(input) }).then(r => r.json()),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['analyses'] }),
  onError: () => toast.error('שגיאה בחישוב'),
});
```

### Pattern 4: Feature Component Decomposition

Each analysis tool page follows this structure. Source pages were 500-1300 lines monoliths — the migration breaks them into composable pieces.

```
app/(auth)/tools/[tool]/page.tsx         <- "use client", orchestrates flow
  |
  +-- SubscriptionGuard                  <- blocks if limit reached
  +-- [Tool]InputForm                    <- React Hook Form + Zod + BirthDataForm
  +-- [Tool]LoadingState                 <- skeleton while waiting
  +-- [Tool]Results                      <- displays computed + AI interpretation
        +-- NumberCard / ChartSVG / etc  <- leaf display component
        +-- ExplainableInsight           <- confidence + sources (GEM 9)
        +-- AnalysisHistory              <- shows past analyses
```

### Pattern 5: Supabase Client Selection Rules

| Context | Client | Why |
|---------|--------|-----|
| Server Component | `createClient()` from `lib/supabase/server.ts` | Reads httpOnly cookies |
| Route Handler | `createClient()` from `lib/supabase/server.ts` | Same — server context |
| Middleware | `createServerClient()` from `lib/supabase/middleware.ts` | Special middleware cookies API |
| Stripe webhook | `createClient()` from `lib/supabase/admin.ts` | Service role — bypass RLS |
| Client Component | `createClient()` from `lib/supabase/client.ts` | Browser, anon key, RLS enforced |
| Cron jobs | Admin client | System operations, no user context |

### Pattern 6: Astrology SVG Birth Chart Decomposition

The original BirthChart.jsx is 922 lines. It must be split into sub-components, not rewritten. The split boundary is:

```
components/features/astrology/BirthChart/
  index.tsx          <- composes the 4 SVG layers, accepts ChartData prop
  ZodiacRing.tsx     <- outer zodiac wheel (12 signs, glyphs, colors)
  PlanetPositions.tsx <- planet markers at calculated degrees
  AspectLines.tsx    <- aspect lines between planets (trine, square, etc.)
  HouseOverlay.tsx   <- house cusps and numbers
```

Each sub-component accepts only its slice of ChartData — no prop drilling the whole chart.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: LLM Calls from Client Components

**What:** Importing OpenAI/Anthropic SDK in a "use client" component and calling it directly.
**Why bad:** Exposes API keys in the browser bundle. All LLM keys are server-side env vars only.
**Instead:** Always route through `/api/tools/[tool]` — the API route calls `invokeLLM()`.

### Anti-Pattern 2: Supabase Admin Client in Client Components

**What:** Using the service-role Supabase client anywhere that runs in the browser.
**Why bad:** Service role bypasses all RLS — any user can read/write any row.
**Instead:** Admin client only in `api/webhooks/stripe/` and `api/cron/`. All user-context routes use the regular server client (anon key + RLS).

### Anti-Pattern 3: Direct DB Writes from Client Components

**What:** Calling `supabase.from('analyses').insert()` from a "use client" component.
**Why bad:** Skips Zod validation, skips usage limit check, skips business logic in the API route.
**Instead:** All mutations go through API route handlers. Client components only read directly from Supabase via React Query (reads are safe — RLS enforces user isolation).

### Anti-Pattern 4: Page Monoliths Over 300 Lines

**What:** Putting all form, loading, result, and history UI into one page file.
**Why bad:** The original BASE44 pages were 500-1300 lines. They are unmaintainable and untestable.
**Instead:** Page files are orchestrators only (<100 lines). Decompose into feature components per Pattern 4.

### Anti-Pattern 5: Rebuilding Working BASE44 Logic

**What:** Rewriting numerology calculations, astrology computations, or LLM prompt engineering from scratch.
**Why bad:** These are GEMs — already ported, typed, and tested. Rewriting risks regression.
**Instead:** The services/ layer already contains the ported logic. Pages and API routes consume services, they do not reimplement.

### Anti-Pattern 6: Skipping SubscriptionGuard

**What:** Building a tool page that allows submissions without checking usage limits.
**Why bad:** The business model depends on plan limits. Free tier users could exhaust paid capacity.
**Instead:** Every tool page wraps the form in `<SubscriptionGuard>`. The API route also calls `increment_usage()` as a server-side double-check.

### Anti-Pattern 7: Prop-Drilling Auth Through Component Trees

**What:** Passing `user` or `session` as props from layout down through many component layers.
**Why bad:** Auth should be a concern of the layout and API layer, not individual components.
**Instead:** Client components that need user data call `supabase.auth.getUser()` directly (browser client) or use a `useUser` hook backed by React Query.

---

## Build Order (Dependency Graph)

The roadmap phases must respect these dependency chains. Items listed earlier are prerequisites.

```
FOUNDATION (complete)
  lib/supabase/* + middleware.ts + types/database.ts
  + components/ui/* (shadcn)
  + components/common/* + components/layouts/*
  + components/forms/BirthDataForm + LocationSearch + FormInput
    |
    v
PHASE 1: Navigation Shell + Sidebar + Routing (auth routes stub)
  Sidebar.tsx (full nav, not placeholder)
  + app/(auth)/* route pages (all stubs with page.tsx files)
  + app/(public)/pricing, blog, home pages
    |
    v
PHASE 2: Core Data + Auth (partial -- 3/9 complete)
  Subscription system (API + guard + plan cards)
  + Goals CRUD
  + Mood tracker
  + Journal
  + Daily insights
  + Profile edit
  + Onboarding complete
    |
    v
PHASE 3: Tools — Tier 1 (foundational, most used)
  Numerology (done)
  + Astrology birth chart (complex -- BirthChart SVG decomposition needed)
  + Tarot (done)
  + Dream (done)
  + Human Design (done)
    |
    v
PHASE 4: Tools — Tier 2 (depends on profile + birth chart done)
  Palmistry (done)
  + Graphology (image upload pattern from palmistry)
  + Drawing analysis (image upload pattern)
  + Personality analysis
  + Compatibility (needs 2-person BirthDataForm pattern)
    |
    v
PHASE 5: Tools — Tier 3 (depends on birth chart + transits)
  Transits (needs real ephemeris -- mocked in BASE44, must rebuild)
  + Solar Return (service exists)
  + Synastry (dual chart -- needs BirthChart x2)
  + Astrology readings (8 modes -- needs all astrology services)
    |
    v
PHASE 6: AI Coach + Synthesis
  Coach chat (Supabase Realtime)
  + Journey generation
  + Mystic synthesis (cross-tool)
  + Ask question
  + Career guidance
    |
    v
PHASE 7: Growth + Monetization
  Stripe webhooks (already exists -- verify)
  + Checkout flow
  + Referrals
  + Subscription management
  + Email (welcome, payment failed, usage limit -- services exist)
    |
    v
PHASE 8: Learning + Analytics
  Tutorials
  + Astrology tutor
  + Drawing tutor
  + Analytics dashboard
  + Analysis history + compare
    |
    v
PHASE 9: Infrastructure + PWA
  Rate limiting (Vercel middleware or upstash/ratelimit)
  + Cron jobs (daily insights, monthly usage reset)
  + PDF export
  + Social sharing
  + PWA manifest + service worker
  + Notifications
  + a11y audit (ARIA, keyboard nav)
```

---

## Scalability Considerations

| Concern | Now (MVP) | At 1K users | At 10K users |
|---------|-----------|-------------|--------------|
| LLM latency | Synchronous wait in API route | Add streaming responses | Edge Function for LLM proxying |
| DB reads | Direct Supabase queries | React Query cache sufficient | Add read replicas if Supabase supports |
| Analysis storage | JSONB in analyses table | Paginate history (already built) | Archive old analyses, S3 for large results |
| Image uploads | Supabase Storage | Supabase Storage sufficient | CDN in front of storage |
| Cron (daily insights) | Vercel cron (1/day batch) | Queue per user segment | Background job service (Trigger.dev) |
| Chat (AI Coach) | Supabase Realtime | Supabase Realtime sufficient | Dedicated WebSocket service |
| Rate limiting | Middleware-level (planned) | Upstash Redis rate limiter | Upstash + Vercel Edge |
| Ephemeris (transits) | Must rebuild from mock | Server-side Swiss Ephemeris WASM | Cache computed positions per date |

---

## Migration Mapping: BASE44 Pages to Next.js Routes

| BASE44 Page | Next.js Route | Status |
|-------------|---------------|--------|
| Home.jsx | `(public)/page.tsx` | Stub |
| Pricing.jsx | `(public)/pricing/page.tsx` | Missing |
| Blog.jsx | `(public)/blog/page.tsx` | Missing |
| Login.jsx | `(public)/login/page.tsx` | Done |
| Dashboard.jsx | `(auth)/dashboard/page.tsx` | Done |
| Onboarding.jsx | `(auth)/onboarding/page.tsx` | Done |
| Numerology.jsx | `(auth)/tools/numerology/page.tsx` | Done |
| Astrology.jsx | `(auth)/tools/astrology/page.tsx` | Missing |
| SolarReturn.jsx | `(auth)/tools/astrology/solar-return/page.tsx` | Missing |
| Transits.jsx | `(auth)/tools/astrology/transits/page.tsx` | Missing (mock in source) |
| Synastry.jsx | `(auth)/tools/astrology/synastry/page.tsx` | Missing |
| AstrologyReadings.jsx | `(auth)/tools/astrology/readings/page.tsx` | Missing |
| AstroCalendar.jsx | `(auth)/tools/astrology/calendar/page.tsx` | Missing |
| Graphology.jsx | `(auth)/tools/graphology/page.tsx` | Missing |
| DrawingAnalysis.jsx | `(auth)/tools/drawing/page.tsx` | Missing |
| Palmistry.jsx | `(auth)/tools/palmistry/page.tsx` | Stub (API done) |
| Tarot.jsx | `(auth)/tools/tarot/page.tsx` | Done |
| HumanDesign.jsx | `(auth)/tools/human-design/page.tsx` | Done |
| DreamAnalysis.jsx | `(auth)/tools/dream/page.tsx` | Done |
| Compatibility.jsx | `(auth)/tools/compatibility/page.tsx` | Missing |
| PersonalityAnalysis.jsx | `(auth)/tools/personality/page.tsx` | Missing |
| CareerGuidance.jsx | `(auth)/tools/career/page.tsx` | Missing |
| DocumentAnalyzer.jsx | `(auth)/tools/document/page.tsx` | Missing |
| AskQuestion.jsx | `(auth)/tools/question/page.tsx` | Missing |
| MysticSynthesis.jsx | `(auth)/tools/synthesis/page.tsx` | Missing |
| AICoach.jsx | `(auth)/coach/page.tsx` | Missing |
| JourneyDashboard.jsx | `(auth)/coach/journey/page.tsx` | Missing |
| MyGoals.jsx | `(auth)/goals/page.tsx` | Missing |
| MoodTracker.jsx | `(auth)/mood/page.tsx` | Missing |
| Journal.jsx | `(auth)/journal/page.tsx` | Missing |
| DailyInsights.jsx | `(auth)/daily-insights/page.tsx` | Missing |
| Notifications.jsx | `(auth)/notifications/page.tsx` | Missing |
| myanalyses.jsx | `(auth)/history/page.tsx` | Missing |
| CompareAnalyses.jsx | `(auth)/history/compare/page.tsx` | Missing |
| CompareDrawingAnalyses.jsx | `(auth)/history/compare/page.tsx` | Part of compare |
| Tutorials.jsx | `(auth)/learn/page.tsx` | Missing |
| AstrologyTutor.jsx | `(auth)/learn/astrology/page.tsx` | Missing |
| DrawingTutor.jsx | `(auth)/learn/drawing/page.tsx` | Missing |
| UserProfile.jsx | `(auth)/profile/page.tsx` | Missing |
| EditProfile.jsx | `(auth)/profile/edit/page.tsx` | Missing |
| ManageProfiles.jsx | `(auth)/profile/guests/page.tsx` | Missing |
| UserSettings.jsx | `(auth)/settings/page.tsx` | Missing |
| ManageSubscription.jsx | `(auth)/subscription/page.tsx` | Missing |
| SubscriptionSuccess.jsx | `(auth)/subscription/success/page.tsx` | Missing |
| Referrals.jsx | `(auth)/referrals/page.tsx` | Missing |
| AnalyticsDashboard.jsx | `(auth)/analytics/page.tsx` | Missing |
| RelationshipAnalysis.jsx | Merged into compatibility | Missing |
| Relationships.jsx | Merged into compatibility | Missing |
| TimingTools.jsx | `(auth)/tools/timing/page.tsx` | Missing |
| Palmistry.jsx | `(auth)/tools/palmistry/page.tsx` | API done, page stub |
| SavedGraphologyInsights.jsx | Merged into graphology history | Missing |
| DailyForecast.jsx | Merged into daily-insights | Missing |

---

## Critical Technical Decision: Transits Ephemeris

The BASE44 `calculateTransits` function is explicitly mocked (score 23/50 in reverse engineering). It does not use real astronomical data. For the Next.js migration, the correct approach is:

**Use Swiss Ephemeris compiled to WASM** (swisseph-wasm package, MIT license). Run on the server inside the API route — never in the browser bundle. Cache computed positions per UTC day in Supabase or Vercel KV.

This is a Phase 5 deep-research item. The astrology chart service (aspects, solar-return) already implements VSOP87 approximations for natal charts — transits need the same treatment.

---

## Sources

- `D:/AI_projects/MystiQor/03_ARCHITECTURE.md` — Full system architecture design (2026-03-20) — HIGH confidence
- `D:/AI_projects/MystiQor/02_REVERSE_ENGINEERING.md` — Feature-by-feature reverse engineering of BASE44 source — HIGH confidence
- `D:/AI_projects/MystiQor/mystiqor-build/src/` — Actual built code (Phase 0 + Phase 2 partial) — HIGH confidence (direct inspection)
- `D:/AI_projects/MystiQor/github-source/src/pages/` — All 53 original BASE44 pages — HIGH confidence (direct inspection)
- `D:/AI_projects/MystiQor/.planning/PROJECT.md` — Project requirements and constraints — HIGH confidence
