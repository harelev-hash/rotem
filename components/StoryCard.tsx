import Link from 'next/link';
import type { Story } from '@/lib/supabase';

interface StoryCardProps {
  story: Story;
}

export default function StoryCard({ story }: StoryCardProps) {
  const date = new Date(story.created_at).toLocaleDateString('he-IL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Link
      href={`/read/${story.id}`}
      className="
        bg-white rounded-2xl p-5 shadow-sm border border-slate-100
        flex flex-col items-center gap-2 text-center
        hover:shadow-md active:scale-95 transition-all duration-150
        focus:outline-none focus:ring-4 focus:ring-blue-200
      "
    >
      <span className="text-4xl">{story.topic_emoji}</span>
      <span className="font-bold text-slate-700">{story.topic}</span>
      <span className="text-xs text-slate-400">{date}</span>
    </Link>
  );
}
