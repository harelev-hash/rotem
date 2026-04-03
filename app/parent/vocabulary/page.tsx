import { supabase, DEFAULT_USER_ID } from '@/lib/supabase';
import Link from 'next/link';
import VocabManageClient from './vocab-manage-client';

export const dynamic = 'force-dynamic';

export default async function ParentVocabularyPage() {
  const { data: words } = await supabase
    .from('vocabulary_words')
    .select('id, user_id, word, added_at')
    .eq('user_id', DEFAULT_USER_ID)
    .order('added_at', { ascending: false });

  return (
    <main className="min-h-screen bg-slate-50 pb-12 fade-in">
      <header className="bg-white border-b border-slate-100 px-4 py-4 flex items-center gap-3">
        <Link href="/parent" className="text-2xl text-slate-500 hover:text-slate-700" aria-label="חזרה">←</Link>
        <h1 className="text-xl font-extrabold text-slate-800">💎 ניהול אוצר מילים</h1>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-6">
        <VocabManageClient words={words ?? []} />
      </div>
    </main>
  );
}
