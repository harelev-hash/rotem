import { supabase, DEFAULT_USER_ID } from '@/lib/supabase';
import HomeClient from './home-client';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const { data: user } = await supabase
    .from('users')
    .select('name')
    .eq('id', DEFAULT_USER_ID)
    .single();

  return <HomeClient userName={user?.name ?? ''} />;
}
