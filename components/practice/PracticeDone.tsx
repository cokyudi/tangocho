import Button from '@/components/ui/Button';

export default function PracticeDone({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 text-center">
      <h1 className="font-display text-3xl font-bold text-ink">{title}</h1>
      <p className="max-w-sm text-muted">{subtitle}</p>
      <div className="flex gap-3">
        <Button href="/capture">+ Add a word</Button>
        <Button href="/browse" variant="neutral">
          Browse
        </Button>
      </div>
    </div>
  );
}
