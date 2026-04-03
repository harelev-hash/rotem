'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase, DEFAULT_USER_ID } from '@/lib/supabase';

const RATINGS = [
  { value: 1, emoji: '😓', label: 'קשה' },
  { value: 2, emoji: '😐', label: 'סבבה' },
  { value: 3, emoji: '😊', label: 'טוב' },
  { value: 4, emoji: '🌟', label: 'מעולה' },
] as const;

export default function RatingPage() {
  const { storyId } = useParams<{ storyId: string }>();
  const router = useRouter();
  const [selected, setSelected] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!selected) return;
    setSaving(true);

    await supabase.from('session_ratings').insert({
      story_id: storyId,
      rating: selected,
      notes: notes || null,
    });

    // Adjust mastery scores based on rating
    // rating 4 = +5%, rating 3 = +2%, rating 2 = 0, rating 1 = -5%
    const delta = selected === 4 ? 5 : selected === 3 ? 2 : selected === 1 ? -5 : 0;
    if (delta !== 0) {
      const { data: vowels } = await supabase
        .from('vowel_progress')
        .select('id, mastery_score')
        .eq('user_id', DEFAULT_USER_ID)
        .eq('is_active', true);

      if (vowels) {
        for (const v of vowels) {
          await supabase
            .from('vowel_progress')
            .update({ mastery_score: Math.max(0, Math.min(100, v.mastery_score + delta)) })
            .eq('id', v.id);
        }
      }
    }

    router.push('/parent');
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col fade-in">
      <header className="bg-white border-b border-slate-100 px-4 py-4 flex items-center gap-3">
        <Link href="/parent" className="text-2xl text-slate-500" aria-label="חזרה">←</Link>
        <h1 className="text-xl font-extrabold text-slate-800">דירוג הסשן</h1>
      </header>

      <div className="max-w-md mx-auto px-4 pt-8 space-y-6">
        <p className="text-center text-slate-600 text-lg font-medium">איך הלכה הקריאה?</p>

        {/* Rating buttons */}
        <div className="grid grid-cols-2 gap-4">
          {RATINGS.map(r => (
            <button
              key={r.value}
              onClick={() => setSelected(r.value)}
              className={`
                flex flex-col items-center justify-center gap-2 rounded-2xl p-6
                border-2 transition-all duration-150 active:scale-95
                ${selected === r.value
                  ? 'border-blue-400 bg-blue-50 shadow-md'
                  : 'border-slate-200 bg-white hover:bg-slate-50'}
              `}
            >
              <span className="text-4xl">{r.emoji}</span>
              <span className={`font-bold ${selected === r.value ? 'text-blue-700' : 'text-slate-600'}`}>
                {r.label}
              </span>
            </button>
          ))}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">הערות (אופציונלי)</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            placeholder="מה היה קל? מה היה קשה?"
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
            dir="rtl"
          />
        </div>

        <button
          onClick={submit}
          disabled={!selected || saving}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 text-white font-bold rounded-2xl py-4 text-lg shadow-md transition-all active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-300"
        >
          {saving ? 'שומר...' : 'שמור דירוג'}
        </button>
      </div>
    </main>
  );
}
