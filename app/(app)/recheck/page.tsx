import { createClient } from '@/lib/supabase/server';
import RecheckClient from '@/components/recheck/RecheckClient';

export const metadata = { title: 'Dictionary re-check' };

export default async function RecheckPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('words')
    .select('id, term, reading, part_of_speech, jlpt')
    .order('created_at', { ascending: true });

  return <RecheckClient words={data ?? []} />;
}
