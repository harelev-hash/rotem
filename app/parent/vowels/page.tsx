import { supabase, DEFAULT_USER_ID } from '@/lib/supabase';
import VowelsClient from './vowels-client';

export const dynamic = 'force-dynamic';

export default async function VowelsPage() {
  const { data: vowels } = await supabase
    .from('vowel_progress')
    .select('*')
    .eq('user_id', DEFAULT_USER_ID)
    .order('vowel_name');

  return <VowelsClient initialVowels={vowels ?? []} />;
}
