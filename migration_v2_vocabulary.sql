-- ============================================================
-- Rotem – Hebrew Reading App
-- Migration v2: Vocabulary words table
-- Run this in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS vocabulary_words (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  word     TEXT NOT NULL,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, word)
);

ALTER TABLE vocabulary_words ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for now" ON vocabulary_words FOR ALL USING (true) WITH CHECK (true);
