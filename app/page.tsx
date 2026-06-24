import Link from 'next/link';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export default function Home() {
  // Placeholder stats — wired to Supabase in later phases.
  const stats = [
    { label: 'Words', value: 0 },
    { label: 'Due today', value: 0 },
    { label: 'Mastered', value: 0 },
  ];

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="font-display text-3xl font-bold text-ink">
          おかえり <span className="text-accent">👋</span>
        </h1>
        <p className="text-muted">Capture a word the moment you hear it.</p>
      </section>

      <section className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <Card key={s.label} className="flex flex-col items-center gap-1 p-4">
            <span className="font-display text-2xl font-bold text-ink">{s.value}</span>
            <span className="text-center text-xs text-muted">{s.label}</span>
          </Card>
        ))}
      </section>

      <section className="flex flex-col gap-3 sm:flex-row">
        <Button href="/capture" className="flex-1">
          + Add a word
        </Button>
        <Button href="/practice" variant="neutral" className="flex-1">
          Start practice
        </Button>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-bold text-ink">Recently added</h2>
        <Card className="p-6 text-center text-muted">
          <p>No words yet.</p>
          <Link href="/capture" className="mt-2 inline-block font-display font-bold text-accent">
            Add your first word →
          </Link>
        </Card>
      </section>

      <p className="text-center">
        <Badge variant="highlight">Phase 0 · skeleton</Badge>
      </p>
    </div>
  );
}
