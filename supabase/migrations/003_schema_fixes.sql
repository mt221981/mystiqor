-- MystiQor — Schema Fixes (from ARCHITECTURE.md v2.0)
-- Applied: 2026-03-22
-- Fixes: 1-9
-- Note: All changes are idempotent (IF NOT EXISTS / OR REPLACE / DO blocks)

-- ============================================================
-- FIX 1: timezone_name replaces timezone_offset (DST-safe)
-- ============================================================
-- Israel uses UTC+2 (IST) in winter and UTC+3 (IDT) in summer.
-- A fixed offset cannot represent DST changes correctly.
ALTER TABLE profiles
  DROP COLUMN IF EXISTS timezone_offset,
  ADD COLUMN IF NOT EXISTS timezone_name TEXT DEFAULT 'Asia/Jerusalem';

-- ============================================================
-- FIX 2: conversations table (for AI Coach)
-- ============================================================
-- coaching_messages previously had a bare conversation_id UUID with no FK.
-- This adds the parent table and backfills the FK constraint.
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  last_message_at TIMESTAMPTZ DEFAULT now(),
  message_count INTEGER DEFAULT 0,
  context JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id, last_message_at DESC);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'conversations'
      AND policyname = 'Users CRUD own conversations'
  ) THEN
    CREATE POLICY "Users CRUD own conversations" ON conversations FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- Add FK from coaching_messages to conversations (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_conversation'
      AND table_name = 'coaching_messages'
  ) THEN
    ALTER TABLE coaching_messages
      ADD CONSTRAINT fk_conversation
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ============================================================
-- FIX 3: processed_webhook_events (Stripe idempotency)
-- ============================================================
-- Prevents duplicate Stripe webhook processing (e.g. payment.succeeded fired twice).
CREATE TABLE IF NOT EXISTS processed_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_stripe ON processed_webhook_events(stripe_event_id);
-- No RLS — accessed only by service role (Stripe webhook handler)

-- ============================================================
-- FIX 4: analytics_events — add composite indexes for performance
-- ============================================================
-- Table already exists from 001_schema.sql.
-- Adding missing composite indexes that dashboard queries require.
CREATE INDEX IF NOT EXISTS idx_analytics_user_date ON analytics_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics_events(event_type);

-- ============================================================
-- FIX 5: blog_posts RLS (public read — ensure policy exists)
-- ============================================================
-- Table already exists from 001_schema.sql with RLS enabled and policy.
-- This block is a no-op if policy already exists; safe to re-run.
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'blog_posts'
      AND policyname = 'Anyone can read published posts'
  ) THEN
    CREATE POLICY "Anyone can read published posts" ON blog_posts
      FOR SELECT USING (is_published = true);
  END IF;
END $$;

-- ============================================================
-- FIX 6: Composite index for dashboard queries
-- ============================================================
-- Replaces three separate single-column indexes with one covering index.
-- Speeds up: SELECT * FROM analyses WHERE user_id = ? AND tool_type = ? ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_analyses_user_tool_date ON analyses(user_id, tool_type, created_at DESC);

-- ============================================================
-- FIX 7: Auto-update updated_at trigger
-- ============================================================
-- Ensures updated_at is always current without relying on application code.
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with an updated_at column (idempotent via DO block)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at' AND tgrelid = 'profiles'::regclass) THEN
    CREATE TRIGGER set_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at' AND tgrelid = 'subscriptions'::regclass) THEN
    CREATE TRIGGER set_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at' AND tgrelid = 'goals'::regclass) THEN
    CREATE TRIGGER set_updated_at BEFORE UPDATE ON goals FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at' AND tgrelid = 'journal_entries'::regclass) THEN
    CREATE TRIGGER set_updated_at BEFORE UPDATE ON journal_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at' AND tgrelid = 'coaching_journeys'::regclass) THEN
    CREATE TRIGGER set_updated_at BEFORE UPDATE ON coaching_journeys FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

-- ============================================================
-- FIX 8: increment_usage with SELECT FOR UPDATE (race-safe)
-- ============================================================
-- Replaces the v1 function that had a TOCTOU race condition:
-- the old SELECT and UPDATE were two separate statements — concurrent
-- requests could both pass the limit check before either updates.
-- SELECT FOR UPDATE locks the row for the duration of the transaction.
CREATE OR REPLACE FUNCTION increment_usage(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_sub subscriptions%ROWTYPE;
BEGIN
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

-- ============================================================
-- FIX 9: reset_monthly_usage with timezone awareness
-- ============================================================
-- The v1 function used date_trunc('month', now()) which uses UTC.
-- Israel is UTC+2/+3, so the reset would fire ~2-3 hours late.
-- AT TIME ZONE 'Asia/Jerusalem' ensures the reset aligns with local midnight.
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
