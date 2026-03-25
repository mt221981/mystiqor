-- 006: Fix daily_insights mood_type CHECK constraint
-- Problem: constraint only allows 5 values but code inserts 'daily', 'forecast', 'calendar'
-- This caused 500 errors on forecast/calendar/daily-insights API routes

ALTER TABLE daily_insights DROP CONSTRAINT IF EXISTS daily_insights_mood_type_check;
ALTER TABLE daily_insights ADD CONSTRAINT daily_insights_mood_type_check
  CHECK (mood_type IN ('inspiring', 'reflective', 'empowering', 'cautionary', 'celebratory', 'daily', 'forecast', 'calendar'));
