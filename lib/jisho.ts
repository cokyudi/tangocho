// Minimal Jisho public API client. Returns the best entry for a term, or null.

export type JishoEntry = {
  reading: string | null;
  meaningEn: string | null;
  partOfSpeech: string | null;
  jlpt: string | null;
};

type JishoApiResponse = {
  data?: Array<{
    slug?: string;
    jlpt?: string[];
    japanese?: Array<{ word?: string; reading?: string }>;
    senses?: Array<{
      english_definitions?: string[];
      parts_of_speech?: string[];
    }>;
  }>;
};

function normalizeJlpt(tags: string[] | undefined): string | null {
  // Jisho returns e.g. "jlpt-n5"; surface the highest (hardest) level present.
  if (!tags?.length) return null;
  const levels = tags
    .map((t) => t.match(/jlpt-(n[1-5])/i)?.[1]?.toUpperCase())
    .filter((x): x is string => Boolean(x))
    .sort(); // N1 < N2 ... lexicographically; N1 is hardest
  return levels[0] ?? null;
}

export async function lookupJisho(term: string): Promise<JishoEntry | null> {
  const url = `https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(term)}`;
  let json: JishoApiResponse;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    json = (await res.json()) as JishoApiResponse;
  } catch {
    return null;
  }

  // Require an exact match on the term (word or reading). Jisho's fuzzy search
  // returns loose hits (e.g. 矢 for やらかした) that must NOT be trusted —
  // those fall through to the Gemini-fills-everything path for slang/casual.
  const entry = json.data?.find((d) =>
    d.japanese?.some((j) => j.word === term || j.reading === term),
  );
  if (!entry) return null;

  const jp = entry.japanese?.[0];
  const sense = entry.senses?.[0];
  const reading = jp?.reading ?? null;
  const meaningEn = sense?.english_definitions?.join('; ') ?? null;
  // Require at least a reading or an English meaning to count as a hit.
  if (!reading && !meaningEn) return null;

  return {
    reading,
    meaningEn,
    partOfSpeech: sense?.parts_of_speech?.join(', ') || null,
    jlpt: normalizeJlpt(entry.jlpt),
  };
}
