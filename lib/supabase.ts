import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ── Types ────────────────────────────────────────────────────────────────────

export interface VowelProgress {
  id: string;
  user_id: string;
  vowel_name: string;
  vowel_symbol: string;
  is_active: boolean;
  mastery_score: number;
  last_practiced: string | null;
}

export interface KnownWord {
  id: string;
  user_id: string;
  word: string;
  times_seen: number;
}

export interface Story {
  id: string;
  user_id: string;
  topic: string;
  topic_emoji: string;
  sentences_json: SentenceItem[];
  completed: boolean;
  created_at: string;
}

export interface SentenceItem {
  sentence: string;
  new_word: string;
  image_description: string;
}

export interface SessionRating {
  id: string;
  story_id: string;
  rating: 1 | 2 | 3 | 4;
  notes: string | null;
  created_at: string;
}

export interface VocabularyWord {
  id: string;
  user_id: string;
  word: string;
  added_at: string;
}

export interface AppUser {
  id: string;
  name: string;
  created_at: string;
}

// ── Default user helper ───────────────────────────────────────────────────────
// For now we use a single default user (no auth).
export const DEFAULT_USER_ID = process.env.NEXT_PUBLIC_DEFAULT_USER_ID ?? '';
