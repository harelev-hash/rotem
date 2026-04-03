'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase, DEFAULT_USER_ID } from '@/lib/supabase';
import type { StoryQuestion, ComprehensionQuestion, FirstLetterQuestion } from '@/lib/supabase';

const STARS = ['⭐', '🌟', '✨', '💫', '⭐', '🌟', '✨', '💫'];

// Strip Hebrew niqqud (U+05B0–U+05C7)
const stripNiqqud = (s: string) => s.replace(/[\u05B0-\u05C7]/g, '');

interface Props {
  storyId: string;
  words: string[];
  questions: StoryQuestion[];
}

type Phase = 'question1' | 'question2' | 'picker' | 'celebrate';

export default function CompleteClient({ storyId, words, questions }: Props) {
  const q1 = questions.find(q => q.type === 'comprehension') as ComprehensionQuestion | undefined;
  const q2 = questions.find(q => q.type === 'first_letter') as FirstLetterQuestion | undefined;

  const firstPhase: Phase = q1 ? 'question1' : q2 ? 'question2' : 'picker';

  const [phase, setPhase] = useState<Phase>(firstPhase);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [celebrating, setCelebrating] = useState(false);

  // MCQ state
  const [mcqPicked, setMcqPicked] = useState<number | null>(null);

  // First-letter state
  const [letterInput, setLetterInput] = useState('');
  const [letterSubmitted, setLetterSubmitted] = useState(false);

  useEffect(() => {
    if (phase === 'celebrate') {
      const t = setTimeout(() => setCelebrating(true), 100);
      return () => clearTimeout(t);
    }
  }, [phase]);

  // ── MCQ handlers ────────────────────────────────────────────
  const handleMcqPick = (i: number) => {
    if (mcqPicked !== null) return;
    setMcqPicked(i);
    if (i === q1!.correct) {
      setTimeout(() => setPhase(q2 ? 'question2' : 'picker'), 1200);
    }
  };

  const mcqBtnClass = (i: number) => {
    if (mcqPicked === null) {
      return 'bg-white border-2 border-purple-200 text-purple-800 hover:border-purple-500 hover:bg-purple-50';
    }
    if (i === q1!.correct) return 'bg-green-100 border-2 border-green-400 text-green-800';
    if (i === mcqPicked) return 'bg-red-100 border-2 border-red-400 text-red-700';
    return 'bg-white border-2 border-slate-100 text-slate-300';
  };

  // ── First-letter handlers ───────────────────────────────────
  const handleLetterSubmit = () => {
    if (!letterInput.trim()) return;
    setLetterSubmitted(true);
  };

  const isLetterCorrect = () => {
    if (!q2) return false;
    return stripNiqqud(letterInput.trim())[0] === stripNiqqud(q2.answer.trim())[0];
  };

  // ── Word picker handler ─────────────────────────────────────
  const toggleWord = (word: string) => {
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

  // ── Phase: Comprehension MCQ ────────────────────────────────
  if (phase === 'question1' && q1) {
    const answered = mcqPicked !== null;
    const correct = answered && mcqPicked === q1.correct;

    return (
      <main className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex flex-col items-center px-6 py-10 fade-in">
        <div className="text-4xl mb-3">🤔</div>
        <p className="text-purple-400 text-sm font-medium mb-2">שאלת הבנה</p>
        <h1 className="text-2xl font-extrabold text-purple-900 mb-8 text-center max-w-md leading-snug">
          {q1.question}
        </h1>

        <div className="w-full max-w-md space-y-3">
          {q1.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleMcqPick(i)}
              disabled={answered}
              className={`w-full text-right text-lg font-semibold px-5 py-4 rounded-2xl transition-all duration-200 ${mcqBtnClass(i)}`}
            >
              {answered && i === q1.correct && <span className="ml-2">✓</span>}
              {answered && i === mcqPicked && i !== q1.correct && <span className="ml-2">✗</span>}
              {opt}
            </button>
          ))}
        </div>

        {answered && (
          <div className={`mt-6 text-lg font-bold ${correct ? 'text-green-600' : 'text-red-600'}`}>
            {correct ? '🎉 נכון מאוד!' : '💪 בפעם הבאה!'}
          </div>
        )}

        {answered && !correct && (
          <button
            onClick={() => setPhase(q2 ? 'question2' : 'picker')}
            className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl px-8 py-3 text-lg transition-all active:scale-95"
          >
            המשך →
          </button>
        )}
      </main>
    );
  }

  // ── Phase: First letter ────────────────────────────────────
  if (phase === 'question2' && q2) {
    const correct = isLetterCorrect();

    return (
      <main className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex flex-col items-center px-6 py-10 fade-in">
        <div className="text-4xl mb-3">✏️</div>
        <p className="text-purple-400 text-sm font-medium mb-2">שאלת אות ראשונה</p>
        <p className="text-xl font-bold text-slate-700 mb-4 text-center">
          מה האות שמתחילה בה המילה:
        </p>
        <div className="text-5xl font-extrabold text-purple-800 mb-8 tracking-wide">
          {q2.word}
        </div>

        {!letterSubmitted ? (
          <div className="flex flex-col items-center gap-4 w-full max-w-xs">
            <input
              type="text"
              value={letterInput}
              onChange={e => setLetterInput(e.target.value.slice(-1))}
              maxLength={1}
              lang="he"
              dir="rtl"
              placeholder="הקלידי אות"
              className="w-32 h-20 text-center text-4xl font-extrabold border-2 border-purple-300 rounded-2xl focus:outline-none focus:border-purple-600 text-purple-900"
              autoFocus
            />
            <button
              onClick={handleLetterSubmit}
              disabled={!letterInput.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xl rounded-2xl px-10 py-3 transition-all active:scale-95 disabled:opacity-40"
            >
              שלח
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className={`text-2xl font-extrabold ${correct ? 'text-green-600' : 'text-red-600'}`}>
              {correct ? '🎉 מעולה! נכון!' : `💪 האות הנכונה היא: ${q2.answer}`}
            </div>
            <button
              onClick={() => setPhase('picker')}
              className="mt-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl px-8 py-3 text-lg transition-all active:scale-95"
            >
              המשך →
            </button>
          </div>
        )}
      </main>
    );
  }

  // ── Phase: Word picker ─────────────────────────────────────
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
              onClick={() => toggleWord(word)}
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

  // ── Phase: Celebrate ───────────────────────────────────────
  return (
    <main className="min-h-screen bg-gradient-to-b from-yellow-50 to-orange-50 flex flex-col items-center justify-center px-6 text-center fade-in">
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
