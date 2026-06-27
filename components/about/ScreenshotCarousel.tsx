'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PhoneFrame from '@/components/about/PhoneFrame';

export type Shot = { src: string; alt: string; caption: string };

export default function ScreenshotCarousel({ shots }: { shots: Shot[] }) {
  const n = shots.length;
  const [[index, dir], setState] = useState<[number, number]>([0, 0]);
  const [paused, setPaused] = useState(false);

  const go = useCallback((d: number) => setState(([i]) => [(i + d + n) % n, d]), [n]);
  const to = (i: number) => setState(([cur]) => [i, i > cur ? 1 : -1]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => go(1), 3800);
    return () => clearInterval(id);
  }, [paused, go]);

  const shot = shots[index];

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="flex items-center justify-center gap-3 sm:gap-6">
        <Arrow label="Previous screen" onClick={() => go(-1)}>
          <ChevronLeft className="h-5 w-5" />
        </Arrow>

        <div className="w-full max-w-[250px] overflow-hidden">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: dir >= 0 ? 48 : -48 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60) go(1);
              else if (info.offset.x > 60) go(-1);
            }}
            className="cursor-grab active:cursor-grabbing"
          >
            <PhoneFrame src={shot.src} alt={shot.alt} />
          </motion.div>
        </div>

        <Arrow label="Next screen" onClick={() => go(1)}>
          <ChevronRight className="h-5 w-5" />
        </Arrow>
      </div>

      <p className="mt-4 text-center text-sm font-display font-bold text-muted">{shot.caption}</p>

      <div className="mt-3 flex justify-center gap-2">
        {shots.map((s, i) => (
          <button
            key={s.src}
            type="button"
            aria-label={`Go to screen ${i + 1}`}
            aria-current={i === index}
            onClick={() => to(i)}
            className={`h-3 w-3 border-2 border-ink transition-colors ${
              i === index ? 'bg-accent' : 'bg-surface'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function Arrow({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="inline-flex h-11 w-11 shrink-0 items-center justify-center border-2 border-ink bg-surface text-fg shadow-retro-sm transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      {children}
    </button>
  );
}
