import { Check, X, Loader2 } from 'lucide-react';

import type { Spoken } from '@/components/practice/usePracticeSession';

const ICONS = {
  checking: <Loader2 aria-label="checking" className="h-5 w-5 animate-spin text-muted" />,
  match: <Check aria-label="correct" className="h-5 w-5 text-ink" strokeWidth={3} />,
  miss: <X aria-label="not a match" className="h-5 w-5 text-accent" strokeWidth={3} />,
};

export default function SpokenResult({ spoken }: { spoken: Spoken }) {
  return (
    <p className="inline-flex items-center gap-1.5 text-muted">
      Heard <span className="font-jp text-base text-ink">{spoken.text || '—'}</span>
      {ICONS[spoken.status]}
      {spoken.note && <span className="text-xs">{spoken.note}</span>}
    </p>
  );
}
