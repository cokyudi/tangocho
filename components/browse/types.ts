export type BrowseWord = {
  id: string;
  term: string;
  reading: string | null;
  meaning_id: string | null;
  meaning_en: string | null;
  part_of_speech: string | null;
  jlpt: string | null;
  example_jp: string | null;
  example_translation: string | null;
  notes: string | null;
  repetitions: number;
  interval: number;
  due_date: string | null;
  source_id: string | null;
  created_at: string;
};
