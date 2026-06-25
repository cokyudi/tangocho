// SM-2 spaced repetition, 3-button variant.
// Ratings map to SM-2 quality: forgot=2 (fail), hard=3, easy=5.

export type Rating = 'forgot' | 'hard' | 'easy';

export type SrsState = {
  ease_factor: number;
  interval: number; // days
  repetitions: number;
};

export type SrsSchedule = SrsState & { due_date: string }; // due_date: YYYY-MM-DD (local)

const QUALITY: Record<Rating, number> = { forgot: 2, hard: 3, easy: 5 };

export const DEFAULT_SRS: SrsState = { ease_factor: 2.5, interval: 0, repetitions: 0 };

function fmtLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addDays(today: Date, days: number): string {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return fmtLocal(d);
}

export function reviewSrs(state: SrsState, rating: Rating, today: Date = new Date()): SrsSchedule {
  const q = QUALITY[rating];
  let { interval, repetitions } = state;

  // Update ease factor (clamped at 1.3). Applied for every rating.
  let ef = state.ease_factor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  ef = Math.max(1.3, Math.round(ef * 100) / 100);

  if (q < 3) {
    // Lapse: relearn from the start.
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * ef);
    repetitions += 1;
  }

  return { ease_factor: ef, interval, repetitions, due_date: addDays(today, interval) };
}
