'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { VocabularyWord } from '@/lib/supabase';

export default function VocabManageClient({ words: initial }: { words: VocabularyWord[] }) {
  const [words, setWords] = useState(initial);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    await supabase.from('vocabulary_words').delete().eq('id', id);
    setWords(prev => prev.filter(w => w.id !== id));
    setDeleting(null);
  };

  if (words.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <div className="text-5xl mb-4">🌱</div>
        <p>אין מילים באוצר עדיין.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-slate-400 text-sm text-center mb-4">{words.length} מילים באוצר</p>
      {words.map(w => (
        <div
          key={w.id}
          className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-slate-100 flex items-center justify-between"
        >
          <span className="text-xl font-bold text-purple-800">{w.word}</span>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">
              {new Date(w.added_at).toLocaleDateString('he-IL')}
            </span>
            <button
              onClick={() => handleDelete(w.id)}
              disabled={deleting === w.id}
              className="text-red-400 hover:text-red-600 text-sm font-medium disabled:opacity-40 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
            >
              {deleting === w.id ? '...' : 'הסר'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
