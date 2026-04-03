'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const STARS = ['⭐', '🌟', '✨', '💫', '⭐', '🌟', '✨', '💫'];

export default function CompletePage() {
  const { storyId } = useParams<{ storyId: string }>();
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setCelebrating(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-yellow-50 to-orange-50 flex flex-col items-center justify-center px-6 text-center fade-in">
      {/* Floating stars */}
      <div className="relative h-32 w-full mb-4 overflow-hidden" aria-hidden>
        {celebrating && STARS.map((s, i) => (
          <span
            key={i}
            className="celebrate-star absolute text-3xl"
            style={{
              left: `${10 + i * 10}%`,
              bottom: 0,
              animationDelay: `${i * 0.15}s`,
            }}
          >
            {s}
          </span>
        ))}
      </div>

      <h1 className="text-4xl font-extrabold text-amber-600 mb-2">כל הכבוד!</h1>
      <p className="text-xl text-slate-600 mb-2">קראת את כל הסיפור!</p>
      <div className="text-6xl my-6">🎉</div>

      {/* Rating prompt */}
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
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl px-6 py-3 text-lg shadow-md transition-all active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-300"
        >
          סיפור חדש
        </Link>
        <Link
          href="/library"
          className="bg-white border-2 border-blue-200 text-blue-600 font-bold rounded-2xl px-6 py-3 text-lg shadow-md transition-all active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-300"
        >
          לספרייה
        </Link>
      </div>
    </main>
  );
}
