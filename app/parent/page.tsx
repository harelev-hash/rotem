import { supabase, DEFAULT_USER_ID } from '@/lib/supabase';
import Link from 'next/link';
import VowelProgressBar from '@/components/VowelProgressBar';

export const dynamic = 'force-dynamic';

export default async function ParentDashboard() {
  const [{ data: vowels }, { data: stories }, { data: ratings }] = await Promise.all([
    supabase.from('vowel_progress').select('*').eq('user_id', DEFAULT_USER_ID).order('vowel_name'),
    supabase.from('stories').select('id, topic, topic_emoji, created_at, completed').eq('user_id', DEFAULT_USER_ID).order('created_at', { ascending: false }).limit(10),
    supabase.from('session_ratings').select('story_id, rating').order('created_at', { ascending: false }),
  ]);

  const completedCount = (stories ?? []).filter(s => s.completed).length;
  const ratingLabels: Record<number, string> = { 1: '😓 קשה', 2: '😐 סבבה', 3: '😊 טוב', 4: '🌟 מעולה' };

  const ratingByStory = Object.fromEntries(
    (ratings ?? []).map(r => [r.story_id, r.rating])
  );

  return (
    <main className="min-h-screen bg-slate-50 pb-12 fade-in">
      <header className="bg-white border-b border-slate-100 px-4 py-4 flex items-center gap-3">
        <Link href="/" className="text-2xl text-slate-500 hover:text-slate-700" aria-label="חזרה">←</Link>
        <h1 className="text-xl font-extrabold text-slate-800">מצב הורה / מורה</h1>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center border border-slate-100">
            <p className="text-3xl font-bold text-blue-600">{completedCount}</p>
            <p className="text-sm text-slate-500">סיפורים הושלמו</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center border border-slate-100">
            <p className="text-3xl font-bold text-purple-600">{(vowels ?? []).filter(v => v.is_active).length}</p>
            <p className="text-sm text-slate-500">תנועות פעילות</p>
          </div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 gap-3">
          <Link
            href="/parent/vowels"
            className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-3 hover:bg-slate-50 transition-colors"
          >
            <span className="text-3xl">🔤</span>
            <div>
              <p className="font-bold text-slate-700">הגדרות תנועות</p>
              <p className="text-sm text-slate-400">הפעלה, כיבוי ורמת שליטה</p>
            </div>
            <span className="mr-auto text-slate-300 text-xl">←</span>
          </Link>
        </div>

        {/* Vowel mastery chart */}
        {vowels && vowels.length > 0 && (
          <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <h2 className="font-bold text-slate-700 mb-4">שליטה בתנועות</h2>
            <div className="space-y-3">
              {vowels.map(v => (
                <div key={v.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className={`font-medium ${v.is_active ? 'text-slate-700' : 'text-slate-400'}`}>
                      {v.vowel_name} {v.vowel_symbol}
                    </span>
                    <span className="text-slate-400">{v.mastery_score}%</span>
                  </div>
                  <VowelProgressBar
                    score={v.mastery_score}
                    color={v.is_active ? 'bg-blue-500' : 'bg-slate-300'}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recent stories */}
        {stories && stories.length > 0 && (
          <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <h2 className="font-bold text-slate-700 mb-4">סיפורים אחרונים</h2>
            <div className="space-y-2">
              {stories.map(s => (
                <div key={s.id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                  <span className="text-2xl">{s.topic_emoji}</span>
                  <div className="flex-1">
                    <p className="font-medium text-slate-700 text-sm">{s.topic}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(s.created_at).toLocaleDateString('he-IL')}
                    </p>
                  </div>
                  <div className="text-sm">
                    {ratingByStory[s.id]
                      ? <span className="text-slate-600">{ratingLabels[ratingByStory[s.id]]}</span>
                      : s.completed
                        ? <Link href={`/parent/rating/${s.id}`} className="text-blue-500 hover:underline">דרג</Link>
                        : <span className="text-slate-300 text-xs">לא הושלם</span>
                    }
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
