'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function DeleteStoryButton({ storyId }: { storyId: string }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!confirm) {
      setConfirm(true);
      return;
    }
    setLoading(true);
    await supabase.from('stories').delete().eq('id', storyId);
    router.refresh();
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      onBlur={() => setConfirm(false)}
      className={`text-xs font-medium px-2 py-1 rounded-lg transition-colors disabled:opacity-40 ${
        confirm
          ? 'bg-red-100 text-red-600 hover:bg-red-200'
          : 'text-slate-300 hover:text-red-400 hover:bg-red-50'
      }`}
    >
      {loading ? '...' : confirm ? 'בטוח?' : '🗑'}
    </button>
  );
}
