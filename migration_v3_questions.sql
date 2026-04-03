-- ============================================================
-- Rotem – Hebrew Reading App
-- Migration v3: Add questions_json column to stories
-- Run this in Supabase SQL Editor
-- ============================================================

ALTER TABLE stories
  ADD COLUMN IF NOT EXISTS questions_json JSONB NOT NULL DEFAULT '[]';
