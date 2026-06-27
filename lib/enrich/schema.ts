import { z } from 'zod';

const exampleFuriganaDescription =
  'The exampleJp sentence annotated with furigana: write each kanji word immediately followed ' +
  'by its kana reading in square brackets, e.g. "今日[きょう]は贅沢[ぜいたく]をする。". ' +
  'Leave kana and punctuation without brackets. Must match exampleJp exactly apart from the brackets.';

// Fields Gemini fills when Jisho already supplied reading/EN/POS/JLPT.
export const geminiGapSchema = z.object({
  meaningId: z.string().describe('Concise Indonesian meaning of the word'),
  exampleJp: z.string().describe('One short, natural Japanese sentence using the word'),
  exampleFurigana: z.string().describe(exampleFuriganaDescription),
  exampleTranslation: z.string().describe('Indonesian translation of the example sentence'),
});

// Full fill when Jisho has no entry (slang, casual, brand-new words).
export const geminiFullSchema = z.object({
  reading: z.string().describe('Kana reading (furigana) of the word, hiragana or katakana'),
  meaningEn: z.string().describe('Concise English meaning'),
  meaningId: z.string().describe('Concise Indonesian meaning'),
  partOfSpeech: z.string().nullable().describe('Part of speech, e.g. "noun", "godan verb", or null'),
  jlpt: z
    .enum(['N5', 'N4', 'N3', 'N2', 'N1'])
    .nullable()
    .describe('Best-guess JLPT level, or null if not applicable (slang)'),
  exampleJp: z.string().describe('One short, natural Japanese sentence using the word'),
  exampleFurigana: z.string().describe(exampleFuriganaDescription),
  exampleTranslation: z.string().describe('Indonesian translation of the example sentence'),
});

export type EnrichResult = {
  term: string;
  reading: string | null;
  meaningEn: string | null;
  meaningId: string | null;
  partOfSpeech: string | null;
  jlpt: string | null;
  exampleJp: string | null;
  exampleFurigana: string | null;
  exampleTranslation: string | null;
  source: 'jisho' | 'gemini';
};
