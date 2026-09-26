import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { lookupJisho, type JishoEntry } from './jisho';
import { tokyoDay } from './progress';

// Explicit user_id filters throughout: the cron passes a service-role client,
// which bypasses RLS.
type Supabase = SupabaseClient<Database>;

const MODEL = 'gemini-2.5-flash';
const DAILY_COUNT = 4;

const suggestionSchema = z.object({
  items: z
    .array(
      z.object({
        friendIndex: z.number().int().describe('Index of the friend (from the list) who says the line'),
        term: z.string().describe('The Japanese word, in its usual written form'),
        reading: z.string().describe('Kana reading'),
        meaningEn: z.string().describe('Concise English meaning'),
        meaningId: z.string().describe('Concise Indonesian meaning'),
        partOfSpeech: z.string().nullable(),
        jlpt: z.enum(['N5', 'N4', 'N3', 'N2', 'N1']).nullable(),
        slang: z.boolean().describe('True only for slang/colloquial words a dictionary may not list'),
        lineJa: z.string().describe("The friend's one-line message using the word, in their speech level"),
        lineFurigana: z
          .string()
          .describe(
            'lineJa with furigana: kanji immediately followed by their kana in square brackets, e.g. ' +
              '会議[かいぎ]. Brackets follow kanji only, never kana: 関[かん]して, 気[き]づいた — not 関して[かんして]. ' +
              'Must match lineJa exactly apart from the brackets.',
          ),
        lineEn: z.string().describe('English translation of lineJa'),
        lineId: z.string().describe('Indonesian translation of lineJa'),
      }),
    )
    .describe(`Exactly ${DAILY_COUNT} items`),
});

export type GeneratedItem = z.infer<typeof suggestionSchema>['items'][number];

const SEASONS = [
  'winter (正月, 寒さ, 新年会)', 'winter (節分, バレンタイン, 受験)', 'early spring (卒業, ひな祭り, 花粉症)',
  'spring (花見, 新年度, 入社)', 'late spring (ゴールデンウィーク, 五月病)', 'rainy season (梅雨, 紫陽花)',
  'summer (夏祭り, 七夕, 熱中症)', 'summer (お盆, 花火, 帰省)', 'early autumn (台風, 月見, 敬老の日)',
  'autumn (紅葉, 読書の秋, ハロウィン)', 'late autumn (七五三, 紅葉狩り, 鍋)', 'winter (忘年会, クリスマス, 大掃除)',
];

// Keep items that Jisho confirms or that Gemini flags as slang; drop words
// already saved or suggested, and repeats. Jisho's reading/POS always win; its
// meaning and JLPT only for non-slang, since for slang it has the literal
// sense (草 → "grass", N4, instead of "lol").
export function keepSuggestions(
  items: GeneratedItem[],
  jisho: (JishoEntry | null)[],
  seen: Set<string>,
  friendCount: number,
) {
  const kept: (Omit<GeneratedItem, 'jlpt'> & { jlpt: string | null })[] = [];
  const taken = new Set(seen);
  items.forEach((item, i) => {
    const term = item.term.trim();
    const j = jisho[i];
    if (!term || taken.has(term)) return;
    if (item.friendIndex < 0 || item.friendIndex >= friendCount) return;
    if (!j && !item.slang) return;
    taken.add(term);
    kept.push({
      ...item,
      term,
      reading: j?.reading ?? item.reading,
      partOfSpeech: j?.partOfSpeech ?? item.partOfSpeech,
      meaningEn: (!item.slang && j?.meaningEn) || item.meaningEn,
      jlpt: item.slang ? null : (j?.jlpt ?? item.jlpt),
    });
  });
  return kept.slice(0, DAILY_COUNT);
}

const SELECT =
  'id, term, reading, meaning_en, meaning_id, line_ja, line_furigana, line_en, status, friends(name, relationship)';

function shuffle<T>(xs: T[]) {
  return xs
    .map((x) => [Math.random(), x] as const)
    .sort((a, b) => a[0] - b[0])
    .map(([, x]) => x);
}

async function generate(supabase: Supabase, userId: string, date: string) {
  const { data: activeFriends } = await supabase
    .from('friends')
    .select('id, name, relationship, themes, persona')
    .eq('user_id', userId)
    .eq('active', true);
  if (!activeFriends?.length) return [];
  const friends = shuffle(activeFriends).slice(0, 3);

  const [{ data: words }, { data: past }] = await Promise.all([
    supabase.from('words').select('term').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase
      .from('daily_suggestions')
      .select('term, status')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
  ]);
  const seen = new Set([...(words ?? []), ...(past ?? [])].map((w) => w.term));
  const recent = (words ?? []).slice(0, 30).map((w) => w.term);
  const feedback = (past ?? []).filter((p) => p.status !== 'pending').slice(0, 20);

  // Difficulty by relationship: JLPT covers textbook/written Japanese only, so
  // it targets coworkers; slang has no level and is judged by not being basic.
  const COWORKER =
    'coworker: polite/business Japanese (です・ます, keigo). Words at JLPT N2–N1 level or business ' +
    'vocabulary heard in meetings but not taught early (稟議, 前倒し, 落とし所)';
  const FRIEND =
    'close friend: casual Japanese (タメ口). Everyday slang and colloquial expressions textbooks skip ' +
    '(ワンチャン, ガチ, 詰んだ, エモい), no JLPT level needed — never basic words';
  const month = Number(date.slice(5, 7)) - 1;
  const friendList = friends
    .map(
      (f, i) =>
        `${i}. ${f.name} — ${f.relationship === 'coworker' ? COWORKER : FRIEND}; ` +
        `themes: ${f.themes.join(', ') || 'anything'}; persona: ${f.persona ?? 'none'}`,
    )
    .join('\n');

  const { object } = await generateObject({
    model: google(MODEL),
    schema: suggestionSchema,
    prompt:
      `You pick ${DAILY_COUNT} Japanese words for an upper-intermediate learner living in Japan, who wants words ` +
      `they will actually hear. Each word is mentioned by one of these friends in a short, natural one-line ` +
      `message to the learner, written in that friend's speech level and drawn from their themes and persona:\n` +
      `${friendList}\n\n` +
      `- Items 1-${DAILY_COUNT - 1}: spread across the friends, each word from that friend's themes.\n` +
      `- Item ${DAILY_COUNT}: a word tied to today's season — ${SEASONS[month]} (today is ${date}) — said by any friend, at that friend's difficulty.\n` +
      `- Too easy: common everyday words a learner meets early (台風, 推し, 気まずい). Skip them.\n` +
      `- Prefer words that build on ones the learner saved recently (shared kanji or topic): ${recent.join('、') || 'none yet'}.\n` +
      `- Never pick any of these (already known or suggested): ${[...seen].join('、') || 'none'}.\n` +
      (feedback.length
        ? `- Recent reactions (skipped = not wanted, known = too easy, saved = good pick): ` +
          `${feedback.map((f) => `${f.term}:${f.status}`).join(', ')}.\n`
        : '') +
      `- Real, commonly used words only; mark slang honestly.\n` +
      `- Lines name real-sounding people or things, never placeholders like 〇〇.`,
  });

  const jisho = await Promise.all(object.items.map((it) => lookupJisho(it.term.trim())));
  const kept = keepSuggestions(object.items, jisho, seen, friends.length);
  if (!kept.length) return [];

  // Return the inserted rows: re-selecting would hit Next's per-render GET
  // fetch memoization and get the earlier empty result back.
  const { data } = await supabase.from('daily_suggestions').insert(
    kept.map((it) => ({
      user_id: userId,
      date,
      friend_id: friends[it.friendIndex].id,
      term: it.term,
      reading: it.reading,
      meaning_en: it.meaningEn,
      meaning_id: it.meaningId,
      part_of_speech: it.partOfSpeech,
      jlpt: it.jlpt,
      line_ja: it.lineJa,
      line_furigana: it.lineFurigana,
      line_en: it.lineEn,
      line_id: it.lineId,
    })),
  ).select(SELECT);
  return data ?? [];
}

// Today's set, generated on the first request of the Tokyo day.
// ponytail: two simultaneous first loads can both generate (up to 8 rows);
// add a per-day lock row if that ever happens in practice.
export async function getTodaysSuggestions(supabase: Supabase, userId: string) {
  const date = tokyoDay(new Date());
  const { data } = await supabase
    .from('daily_suggestions')
    .select(SELECT)
    .eq('user_id', userId)
    .eq('date', date)
    .order('created_at');
  if (data?.length) return data;

  try {
    return await generate(supabase, userId, date);
  } catch (err) {
    // Gemini down or rate-limited: show nothing today, retry on the next load.
    console.error('daily suggestions failed', err);
    return [];
  }
}

export type Suggestion = Awaited<ReturnType<typeof getTodaysSuggestions>>[number];
