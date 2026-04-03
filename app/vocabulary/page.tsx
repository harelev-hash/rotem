import { supabase, DEFAULT_USER_ID } from '@/lib/supabase';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function VocabularyPage() {
  const { data: words } = await supabase
    .from('vocabulary_words')
    .select('id, word, added_at')
    .eq('user_id', DEFAULT_USER_ID)
    .order('added_at', { ascending: false });

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 to-white px-4 pb-10 fade-in">
      <header className="max-w-md mx-auto pt-8 pb-6 flex items-center gap-3">
        <Link href="/" className="text-2xl focus:outline-none" aria-label="חזרה">←</Link>
        <h1 className="text-2xl font-extrabold text-purple-800">💎 אוצר המילים שלי</h1>
      </header>

      {!words || words.length === 0 ? (
        <div className="max-w-md mx-auto text-center py-16 text-slate-400">
          <div className="text-5xl mb-4">🌱</div>
          <p className="text-lg">עדיין אין מילים באוצר.</p>
          <p className="text-sm mt-2">בסוף כל סיפור, סמני מילים שרכשת!</p>
          <Link href="/" className="mt-4 inline-block text-purple-500 font-semibold hover:underline">
            קראי סיפור ראשון!
          </Link>
        </div>
      ) : (
        <div className="max-w-md mx-auto">
          <p className="text-slate-400 text-sm text-center mb-6">{words.length} מילים</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {words.map(w => (
              <div
                key={w.id}
                className="bg-white border-2 border-purple-200 text-purple-800 font-bold text-xl px-5 py-3 rounded-2xl shadow-sm"
              >
                {w.word}
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
