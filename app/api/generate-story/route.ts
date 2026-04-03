import { NextRequest, NextResponse } from 'next/server';
import { generateStory } from '@/lib/generateStory';
import { supabase, DEFAULT_USER_ID } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topic, topicHebrew, topicEmoji, customWord } = body as {
      topic: string;
      topicHebrew: string;
      topicEmoji: string;
      customWord?: string;
    };

    if (!topic || !topicHebrew) {
      return NextResponse.json({ error: 'Missing topic' }, { status: 400 });
    }

    // Fetch active vowels for the user
    const { data: vowels, error: vowelErr } = await supabase
      .from('vowel_progress')
      .select('*')
      .eq('user_id', DEFAULT_USER_ID)
      .eq('is_active', true);

    if (vowelErr) throw vowelErr;

    if (!vowels || vowels.length === 0) {
      return NextResponse.json(
        { error: 'אין תנועות פעילות. פתחי מצב הורה כדי להפעיל תנועות.' },
        { status: 400 }
      );
    }

    // Fetch known words for the user
    const { data: knownWordsRows } = await supabase
      .from('known_words')
      .select('word')
      .eq('user_id', DEFAULT_USER_ID)
      .order('times_seen', { ascending: false })
      .limit(30);

    const knownWords = (knownWordsRows ?? []).map((r: { word: string }) => r.word);

    // Generate story
    const { sentences, questions } = await generateStory(topic, topicHebrew, vowels, knownWords, customWord);

    // Save story to DB
    const { data: story, error: storyErr } = await supabase
      .from('stories')
      .insert({
        user_id: DEFAULT_USER_ID,
        topic: topicHebrew,
        topic_emoji: topicEmoji,
        sentences_json: sentences,
        questions_json: questions,
        completed: false,
      })
      .select()
      .single();

    if (storyErr) throw storyErr;

    // Track new words
    const newWords = sentences.map((s) => s.new_word);
    for (const word of newWords) {
      await supabase.rpc('upsert_known_word', {
        p_user_id: DEFAULT_USER_ID,
        p_word: word,
      });
    }

    return NextResponse.json({ storyId: story.id });
  } catch (err) {
    console.error('[generate-story]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'שגיאה ביצירת הסיפור' },
      { status: 500 }
    );
  }
}
