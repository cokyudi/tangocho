import Image from 'next/image';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Furigana from '@/components/Furigana';
import FuriganaText from '@/components/FuriganaText';
import type { AboutCopy } from '@/constants/aboutCopy';

const PAGES = [
  { src: '/story/notebook-1.jpg', tilt: '-rotate-2' },
  { src: '/story/notebook-2.jpg', tilt: 'rotate-2' },
];

export default function AboutStory({ t }: { t: AboutCopy['story'] }) {
  const s = t.sample;
  return (
    <section className="space-y-6">
      <h2 className="font-display text-2xl font-bold text-ink">{t.heading}</h2>
      <div className="mx-auto grid max-w-xl grid-cols-2 gap-4 px-2 sm:gap-8">
        {PAGES.map((p, i) => (
          <figure key={p.src} className={`border-2 border-ink bg-surface p-1.5 shadow-retro ${p.tilt}`}>
            <Image
              src={p.src}
              alt={t.alts[i]}
              width={900}
              height={1200}
              sizes="(min-width: 640px) 270px, 45vw"
              className="block h-auto w-full brightness-110 contrast-125"
            />
          </figure>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-[1.3fr_1fr]">
        <Card className="space-y-3 p-5 text-muted">
          {t.body.map((para) => (
            <p key={para}>{para}</p>
          ))}
        </Card>
        <Card className="space-y-3 self-start p-5">
          <p className="font-display text-xs font-bold uppercase tracking-wide text-muted">{s.label}</p>
          <div className="flex items-end justify-between gap-2">
            <Furigana term="伏線" reading="ふくせん" className="text-3xl font-bold text-ink" />
            <Badge variant="highlight">{s.source}</Badge>
          </div>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
            <dt className="font-display font-bold text-accent">EN</dt>
            <dd className="text-fg">{s.en}</dd>
            <dt className="font-display font-bold text-accent">ID</dt>
            <dd className="text-fg">{s.id}</dd>
          </dl>
          <FuriganaText text={s.example} className="block border-t-2 border-ink/15 pt-3 text-sm text-fg" />
        </Card>
      </div>
    </section>
  );
}
