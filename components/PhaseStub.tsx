import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

export default function PhaseStub({
  title,
  subtitle,
  phase,
}: {
  title: string;
  subtitle: string;
  phase: string;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink">{title}</h1>
        <Badge variant="highlight">{phase}</Badge>
      </div>
      <Card className="p-8 text-center text-muted">{subtitle}</Card>
    </div>
  );
}
