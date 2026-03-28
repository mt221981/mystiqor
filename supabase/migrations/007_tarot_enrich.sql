-- 007: Phase 18 — הוספת עמודות מטא-דאטה עשירה לטבלת tarot_cards
-- Per D-02: element, astrology, kabbalah, archetype, upright_keywords, reversed_keywords, numerology_value
-- RLS: קיים "Public read tarot cards" FOR SELECT USING (true) — מכסה עמודות חדשות אוטומטית

ALTER TABLE tarot_cards
  ADD COLUMN IF NOT EXISTS element TEXT,
  ADD COLUMN IF NOT EXISTS astrology TEXT,
  ADD COLUMN IF NOT EXISTS kabbalah TEXT,
  ADD COLUMN IF NOT EXISTS archetype TEXT,
  ADD COLUMN IF NOT EXISTS upright_keywords TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS reversed_keywords TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS numerology_value INTEGER;
