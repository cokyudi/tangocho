import { describe, expect, it } from 'vitest';
import { isKana, isMatch, normalize } from './speech';

const tabemono = { term: '食べ物', reading: 'たべもの' };

describe('normalize', () => {
  it('folds katakana to hiragana and strips spaces/punctuation', () => {
    expect(normalize('ショク ジ。')).toBe('しょくじ');
  });
});

describe('isMatch', () => {
  it('matches the kanji term', () => {
    expect(isMatch('食べ物', tabemono)).toBe(true);
  });

  it('matches the reading, in katakana too', () => {
    expect(isMatch('タベモノ', tabemono)).toBe(true);
  });

  it('judges only what was heard, not the recognizer runner-ups', () => {
    // らきょう must fail 妥協 even though 妥協 was offered as an alternative.
    expect(isMatch('らきょう', { term: '妥協', reading: 'だきょう' })).toBe(false);
  });

  it('accepts the word inside a short phrase', () => {
    expect(isMatch('食べ物です', tabemono)).toBe(true);
  });

  it('rejects a different word', () => {
    expect(isMatch('たべる', tabemono)).toBe(false);
  });

  it('does not substring-match single-kana words', () => {
    expect(isMatch('はし', { term: 'は', reading: 'は' })).toBe(false);
    expect(isMatch('は', { term: 'は', reading: 'は' })).toBe(true);
  });

  it('handles a missing reading', () => {
    expect(isMatch('すごい', { term: 'すごい', reading: null })).toBe(true);
  });
});

describe('isKana', () => {
  it('is true for hiragana, katakana and long vowels', () => {
    expect(isKana('かんしょう')).toBe(true);
    expect(isKana('タベモノ')).toBe(true);
    expect(isKana('ラーメン')).toBe(true);
  });

  it('is false for kanji or mixed text', () => {
    expect(isKana('鑑賞')).toBe(false);
    expect(isKana('食べ物')).toBe(false);
  });
});
