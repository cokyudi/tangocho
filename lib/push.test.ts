import { describe, it, expect } from 'vitest';
import { dailyPayload } from './push';

const ken = { line_ja: '昨日ゲームに没頭しすぎた。', friends: { name: 'ケン' } };

describe('dailyPayload', () => {
  it('leads with the first friend line and counts words and dues', () => {
    expect(dailyPayload([ken, ken], 3)).toEqual({
      title: 'ケン: 「昨日ゲームに没頭しすぎた。」',
      body: '2 new words · 3 due',
      url: '/',
    });
  });

  it('falls back to a review title when there are no friend words', () => {
    expect(dailyPayload([], 5)).toMatchObject({ title: '今日の復習', body: '5 due' });
  });

  it('sends nothing when there is nothing to do', () => {
    expect(dailyPayload([], 0)).toBeNull();
  });
});
