import { describe, it, expect } from 'vitest';
import { computeProgress } from './progress';

// Noon JST, so local-date arithmetic and Tokyo day keys line up.
const now = new Date('2026-06-25T03:00:00Z');
const at = (day: string) => ({ reviewed_at: `${day}T03:00:00Z` });

describe('computeProgress', () => {
  it('counts a streak ending today', () => {
    const { streak } = computeProgress([], [at('2026-06-25'), at('2026-06-24'), at('2026-06-23'), at('2026-06-21')], now);
    expect(streak).toBe(3);
  });

  it('keeps yesterday’s streak alive when nothing is reviewed yet today', () => {
    const { streak } = computeProgress([], [at('2026-06-24'), at('2026-06-23')], now);
    expect(streak).toBe(2);
  });

  it('buckets reviews into the last 14 Tokyo days', () => {
    const { days, maxDay } = computeProgress([], [at('2026-06-25'), at('2026-06-25'), at('2026-06-01')], now);
    expect(days).toHaveLength(14);
    expect(days[13]).toEqual({ day: '2026-06-25', count: 2, label: '06-25' });
    expect(days[0].day).toBe('2026-06-12');
    expect(days.reduce((n, d) => n + d.count, 0)).toBe(2);
    expect(maxDay).toBe(2);
  });

  it('builds the mastery distribution', () => {
    const { dist, maxDist } = computeProgress([{ repetitions: 0, interval: 0 }, { repetitions: 3, interval: 100 }, { repetitions: 1, interval: 1 }, { repetitions: 1, interval: 2 }], [], now);
    expect(dist).toEqual({ new: 1, learning: 2, young: 0, mature: 0, mastered: 1 });
    expect(maxDist).toBe(2);
  });
});
