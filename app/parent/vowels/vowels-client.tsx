'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import VowelProgressBar from '@/components/VowelProgressBar';
import type { VowelProgress } from '@/lib/supabase';

const VOWEL_EXAMPLES: Record<string, string> = {
  patah:  'בַּיִת',
  kamatz: 'שָׁלוֹם',
  hiriq:  'דִּבּוּר',
  tzere:  'שֵׁם',
  holam:  'שׁוֹר',
  shuruk: 'שׁוּב',
  shva:   'בְּרָכָה',
};

interface Props {
  initialVowels: VowelProgress[];
}

export default function VowelsClient({ initialVowels }: Props) {
  const router = useRouter();
  const [vowels, setVowels] = useState<VowelProgress[]>(initialVowels);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggle = (id: string) => {
    setVowels(prev => prev.map(v => v.id === id ? { ...v, is_active: !v.is_active } : v));
  };

  const adjustScore = (id: string, delta: number) => {
    setVowels(prev => prev.map(v =>
      v.id === id
        ? { ...v, mastery_score: Math.max(0, Math.min(100, v.mastery_score + delta)) }
        : v
    ));
  };

  const save = async () => {
    setSaving(true);
    setSaved(false);
    for (const v of vowels) {
      await supabase
        .from('vowel_progress')
        .update({ is_active: v.is_active, mastery_score: v.mastery_score })
        .eq('id', v.id);
    }
    setSaving(false);
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-12 fade-in">
      <header className="bg-white border-b border-slate-100 px-4 py-4 flex items-center gap-3">
        <Link href="/parent" className="text-2xl text-slate-500 hover:text-slate-700" aria-label="חזרה">←</Link>
        <h1 className="text-xl font-extrabold text-slate-800">🔤 הגדרות תנועות</h1>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-6 space-y-4">
        {vowels.map(v => (
          <div
            key={v.id}
            className={`bg-white rounded-2xl p-5 shadow-sm border transition-all ${v.is_active ? 'border-blue-200' : 'border-slate-100 opacity-60'}`}
          >
            {/* Row 1: name + toggle */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="font-bold text-slate-700 text-base">{v.vowel_name}</span>
                <span className="mr-2 text-2xl">{v.vowel_symbol}</span>
                <span className="text-sm text-slate-400 mr-1">— {VOWEL_EXAMPLES[v.vowel_name] ?? ''}</span>
              </div>
              <button
                onClick={() => toggle(v.id)}
                className={`w-12 h-6 rounded-full transition-colors duration-200 relative flex-shrink-0 ${v.is_active ? 'bg-blue-500' : 'bg-slate-300'}`}
                aria-label={v.is_active ? 'כבה תנועה' : 'הפעל תנועה'}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${v.is_active ? 'right-0.5' : 'left-0.5'}`}
                />
              </button>
            </div>

            {/* Row 2: progress bar + score controls */}
            <VowelProgressBar score={v.mastery_score} />
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-slate-500">שליטה: {v.mastery_score}%</span>
              <div className="flex gap-2">
                <button
                  onClick={() => adjustScore(v.id, -10)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 font-bold text-slate-600 flex items-center justify-center text-lg active:scale-95"
                >−</button>
                <button
                  onClick={() => adjustScore(v.id, +10)}
                  className="w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-200 font-bold text-blue-600 flex items-center justify-center text-lg active:scale-95"
                >+</button>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={save}
          disabled={saving}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 text-white font-bold rounded-2xl py-4 text-lg shadow-md transition-all active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-300"
        >
          {saving ? 'שומר...' : saved ? '✓ נשמר!' : 'שמור שינויים'}
        </button>
      </div>
    </main>
  );
}
