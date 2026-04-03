'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SentenceDisplay from '@/components/SentenceDisplay';
import TTSButton from '@/components/TTSButton';
import { supabase } from '@/lib/supabase';
import type { Story } from '@/lib/supabase';

interface Props {
  story: Story;
}

export default function ReadClient({ story }: Props) {
  const router = useRouter();
  const sentences = story.sentences_json;
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);

  const current = sentences[index];
  const total = sentences.length;

  const handleNext = async () => {
    if (index < total - 1) {
      setIndex(i => i + 1);
    } else {
      // Mark story as completed
      await supabase
        .from('stories')
        .update({ completed: true })
        .eq('id', story.id);

      setDone(true);
      router.push(`/read/${story.id}/complete`);
    }
  };

  if (done) return null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex flex-col fade-in">
      {/* Progress dots */}
      <div className="flex justify-center gap-2 pt-6 pb-2">
        {sentences.map((_, i) => (
          <div
            key={i}
            className={`
              rounded-full transition-all duration-300
              ${i === index ? 'w-5 h-5 bg-purple-500' : i < index ? 'w-4 h-4 bg-purple-300' : 'w-4 h-4 bg-slate-200'}
            `}
          />
        ))}
      </div>

      {/* Topic badge */}
      <div className="flex justify-center pt-2 pb-1">
        <span className="text-2xl">{story.topic_emoji}</span>
      </div>

      {/* Image placeholder */}
      <div className="mx-auto w-full max-w-sm px-6 mt-4">
        <div className="bg-slate-100 rounded-3xl h-44 flex items-center justify-center text-slate-300 text-sm">
          {current.image_description}
        </div>
      </div>

      {/* Sentence */}
      <div className="flex-1 flex items-center justify-center px-4 py-6">
        <SentenceDisplay
          sentence={current.sentence}
          newWord={current.new_word}
        />
      </div>

      {/* Controls */}
      <div className="w-full max-w-md mx-auto px-6 pb-10 flex items-center justify-between">
        <TTSButton text={current.sentence} />

        <button
          onClick={handleNext}
          className="
            bg-purple-500 hover:bg-purple-600 active:scale-95
            text-white font-bold text-xl rounded-2xl
            px-8 py-4 shadow-lg transition-all duration-150
            focus:outline-none focus:ring-4 focus:ring-purple-300
            min-w-[140px]
          "
        >
          {index < total - 1 ? '← המשך' : '← סיום'}
        </button>
      </div>
    </main>
  );
}
