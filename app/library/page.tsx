import { supabase, DEFAULT_USER_ID } from '@/lib/supabase';
import StoryCard from '@/components/StoryCard';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function LibraryPage() {
  const { data: stories } = await supabase
    .from('stories')
    .select('*')
    .eq('user_id', DEFAULT_USER_ID)
    .eq('completed', true)
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 to-white px-4 pb-10 fade-in">
      <header className="max-w-md mx-auto pt-8 pb-6 flex items-center gap-3">
        <Link href="/" className="text-2xl focus:outline-none" aria-label="חזרה">←</Link>
        <h1 className="text-2xl font-extrabold text-purple-800">📖 הספרייה שלי</h1>
      </header>

      {!stories || stories.length === 0 ? (
        <div className="max-w-md mx-auto text-center py-16 text-slate-400">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-lg">עדיין אין סיפורים.</p>
          <Link href="/" className="mt-4 inline-block text-blue-500 font-semibold hover:underline">
            צרי סיפור ראשון!
          </Link>
        </div>
      ) : (
        <div className="max-w-md mx-auto grid grid-cols-2 gap-4">
          {stories.map(story => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      )}
    </main>
  );
}
