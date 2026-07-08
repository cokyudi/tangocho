import { NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { createClient } from '@/lib/supabase/server';
import { isAllowedEmail } from '@/lib/auth';
import { lookupJisho } from '@/lib/jisho';
import { geminiGapSchema, geminiFullSchema, type EnrichResult } from '@/lib/enrich/schema';
import { isRateLimit } from '@/lib/enrich/rate-limit';

const MODEL = 'gemini-2.5-flash';

export async function POST(request: Request) {
  // Auth: only the allowlisted user may spend Gemini quota.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAllowedEmail(user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { term } = (await request.json().catch(() => ({}))) as { term?: string };
  const trimmed = term?.trim();
  if (!trimmed) {
    return NextResponse.json({ error: 'Missing term' }, { status: 400 });
  }

  const jisho = await lookupJisho(trimmed);

  try {
    if (jisho) {
      // Jisho supplied reading/EN/POS/JLPT; Gemini fills Indonesian + example.
      const { object } = await generateObject({
        model: google(MODEL),
        schema: geminiGapSchema,
        prompt:
          `The Japanese word is "${trimmed}" (reading: ${jisho.reading ?? '?'}). ` +
          `Its dictionary English meaning is: ${jisho.meaningEn ?? 'unknown'}. ` +
          `Give a concise Indonesian meaning and one short, natural example sentence in Japanese using the word, with its Indonesian translation. ` +
          `Most words are ordinary vocabulary — for those, base the Indonesian meaning on the dictionary meaning and leave meaningEnRefined null. ` +
          `Only when this word has a well-known slang/colloquial sense that genuinely DIFFERS from the dictionary meaning ` +
          `(e.g. ワンチャン usually means "maybe/there's a chance" adverbially, not literally "one chance") ` +
          `should you reflect that everyday usage in the Indonesian meaning and set a refined English meaning. Do not merely reword the dictionary meaning.`,
      });
      const result: EnrichResult = {
        term: trimmed,
        reading: jisho.reading,
        meaningEn: object.meaningEnRefined ?? jisho.meaningEn,
        meaningId: object.meaningId,
        partOfSpeech: jisho.partOfSpeech,
        jlpt: jisho.jlpt,
        exampleJp: object.exampleJp,
        exampleFurigana: object.exampleFurigana,
        exampleTranslation: object.exampleTranslation,
        source: 'jisho',
        geminiUsed: true,
      };
      return NextResponse.json(result);
    }

    // No Jisho entry (slang/casual/new) — Gemini fills everything.
    const { object } = await generateObject({
      model: google(MODEL),
      schema: geminiFullSchema,
      prompt:
        `The Japanese word or phrase is "${trimmed}". It may be slang or casual Japanese. ` +
        `Provide its kana reading, a concise English meaning, a concise Indonesian meaning, ` +
        `part of speech, best-guess JLPT level (or null for slang), and one short natural ` +
        `Japanese example sentence with its Indonesian translation.`,
    });
    const result: EnrichResult = {
      term: trimmed,
      reading: object.reading,
      meaningEn: object.meaningEn,
      meaningId: object.meaningId,
      partOfSpeech: object.partOfSpeech,
      jlpt: object.jlpt,
      exampleJp: object.exampleJp,
      exampleFurigana: object.exampleFurigana,
      exampleTranslation: object.exampleTranslation,
      source: 'gemini',
      geminiUsed: true,
    };
    return NextResponse.json(result);
  } catch (err) {
    // Gemini failed — still return whatever Jisho gave so the user can save.
    if (jisho) {
      const result: EnrichResult = {
        term: trimmed,
        reading: jisho.reading,
        meaningEn: jisho.meaningEn,
        meaningId: null,
        partOfSpeech: jisho.partOfSpeech,
        jlpt: jisho.jlpt,
        exampleJp: null,
        exampleFurigana: null,
        exampleTranslation: null,
        source: 'jisho',
        geminiUsed: false,
      };
      return NextResponse.json(result);
    }
    if (isRateLimit(err)) {
      return NextResponse.json(
        { error: 'AI is rate-limited — wait a minute and try again, or fill the fields manually.' },
        { status: 429 },
      );
    }
    return NextResponse.json(
      { error: 'AI lookup failed — try again or fill the fields manually.' },
      { status: 502 },
    );
  }
}
