import { describe, it, expect } from 'vitest';
import { keepSuggestions, type GeneratedItem } from './daily';

const item = (term: string, over: Partial<GeneratedItem> = {}): GeneratedItem => ({
  friendIndex: 0,
  term,
  reading: '',
  meaningEn: '',
  meaningId: '',
  partOfSpeech: null,
  jlpt: null,
  slang: false,
  lineJa: '',
  lineFurigana: '',
  lineEn: '',
  lineId: '',
  ...over,
});
const hit = { reading: 'x', meaningEn: 'x', partOfSpeech: null, jlpt: null };

describe('keepSuggestions', () => {
  it('keeps Jisho-confirmed words and flagged slang, drops unconfirmed non-slang', () => {
    const kept = keepSuggestions(
      [item('稟議'), item('エモい', { slang: true }), item('でっちあげ語')],
      [hit, null, null],
      new Set(),
      1,
    );
    expect(kept.map((k) => k.term)).toEqual(['稟議', 'エモい']);
  });

  it('drops words already seen, repeats within the batch, and bad friend indexes', () => {
    const kept = keepSuggestions(
      [item('伏線'), item(' 紅葉 '), item('紅葉'), item('会議', { friendIndex: 3 })],
      [hit, hit, hit, hit],
      new Set(['伏線']),
      2,
    );
    expect(kept.map((k) => k.term)).toEqual(['紅葉']);
  });

  it('caps the set at 4', () => {
    const items = ['一', '二', '三', '四', '五'].map((t) => item(t));
    expect(keepSuggestions(items, items.map(() => hit), new Set(), 1)).toHaveLength(4);
  });
});
