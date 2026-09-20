// Browser speech: TTS via speechSynthesis, recognition via the Web Speech API.

// lib.dom has no SpeechRecognition types; declare just what we use.
export type Recognition = {
  lang: string;
  maxAlternatives: number;
  interimResults: boolean;
  onresult:
    | ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void)
    | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

export function createRecognition(): Recognition | null {
  const w = window as unknown as Record<string, (new () => Recognition) | undefined>;
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  if (!Ctor) return null;
  const r = new Ctor();
  r.lang = 'ja-JP';
  // One alternative only: judge what was actually said, not the recognizer's
  // 4 runner-up guesses (らきょう would pass because 妥協 sat further down).
  r.maxAlternatives = 1;
  // Interim on: Safari often never finalizes, so the hook keeps the latest partial.
  r.interimResults = true;
  return r;
}

export function speak(text: string) {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ja-JP';
  speechSynthesis.speak(u);
}

// Katakana → hiragana, drop whitespace/punctuation, so ショクジ matches しょくじ.
export function normalize(s: string) {
  return s
    .replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60))
    .replace(/[\s\p{P}]/gu, '');
}

// True if what was heard is the term or its reading. Also accepts the target
// inside a longer phrase (食べ物です), but only for 2+ chars so a one-kana word
// can't match by accident.
export function isMatch(raw: string, word: { term: string; reading: string | null }) {
  const heard = normalize(raw);
  return [word.term, word.reading]
    .filter(Boolean)
    .map((t) => normalize(t!))
    .some((t) => heard === t || (t.length >= 2 && heard.includes(t)));
}

export const isKana = (s: string) => /^[\u3041-\u309f\u30a0-\u30ff\u30fc]+$/.test(normalize(s));

// Reading of a heard term, via Jisho (server route). Cached per session;
// null when unknown or the lookup fails.
const readings = new Map<string, string | null>();

export async function lookupReading(term: string): Promise<string | null> {
  if (readings.has(term)) return readings.get(term)!;
  let reading: string | null = null;
  try {
    const res = await fetch(`/api/reading?q=${encodeURIComponent(term)}`);
    if (res.ok) reading = ((await res.json()) as { reading: string | null }).reading;
  } catch {
    reading = null;
  }
  readings.set(term, reading);
  return reading;
}
