// Slow infinite marquee of example "sources" — ties into the app's hook of
// remembering where each word was learned. Duplicated list + translateX(-50%)
// for a seamless loop; the global reduced-motion rule freezes it.
const SOURCES = [
  'Midnight Diner S2',
  'Sato-san at work',
  'Twitter',
  '朝のニュース',
  'YouTube',
  '街の看板',
  'テラスハウス',
  '友達との会話',
  'アニメ',
  'ドラマ',
];

export default function SourceMarquee() {
  return (
    <div className="overflow-hidden border-y-2 border-ink py-3" aria-hidden>
      <div className="flex w-max animate-marquee gap-3 pr-3">
        {[...SOURCES, ...SOURCES].map((s, i) => (
          <span
            key={i}
            className="whitespace-nowrap border-2 border-ink bg-surface px-3 py-1 text-sm font-display font-bold text-fg shadow-retro-sm"
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}
