'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateStoryWithWordButton({ word }: { word: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: 'custom',
          topicHebrew: word,
          topicEmoji: '✏️',
          customWord: word,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/read/${data.storyId}`);
    } catch {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      title={`צרי סיפור עם "${word}"`}
      className="text-xs font-semibold text-purple-500 hover:text-purple-700 px-2 py-1 rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-40 whitespace-nowrap"
    >
      {loading ? '...' : '✏️ סיפור'}
    </button>
  );
}
