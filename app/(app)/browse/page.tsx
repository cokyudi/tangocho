import BrowseClient from '@/components/browse/BrowseClient';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Browse' };

export default async function BrowsePage() {
  const supabase = await createClient();
  const [{ data: words }, { data: sources }] = await Promise.all([
    supabase
      .from('words')
      .select(
        'id, term, reading, meaning_id, meaning_en, part_of_speech, jlpt, example_jp, example_translation, notes, repetitions, interval, due_date, source_id, created_at',
      )
      .order('created_at', { ascending: false }),
    supabase.from('sources').select('id, type, name, detail').order('name'),
  ]);

  return <BrowseClient words={words ?? []} sources={sources ?? []} />;
}
