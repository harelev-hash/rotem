'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase, DEFAULT_USER_ID } from '@/lib/supabase';

const STARS = ['⭐', '🌟', '✨', '💫', '⭐', '🌟', '✨', '💫'];

interface Props {
  storyId: string;
  words: string[];
}

export default function CompleteClient({ storyId, words }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [phase, setPhase] = useState<'picker' | 'celebrate'>('picker');
  const [saving, setSaving] = useState(false);
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    if (phase === 'celebrate') {
      const t = setTimeout(() => setCelebrating(true), 100);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const toggle = (word: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(word)) next.delete(word);
      else next.add(word);
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    if (selected.size > 0) {
      await Promise.all(
        [...selected].map(word =>
          supabase
            .from('vocabulary_words')
            .upsert({ user_id: DEFAULT_USER_ID, word }, { onConflict: 'user_id,word' })
        )
      );
    }
    setSaving(false);
    setPhase('celebrate');
  };

  if (phase === 'picker') {
    return (
      <main className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex flex-col items-center px-6 py-10 fade-in">
        <div className="text-5xl mb-4">💎</div>
        <h1 className="text-3xl font-extrabold text-purple-800 mb-2 text-center">אילו מילים רכשנו?</h1>
        <p className="text-slate-500 text-sm mb-8 text-center">
          סמני את המילים שרותם כבר מכירה היטב
        </p>

        <div className="flex flex-wrap justify-center gap-3 max-w-md mb-10">
          {words.map(word => (
            <button
              key={word}
              onClick={() => toggle(word)}
              className={`
                text-xl font-bold px-5 py-3 rounded-2xl border-2 transition-all duration-150
                ${selected.has(word)
                  ? 'bg-purple-600 border-purple-600 text-white shadow-md scale-105'
                  : 'bg-white border-purple-200 text-purple-800 hover:border-purple-400'}
              `}
            >
              {word}
            </button>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xl rounded-2xl px-10 py-4 shadow-lg transition-all active:scale-95 disabled:opacity-60"
        >
          {saving ? 'שומר...' : 'המשך לחגיגה →'}
        </button>

        {selected.size === 0 && (
          <p className="text-slate-400 text-xs mt-3">אפשר גם להמשיך בלי לסמן</p>
        )}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-yellow-50 to-orange-50 flex flex-col items-center justify-center px-6 text-center fade-in">
      {/* Floating stars */}
      <div className="relative h-32 w-full mb-4 overflow-hidden" aria-hidden>
        {celebrating && STARS.map((s, i) => (
          <span
            key={i}
            className="celebrate-star absolute text-3xl"
            style={{ left: `${10 + i * 10}%`, bottom: 0, animationDelay: `${i * 0.15}s` }}
          >
            {s}
          </span>
        ))}
      </div>

      <h1 className="text-4xl font-extrabold text-amber-600 mb-2">כל הכבוד!</h1>
      <p className="text-xl text-slate-600 mb-2">קראת את כל הסיפור!</p>
      {selected.size > 0 && (
        <p className="text-purple-600 font-semibold mb-2">
          ✨ {selected.size} מילים נוספו לאוצר המילים!
        </p>
      )}
      <div className="text-6xl my-6">🎉</div>

      <p className="text-slate-500 mb-2 text-sm">ההורה/המורה יכולים לדרג את הסשן</p>
      <Link
        href={`/parent/rating/${storyId}`}
        className="bg-amber-400 hover:bg-amber-500 text-white font-bold rounded-2xl px-6 py-3 text-lg shadow-md mb-4 inline-block transition-all active:scale-95"
      >
        דירוג הסשן
      </Link>

      <div className="flex gap-4 mt-2">
        <Link
          href="/"
          className="bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-2xl px-6 py-3 text-lg shadow-md transition-all active:scale-95"
        >
          סיפור חדש
        </Link>
        <Link
          href="/library"
          className="bg-white border-2 border-purple-200 text-purple-600 font-bold rounded-2xl px-6 py-3 text-lg shadow-md transition-all active:scale-95"
        >
          לספרייה
        </Link>
      </div>
    </main>
  );
}
