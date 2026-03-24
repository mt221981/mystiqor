-- Phase 10: Add share_token and is_public to analyses for social sharing (EXPO-02)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analyses' AND column_name = 'share_token'
  ) THEN
    ALTER TABLE analyses ADD COLUMN share_token UUID DEFAULT gen_random_uuid();
    ALTER TABLE analyses ADD COLUMN is_public BOOLEAN DEFAULT FALSE NOT NULL;
    CREATE UNIQUE INDEX IF NOT EXISTS analyses_share_token_idx ON analyses(share_token);
  END IF;
END $$;

-- RLS: allow public read of shared analyses (both token match AND is_public required)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'analyses' AND policyname = 'analyses_public_share_read'
  ) THEN
    CREATE POLICY analyses_public_share_read ON analyses
      FOR SELECT USING (is_public = true);
  END IF;
END $$;
