-- MystiQor — Phase 7 Schema Fixes
-- Applied: 2026-03-24
-- Adds missing progress columns to coaching_journeys

-- ============================================================
-- FIX 1: Add progress_percentage column to coaching_journeys
-- BASE44 source uses this field but 001_schema.sql did not define it
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'coaching_journeys' AND column_name = 'progress_percentage'
  ) THEN
    ALTER TABLE coaching_journeys ADD COLUMN progress_percentage INTEGER DEFAULT 0;
  END IF;
END $$;

-- ============================================================
-- FIX 2: Add completed_steps column to coaching_journeys
-- BASE44 source uses this field but 001_schema.sql did not define it
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'coaching_journeys' AND column_name = 'completed_steps'
  ) THEN
    ALTER TABLE coaching_journeys ADD COLUMN completed_steps INTEGER DEFAULT 0;
  END IF;
END $$;
