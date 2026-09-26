import { createClient } from '@/lib/supabase/server';
import FriendsClient from '@/components/friends/FriendsClient';

export const metadata = { title: 'Friends' };

export default async function FriendsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('friends')
    .select('id, name, relationship, themes, persona, active')
    .order('created_at', { ascending: true });

  return <FriendsClient friends={data ?? []} />;
}
