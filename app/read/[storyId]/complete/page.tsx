import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { StoryQuestion } from '@/lib/supabase';
import CompleteClient from './complete-client';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ storyId: string }>;
}

export default async function CompletePage({ params }: Props) {
  const { storyId } = await params;

  const { data: story } = await supabase
    .from('stories')
    .select('sentences_json, questions_json')
    .eq('id', storyId)
    .single();

  if (!story) notFound();

  const words: string[] = (story.sentences_json as { new_word: string }[]).map(s => s.new_word);
  const questions: StoryQuestion[] = (story.questions_json as StoryQuestion[]) ?? [];

  return <CompleteClient storyId={storyId} words={words} questions={questions} />;
}
