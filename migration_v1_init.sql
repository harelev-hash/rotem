-- ============================================================
-- Rotem – Hebrew Reading App
-- Migration v1: Initial schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- ── users ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for now" ON users FOR ALL USING (true) WITH CHECK (true);

-- ── vowel_progress ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vowel_progress (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vowel_name     TEXT NOT NULL,   -- patah | kamatz | hiriq | tzere | holam | shuruk | shva
  vowel_symbol   TEXT NOT NULL,   -- actual Hebrew diacritic character
  is_active      BOOLEAN NOT NULL DEFAULT true,
  mastery_score  INTEGER NOT NULL DEFAULT 0 CHECK (mastery_score BETWEEN 0 AND 100),
  last_practiced TIMESTAMPTZ
);

ALTER TABLE vowel_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for now" ON vowel_progress FOR ALL USING (true) WITH CHECK (true);

-- ── known_words ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS known_words (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  word       TEXT NOT NULL,
  times_seen INTEGER NOT NULL DEFAULT 1,
  UNIQUE(user_id, word)
);

ALTER TABLE known_words ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for now" ON known_words FOR ALL USING (true) WITH CHECK (true);

-- ── stories ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stories (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic          TEXT NOT NULL,
  topic_emoji    TEXT NOT NULL DEFAULT '',
  sentences_json JSONB NOT NULL DEFAULT '[]',
  completed      BOOLEAN NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for now" ON stories FOR ALL USING (true) WITH CHECK (true);

-- ── session_ratings ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS session_ratings (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id   UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  rating     INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 4),
  notes      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE session_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for now" ON session_ratings FOR ALL USING (true) WITH CHECK (true);

-- ── RPC: upsert_known_word ────────────────────────────────────
CREATE OR REPLACE FUNCTION upsert_known_word(p_user_id UUID, p_word TEXT)
RETURNS void LANGUAGE sql AS $$
  INSERT INTO known_words (user_id, word, times_seen)
  VALUES (p_user_id, p_word, 1)
  ON CONFLICT (user_id, word)
  DO UPDATE SET times_seen = known_words.times_seen + 1;
$$;

-- ── Seed: default user + vowels ──────────────────────────────
-- Replace the UUID below with your actual user UUID, or generate a new one.
-- After running, copy the user id into NEXT_PUBLIC_DEFAULT_USER_ID in .env.local

DO $$
DECLARE
  v_user_id UUID := gen_random_uuid();
BEGIN
  INSERT INTO users (id, name) VALUES (v_user_id, 'רותם');

  INSERT INTO vowel_progress (user_id, vowel_name, vowel_symbol, is_active, mastery_score) VALUES
    (v_user_id, 'patah',  E'\u05B7', true,  50),
    (v_user_id, 'kamatz', E'\u05B8', true,  40),
    (v_user_id, 'hiriq',  E'\u05B4', false, 20),
    (v_user_id, 'tzere',  E'\u05B5', false, 10),
    (v_user_id, 'holam',  E'\u05B9', false, 10),
    (v_user_id, 'shuruk', E'\u05BC', false,  0),
    (v_user_id, 'shva',   E'\u05B0', false,  0);

  RAISE NOTICE 'Created user with id: %', v_user_id;
  RAISE NOTICE 'Copy this id to NEXT_PUBLIC_DEFAULT_USER_ID in .env.local';
END $$;
