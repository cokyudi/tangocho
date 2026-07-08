import { describe, it, expect, vi, afterEach } from 'vitest';
import { lookupJisho } from './jisho';

type JishoDatum = {
  jlpt?: string[];
  japanese?: Array<{ word?: string; reading?: string }>;
  senses?: Array<{ english_definitions?: string[]; parts_of_speech?: string[] }>;
};

function mockJisho(data: JishoDatum[] | null, ok = true) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      ok,
      json: async () => ({ data }),
    })),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('lookupJisho', () => {
  it('returns the entry on an exact word match', async () => {
    mockJisho([
      {
        jlpt: ['jlpt-n5'],
        japanese: [{ word: '学校', reading: 'がっこう' }],
        senses: [{ english_definitions: ['school'], parts_of_speech: ['Noun'] }],
      },
    ]);
    const r = await lookupJisho('学校');
    expect(r).toEqual({ reading: 'がっこう', meaningEn: 'school', partOfSpeech: 'Noun', jlpt: 'N5' });
  });

  it('returns the entry on an exact reading match (kana input)', async () => {
    mockJisho([
      {
        japanese: [{ word: '学校', reading: 'がっこう' }],
        senses: [{ english_definitions: ['school'] }],
      },
    ]);
    const r = await lookupJisho('がっこう');
    expect(r?.meaningEn).toBe('school');
  });

  it('rejects fuzzy-only hits so slang falls through to null', async () => {
    // Jisho's fuzzy search returns 矢 (や) for やらかした — neither word nor
    // reading equals the query, so it must NOT be trusted.
    mockJisho([
      {
        japanese: [{ word: '矢', reading: 'や' }],
        senses: [{ english_definitions: ['arrow'] }],
      },
    ]);
    expect(await lookupJisho('やらかした')).toBeNull();
  });

  it('surfaces the hardest JLPT level present', async () => {
    mockJisho([
      {
        jlpt: ['jlpt-n5', 'jlpt-n1', 'jlpt-n3'],
        japanese: [{ word: '手', reading: 'て' }],
        senses: [{ english_definitions: ['hand'] }],
      },
    ]);
    expect((await lookupJisho('手'))?.jlpt).toBe('N1');
  });

  it('joins multiple definitions and parts of speech', async () => {
    mockJisho([
      {
        japanese: [{ word: '面白い', reading: 'おもしろい' }],
        senses: [
          { english_definitions: ['interesting', 'fascinating'], parts_of_speech: ['I-adjective', 'Noun'] },
        ],
      },
    ]);
    const r = await lookupJisho('面白い');
    expect(r?.meaningEn).toBe('interesting; fascinating');
    expect(r?.partOfSpeech).toBe('I-adjective, Noun');
  });

  it('returns null when Jisho has no data', async () => {
    mockJisho([]);
    expect(await lookupJisho('存在しない語')).toBeNull();
  });

  it('returns null on a non-ok response', async () => {
    mockJisho(null, false);
    expect(await lookupJisho('学校')).toBeNull();
  });

  it('returns null when a matched entry has neither reading nor meaning', async () => {
    mockJisho([{ japanese: [{ word: '空' }], senses: [{}] }]);
    expect(await lookupJisho('空')).toBeNull();
  });

  it('returns null when fetch throws (network/timeout)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('timeout');
      }),
    );
    expect(await lookupJisho('学校')).toBeNull();
  });

  it('has no jlpt when tags are absent', async () => {
    mockJisho([
      { japanese: [{ word: 'ワンチャン', reading: 'ワンチャン' }], senses: [{ english_definitions: ['one chance'] }] },
    ]);
    expect((await lookupJisho('ワンチャン'))?.jlpt).toBeNull();
  });
});
