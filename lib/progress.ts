import { masteryLevel, MASTERY_LEVELS, type MasteryLevel } from './mastery';

export const tokyoDay = (d: Date | string) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo' }).format(new Date(d));

export function computeProgress(
  words: { repetitions: number; interval: number }[],
  logs: { reviewed_at: string }[],
  now = new Date(),
) {
  // Mastery distribution
  const dist: Record<MasteryLevel, number> = { new: 0, learning: 0, young: 0, mature: 0, mastered: 0 };
  for (const w of words) dist[masteryLevel(w)]++;
  const maxDist = Math.max(1, ...MASTERY_LEVELS.map((l) => dist[l]));

  // Reviews per day, last 14 days (Tokyo)
  const counts = new Map<string, number>();
  for (const l of logs) {
    const d = tokyoDay(l.reviewed_at);
    counts.set(d, (counts.get(d) ?? 0) + 1);
  }
  const days: { day: string; count: number; label: string }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = tokyoDay(d);
    days.push({ day: key, count: counts.get(key) ?? 0, label: key.slice(5) });
  }
  const maxDay = Math.max(1, ...days.map((d) => d.count));

  // Current streak (consecutive days with >=1 review, tolerant of no review yet today)
  let streak = 0;
  const cursor = new Date(now);
  if (!counts.has(tokyoDay(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (counts.has(tokyoDay(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return { dist, maxDist, days, maxDay, streak };
}
