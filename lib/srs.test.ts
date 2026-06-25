import { describe, it, expect } from 'vitest';
import { reviewSrs, addDays, DEFAULT_SRS } from './srs';

const today = new Date('2026-06-25T10:00:00');

describe('reviewSrs', () => {
  it('schedules a new card 1 day out on "easy" and counts a repetition', () => {
    const r = reviewSrs(DEFAULT_SRS, 'easy', today);
    expect(r.interval).toBe(1);
    expect(r.repetitions).toBe(1);
    expect(r.ease_factor).toBe(2.6); // 2.5 + 0.1
    expect(r.due_date).toBe('2026-06-26');
  });

  it('uses the classic 1 → 6 day jump on the second success', () => {
    const first = reviewSrs(DEFAULT_SRS, 'easy', today);
    const second = reviewSrs(first, 'easy', today);
    expect(second.interval).toBe(6);
    expect(second.repetitions).toBe(2);
  });

  it('multiplies interval by ease factor from the third success', () => {
    let s = reviewSrs(DEFAULT_SRS, 'easy', today); // i=1
    s = reviewSrs(s, 'easy', today); // i=6
    const third = reviewSrs(s, 'easy', today); // i=round(6*ef)
    expect(third.interval).toBe(Math.round(6 * third.ease_factor));
    expect(third.interval).toBeGreaterThan(6);
  });

  it('resets to 1 day and repetitions 0 on "forgot"', () => {
    let s = reviewSrs(DEFAULT_SRS, 'easy', today);
    s = reviewSrs(s, 'easy', today);
    const lapsed = reviewSrs(s, 'forgot', today);
    expect(lapsed.interval).toBe(1);
    expect(lapsed.repetitions).toBe(0);
    expect(lapsed.due_date).toBe('2026-06-26');
  });

  it('lowers ease factor on "hard" and "forgot", raises on "easy"', () => {
    expect(reviewSrs(DEFAULT_SRS, 'hard', today).ease_factor).toBeCloseTo(2.36, 2);
    expect(reviewSrs(DEFAULT_SRS, 'forgot', today).ease_factor).toBeCloseTo(2.18, 2);
    expect(reviewSrs(DEFAULT_SRS, 'easy', today).ease_factor).toBe(2.6);
  });

  it('never drops ease factor below 1.3', () => {
    let s = { ...DEFAULT_SRS };
    for (let i = 0; i < 20; i++) s = reviewSrs(s, 'forgot', today);
    expect(s.ease_factor).toBe(1.3);
  });
});

describe('addDays', () => {
  it('formats a local date N days ahead', () => {
    expect(addDays(today, 0)).toBe('2026-06-25');
    expect(addDays(today, 7)).toBe('2026-07-02');
  });
});
