'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import TopicCard from '@/components/TopicCard';
import Link from 'next/link';

const TOPICS = [
  { id: 'animals', label: 'חיות', emoji: '🐾', color: 'bg-orange-100 hover:bg-orange-200' },
  { id: 'sea',     label: 'ים',   emoji: '🌊', color: 'bg-blue-100 hover:bg-blue-200' },
  { id: 'magic',   label: 'קסם',  emoji: '✨', color: 'bg-purple-100 hover:bg-purple-200' },
  { id: 'food',    label: 'אוכל', emoji: '🍕', color: 'bg-red-100 hover:bg-red-200' },
  { id: 'nature',  label: 'טבע',  emoji: '🌿', color: 'bg-green-100 hover:bg-green-200' },
  { id: 'space',   label: 'חלל',  emoji: '🚀', color: 'bg-indigo-100 hover:bg-indigo-200' },
];

const TOPIC_HEBREW: Record<string, string> = {
  animals: 'חיות', sea: 'ים', magic: 'קסם',
  food: 'אוכל', nature: 'טבע', space: 'חלל',
};

interface Props {
  userName: string;
}

export default function HomeClient({ userName }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Long-press on logo (1.5s) → parent mode
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleLogoPress = () => {
    pressTimer.current = setTimeout(() => router.push('/parent'), 1500);
  };
  const handleLogoRelease = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
  };

  const handleTopic = async (topic: typeof TOPICS[0]) => {
    setLoading(topic.id);
    setError(null);
    try {
      const res = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.id,
          topicHebrew: TOPIC_HEBREW[topic.id],
          topicEmoji: topic.emoji,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'שגיאה');
      router.push(`/read/${data.storyId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה ביצירת הסיפור. נסי שוב.');
      setLoading(null);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 to-blue-100 flex flex-col items-center px-4 pb-10 fade-in">
      {/* Header */}
      <header className="w-full max-w-md pt-10 pb-6 flex flex-col items-center gap-1">
        <button
          onMouseDown={handleLogoPress}
          onMouseUp={handleLogoRelease}
          onTouchStart={handleLogoPress}
          onTouchEnd={handleLogoRelease}
          className="text-6xl leading-none select-none focus:outline-none"
          aria-label="לחצי 1.5 שניות לכניסה למצב הורה"
        >
          📚
        </button>
        {userName && (
          <p className="text-blue-400 font-medium text-base mt-1">שלום, {userName}!</p>
        )}
        <h1 className="text-3xl font-extrabold text-blue-800 mt-1">קוראים יחד</h1>
        <p className="text-slate-500 text-base">איזה סיפור תרצי היום?</p>
      </header>

      {/* Error */}
      {error && (
        <div className="w-full max-w-md bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-center mb-4">
          {error}
        </div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-white/70 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4">
          <div className="text-5xl animate-bounce">
            {TOPICS.find(t => t.id === loading)?.emoji}
          </div>
          <p className="text-xl font-bold text-blue-700">יוצרים סיפור...</p>
          <p className="text-slate-400 text-sm">זה עשוי לקחת כמה שניות</p>
        </div>
      )}

      {/* Topic grid */}
      <div className="w-full max-w-md grid grid-cols-2 gap-4">
        {TOPICS.map(t => (
          <TopicCard
            key={t.id}
            emoji={t.emoji}
            label={t.label}
            color={t.color}
            onClick={() => handleTopic(t)}
            disabled={!!loading}
          />
        ))}
      </div>

      {/* Library link */}
      <Link
        href="/library"
        className="mt-8 flex items-center gap-2 text-blue-600 font-semibold text-lg hover:underline focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-lg px-2 py-1"
      >
        <span>📖</span> הספרייה שלי
      </Link>
    </main>
  );
}
