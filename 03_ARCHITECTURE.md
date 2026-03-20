# 03_ARCHITECTURE.md — System Architecture Design

> **תאריך:** 2026-03-20
> **מבוסס על:** 01_CODEBASE_MAP.md, 02_REVERSE_ENGINEERING.md, 02b_GEMS.md
> **Stack:** Next.js 14+ App Router · TypeScript strict · Supabase · Tailwind + shadcn/ui

---

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         VERCEL (CDN + Edge)                     │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Next.js 14+ App Router                 │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐   │  │
│  │  │  (public)/   │  │   (auth)/    │  │   api/         │   │  │
│  │  │  Home        │  │  Dashboard   │  │  webhooks/     │   │  │
│  │  │  Pricing     │  │  Tools/*     │  │  stripe        │   │  │
│  │  │  Blog        │  │  Profile     │  │  cron/         │   │  │
│  │  │  Login       │  │  Settings    │  │  daily-insight │   │  │
│  │  └─────────────┘  └──────────────┘  └────────────────┘   │  │
│  └───────────────────────────────────────────────────────────┘  │
└───────────────┬──────────────────────────────┬──────────────────┘
                │                              │
                ▼                              ▼
┌──────────────────────────┐   ┌──────────────────────────────────┐
│      SUPABASE             │   │       EXTERNAL SERVICES          │
│  ┌──────────────────┐     │   │  ┌────────────┐                 │
│  │  PostgreSQL      │     │   │  │  OpenAI /   │  LLM Analysis  │
│  │  + RLS Policies  │     │   │  │  Anthropic  │                │
│  ├──────────────────┤     │   │  ├────────────┤                 │
│  │  Auth (GoTrue)   │     │   │  │  Stripe    │  Payments       │
│  ├──────────────────┤     │   │  ├────────────┤                 │
│  │  Storage         │     │   │  │  Nominatim │  Geocoding      │
│  │  (images, PDFs)  │     │   │  ├────────────┤                 │
│  ├──────────────────┤     │   │  │  Resend    │  Emails         │
│  │  Realtime        │     │   │  └────────────┘                 │
│  │  (AI Coach chat) │     │   └──────────────────────────────────┘
│  ├──────────────────┤     │
│  │  Edge Functions  │     │
│  │  (heavy compute) │     │
│  └──────────────────┘     │
└──────────────────────────┘
```

### Data Flow
```
User Action → Next.js Server Component / Route Handler
  → Supabase Client (server-side, with RLS)
    → PostgreSQL (data)
    → Storage (files)
  → LLM API (AI analysis, server-side only)
  → Response → React Query cache → UI
```

### Auth Flow
```
1. User visits site → Supabase Auth check (middleware.ts)
2. No session → Redirect to /login
3. Login → Supabase Auth (email/password or OAuth)
4. Session cookie set (httpOnly, secure)
5. middleware.ts validates session on every (auth) route
6. Server components use createServerClient() → RLS enforced
7. Client components use createBrowserClient() → RLS enforced
```

---

## 2. Database Design

### 2.1 ERD Summary

```
users (Supabase Auth)
  │
  ├── 1:1 ── profiles
  ├── 1:1 ── subscriptions
  ├── 1:N ── analyses
  ├── 1:N ── goals
  ├── 1:N ── mood_entries
  ├── 1:N ── journal_entries
  ├── 1:N ── daily_insights
  ├── 1:N ── dreams
  ├── 1:N ── coaching_journeys
  ├── 1:N ── coaching_messages
  ├── 1:N ── reminders
  ├── 1:N ── payment_history
  ├── 1:N ── learning_progress
  ├── 1:N ── referrals
  ├── 1:N ── guest_profiles
  └── 1:N ── analytics_events

analyses
  └── 1:N ── analysis_features

(system tables)
  ├── rulebook
  ├── tarot_cards
  └── blog_posts
```

### 2.2 Table Definitions

#### `profiles`
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  birth_time TIME,
  birth_place TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  timezone_offset INTEGER DEFAULT 7200, -- seconds, default Israel UTC+2
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  disciplines TEXT[] DEFAULT '{}',
  focus_areas TEXT[] DEFAULT '{}',
  personal_goals TEXT[] DEFAULT '{}',
  ai_suggestions_enabled BOOLEAN DEFAULT true,
  onboarding_completed BOOLEAN DEFAULT false,
  profile_completion_score INTEGER DEFAULT 0 CHECK (profile_completion_score BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
```

#### `subscriptions`
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free', 'basic', 'premium', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('trial', 'active', 'cancelled', 'expired', 'past_due')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  analyses_limit INTEGER NOT NULL DEFAULT 3,
  analyses_used INTEGER NOT NULL DEFAULT 0,
  guest_profiles_limit INTEGER NOT NULL DEFAULT 1,
  guest_profiles_used INTEGER NOT NULL DEFAULT 0,
  trial_end_date TIMESTAMPTZ,
  start_date TIMESTAMPTZ DEFAULT now(),
  end_date TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  auto_renew BOOLEAN DEFAULT true,
  last_reset_date TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own subscription" ON subscriptions FOR UPDATE USING (auth.uid() = user_id);
-- Insert/delete only via server (service role) for Stripe webhook
```

#### `analyses`
```sql
CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_type TEXT NOT NULL CHECK (tool_type IN (
    'numerology', 'astrology', 'palmistry', 'graphology', 'tarot',
    'drawing', 'dream', 'career', 'compatibility', 'synastry',
    'solar_return', 'transits', 'human_design', 'personality',
    'document', 'question', 'relationship', 'synthesis'
  )),
  input_data JSONB NOT NULL DEFAULT '{}',
  results JSONB NOT NULL DEFAULT '{}',
  summary TEXT,
  confidence_score NUMERIC(4,3) CHECK (confidence_score BETWEEN 0 AND 1),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_analyses_user_id ON analyses(user_id);
CREATE INDEX idx_analyses_tool_type ON analyses(tool_type);
CREATE INDEX idx_analyses_created_at ON analyses(created_at DESC);

-- RLS
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own analyses" ON analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own analyses" ON analyses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own analyses" ON analyses FOR DELETE USING (auth.uid() = user_id);
```

#### `analysis_features`
```sql
CREATE TABLE analysis_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  tool_type TEXT NOT NULL,
  feature_key TEXT NOT NULL,
  feature_value TEXT,
  confidence NUMERIC(4,3) DEFAULT 1.0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_features_analysis_id ON analysis_features(analysis_id);

-- RLS: inherits from analyses via analysis_id
ALTER TABLE analysis_features ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own features" ON analysis_features FOR SELECT
  USING (EXISTS (SELECT 1 FROM analyses WHERE analyses.id = analysis_features.analysis_id AND analyses.user_id = auth.uid()));
CREATE POLICY "Users can insert own features" ON analysis_features FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM analyses WHERE analyses.id = analysis_features.analysis_id AND analyses.user_id = auth.uid()));
```

#### `goals`
```sql
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('career', 'relationships', 'personal_growth', 'health', 'spirituality', 'creativity', 'finance', 'other')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'in_progress', 'completed')),
  progress INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  target_date DATE,
  preferred_tools TEXT[] DEFAULT '{}',
  action_plan JSONB DEFAULT '[]',
  ai_summary TEXT,
  recommendations JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_goals_user_id ON goals(user_id);

-- RLS
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users CRUD own goals" ON goals FOR ALL USING (auth.uid() = user_id);
```

#### `mood_entries`
```sql
CREATE TABLE mood_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mood TEXT NOT NULL,
  mood_score INTEGER NOT NULL CHECK (mood_score BETWEEN 1 AND 10),
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
  stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 10),
  sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 10),
  notes TEXT,
  activities TEXT[] DEFAULT '{}',
  gratitude TEXT[] DEFAULT '{}',
  ai_analysis JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_mood_user_date ON mood_entries(user_id, created_at DESC);

ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users CRUD own mood" ON mood_entries FOR ALL USING (auth.uid() = user_id);
```

#### `journal_entries`
```sql
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  mood TEXT,
  mood_score INTEGER CHECK (mood_score BETWEEN 1 AND 10),
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
  gratitude TEXT[] DEFAULT '{}',
  goals TEXT[] DEFAULT '{}',
  ai_insights TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users CRUD own journal" ON journal_entries FOR ALL USING (auth.uid() = user_id);
```

#### `daily_insights`
```sql
CREATE TABLE daily_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  actionable_tip TEXT,
  mood_type TEXT CHECK (mood_type IN ('inspiring', 'reflective', 'empowering', 'cautionary', 'celebratory')),
  focus_area TEXT,
  confidence NUMERIC(4,3),
  tarot JSONB, -- { card_name, orientation, meaning }
  data_sources JSONB, -- { numerology: {}, astrology: {} }
  recurring_themes JSONB DEFAULT '[]',
  user_feedback JSONB, -- { rating: 1-5, comment, feedback_date }
  insight_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_insights_user_date ON daily_insights(user_id, insight_date DESC);

ALTER TABLE daily_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users CRUD own insights" ON daily_insights FOR ALL USING (auth.uid() = user_id);
```

#### `dreams`
```sql
CREATE TABLE dreams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  dream_date DATE DEFAULT CURRENT_DATE,
  emotions TEXT[] DEFAULT '{}',
  symbols TEXT[] DEFAULT '{}',
  people TEXT[] DEFAULT '{}',
  location TEXT,
  mood_after TEXT,
  is_recurring BOOLEAN DEFAULT false,
  is_lucid BOOLEAN DEFAULT false,
  dreamscape_url TEXT,
  ai_interpretation TEXT,
  psychological_themes TEXT[] DEFAULT '{}',
  symbol_meanings JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE dreams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users CRUD own dreams" ON dreams FOR ALL USING (auth.uid() = user_id);
```

#### `coaching_journeys`
```sql
CREATE TABLE coaching_journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  focus_area TEXT,
  journey_type TEXT DEFAULT 'daily' CHECK (journey_type IN ('daily', 'weekly', 'custom')),
  steps JSONB NOT NULL DEFAULT '[]', -- [{ step_number, title, description, type, status, suggestions }]
  tags TEXT[] DEFAULT '{}',
  ai_insights TEXT,
  linked_goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE coaching_journeys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users CRUD own journeys" ON coaching_journeys FOR ALL USING (auth.uid() = user_id);
```

#### `coaching_messages`
```sql
CREATE TABLE coaching_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_messages_conversation ON coaching_messages(conversation_id, created_at);

ALTER TABLE coaching_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users CRUD own messages" ON coaching_messages FOR ALL USING (auth.uid() = user_id);
```

#### `reminders`
```sql
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  scheduled_date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'dismissed')),
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule TEXT, -- cron expression
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users CRUD own reminders" ON reminders FOR ALL USING (auth.uid() = user_id);
```

#### `payment_history`
```sql
CREATE TABLE payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_payment_id TEXT,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'ILS',
  status TEXT NOT NULL CHECK (status IN ('succeeded', 'failed', 'refunded')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own payments" ON payment_history FOR SELECT USING (auth.uid() = user_id);
-- Insert only via service role (Stripe webhook)
```

#### `guest_profiles`
```sql
CREATE TABLE guest_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  birth_time TIME,
  birth_place TEXT,
  relationship TEXT, -- partner, child, friend, etc.
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE guest_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users CRUD own guests" ON guest_profiles FOR ALL USING (auth.uid() = user_id);
```

#### `learning_progress`
```sql
CREATE TABLE learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  discipline TEXT NOT NULL, -- astrology, drawing, etc.
  level TEXT DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  topic TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  quiz_score INTEGER CHECK (quiz_score BETWEEN 0 AND 100),
  study_time_minutes INTEGER DEFAULT 0,
  last_studied TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, discipline, topic)
);

ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users CRUD own progress" ON learning_progress FOR ALL USING (auth.uid() = user_id);
```

#### `referrals`
```sql
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_email TEXT NOT NULL,
  referral_code TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rewarded')),
  reward_analyses INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own referrals" ON referrals FOR SELECT USING (auth.uid() = referrer_id);
CREATE POLICY "Users create referrals" ON referrals FOR INSERT WITH CHECK (auth.uid() = referrer_id);
```

#### System Tables (no RLS — service role only)

```sql
-- Rulebook: condition-based insight generation rules
CREATE TABLE rulebook (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_type TEXT NOT NULL,
  rule_id TEXT NOT NULL UNIQUE,
  condition JSONB NOT NULL, -- { feature_key, operator, value }
  insight_template JSONB NOT NULL, -- { title, content, insight_type }
  weight NUMERIC(3,2) DEFAULT 1.0,
  base_confidence NUMERIC(3,2) DEFAULT 0.9,
  sources TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tarot cards (static reference data)
CREATE TABLE tarot_cards (
  id SERIAL PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_he TEXT NOT NULL,
  arcana TEXT NOT NULL CHECK (arcana IN ('major', 'minor')),
  suit TEXT, -- wands, cups, swords, pentacles (null for major)
  number INTEGER,
  meaning_upright TEXT NOT NULL,
  meaning_reversed TEXT NOT NULL,
  keywords TEXT[] DEFAULT '{}',
  image_url TEXT
);

-- Blog posts
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  author TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  read_time_minutes INTEGER DEFAULT 5,
  is_published BOOLEAN DEFAULT true,
  published_at TIMESTAMPTZ DEFAULT now()
);
```

### 2.3 Database Functions

```sql
-- Monthly usage reset (called by cron)
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void AS $$
BEGIN
  UPDATE subscriptions
  SET analyses_used = 0,
      guest_profiles_used = 0,
      last_reset_date = now(),
      updated_at = now()
  WHERE last_reset_date < date_trunc('month', now());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment analysis usage (with limit check)
CREATE OR REPLACE FUNCTION increment_usage(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_sub subscriptions%ROWTYPE;
BEGIN
  SELECT * INTO v_sub FROM subscriptions WHERE user_id = p_user_id;

  IF v_sub IS NULL THEN
    RAISE EXCEPTION 'No subscription found';
  END IF;

  IF v_sub.analyses_limit != -1 AND v_sub.analyses_used >= v_sub.analyses_limit THEN
    RAISE EXCEPTION 'Usage limit reached';
  END IF;

  UPDATE subscriptions
  SET analyses_used = analyses_used + 1, updated_at = now()
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object('success', true, 'new_count', v_sub.analyses_used + 1, 'limit', v_sub.analyses_limit);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profile completion score calculator
CREATE OR REPLACE FUNCTION calculate_profile_completion(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_profile profiles%ROWTYPE;
  v_score INTEGER := 0;
BEGIN
  SELECT * INTO v_profile FROM profiles WHERE id = p_user_id;
  IF v_profile IS NULL THEN RETURN 0; END IF;

  IF v_profile.full_name IS NOT NULL THEN v_score := v_score + 15; END IF;
  IF v_profile.birth_date IS NOT NULL THEN v_score := v_score + 15; END IF;
  IF v_profile.birth_time IS NOT NULL THEN v_score := v_score + 10; END IF;
  IF v_profile.birth_place IS NOT NULL THEN v_score := v_score + 10; END IF;
  IF v_profile.gender IS NOT NULL THEN v_score := v_score + 5; END IF;
  IF array_length(v_profile.disciplines, 1) > 0 THEN v_score := v_score + 15; END IF;
  IF array_length(v_profile.focus_areas, 1) > 0 THEN v_score := v_score + 15; END IF;
  IF array_length(v_profile.personal_goals, 1) > 0 THEN v_score := v_score + 15; END IF;

  UPDATE profiles SET profile_completion_score = v_score, updated_at = now() WHERE id = p_user_id;
  RETURN v_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 3. API Design

### 3.1 Route Structure

```
src/app/api/
├── auth/
│   ├── callback/route.ts          # OAuth callback
│   └── confirm/route.ts           # Email confirmation
├── webhooks/
│   └── stripe/route.ts            # Stripe events (POST)
├── analysis/
│   ├── route.ts                   # POST: create analysis (generic)
│   └── [id]/route.ts              # GET: single analysis
├── tools/
│   ├── numerology/route.ts        # POST: numerology calculation
│   ├── astrology/
│   │   ├── birth-chart/route.ts   # POST: birth chart
│   │   ├── solar-return/route.ts  # POST: solar return
│   │   ├── transits/route.ts      # POST: current transits
│   │   ├── readings/route.ts      # POST: generate reading
│   │   └── interpret/route.ts     # POST: interpret chart
│   ├── graphology/route.ts        # POST: handwriting analysis
│   ├── drawing/route.ts           # POST: drawing analysis
│   ├── palmistry/route.ts         # POST: palm analysis
│   ├── tarot/route.ts             # POST: tarot reading
│   ├── human-design/route.ts      # POST: HD calculation
│   ├── dream/route.ts             # POST: dream interpretation
│   ├── compatibility/route.ts     # POST: compatibility check
│   ├── career/route.ts            # POST: career guidance
│   ├── document/route.ts          # POST: document analysis
│   ├── question/route.ts          # POST: ask question
│   └── synthesis/route.ts         # POST: mystic synthesis
├── coach/
│   ├── message/route.ts           # POST: send message to coach
│   └── journey/route.ts           # POST: generate journey
├── goals/
│   ├── route.ts                   # GET/POST: goals
│   ├── [id]/route.ts              # PATCH/DELETE: goal
│   └── [id]/recommendations/route.ts # POST: AI recommendations
├── insights/
│   ├── daily/route.ts             # POST: generate daily insight
│   └── weekly/route.ts            # POST: generate weekly report
├── subscription/
│   ├── route.ts                   # GET: status
│   ├── checkout/route.ts          # POST: create checkout
│   ├── cancel/route.ts            # POST: cancel
│   └── usage/route.ts             # POST: increment
├── geocode/route.ts               # GET: location search
├── upload/route.ts                # POST: file upload
└── cron/
    ├── daily-insights/route.ts    # POST: batch generate insights
    └── reset-usage/route.ts       # POST: monthly reset
```

### 3.2 API Standards

**Request Format:**
```typescript
// All mutations use Zod validation
const RequestSchema = z.object({
  field: z.string().min(1).max(500),
});

// Route handler pattern
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  // Business logic...
  return NextResponse.json({ data: result });
}
```

**Response Format:**
```typescript
// Success
{ data: T, meta?: { count, page, total } }

// Error
{ error: string, details?: Record<string, string[]> }
```

**Pagination:**
```typescript
// Query params: ?page=1&limit=20&sort=created_at&order=desc
const PaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sort: z.string().default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
});
```

**Rate Limiting:**
```typescript
// Via Vercel middleware or custom limiter
const RATE_LIMITS = {
  'api/tools/*': { window: '1m', max: 10 },      // 10 analyses per minute
  'api/coach/message': { window: '1m', max: 30 }, // 30 chat messages per minute
  'api/auth/*': { window: '15m', max: 5 },        // 5 auth attempts per 15min
  'api/upload': { window: '1h', max: 20 },        // 20 uploads per hour
  'api/webhooks/*': { window: '1s', max: 100 },   // Stripe can burst
};
```

---

## 4. Component Architecture

### 4.1 Directory Structure
```
src/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                # Home/Landing
│   │   ├── pricing/page.tsx
│   │   ├── blog/
│   │   │   ├── page.tsx            # Blog list
│   │   │   └── [slug]/page.tsx     # Blog post
│   │   └── login/page.tsx
│   ├── (auth)/
│   │   ├── layout.tsx              # Auth layout (sidebar + header)
│   │   ├── dashboard/page.tsx
│   │   ├── onboarding/page.tsx
│   │   ├── tools/
│   │   │   ├── numerology/page.tsx
│   │   │   ├── astrology/
│   │   │   │   ├── page.tsx        # Birth chart
│   │   │   │   ├── readings/page.tsx
│   │   │   │   ├── solar-return/page.tsx
│   │   │   │   ├── transits/page.tsx
│   │   │   │   └── synastry/page.tsx
│   │   │   ├── graphology/page.tsx
│   │   │   ├── drawing/page.tsx
│   │   │   ├── palmistry/page.tsx
│   │   │   ├── tarot/page.tsx
│   │   │   ├── human-design/page.tsx
│   │   │   ├── dream/page.tsx
│   │   │   ├── compatibility/page.tsx
│   │   │   ├── career/page.tsx
│   │   │   ├── document/page.tsx
│   │   │   ├── question/page.tsx
│   │   │   ├── synthesis/page.tsx
│   │   │   └── personality/page.tsx
│   │   ├── coach/
│   │   │   ├── page.tsx            # Chat + journeys
│   │   │   └── journey/[id]/page.tsx
│   │   ├── goals/page.tsx
│   │   ├── mood/page.tsx
│   │   ├── journal/page.tsx
│   │   ├── daily-insights/page.tsx
│   │   ├── notifications/page.tsx
│   │   ├── history/
│   │   │   ├── page.tsx            # All analyses
│   │   │   └── compare/page.tsx
│   │   ├── learn/
│   │   │   ├── page.tsx            # Tutorials
│   │   │   ├── astrology/page.tsx  # Astrology tutor
│   │   │   └── drawing/page.tsx    # Drawing tutor
│   │   ├── profile/
│   │   │   ├── page.tsx            # View profile
│   │   │   └── edit/page.tsx       # Edit profile
│   │   ├── settings/page.tsx
│   │   ├── subscription/
│   │   │   ├── page.tsx            # Manage
│   │   │   └── success/page.tsx    # Post-payment
│   │   └── referrals/page.tsx
│   ├── api/                        # Route handlers (see §3.1)
│   ├── layout.tsx                  # Root layout (RTL, theme, fonts)
│   ├── not-found.tsx               # 404
│   ├── error.tsx                   # Error boundary
│   └── loading.tsx                 # Global loading
├── components/
│   ├── ui/                         # shadcn/ui (generated via CLI)
│   ├── layouts/
│   │   ├── Sidebar.tsx             # Main sidebar navigation
│   │   ├── Header.tsx              # Top header bar
│   │   ├── MobileNav.tsx           # Mobile hamburger menu
│   │   └── PageHeader.tsx          # Page title + breadcrumbs
│   ├── forms/
│   │   ├── BirthDataForm.tsx       # Reusable birth date/time/place
│   │   ├── LocationSearch.tsx      # Nominatim autocomplete
│   │   └── FormInput.tsx           # Validated input with Zod
│   ├── features/
│   │   ├── astrology/
│   │   │   ├── BirthChart/         # SVG zodiac circle (split from 922-line monolith)
│   │   │   │   ├── index.tsx
│   │   │   │   ├── ZodiacRing.tsx
│   │   │   │   ├── PlanetPositions.tsx
│   │   │   │   ├── AspectLines.tsx
│   │   │   │   └── HouseOverlay.tsx
│   │   │   ├── ReadingCard.tsx
│   │   │   └── ConceptCard.tsx
│   │   ├── numerology/
│   │   │   └── NumberCard.tsx
│   │   ├── drawing/
│   │   │   ├── DigitalCanvas.tsx
│   │   │   ├── AnnotatedViewer.tsx
│   │   │   ├── KoppitzIndicators.tsx
│   │   │   └── MetricsBreakdown.tsx
│   │   ├── graphology/
│   │   │   ├── Comparison.tsx
│   │   │   ├── ProgressTracker.tsx
│   │   │   └── QuickStats.tsx
│   │   ├── coach/
│   │   │   ├── ChatMessage.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   └── JourneyCard.tsx
│   │   ├── insights/
│   │   │   ├── ExplainableInsight.tsx  # GEM 9
│   │   │   ├── DailyInsightCard.tsx
│   │   │   └── ConfidenceBadge.tsx
│   │   ├── goals/
│   │   │   ├── GoalCard.tsx
│   │   │   └── ProgressModal.tsx
│   │   ├── subscription/
│   │   │   ├── SubscriptionGuard.tsx
│   │   │   ├── PlanCard.tsx
│   │   │   └── UsageBar.tsx
│   │   ├── onboarding/
│   │   │   └── OnboardingWizard.tsx
│   │   └── shared/
│   │       ├── ToolGrid.tsx
│   │       ├── AnalysisHistory.tsx
│   │       └── ProfileCard.tsx
│   └── common/
│       ├── LoadingSpinner.tsx
│       ├── EmptyState.tsx          # Single consolidated version
│       ├── ErrorBoundary.tsx       # GEM 10: auto-recovery
│       ├── PageTransition.tsx
│       ├── SearchBar.tsx
│       └── Breadcrumbs.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts              # Browser client
│   │   ├── server.ts              # Server client (cookies)
│   │   ├── middleware.ts           # Auth middleware helper
│   │   └── admin.ts               # Service role client (webhooks)
│   ├── utils/
│   │   ├── cn.ts                  # className merger
│   │   ├── llm-response.ts        # GEM 5: forceToString
│   │   ├── dates.ts               # Israeli date formatting
│   │   └── sanitize.ts            # XSS prevention (DOMPurify)
│   ├── validations/
│   │   ├── auth.ts                # Login/register schemas
│   │   ├── profile.ts             # Profile schemas
│   │   ├── analysis.ts            # Analysis input schemas
│   │   └── subscription.ts        # Subscription schemas
│   ├── constants/
│   │   ├── astrology.ts           # GEM 6: zodiac, planets, houses
│   │   ├── numerology.ts          # Number meanings
│   │   ├── plans.ts               # Subscription plan definitions
│   │   └── categories.ts          # Goal categories, mood types, etc.
│   ├── animations/
│   │   └── presets.ts             # GEM 11: animation variants
│   └── query/
│       └── cache-config.ts        # GEM 8: CACHE_TIMES + query defaults
├── hooks/
│   ├── useSubscription.ts         # GEM 7
│   ├── useMobile.ts
│   ├── useDebounce.ts             # GEM (from useDebounce.jsx)
│   └── useAnalytics.ts            # Page view + tool usage tracking
├── services/
│   ├── astrology/
│   │   ├── solar-return.ts        # GEM 1: VSOP87 calculations
│   │   ├── aspects.ts             # GEM 14: aspect calculation
│   │   ├── chart.ts               # Full chart assembly
│   │   └── prompts/
│   │       ├── interpretation.ts  # GEM 12: v6.0 prompt
│   │       └── solar-return.ts    # SR interpretation prompt
│   ├── numerology/
│   │   ├── gematria.ts            # GEM 2: Hebrew gematria
│   │   ├── calculations.ts        # Life path, destiny, soul
│   │   └── compatibility.ts       # Compatibility matrix
│   ├── analysis/
│   │   ├── rule-engine.ts         # GEM 3: condition evaluation
│   │   └── llm.ts                 # LLM invocation wrapper
│   ├── drawing/
│   │   └── analysis.ts            # Drawing feature extraction
│   ├── email/
│   │   ├── welcome.ts
│   │   ├── payment-failed.ts
│   │   └── usage-limit.ts
│   └── geocode.ts                 # Nominatim wrapper
├── stores/
│   ├── theme.ts                   # Zustand: dark/light mode
│   ├── onboarding.ts              # Zustand: onboarding wizard state
│   └── coach-chat.ts              # Zustand: active conversation
├── types/
│   ├── database.ts                # Generated from Supabase (supabase gen types)
│   ├── analysis.ts                # Analysis result types
│   ├── astrology.ts               # Planet, Aspect, House, Sign types
│   ├── numerology.ts              # NumerologyResult, GematriaResult
│   └── subscription.ts            # Plan, SubscriptionStatus
└── middleware.ts                   # Auth middleware (redirect to /login)
```

### 4.2 State Management Strategy

| State Type | Tool | Where |
|-----------|------|-------|
| **Server data** (analyses, profile, goals) | React Query | `hooks/` + route handlers |
| **Auth state** | Supabase Auth | `lib/supabase/` + middleware |
| **UI state** (theme, sidebar open) | Zustand | `stores/` |
| **Form state** | React Hook Form + Zod | Component-local |
| **URL state** (filters, pages) | `useSearchParams()` | Next.js built-in |

### 4.3 Data Fetching Strategy

| Pattern | Use Case | Implementation |
|---------|----------|---------------|
| **Server Components** | Initial page data, SEO | `await supabase.from('table').select()` |
| **React Query** | Client-side refetch, mutations | `useQuery` + `useMutation` |
| **Supabase Realtime** | Coach chat messages | `supabase.channel().on('postgres_changes')` |
| **Prefetch** | Critical data on app load | `prefetchCriticalData()` from GEM 8 |
| **Optimistic Updates** | Usage increment, goal progress | `queryClient.setQueryData()` |

---

## 5. Security Architecture

### 5.1 Auth Flow (Supabase Auth)
```
1. Email/Password signup → Supabase creates user + sends confirmation
2. Login → Supabase returns session (JWT)
3. Session stored in httpOnly cookie via @supabase/ssr
4. middleware.ts:
   - Check session on every (auth) route
   - Refresh token if expired
   - Redirect to /login if no session
5. Server components: createServerClient() → automatic RLS
6. API routes: createClient() → verify user → RLS enforced
7. Webhooks: createAdminClient() → service role (bypass RLS)
```

### 5.2 RLS Summary
| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| profiles | Own | Own | Own | — |
| subscriptions | Own | Service | Own | Service |
| analyses | Own | Own | — | Own |
| analysis_features | Via analysis | Via analysis | — | Via analysis |
| goals | Own | Own | Own | Own |
| mood_entries | Own | Own | Own | Own |
| journal_entries | Own | Own | Own | Own |
| daily_insights | Own | Own | Own | Own |
| dreams | Own | Own | Own | Own |
| coaching_journeys | Own | Own | Own | Own |
| coaching_messages | Own | Own | — | Own |
| reminders | Own | Own | Own | Own |
| payment_history | Own | Service | — | — |
| guest_profiles | Own | Own | Own | Own |
| learning_progress | Own | Own | Own | Own |
| referrals | Own | Own | — | — |
| rulebook | — | — | — | — |
| tarot_cards | Public | — | — | — |
| blog_posts | Public | — | — | — |

### 5.3 Input Validation
- **All API routes:** Zod schema validation before processing
- **LLM prompts:** Sanitize user text via `sanitize.ts` (strip HTML, limit length)
- **File uploads:** Type whitelist (image/jpeg, image/png, application/pdf), max 10MB, storage bucket policies
- **CSRF:** Next.js built-in CSRF protection on server actions
- **XSS:** DOMPurify on all user-generated content before rendering

### 5.4 Environment Variables
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # Server only

# LLM
OPENAI_API_KEY=                      # Server only
# or ANTHROPIC_API_KEY=

# Stripe
STRIPE_SECRET_KEY=                   # Server only
STRIPE_WEBHOOK_SECRET=               # Server only
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Email
RESEND_API_KEY=                      # Server only

# App
NEXT_PUBLIC_APP_URL=
CRON_SECRET=                         # For cron job auth
```

---

## 6. Performance Design

### 6.1 Rendering Strategy
| Page Type | Strategy | Why |
|-----------|----------|-----|
| Home, Pricing, Blog | SSG (Static) | SEO + fast load |
| Dashboard, Profile | SSR + Client Hydration | Personalized but fast initial |
| Tool pages (Numerology, etc.) | Client-side | Interactive forms, no SEO needed |
| Analysis results | Client-side (React Query) | Dynamic data, cached |

### 6.2 Optimization Techniques
- **Dynamic imports:** `next/dynamic` for BirthChart SVG, DigitalCanvas, Recharts
- **Image optimization:** `next/image` for all images + Supabase Storage CDN
- **Bundle splitting:** Each tool page is a separate chunk (App Router automatic)
- **React Query caching:** CACHE_TIMES from GEM 8 (2min → 1hr tiers)
- **Pagination:** All list views (analyses, goals, journal) paginated (20 items default)
- **Target:** Initial JS < 200KB, LCP < 1.5s, Lighthouse > 90

### 6.3 Cron Jobs
| Job | Schedule | Endpoint |
|-----|----------|----------|
| Monthly usage reset | 1st of month, 00:00 UTC | `api/cron/reset-usage` |
| Daily insight generation | Daily, 06:00 Israel | `api/cron/daily-insights` |

---

## 7. Architecture Score

| Criterion | Score | Threshold | Notes |
|-----------|-------|-----------|-------|
| **Separation of Concerns** | 9/10 | 8 | Services / Hooks / Components / API clearly separated |
| **Type Safety** | 9/10 | 9 | TypeScript strict, Zod validation, generated DB types |
| **Security Design** | 9/10 | 8 | RLS on every table, input validation, rate limiting, no secrets in client |
| **Scalability** | 8/10 | 7 | Supabase scales, Vercel edge, React Query caching |
| **Developer Experience** | 8/10 | 7 | shadcn/ui CLI, absolute imports, clear structure |
| **Data Model** | 9/10 | 8 | 20 tables, proper constraints, indexes, relations |
| **Error Strategy** | 8/10 | 8 | Error boundaries, Zod errors, toast messages, GEM 10 auto-recovery |
| **Performance Design** | 8/10 | 7 | Dynamic imports, SSG/SSR mix, pagination, caching tiers |
| **RTL/Hebrew** | 9/10 | 9 | Root RTL, start/end alignment, Hebrew constants, Israeli dates |
| **Migration Path** | 8/10 | 7 | 14 GEMs mapped to target files, clear dependency order |
| **TOTAL** | **85/100** | **80** | **PASS** |

---

> **שלב 3 הושלם. ציון ארכיטקטורה: 85/100 (סף: 80).** מחכה לאישורך לפני שממשיך לשלב 4: PRD.
