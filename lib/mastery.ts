export type MasteryLevel = 'new' | 'learning' | 'young' | 'mature' | 'mastered';

export const MASTERY_LABELS: Record<MasteryLevel, string> = {
  new: 'New',
  learning: 'Learning',
  young: 'Young',
  mature: 'Mature',
  mastered: 'Mastered',
};

export const MASTERY_LEVELS: MasteryLevel[] = ['new', 'learning', 'young', 'mature', 'mastered'];

// Derived from SM-2 state, not stored.
export function masteryLevel(word: { repetitions: number; interval: number }): MasteryLevel {
  if (word.repetitions === 0) return 'new';
  if (word.interval < 7) return 'learning';
  if (word.interval < 21) return 'young';
  if (word.interval <= 90) return 'mature';
  return 'mastered';
}

// A word is due if it has never been reviewed or its due date has arrived.
export function isDue(word: { due_date: string | null }, today = new Date()): boolean {
  if (!word.due_date) return true;
  const d = new Date(`${word.due_date}T23:59:59`);
  return d <= today;
}
