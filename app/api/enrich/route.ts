import { NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { createClient } from '@/lib/supabase/server';
import { isAllowedEmail } from '@/lib/auth';
import { lookupJisho } from '@/lib/jisho';
import { geminiGapSchema, geminiFullSchema, type EnrichResult } from '@/lib/enrich/schema';

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
          `Its English meaning is: ${jisho.meaningEn ?? 'unknown'}. ` +
          `Give a concise Indonesian meaning and one short, natural example sentence in Japanese using the word, with its Indonesian translation.`,
      });
      const result: EnrichResult = {
        term: trimmed,
        reading: jisho.reading,
        meaningEn: jisho.meaningEn,
        meaningId: object.meaningId,
        partOfSpeech: jisho.partOfSpeech,
        jlpt: jisho.jlpt,
        exampleJp: object.exampleJp,
        exampleTranslation: object.exampleTranslation,
        source: 'jisho',
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
      exampleTranslation: object.exampleTranslation,
      source: 'gemini',
    };
    return NextResponse.json(result);
  } catch {
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
        exampleTranslation: null,
        source: 'jisho',
      };
      return NextResponse.json(result);
    }
    return NextResponse.json({ error: 'Enrichment failed' }, { status: 502 });
  }
}
