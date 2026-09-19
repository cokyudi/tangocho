import { Check, X } from 'lucide-react';

export default function SpokenResult({ spoken }: { spoken: { heard: string; matched: boolean } }) {
  const Icon = spoken.matched ? Check : X;
  return (
    <p className="inline-flex items-center gap-1.5 text-muted">
      Heard <span className="font-jp text-base text-ink">{spoken.heard || '—'}</span>
      <Icon
        aria-label={spoken.matched ? 'correct' : 'not a match'}
        className={`h-5 w-5 ${spoken.matched ? 'text-ink' : 'text-accent'}`}
        strokeWidth={3}
      />
    </p>
  );
}
