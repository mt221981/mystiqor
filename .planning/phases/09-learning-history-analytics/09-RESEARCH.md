# Phase 9: Learning + History + Analytics — Research

**Researched:** 2026-03-24
**Domain:** Analysis history, comparison, tutorials/tutor chat, blog, self-analytics dashboard
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ASTR-08 | Astrology readings history (curated saved readings) | AstrologyReadings.jsx source ported to new history subpage under `/learn/astrology` |
| HIST-01 | Analysis history with filterable list across all tools | analyses table + existing GET /api/analysis route with tool_type filter + pagination |
| HIST-02 | Analysis timeline visualization | AnalysisTimeline component pattern from BASE44; date-fns + Recharts already installed |
| HIST-03 | Compare analyses side-by-side | CompareAnalyses.jsx source; `/api/analysis?include_results=true` already supports it |
| GROW-02 | Blog with educational content | blog_posts table in DB; Blog.jsx source uses hardcoded data — must switch to Supabase |
| GROW-03 | Tutorials page with interactive content | Tutorials.jsx source; learning_progress table already in DB |
| GROW-04 | Astrology tutor (concept cards, AI teaching) | AstrologyTutor.jsx source; reuses coach conversation API pattern |
| GROW-05 | Drawing tutor (concept cards, AI teaching) | DrawingTutor.jsx source; same conversation API pattern |
| UX-09 | Analytics dashboard (self-analytics — usage patterns, tool distribution) | analytics_events table in DB; AnalyticsDashboard.jsx source; Recharts already installed |
</phase_requirements>

---

## Summary

Phase 9 adds six features all anchored in data that already exists in the database: the `analyses` table (history, compare, ASTR-08), `learning_progress` table (tutorials, tutors), `blog_posts` table (blog), and `analytics_events` table (self-analytics). Eight of the nine requirements are "port-and-adapt" tasks — BASE44 source files already implement the UI logic and the project's DB schema already contains the required tables. The primary engineering work is wiring each page to Supabase instead of BASE44 entities, typing everything strictly, and connecting the existing `/api/analysis` route (which supports pagination and `include_results`) to the new history page.

The two new routes that need non-trivial work are the tutor chat routes (`/api/learn/tutor/astrology` and `/api/learn/tutor/drawing`) — these replicate the pattern established by `/api/coach/conversations` and `/api/coach/message`, injecting user context from `analyses` and `learning_progress`. The analytics dashboard is purely read-only from `analytics_events` and needs no mutations.

The Sidebar already has a "למידה" section with entries for `/tutorials` and `/blog`. All new routes (`/history`, `/history/compare`, `/learn/astrology`, `/learn/drawing`, `/learn/tutorials`, `/learn/blog`, `/analytics`) must be added to `PROTECTED_PATHS` in `src/lib/supabase/middleware.ts`.

**Primary recommendation:** Port each BASE44 page as a full-page route under the existing `(auth)` group, adapting BASE44 entity calls to the Supabase client pattern already established in Phases 3-8. Do not duplicate the `TOOL_NAMES` constant — import it from a shared location or from the existing `AnalysisHistory.tsx` component.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js (App Router) | 15.x | Page routing, Server Components | Project stack |
| TypeScript strict | — | Types for all components | Project standard — zero `any` |
| Supabase (browser client) | 2.x | DB reads for analyses, learning_progress, blog_posts, analytics_events | Project DB |
| @tanstack/react-query | ^5.91.2 | Server-state caching, pagination, mutations | Already installed |
| Recharts | ^3.8.0 | Bar charts, Line charts, Pie charts for analytics dashboard + timeline | Already installed, used in dashboard |
| framer-motion | ^12.38.0 | Card entrance animations, AnimatePresence | Already installed |
| date-fns v4 | ^4.1.0 | Date formatting with `he` locale | Already installed — v4 import style |
| zod v4 | ^4.3.6 | Validation schemas for API routes | Already installed — v4 API |
| shadcn/ui | — | Card, Badge, Button, Select, Tabs, Input, Progress | Already installed |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | installed | Icons (History, GraduationCap, BookOpen, BarChart3, GitCompare, Stars) | All pages |
| sonner (Toaster) | installed | Toast notifications for tutor interactions | Tutor pages |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Recharts for timeline | react-chrono | Recharts already installed and used — no new dep |
| Custom blog renderer | react-markdown | Blog content is plain text in BASE44; can start with simple text, add markdown later |

**No new npm packages needed for Phase 9.** All required libraries are already installed.

---

## Architecture Patterns

### Recommended Project Structure

New files for Phase 9:

```
src/
├── app/
│   └── (auth)/
│       ├── history/
│       │   ├── page.tsx                    # 09-01: full history list + timeline toggle
│       │   └── compare/
│       │       └── page.tsx                # 09-02: side-by-side compare
│       ├── learn/
│       │   ├── page.tsx                    # 09-03: tutorials hub (redirect or index)
│       │   ├── tutorials/
│       │   │   └── page.tsx                # GROW-03: learning paths + InteractiveTutorial
│       │   ├── astrology/
│       │   │   └── page.tsx                # GROW-04 + ASTR-08: tutor chat + readings
│       │   ├── drawing/
│       │   │   └── page.tsx                # GROW-05: drawing tutor chat
│       │   └── blog/
│       │       └── page.tsx                # GROW-02: blog list + article view
│       └── analytics/
│           └── page.tsx                    # UX-09: self-analytics dashboard
├── api/
│   ├── learn/
│   │   ├── progress/
│   │   │   └── route.ts                    # GET/POST learning_progress rows
│   │   └── tutor/
│   │       ├── astrology/
│   │       │   └── route.ts                # POST: AI tutor chat (astrology)
│   │       └── drawing/
│   │           └── route.ts                # POST: AI tutor chat (drawing)
│   ├── blog/
│   │   └── route.ts                        # GET blog_posts (is_published=true)
│   └── analytics/
│       └── route.ts                        # GET analytics_events for current user
├── components/
│   └── features/
│       ├── history/
│       │   ├── AnalysisCard.tsx             # Single analysis card (grid view)
│       │   ├── AnalysisTimeline.tsx         # Timeline view by date
│       │   ├── HistoryFilters.tsx           # Tool type + date range filters
│       │   └── ComparePanel.tsx             # Side-by-side diff UI
│       ├── learn/
│       │   ├── TutorChat.tsx               # Shared chat UI for astrology + drawing tutors
│       │   ├── LearningPathCard.tsx         # Module card with lock/unlock state
│       │   ├── QuickConceptButtons.tsx      # Quick-start concept prompts
│       │   └── ProgressTracker.tsx          # Progress bar + topic completion
│       ├── blog/
│       │   └── BlogPostCard.tsx             # Article card + inline reader
│       └── analytics/
│           ├── ToolUsageChart.tsx           # Pie chart: tools used
│           ├── ActivityHeatmap.tsx          # Daily activity line chart
│           └── UsageStats.tsx              # Stat cards (total analyses, mood avg, etc.)
└── lib/
    └── validations/
        ├── learning.ts                      # Zod: LearningProgressSchema
        └── analytics.ts                     # Zod: AnalyticsEventQuerySchema
```

### Pattern 1: History Page with Existing API Route

The `GET /api/analysis` route already supports:
- `tool_type` filter
- `limit` + `offset` pagination
- `include_results=true` for comparison
- Returns `meta.total` for pagination UI

```typescript
// Caller pattern — already verified in route.ts
const res = await fetch(
  `/api/analysis?limit=20&offset=${offset}&tool_type=${toolType}`,
);
const { data, meta } = await res.json();
// meta.total drives "showing X of Y" and pagination buttons
```

### Pattern 2: Tutor Chat — Reuse Coach Conversation API

The tutor chat (AstrologyTutor, DrawingTutor) in BASE44 calls `base44.agents.addMessage`. In Next.js this maps to the same pattern as `/api/coach/conversations` and `/api/coach/message`. Create new routes `/api/learn/tutor/astrology` and `/api/learn/tutor/drawing` that:

1. Accept `{ conversationId, message, discipline }` POST body
2. Build context from user's most recent `analyses` (matching discipline tool_type)
3. Build context from user's `learning_progress` rows for that discipline
4. Call `invokeLLM` with a system prompt identifying the AI as a tutor
5. Store the exchange in `conversations` / `messages` tables (same tables as coach)

```typescript
// System prompt pattern for tutor routes
const systemPrompt = `
אתה מורה מומחה באסטרולוגיה. המשתמש למד עד כה: ${completedTopics}.
ניתוחים קיימים: ${analysisContext}.
ענה בעברית, בצורה פשוטה ומותאמת לרמת המשתמש.
`;
```

### Pattern 3: Learning Progress CRUD

`learning_progress` table schema (from database.generated.ts):
```typescript
{
  id: string;
  user_id: string;
  discipline: string;       // 'astrology' | 'drawing' | 'numerology'
  topic: string;            // topic ID e.g. 'sun_moon_ascendant'
  level: string | null;     // 'beginner' | 'intermediate' | 'advanced'
  completed: boolean | null;
  quiz_score: number | null;
  study_time_minutes: number | null;
  last_studied: string | null;  // ISO datetime
  created_at: string | null;
}
```

One row per topic per user. Upsert on `(user_id, discipline, topic)` — no duplicate rows.

```typescript
// Upsert pattern
await supabase
  .from('learning_progress')
  .upsert(
    { user_id, discipline, topic, completed: true, last_studied: new Date().toISOString() },
    { onConflict: 'user_id,discipline,topic' }  // requires unique constraint
  );
```

**Check:** Migration may need to add a unique constraint on `(user_id, discipline, topic)` if not already present.

### Pattern 4: Blog from Supabase (not hardcoded)

BASE44's Blog.jsx has 4 hardcoded articles. The DB has a `blog_posts` table with `is_published` flag. The plan is to:
1. Seed the blog with the 4 BASE44 articles via a migration or insert
2. Read from Supabase via `GET /api/blog?category=&search=`
3. Filter by `is_published = true`
4. No auth required for blog reads (public page — but route is inside `(auth)` group per existing layout)

```typescript
// blog_posts table columns
{ id, title, slug, content, excerpt, author, category, tags, read_time_minutes, is_published, published_at }
```

### Pattern 5: Analytics Dashboard — Self-Analytics Only

The BASE44 `AnalyticsDashboard.jsx` shows admin-style metrics (all sessions, conversion rates). `UX-09` specifies **self-analytics** — this user's own usage patterns. The correct data sources are:

- `analyses` table — tool distribution, usage over time (already has `created_at` and `tool_type`)
- `mood_entries` table — mood score trend
- `goals` table — completion rate
- `analytics_events` table — optional, if events were tracked

**Simpler approach (HIGH confidence):** Build self-analytics from `analyses` + `mood_entries` + `goals` queries rather than relying on `analytics_events` (which may have sparse data). This avoids the "no data" empty-state problem.

```typescript
// Tool usage distribution from analyses
const { data } = await supabase
  .from('analyses')
  .select('tool_type, created_at')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false });
// Group client-side by tool_type and by week
```

### Anti-Patterns to Avoid

- **Loading all analyses without pagination:** The `AnalysisHistory` component in BASE44 calls `.list('-created_date', 200)` — fetching 200 rows at once. Use the existing `GET /api/analysis` route with `limit=20` and cursor pagination instead.
- **Duplicating TOOL_NAMES:** Already defined in `AnalysisHistory.tsx`. Import from there or move to `@/lib/constants/tool-names.ts` and share.
- **Inline blog content:** Do not hardcode articles in page.tsx. Seed the DB and fetch from Supabase.
- **Using `window.location.href` for navigation:** Replace all BASE44 `window.location.href = createPageUrl(...)` with Next.js `useRouter().push()` or `<Link>`.
- **Analytics routes without auth:** All pages in Phase 9 are inside `(auth)` group — protected by layout. Also add to `PROTECTED_PATHS` in middleware.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| AI tutor chat state | Custom WebSocket or SSE | invokeLLM + standard REST (same as coach) | Matches existing coach pattern exactly |
| Analytics aggregation | Custom aggregation service | Client-side useMemo grouping on Recharts data | Volume is low (personal use), server aggregation is overkill |
| Blog CMS | Custom editor | Seed via migration, read from DB | GROW-02 scope is display + search, not admin editing |
| Timeline component | Custom SVG timeline | Recharts LineChart with date X-axis + custom dots | Recharts already installed; sufficient for this use case |
| Comparison diff engine | Myers diff algorithm | Side-by-side layout with same/different badge (BASE44 pattern) | Analyses are structured JSON — field-by-field comparison is sufficient |

---

## Common Pitfalls

### Pitfall 1: Missing Unique Constraint on learning_progress
**What goes wrong:** Upsert on `(user_id, discipline, topic)` fails with duplicate insert if unique constraint is missing.
**Why it happens:** `learning_progress` table was created in `001_schema.sql` — its constraints were not audited in Phase 1.
**How to avoid:** Add a `DO $$ BEGIN IF NOT EXISTS ...` block to check and add the unique constraint in a new migration (`005_schema_fixes.sql`).
**Warning signs:** Supabase upsert returning a conflict error on the first learning progress save.

### Pitfall 2: Recharts v3 SSR Incompatibility
**What goes wrong:** Recharts components crash on server render with "document is not defined".
**Why it happens:** Recharts accesses DOM APIs at module load. Phase 3 (dashboard) solved this by using `dynamic(() => import(...), { ssr: false })`.
**How to avoid:** Wrap all chart components in `next/dynamic` with `ssr: false`. This is the established project pattern.
**Warning signs:** Build error mentioning "ReferenceError: document is not defined".

### Pitfall 3: AstrologyTutor Reads URL params with window.location
**What goes wrong:** `const urlParams = new URLSearchParams(window.location.search)` crashes on server render.
**Why it happens:** BASE44 source uses `window.location` directly. In Next.js App Router, search params must come from `useSearchParams()` hook inside a Suspense boundary.
**How to avoid:** Replace with `useSearchParams()` wrapped in `<Suspense>` — same pattern used in `src/app/(public)/login/page.tsx`.
**Warning signs:** Hydration mismatch error or build error on the tutor page.

### Pitfall 4: PROTECTED_PATHS Missing New Routes
**What goes wrong:** New routes `/history`, `/learn/*`, `/analytics` are accessible without auth.
**Why it happens:** `PROTECTED_PATHS` in `src/lib/supabase/middleware.ts` is a whitelist — new paths must be added explicitly.
**How to avoid:** Add `/history`, `/learn`, `/analytics` to the `PROTECTED_PATHS` array in the middleware file as part of the first plan.
**Warning signs:** Navigating to `/history` while logged out does not redirect to login.

### Pitfall 5: Blog posts table has no seed data
**What goes wrong:** Blog page shows empty state even after implementation.
**Why it happens:** `blog_posts` table exists in DB but has no rows. BASE44 used hardcoded data.
**How to avoid:** Plan 09-03 (blog) must include a `005_schema_fixes.sql` INSERT or a seeding step with the 4 BASE44 articles (numerology guide, astrology 2024, palmistry, graphology).
**Warning signs:** Blog renders immediately showing "אין מאמרים" empty state.

### Pitfall 6: Sidebar navigation hrefs don't match actual routes
**What goes wrong:** Sidebar "מדריכים" links to `/tutorials` but the actual route is `/learn/tutorials`.
**Why it happens:** Sidebar was pre-wired in Phase 8 with placeholder hrefs. The actual routes are now being created.
**How to avoid:** Update `NAV_SECTIONS` in `Sidebar.tsx` as part of the first plan that creates pages. Add History, Analytics entries as new sidebar items.
**Warning signs:** Clicking sidebar nav items results in 404.

### Pitfall 7: date-fns v4 import style
**What goes wrong:** `import { format } from 'date-fns/locale'` or v3 named exports cause TypeScript errors.
**Why it happens:** date-fns v4 changes import style — `he` locale is imported from `date-fns/locale/he` in v4.
**How to avoid:** Use `import { he } from 'date-fns/locale/he'` (v4 style) — check how existing code imports it in dashboard components and match exactly.
**Warning signs:** TypeScript error "Module 'date-fns/locale' has no exported member 'he'".

### Pitfall 8: analytics_events table user_id is nullable
**What goes wrong:** Filtering analytics_events by user_id returns no rows for logged-in users.
**Why it happens:** `analytics_events.user_id` is `string | null` — events may have been written without a user_id if the analytics tracker ran before auth was established.
**How to avoid:** In self-analytics, prefer `analyses` + `mood_entries` + `goals` as the primary data source (all have non-null `user_id`). Use `analytics_events` only for tool usage events where `user_id` is confirmed.
**Warning signs:** Analytics dashboard shows zeros despite the user having analyses.

---

## Code Examples

### History page pagination with existing API

```typescript
// Source: verified pattern from /api/analysis/route.ts (Phase 5 decision)
const useAnalysisHistory = (toolType?: string, page = 0) => {
  const limit = 20;
  const offset = page * limit;
  return useQuery({
    queryKey: ['analyses', toolType, page],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
      if (toolType) params.set('tool_type', toolType);
      const res = await fetch(`/api/analysis?${params}`);
      return res.json() as Promise<{ data: AnalysisRow[]; meta: { total: number } }>;
    },
    staleTime: CACHE_TIMES.MEDIUM,
  });
};
```

### Compare analyses — fetch with results

```typescript
// Source: Phase 5 decision — include_results param added to /api/analysis
const fetchAnalysisWithResults = async (id: string) => {
  const res = await fetch(`/api/analysis?include_results=true&limit=1&offset=0`);
  // Note: for single analysis by ID, add /api/analysis/[id]/route.ts in Wave 0
  // OR fetch all with results and find by id client-side (acceptable for ≤50 analyses)
};
```

### Learning progress upsert

```typescript
// Upsert pattern — requires unique constraint on (user_id, discipline, topic)
const upsertProgress = async (
  supabase: SupabaseClient,
  userId: string,
  discipline: string,
  topic: string,
  completed: boolean,
  quizScore?: number
) => {
  const { error } = await supabase
    .from('learning_progress')
    .upsert(
      {
        user_id: userId,
        discipline,
        topic,
        completed,
        quiz_score: quizScore ?? null,
        last_studied: new Date().toISOString(),
      },
      { onConflict: 'user_id,discipline,topic' }
    );
  return error;
};
```

### Self-analytics — tool distribution from analyses

```typescript
// Source: pattern from dashboard AnalysesChart (Phase 3)
'use client';
const toolDistribution = useMemo(() => {
  const counts: Record<string, number> = {};
  analyses.forEach((a) => {
    counts[a.tool_type] = (counts[a.tool_type] ?? 0) + 1;
  });
  return Object.entries(counts).map(([name, value]) => ({
    name: TOOL_NAMES[name] ?? name,
    value,
  }));
}, [analyses]);
```

### Tutor API route — invokeLLM pattern

```typescript
// Pattern: matches /api/coach/message pattern from Phase 7
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'לא מחובר' }, { status: 401 });

  const body = TutorMessageSchema.safeParse(await request.json());
  if (!body.success) return NextResponse.json({ error: 'נתונים לא תקינים' }, { status: 400 });

  // Fetch user's relevant analyses for context
  const { data: analyses } = await supabase
    .from('analyses')
    .select('results, summary, created_at')
    .eq('user_id', user.id)
    .eq('tool_type', 'astrology')  // discipline-specific
    .order('created_at', { ascending: false })
    .limit(3);

  const systemPrompt = buildTutorSystemPrompt('astrology', analyses ?? []);
  const result = await invokeLLM({ prompt: body.data.message, systemPrompt, maxTokens: 1500 });

  if (!result.success) return NextResponse.json({ error: 'שגיאת AI' }, { status: 500 });

  return NextResponse.json({ reply: result.value });
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| BASE44 entity calls (`base44.entities.Analysis.list`) | `useQuery` + `fetch('/api/analysis')` | All previous phases | Use `/api/analysis` route, not Supabase directly from client |
| BASE44 agent conversations | `/api/coach/conversations` + `/api/coach/message` REST pattern | Phase 7 | Tutor routes replicate this exact pattern |
| Hardcoded blog content | Seeded DB rows in `blog_posts` table | Phase 9 | Need migration INSERT for seed data |
| `window.location.href` navigation | Next.js `<Link>` or `useRouter().push()` | All previous phases | Never use `window.location` in App Router |

---

## Open Questions

1. **Single-analysis detail route?**
   - What we know: `AnalysisHistory.tsx` links to `/history?id=${analysis.id}` but there is no `GET /api/analysis/[id]` route yet.
   - What's unclear: Should the history page show an inline expandable detail, or navigate to a separate detail page?
   - Recommendation: Inline expandable detail in the history list (simpler, avoids new route). Plan 09-01 should clarify.

2. **Blog: read-only or admin-editable?**
   - What we know: GROW-02 says "Blog with educational content" — no admin requirement.
   - What's unclear: Who populates future blog posts?
   - Recommendation: Seed 4 articles from BASE44 source. Future posts require admin panel (v2/ADV-04). Plan 09-03 seeds via migration only.

3. **Unique constraint on learning_progress(user_id, discipline, topic)?**
   - What we know: The table exists, but the constraint was not confirmed in Phase 1 migration audit.
   - What's unclear: Whether the constraint exists in `001_schema.sql`.
   - Recommendation: Wave 0 of Plan 09-03 must check this constraint and add it if missing via `005_schema_fixes.sql`.

---

## Validation Architecture

> nyquist_validation is enabled (config.json `workflow.nyquist_validation: true`).

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.x + @testing-library/jest-dom |
| Config file | `mystiqor-build/vitest.config.ts` |
| Quick run command | `cd mystiqor-build && npx vitest run tests/services/ --reporter=verbose` |
| Full suite command | `cd mystiqor-build && npx vitest run --reporter=verbose` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| HIST-01 | GET /api/analysis returns filtered + paginated list | unit | `npx vitest run tests/services/analysis-history.test.ts -x` | ❌ Wave 0 |
| HIST-03 | GET /api/analysis?include_results=true returns results field | unit | `npx vitest run tests/services/analysis-history.test.ts -x` | ❌ Wave 0 |
| GROW-04 | POST /api/learn/tutor/astrology returns AI reply | unit | `npx vitest run tests/services/tutor.test.ts -x` | ❌ Wave 0 |
| GROW-02 | GET /api/blog returns is_published posts | unit | `npx vitest run tests/services/blog.test.ts -x` | ❌ Wave 0 |
| UX-09 | Analytics page aggregates analyses by tool_type | unit (util fn) | `npx vitest run tests/services/analytics.test.ts -x` | ❌ Wave 0 |
| HIST-02 | Timeline renders analyses sorted by date | component smoke | manual verify (Recharts chart visual) | N/A |
| ASTR-08 | Astrology readings page shows tabbed history | manual | human-verify plan | N/A |
| GROW-03 | Tutorials hub renders learning path modules | manual | human-verify plan | N/A |
| GROW-05 | Drawing tutor chat sends and receives message | manual | human-verify plan | N/A |

### Sampling Rate
- **Per task commit:** `cd mystiqor-build && npx vitest run tests/services/ --reporter=verbose`
- **Per wave merge:** `cd mystiqor-build && npx vitest run --reporter=verbose`
- **Phase gate:** Full suite green + `tsc --noEmit` exits 0 before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/services/analysis-history.test.ts` — covers HIST-01, HIST-03
- [ ] `tests/services/tutor.test.ts` — covers GROW-04, GROW-05 (mock invokeLLM)
- [ ] `tests/services/blog.test.ts` — covers GROW-02
- [ ] `tests/services/analytics.test.ts` — covers UX-09 aggregation utility

---

## Sources

### Primary (HIGH confidence)
- BASE44 source pages read directly: `myanalyses.jsx`, `CompareAnalyses.jsx`, `Tutorials.jsx`, `AstrologyTutor.jsx`, `DrawingTutor.jsx`, `AnalyticsDashboard.jsx`, `Blog.jsx`, `AstrologyReadings.jsx`
- DB types verified: `mystiqor-build/src/types/database.generated.ts` + `database.ts` — `analyses`, `learning_progress`, `blog_posts`, `analytics_events` all present
- Existing API route verified: `src/app/api/analysis/route.ts` — supports `tool_type`, `limit`, `offset`, `include_results`
- Existing components verified: `AnalysisHistory.tsx`, `AnalysesChart.tsx` in `src/components/features/shared/`
- Sidebar navigation verified: `Sidebar.tsx` — "למידה" section already has `/tutorials` and `/blog` hrefs; needs updating
- Installed packages verified: `recharts@^3.8.0`, `framer-motion@^12.38.0`, `date-fns@^4.1.0`, `zod@^4.3.6`, `@tanstack/react-query@^5.91.2`
- Test infrastructure verified: `vitest.config.ts` present, `tests/` directory exists with existing test files

### Secondary (MEDIUM confidence)
- PROTECTED_PATHS array inspected in `src/lib/supabase/middleware.ts` — does not include history, learn, analytics yet
- Coach conversation pattern verified in `src/app/api/coach/conversations/route.ts` — reuse pattern for tutor routes confirmed

### Tertiary (LOW confidence)
- Unique constraint on `learning_progress(user_id, discipline, topic)` — assumed absent, needs schema verification in Wave 0

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages verified in package.json
- Architecture: HIGH — all patterns derived from existing working code in prior phases
- Pitfalls: HIGH — sourced from actual code inspection (Sidebar hrefs, PROTECTED_PATHS, Recharts SSR, date-fns v4)
- DB schema: HIGH — verified in database.generated.ts
- Unique constraint: LOW — not confirmed, flagged as Wave 0 check

**Research date:** 2026-03-24
**Valid until:** 2026-04-24 (stable stack)
