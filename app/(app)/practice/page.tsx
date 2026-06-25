import PracticeClient from '@/components/practice/PracticeClient';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Practice' };

export default async function PracticePage() {
  const supabase = await createClient();
  // "Today" in the user's timezone (Japan) so due-today words appear correctly.
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo' }).format(new Date());

  const { data } = await supabase
    .from('words')
    .select(
      'id, term, reading, meaning_id, meaning_en, example_jp, example_translation, jlpt, part_of_speech, ease_factor, interval, repetitions, due_date, sources ( name, detail, type )',
    )
    .or(`due_date.is.null,due_date.lte.${today}`)
    .order('due_date', { ascending: true, nullsFirst: true });

  const words = (data ?? []).map((w) => {
    const src = Array.isArray(w.sources) ? w.sources[0] : w.sources;
    return {
      id: w.id,
      term: w.term,
      reading: w.reading,
      meaning_id: w.meaning_id,
      meaning_en: w.meaning_en,
      example_jp: w.example_jp,
      example_translation: w.example_translation,
      jlpt: w.jlpt,
      part_of_speech: w.part_of_speech,
      ease_factor: w.ease_factor,
      interval: w.interval,
      repetitions: w.repetitions,
      due_date: w.due_date,
      source: src ? { name: src.name, detail: src.detail, type: src.type } : null,
    };
  });

  return <PracticeClient words={words} />;
}
