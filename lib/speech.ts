// Browser speech: TTS via speechSynthesis, recognition via the Web Speech API.

// lib.dom has no SpeechRecognition types; declare just what we use.
export type Recognition = {
  lang: string;
  maxAlternatives: number;
  interimResults: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  abort: () => void;
};

export function createRecognition(): Recognition | null {
  const w = window as unknown as Record<string, (new () => Recognition) | undefined>;
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  if (!Ctor) return null;
  const r = new Ctor();
  r.lang = 'ja-JP';
  r.maxAlternatives = 5;
  r.interimResults = false;
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

// True if any recognition alternative is the term or its reading. Also accepts
// the target inside a longer phrase (食べ物です), but only for 2+ chars so a
// one-kana word can't match by accident.
export function isMatch(transcripts: string[], word: { term: string; reading: string | null }) {
  const targets = [word.term, word.reading].filter(Boolean).map((t) => normalize(t!));
  return transcripts.some((raw) => {
    const heard = normalize(raw);
    return targets.some((t) => heard === t || (t.length >= 2 && heard.includes(t)));
  });
}
