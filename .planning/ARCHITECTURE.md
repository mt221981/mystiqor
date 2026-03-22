# MystiQor — System Architecture v2.0

> **תאריך:** 2026-03-22
> **מבוסס על:** הנדסה לאחור של 53 דפי BASE44, mystiqor-build Phase 0, research/ARCHITECTURE.md
> **Stack:** Next.js 15 App Router · TypeScript strict · Supabase · Tailwind + shadcn/ui
> **שינויים מ-v1:** 12 תיקוני באגים, 5 שיפורים ארכיטקטוניים

---

## 1. System Topology

```
VERCEL (CDN + Edge Network)
  │
  ├── Next.js 15 App Router (mystiqor-build/)
  │     │
  │     ├── (public)/              Public routes (no auth)
  │     │     home, pricing, blog, login
  │     │
  │     ├── (auth)/                Protected routes
  │     │     layout.tsx           Server: session check → redirect
  │     │     layout-client.tsx    Client: QueryClient + Toaster + Sidebar
  │     │     dashboard, tools/*, coach, goals, mood, journal,
  │     │     daily-insights, notifications, history, learn,
  │     │     profile, settings, subscription, referrals
  │     │
  │     └── api/                   Route Handlers (server-only)
  │           auth/, tools/, analysis/, coach/, goals/, insights/,
  │           subscription/, geocode, upload, webhooks/stripe, cron/
  │
  ├── SUPABASE
  │     PostgreSQL + RLS (20 tables + 2 system tables)
  │     Auth (GoTrue / email+password)
  │     Storage (images: drawings, handwriting, palms, PDFs)
  │     Realtime (AI Coach chat streaming)
  │
  └── EXTERNAL SERVICES
        OpenAI (gpt-4o-mini text, gpt-4o vision) — server-only
        Stripe — checkout, webhooks, subscription management
        Nominatim — geocoding for birth place (free, no API key)
        Resend — transactional email
```

---

## 2. Data Flow Diagrams

### 2.1 Tool Analysis Flow
```
User submits form (Client Component)
  → React Hook Form validates (Zod schema)
  → useMutation → fetch('/api/tools/[tool]', POST)
  → API Route Handler:
      1. createClient() [server Supabase, reads cookies]
      2. supabase.auth.getUser() [verify session]
      3. ZodSchema.safeParse(body) [validate input]
      4. increment_usage() [atomic DB function, SELECT FOR UPDATE]
      5. Service function (pure computation or LLM call)
      6. Zod.parse(llmResponse) [validate LLM response shape] ← NEW
      7. supabase.from('analyses').insert(row) [save result]
      8. NextResponse.json({ data })
  → React Query cache updated → Result component renders
```

### 2.2 Auth Flow
```
User visits /(auth)/* route
  → middleware.ts: updateSession() [refresh cookie if near-expiry]
  → app/(auth)/layout.tsx (Server Component):
      createClient() + supabase.auth.getUser()
      No session? → redirect('/login')
      Has session? → render AuthLayoutClient
  → AuthLayoutClient: QueryClientProvider + Toaster + Sidebar
  → Page renders (may prefetch data)
```

### 2.3 Subscription Gate (Double-Check Pattern)
```
Client-side:
  SubscriptionGuard → useQuery(['subscription'])
    → analyses_used >= analyses_limit? → show upgrade modal
    → OK? → render tool form

Server-side:
  API route → increment_usage() RPC
    → SELECT FOR UPDATE (atomic lock)
    → limit reached? → 402 Payment Required
    → OK? → continue to LLM call
```

### 2.4 File Upload (Streaming, NOT Buffered)
```
User selects image (Drawing / Graphology / Palmistry)
  → Client: generates presigned upload URL via /api/upload/presign
  → Client: uploads directly to Supabase Storage (bypasses Vercel 4.5MB limit)
  → Client: submits tool form with storage URL
  → API route: receives URL, passes to LLM as image input
```

### 2.5 AI Coach (Realtime)
```
User sends message
  → POST /api/coach/message
      Save user message to coaching_messages
      Stream LLM response
      Save assistant message
  → Supabase Realtime broadcasts new message
  → ChatMessage component renders new bubble
```

---

## 3. Database Design

### 3.1 ERD

```
auth.users (Supabase Auth)
  │
  ├── 1:1 ── profiles
  ├── 1:1 ── subscriptions
  ├── 1:N ── analyses ── 1:N ── analysis_features
  ├── 1:N ── goals
  ├── 1:N ── mood_entries
  ├── 1:N ── journal_entries
  ├── 1:N ── daily_insights
  ├── 1:N ── dreams
  ├── 1:N ── conversations ── 1:N ── coaching_messages  ← NEW
  ├── 1:N ── coaching_journeys
  ├── 1:N ── reminders
  ├── 1:N ── payment_history
  ├── 1:N ── guest_profiles
  ├── 1:N ── learning_progress
  ├── 1:N ── referrals
  ├── 1:N ── analytics_events
  └── 1:N ── processed_webhook_events  ← NEW

(system tables — no user FK)
  ├── rulebook
  ├── tarot_cards
  └── blog_posts
```

### 3.2 Schema Changes from v1 (Fixes)

#### FIX 1: `profiles.timezone_name` replaces `timezone_offset`
```sql
-- BEFORE (broken with DST):
-- timezone_offset INTEGER DEFAULT 7200

-- AFTER:
ALTER TABLE profiles
  DROP COLUMN IF EXISTS timezone_offset,
  ADD COLUMN timezone_name TEXT DEFAULT 'Asia/Jerusalem';
-- Now correctly handles IST (UTC+2) / IDT (UTC+3) automatically
```

#### FIX 2: New `conversations` table
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  last_message_at TIMESTAMPTZ DEFAULT now(),
  message_count INTEGER DEFAULT 0,
  context JSONB DEFAULT '{}', -- analysis refs the coach knows about
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_conversations_user ON conversations(user_id, last_message_at DESC);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users CRUD own conversations" ON conversations FOR ALL USING (auth.uid() = user_id);

-- Update coaching_messages to FK to conversations
ALTER TABLE coaching_messages
  ADD CONSTRAINT fk_conversation
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE;
```

#### FIX 3: New `processed_webhook_events` table (Stripe idempotency)
```sql
CREATE TABLE processed_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_webhook_events_stripe ON processed_webhook_events(stripe_event_id);
-- No RLS — service role only
```

#### FIX 4: New `analytics_events` table (was missing)
```sql
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- page_view, tool_use, feature_click, etc.
  event_data JSONB DEFAULT '{}',
  page_path TEXT,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_analytics_user_date ON analytics_events(user_id, created_at DESC);
CREATE INDEX idx_analytics_type ON analytics_events(event_type);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own events" ON analytics_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create events" ON analytics_events FOR INSERT WITH CHECK (auth.uid() = user_id);
```

#### FIX 5: Blog posts RLS (public read)
```sql
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read published posts" ON blog_posts
  FOR SELECT USING (is_published = true);
-- Insert/Update/Delete: service role only (admin)
```

#### FIX 6: Composite index for dashboard queries
```sql
CREATE INDEX idx_analyses_user_tool_date ON analyses(user_id, tool_type, created_at DESC);
```

#### FIX 7: Auto-update `updated_at` trigger
```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at column
CREATE TRIGGER set_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON goals FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON journal_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON coaching_journeys FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

#### FIX 8: Atomic `increment_usage()` with SELECT FOR UPDATE
```sql
CREATE OR REPLACE FUNCTION increment_usage(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_sub subscriptions%ROWTYPE;
BEGIN
  -- Lock the row to prevent race conditions
  SELECT * INTO v_sub FROM subscriptions
    WHERE user_id = p_user_id
    FOR UPDATE;

  IF v_sub IS NULL THEN
    RAISE EXCEPTION 'No subscription found';
  END IF;

  IF v_sub.analyses_limit != -1 AND v_sub.analyses_used >= v_sub.analyses_limit THEN
    RAISE EXCEPTION 'Usage limit reached';
  END IF;

  UPDATE subscriptions
  SET analyses_used = analyses_used + 1, updated_at = now()
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'new_count', v_sub.analyses_used + 1,
    'limit', v_sub.analyses_limit
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### FIX 9: `reset_monthly_usage()` with timezone awareness
```sql
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void AS $$
BEGIN
  UPDATE subscriptions
  SET analyses_used = 0,
      guest_profiles_used = 0,
      last_reset_date = now(),
      updated_at = now()
  WHERE last_reset_date < date_trunc('month', now() AT TIME ZONE 'Asia/Jerusalem');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 4. API Design

### 4.1 Route Structure
```
src/app/api/
├── auth/
│   ├── callback/route.ts          # OAuth callback
│   └── confirm/route.ts           # Email confirmation
├── webhooks/
│   └── stripe/route.ts            # Stripe events (idempotent)
├── analysis/
│   ├── route.ts                   # POST: create / GET: list
│   └── [id]/route.ts              # GET: single analysis
├── tools/
│   ├── numerology/route.ts
│   ├── astrology/
│   │   ├── birth-chart/route.ts
│   │   ├── solar-return/route.ts
│   │   ├── transits/route.ts
│   │   ├── readings/route.ts
│   │   └── interpret/route.ts
│   ├── graphology/route.ts
│   ├── drawing/route.ts
│   ├── palmistry/route.ts
│   ├── tarot/route.ts
│   ├── human-design/route.ts
│   ├── dream/route.ts
│   ├── compatibility/route.ts
│   ├── career/route.ts
│   ├── personality/route.ts
│   ├── document/route.ts
│   ├── question/route.ts
│   ├── timing/route.ts
│   └── synthesis/route.ts
├── coach/
│   ├── message/route.ts           # POST: send message
│   ├── conversation/route.ts      # GET: list / POST: create
│   └── journey/route.ts           # POST: generate journey
├── goals/
│   ├── route.ts                   # GET/POST
│   ├── [id]/route.ts              # PATCH/DELETE
│   └── [id]/recommendations/route.ts
├── mood/route.ts                  # GET/POST
├── journal/
│   ├── route.ts                   # GET/POST
│   └── [id]/route.ts              # PATCH/DELETE
├── insights/
│   ├── daily/route.ts
│   └── weekly/route.ts
├── profile/
│   ├── route.ts                   # GET/PATCH
│   └── guests/route.ts            # GET/POST/DELETE
├── subscription/
│   ├── route.ts                   # GET: status
│   ├── checkout/route.ts          # POST: create checkout
│   ├── cancel/route.ts            # POST: cancel
│   └── usage/route.ts             # POST: increment
├── upload/
│   ├── route.ts                   # POST: upload file
│   └── presign/route.ts           # POST: get presigned URL ← NEW
├── geocode/route.ts               # GET: location search
├── referrals/route.ts             # GET/POST
└── cron/
    ├── daily-insights/route.ts    # POST: batch generate
    └── reset-usage/route.ts       # POST: monthly reset
```

### 4.2 API Route Pattern (Canonical)

```typescript
export async function POST(request: NextRequest) {
  try {
    // 1. Auth
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'לא מחובר' }, { status: 401 });

    // 2. Validate input
    const body: unknown = await request.json();
    const parsed = ToolInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'קלט לא תקין', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // 3. Check/increment usage (atomic, race-safe)
    const { error: usageError } = await supabase.rpc('increment_usage', { p_user_id: user.id });
    if (usageError) return NextResponse.json({ error: 'הגעת למגבלת הניתוחים' }, { status: 402 });

    // 4. Service computation
    const computed = await toolService(parsed.data);

    // 5. LLM interpretation (server-only)
    const llmRaw = await invokeLLM({ userId: user.id, systemPrompt, prompt });

    // 6. Validate LLM response shape ← NEW
    const llmParsed = ToolResponseSchema.safeParse(llmRaw.data);
    if (!llmParsed.success) {
      console.error('LLM response validation failed', llmRaw.data);
      // Fallback: use forceToString for text extraction
      const fallbackText = forceToString(llmRaw.data);
      // Save with lower confidence
    }

    // 7. Save to DB
    const { data: analysis } = await supabase
      .from('analyses')
      .insert({ user_id: user.id, tool_type, input_data, results, summary, confidence_score })
      .select('id')
      .single();

    // 8. Return
    return NextResponse.json({ data: { ...computed, analysis_id: analysis?.id } });
  } catch {
    return NextResponse.json({ error: 'שגיאה פנימית' }, { status: 500 });
  }
}
```

### 4.3 Stripe Webhook Pattern (Idempotent)

```typescript
export async function POST(request: NextRequest) {
  const body = await request.text(); // raw body for signature verification
  const sig = request.headers.get('stripe-signature');

  const event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET);

  // Idempotency check
  const admin = createAdminClient();
  const { data: existing } = await admin
    .from('processed_webhook_events')
    .select('id')
    .eq('stripe_event_id', event.id)
    .single();

  if (existing) return NextResponse.json({ received: true }); // Already processed

  // Process event...

  // Mark as processed
  await admin.from('processed_webhook_events').insert({
    stripe_event_id: event.id,
    event_type: event.type,
  });
}
```

### 4.4 Response Format

```typescript
// Success
{ data: T, meta?: { count: number, page: number, total: number } }

// Error
{ error: string, details?: Record<string, string[]> }

// Status codes
// 200: Success
// 400: Invalid input (Zod validation failed)
// 401: Not authenticated
// 402: Payment required (usage limit)
// 429: Rate limited
// 500: Internal server error
```

### 4.5 Rate Limiting

```typescript
const RATE_LIMITS = {
  'api/tools/*':       { window: '1m', max: 10 },   // 10 analyses/minute
  'api/coach/message': { window: '1m', max: 30 },   // 30 messages/minute
  'api/auth/*':        { window: '15m', max: 5 },    // 5 auth attempts/15min
  'api/upload':        { window: '1h', max: 20 },    // 20 uploads/hour
  'api/webhooks/*':    { window: '1s', max: 100 },   // Stripe bursts
};
```

---

## 5. Component Architecture

### 5.1 Directory Structure

```
src/
├── app/
│   ├── (public)/                  # No auth required
│   │   ├── page.tsx               # Landing/Home
│   │   ├── pricing/page.tsx
│   │   ├── blog/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   └── login/page.tsx
│   ├── (auth)/                    # Auth required
│   │   ├── layout.tsx             # Server: session check
│   │   ├── layout-client.tsx      # Client: providers
│   │   ├── dashboard/page.tsx
│   │   ├── onboarding/page.tsx
│   │   ├── tools/
│   │   │   ├── numerology/page.tsx
│   │   │   ├── astrology/
│   │   │   │   ├── page.tsx       # Birth chart
│   │   │   │   ├── readings/page.tsx
│   │   │   │   ├── solar-return/page.tsx
│   │   │   │   ├── transits/page.tsx
│   │   │   │   ├── synastry/page.tsx
│   │   │   │   └── calendar/page.tsx
│   │   │   ├── graphology/page.tsx
│   │   │   ├── drawing/page.tsx
│   │   │   ├── palmistry/page.tsx
│   │   │   ├── tarot/page.tsx
│   │   │   ├── human-design/page.tsx
│   │   │   ├── dream/page.tsx
│   │   │   ├── compatibility/page.tsx
│   │   │   ├── personality/page.tsx
│   │   │   ├── career/page.tsx
│   │   │   ├── document/page.tsx
│   │   │   ├── question/page.tsx
│   │   │   ├── timing/page.tsx
│   │   │   └── synthesis/page.tsx
│   │   ├── coach/
│   │   │   ├── page.tsx
│   │   │   └── journey/[id]/page.tsx
│   │   ├── goals/page.tsx
│   │   ├── mood/page.tsx
│   │   ├── journal/page.tsx
│   │   ├── daily-insights/page.tsx
│   │   ├── notifications/page.tsx
│   │   ├── history/
│   │   │   ├── page.tsx
│   │   │   └── compare/page.tsx
│   │   ├── learn/
│   │   │   ├── page.tsx
│   │   │   ├── astrology/page.tsx
│   │   │   └── drawing/page.tsx
│   │   ├── profile/
│   │   │   ├── page.tsx
│   │   │   ├── edit/page.tsx
│   │   │   └── guests/page.tsx
│   │   ├── settings/page.tsx
│   │   ├── subscription/
│   │   │   ├── page.tsx
│   │   │   └── success/page.tsx
│   │   ├── referrals/page.tsx
│   │   └── analytics/page.tsx
│   ├── api/                       # See §4.1
│   ├── layout.tsx                 # Root: RTL, fonts, theme
│   ├── not-found.tsx
│   ├── error.tsx
│   └── loading.tsx
├── components/
│   ├── ui/                        # shadcn/ui (30+ primitives)
│   ├── layouts/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── MobileNav.tsx
│   │   └── PageHeader.tsx
│   ├── forms/
│   │   ├── BirthDataForm.tsx      # Reusable: date + time + place (geocoded)
│   │   ├── LocationSearch.tsx     # Nominatim autocomplete
│   │   └── FormInput.tsx          # Validated input
│   ├── features/
│   │   ├── astrology/
│   │   │   ├── BirthChart/        # SVG decomposition
│   │   │   │   ├── index.tsx
│   │   │   │   ├── ZodiacRing.tsx
│   │   │   │   ├── PlanetPositions.tsx
│   │   │   │   ├── AspectLines.tsx
│   │   │   │   └── HouseOverlay.tsx
│   │   │   ├── ReadingCard.tsx
│   │   │   └── ConceptCard.tsx
│   │   ├── numerology/NumberCard.tsx
│   │   ├── drawing/
│   │   │   ├── DigitalCanvas.tsx
│   │   │   ├── AnnotatedViewer.tsx
│   │   │   ├── KoppitzIndicators.tsx
│   │   │   └── MetricsBreakdown.tsx
│   │   ├── graphology/
│   │   │   ├── Comparison.tsx
│   │   │   ├── ProgressTracker.tsx
│   │   │   ├── QuickStats.tsx
│   │   │   ├── ExportPDF.tsx
│   │   │   └── Timeline.tsx
│   │   ├── coach/
│   │   │   ├── ChatMessage.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   ├── QuickActions.tsx
│   │   │   └── JourneyCard.tsx
│   │   ├── insights/
│   │   │   ├── ExplainableInsight.tsx
│   │   │   ├── DailyInsightCard.tsx
│   │   │   └── ConfidenceBadge.tsx
│   │   ├── goals/
│   │   │   ├── GoalCard.tsx
│   │   │   ├── GoalLinker.tsx
│   │   │   └── ProgressModal.tsx
│   │   ├── subscription/
│   │   │   ├── SubscriptionGuard.tsx
│   │   │   ├── PlanCard.tsx
│   │   │   └── UsageBar.tsx
│   │   ├── onboarding/OnboardingWizard.tsx
│   │   ├── dashboard/
│   │   │   ├── BiorhythmChart.tsx
│   │   │   ├── MoodTrend.tsx
│   │   │   ├── GoalProgress.tsx
│   │   │   └── ToolDistribution.tsx
│   │   └── shared/
│   │       ├── ToolGrid.tsx
│   │       ├── AnalysisHistory.tsx
│   │       ├── AnalysisComparison.tsx
│   │       └── ProfileCard.tsx
│   └── common/
│       ├── LoadingSpinner.tsx
│       ├── EmptyState.tsx
│       ├── ErrorBoundary.tsx      # GEM 10: auto-recovery
│       ├── PageTransition.tsx
│       ├── SearchBar.tsx
│       └── Breadcrumbs.tsx
├── lib/
│   ├── supabase/                  # DO NOT MODIFY — 48/50 score
│   │   ├── client.ts              # Browser
│   │   ├── server.ts              # Server (cookies)
│   │   ├── middleware.ts          # Session refresh
│   │   └── admin.ts              # Service role
│   ├── utils/
│   │   ├── cn.ts
│   │   ├── llm-response.ts       # GEM 5: forceToString
│   │   ├── dates.ts              # Israeli date formatting
│   │   └── sanitize.ts           # XSS prevention
│   ├── validations/               # Zod schemas (7 files)
│   ├── constants/
│   │   ├── astrology.ts          # GEM 6
│   │   ├── plans.ts              # GEM 7
│   │   └── categories.ts
│   ├── animations/presets.ts      # GEM 11
│   └── query/cache-config.ts     # GEM 8
├── hooks/
│   ├── useSubscription.ts
│   ├── useAnalytics.ts
│   ├── useMobile.ts
│   └── useDebounce.ts
├── services/
│   ├── astrology/
│   │   ├── chart.ts
│   │   ├── aspects.ts            # GEM 14
│   │   ├── solar-return.ts       # GEM 1
│   │   └── prompts/
│   ├── numerology/
│   │   ├── calculations.ts
│   │   ├── gematria.ts           # GEM 2
│   │   └── compatibility.ts
│   ├── analysis/
│   │   ├── llm.ts                # LLM invocation wrapper
│   │   ├── rule-engine.ts        # GEM 3
│   │   └── response-schemas/     # NEW: Zod schemas per tool
│   │       ├── astrology.ts
│   │       ├── numerology.ts
│   │       ├── drawing.ts
│   │       └── ...
│   ├── drawing/analysis.ts
│   ├── email/
│   │   ├── welcome.ts
│   │   ├── payment-failed.ts
│   │   └── usage-limit.ts
│   └── geocode.ts
├── stores/
│   ├── theme.ts
│   ├── onboarding.ts
│   └── coach-chat.ts
├── types/
│   ├── database.ts               # To be replaced by supabase gen types
│   ├── analysis.ts
│   ├── astrology.ts
│   ├── numerology.ts
│   └── subscription.ts
└── middleware.ts                  # Auth redirect
```

### 5.2 Tool Page Decomposition Pattern

Every tool page follows this structure — **max 100 lines per page file**:

```
app/(auth)/tools/[tool]/page.tsx         "use client", orchestrates flow
  │
  ├── SubscriptionGuard                  blocks if limit reached
  ├── [Tool]InputForm                    React Hook Form + Zod + BirthDataForm
  ├── [Tool]LoadingState                 skeleton while waiting
  └── [Tool]Results                      displays computed + AI interpretation
        ├── NumberCard / ChartSVG / etc  leaf display component
        ├── ExplainableInsight           confidence + reasoning
        └── AnalysisHistory              past analyses of this type
```

---

## 6. State Management

| State Type | Tool | Where |
|-----------|------|-------|
| Server data (analyses, profile, goals) | React Query | hooks/ + API routes |
| Auth state | Supabase Auth | lib/supabase/ + middleware |
| UI state (theme, sidebar) | Zustand | stores/ |
| Form state | React Hook Form + Zod | Component-local |
| URL state (filters, pagination) | useSearchParams() | Next.js built-in |
| Chat state (active conversation) | Zustand | stores/coach-chat.ts |

---

## 7. Security Architecture

### 7.1 RLS Summary

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| profiles | Own | Own | Own | — |
| subscriptions | Own | Service | Own | Service |
| analyses | Own | Own | — | Own |
| analysis_features | Via analysis FK | Via analysis FK | — | Via analysis FK |
| goals | Own | Own | Own | Own |
| mood_entries | Own | Own | Own | Own |
| journal_entries | Own | Own | Own | Own |
| daily_insights | Own | Own | Own | Own |
| dreams | Own | Own | Own | Own |
| conversations | Own | Own | Own | Own |
| coaching_messages | Own | Own | — | Own |
| coaching_journeys | Own | Own | Own | Own |
| reminders | Own | Own | Own | Own |
| payment_history | Own (read) | Service | — | — |
| guest_profiles | Own | Own | Own | Own |
| learning_progress | Own | Own | Own | Own |
| referrals | Own (read) | Own | — | — |
| analytics_events | Own (read) | Own | — | — |
| processed_webhook_events | — | Service | — | — |
| tarot_cards | Public | — | — | — |
| blog_posts | Public (published) | — | — | — |
| rulebook | Service | Service | Service | Service |

### 7.2 Supabase Client Selection Rules

| Context | Client | Why |
|---------|--------|-----|
| Server Component | `server.ts` | Reads httpOnly cookies |
| Route Handler | `server.ts` | Same — server context |
| Middleware | `middleware.ts` | Special cookies API |
| Stripe webhook | `admin.ts` | Service role — bypass RLS |
| Cron jobs | `admin.ts` | System operations |
| Client Component | `client.ts` | Browser, anon key, RLS enforced |

### 7.3 Environment Variables

```env
# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # Server only

# LLM (REQUIRED)
OPENAI_API_KEY=                      # Server only

# Stripe (Phase 8)
STRIPE_SECRET_KEY=                   # Server only
STRIPE_WEBHOOK_SECRET=               # Server only
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Email (Phase 8)
RESEND_API_KEY=                      # Server only

# App
NEXT_PUBLIC_APP_URL=
CRON_SECRET=                         # For cron job auth
```

---

## 8. Performance Design

### 8.1 Rendering Strategy

| Page Type | Strategy | Why |
|-----------|----------|-----|
| Home, Pricing, Blog | SSG (Static) | SEO + fast load |
| Dashboard | SSR + Client Hydration | Personalized, fast initial |
| Tool pages | Client-side | Interactive forms, no SEO |
| Analysis results | Client-side (React Query) | Dynamic, cached |

### 8.2 Optimization Techniques

- **Dynamic imports:** `next/dynamic` for BirthChart SVG, DigitalCanvas, Recharts
- **Image optimization:** `next/image` + Supabase Storage CDN
- **Bundle splitting:** Automatic per-page in App Router
- **React Query caching:** CACHE_TIMES from GEM 8 (2min → 1hr tiers)
- **Pagination:** All lists default 20 items
- **Targets:** Initial JS < 200KB, LCP < 1.5s, Lighthouse > 90

### 8.3 Cron Jobs

| Job | Schedule | Endpoint |
|-----|----------|----------|
| Monthly usage reset | 1st of month, 00:00 IST | `api/cron/reset-usage` |
| Daily insight generation | Daily, 06:00 IST | `api/cron/daily-insights` |

---

## 9. Anti-Patterns (DO NOT)

1. **LLM calls from client components** — exposes API keys
2. **Admin client in client components** — bypasses all RLS
3. **Direct DB writes from client** — skips validation + usage check
4. **Page files > 300 lines** — decompose into feature components
5. **Rewriting working BASE44 logic** — use ported services
6. **Skipping SubscriptionGuard** — breaks business model
7. **Prop-drilling auth** — use hooks or server-side checks
8. **`left`/`right` CSS** — use `start`/`end` for RTL
9. **English UI text** — all user-facing text in Hebrew
10. **Importing `server.ts` in `'use client'`** — wrong client, breaks auth

---

## 10. Migration Mapping

| Status | Count | Examples |
|--------|-------|---------|
| Done | 7 | login, dashboard, onboarding, numerology, tarot, dream, human-design |
| Stub | 2 | palmistry (API done), home |
| Missing | 37 | astrology, graphology, drawing, coach, goals, mood, journal, etc. |
| Not migrating | 3 | TestStripe, IconGenerator, LanguageToggle |

Full mapping: see [research/ARCHITECTURE.md](research/ARCHITECTURE.md) §Migration Mapping

---

## 11. Architecture Score v2

| Criterion | v1 | v2 | Notes |
|-----------|-----|-----|-------|
| Separation of Concerns | 9 | 9 | Unchanged |
| Type Safety | 9 | 10 | +Zod LLM response validation |
| Security Design | 9 | 10 | +webhook idempotency, +streaming upload |
| Scalability | 8 | 9 | +streaming uploads, +timezone awareness |
| Developer Experience | 8 | 8 | Unchanged |
| Data Model | 9 | 10 | +conversations table, +analytics_events, +triggers, +indexes |
| Error Strategy | 8 | 9 | +LLM response fallback pattern |
| Performance Design | 8 | 8 | Unchanged |
| RTL/Hebrew | 9 | 9 | Unchanged |
| Migration Path | 8 | 9 | +cleaner dependency ordering |
| **TOTAL** | **85** | **91/100** | **+6 from fixes** |

---

*Architecture v2.0 — 2026-03-22*
*Changes from v1: 12 bug fixes, 5 improvements, score 85→91*
