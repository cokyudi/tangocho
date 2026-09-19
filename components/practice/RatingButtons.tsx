import { Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { reviewSrs, type Rating } from '@/lib/srs';
import type { PracticeWord } from '@/components/practice/PracticeClient';

const RATINGS: { rating: Rating; label: string; variant: 'accent' | 'neutral' }[] = [
  { rating: 'forgot', label: 'Forgot', variant: 'neutral' },
  { rating: 'hard', label: 'Hard', variant: 'neutral' },
  { rating: 'easy', label: 'Easy', variant: 'accent' },
];

function intervalLabel(days: number) {
  if (days < 1) return '<1d';
  if (days < 30) return `${days}d`;
  if (days < 365) return `${Math.round(days / 30)}mo`;
  return `${Math.round(days / 365)}y`;
}

export default function RatingButtons({
  word,
  pending,
  onRate,
  suggest,
}: {
  word: PracticeWord;
  pending: Rating | null;
  onRate: (rating: Rating) => void;
  // Highlight this rating instead of the default (Easy), e.g. Forgot after a missed Speak.
  suggest?: Rating;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {RATINGS.map(({ rating, label, variant }) => {
        const preview = reviewSrs(
          {
            ease_factor: word.ease_factor,
            interval: word.interval,
            repetitions: word.repetitions,
          },
          rating,
        );
        return (
          <Button
            key={rating}
            variant={suggest ? (rating === suggest ? 'accent' : 'neutral') : variant}
            onClick={() => onRate(rating)}
            disabled={pending !== null}
            className="flex-col !px-2 !py-3"
          >
            {pending === rating ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <span>{label}</span>
                <span className="text-xs font-normal opacity-80">
                  {intervalLabel(preview.interval)}
                </span>
              </>
            )}
          </Button>
        );
      })}
    </div>
  );
}
