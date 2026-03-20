-- MystiQor — Initial Schema
-- Generated: 2026-03-20
-- Tables: 20
-- Apply with: supabase db push OR psql -f this file

-- ============================================================
-- 1. profiles — פרופילי משתמשים
-- ============================================================
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

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================
-- 2. subscriptions — מנויים
-- ============================================================
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

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own subscription" ON subscriptions FOR UPDATE USING (auth.uid() = user_id);
-- Insert/delete only via server (service role) for Stripe webhook

-- ============================================================
-- 3. analyses — ניתוחים
-- ============================================================
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

ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own analyses" ON analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own analyses" ON analyses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own analyses" ON analyses FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- 4. analysis_features — תכונות ניתוח
-- ============================================================
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

ALTER TABLE analysis_features ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own features" ON analysis_features FOR SELECT
  USING (EXISTS (SELECT 1 FROM analyses WHERE analyses.id = analysis_features.analysis_id AND analyses.user_id = auth.uid()));
CREATE POLICY "Users can insert own features" ON analysis_features FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM analyses WHERE analyses.id = analysis_features.analysis_id AND analyses.user_id = auth.uid()));

-- ============================================================
-- 5. goals — מטרות
-- ============================================================
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

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users CRUD own goals" ON goals FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- 6. mood_entries — רשומות מצב רוח
-- ============================================================
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

-- ============================================================
-- 7. journal_entries — רשומות יומן
-- ============================================================
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

-- ============================================================
-- 8. daily_insights — תובנות יומיות
-- ============================================================
CREATE TABLE daily_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  actionable_tip TEXT,
  mood_type TEXT CHECK (mood_type IN ('inspiring', 'reflective', 'empowering', 'cautionary', 'celebratory')),
  focus_area TEXT,
  confidence NUMERIC(4,3),
  tarot JSONB,
  data_sources JSONB,
  recurring_themes JSONB DEFAULT '[]',
  user_feedback JSONB,
  insight_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_insights_user_date ON daily_insights(user_id, insight_date DESC);

ALTER TABLE daily_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users CRUD own insights" ON daily_insights FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- 9. dreams — חלומות
-- ============================================================
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

-- ============================================================
-- 10. coaching_journeys — מסעות אימון
-- ============================================================
CREATE TABLE coaching_journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  focus_area TEXT,
  journey_type TEXT DEFAULT 'daily' CHECK (journey_type IN ('daily', 'weekly', 'custom')),
  steps JSONB NOT NULL DEFAULT '[]',
  tags TEXT[] DEFAULT '{}',
  ai_insights TEXT,
  linked_goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE coaching_journeys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users CRUD own journeys" ON coaching_journeys FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- 11. coaching_messages — הודעות אימון
-- ============================================================
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

-- ============================================================
-- 12. reminders — תזכורות
-- ============================================================
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  scheduled_date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'dismissed')),
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users CRUD own reminders" ON reminders FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- 13. payment_history — היסטוריית תשלומים
-- ============================================================
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

-- ============================================================
-- 14. guest_profiles — פרופילי אורחים
-- ============================================================
CREATE TABLE guest_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  birth_time TIME,
  birth_place TEXT,
  relationship TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE guest_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users CRUD own guests" ON guest_profiles FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- 15. learning_progress — התקדמות למידה
-- ============================================================
CREATE TABLE learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  discipline TEXT NOT NULL,
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

-- ============================================================
-- 16. referrals — הפניות
-- ============================================================
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

-- ============================================================
-- 17. analytics_events — אירועי אנליטיקס
-- ============================================================
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  page_url TEXT,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users insert own events" ON analytics_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users view own events" ON analytics_events FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- 18. rulebook — ספר כללים (system table)
-- ============================================================
CREATE TABLE rulebook (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_type TEXT NOT NULL,
  rule_id TEXT NOT NULL UNIQUE,
  condition JSONB NOT NULL,
  insight_template JSONB NOT NULL,
  weight NUMERIC(3,2) DEFAULT 1.0,
  base_confidence NUMERIC(3,2) DEFAULT 0.9,
  sources TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- System table — no RLS, service role manages content
ALTER TABLE rulebook ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read rulebook" ON rulebook FOR SELECT USING (true);

-- ============================================================
-- 19. tarot_cards — קלפי טארוט (system table)
-- ============================================================
CREATE TABLE tarot_cards (
  id SERIAL PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_he TEXT NOT NULL,
  arcana TEXT NOT NULL CHECK (arcana IN ('major', 'minor')),
  suit TEXT,
  number INTEGER,
  meaning_upright TEXT NOT NULL,
  meaning_reversed TEXT NOT NULL,
  keywords TEXT[] DEFAULT '{}',
  image_url TEXT
);

-- Public read — reference data
ALTER TABLE tarot_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read tarot cards" ON tarot_cards FOR SELECT USING (true);

-- ============================================================
-- 20. blog_posts — פוסטים בבלוג (system table)
-- ============================================================
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

-- Public read — marketing/educational content
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published posts" ON blog_posts FOR SELECT USING (is_published = true);
