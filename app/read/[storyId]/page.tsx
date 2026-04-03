import { supabase } from '@/lib/supabase';
import ReadClient from './read-client';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ storyId: string }>;
}

export default async function ReadPage({ params }: Props) {
  const { storyId } = await params;

  const { data: story, error } = await supabase
    .from('stories')
    .select('*')
    .eq('id', storyId)
    .single();

  if (error || !story) notFound();

  return <ReadClient story={story} />;
}
