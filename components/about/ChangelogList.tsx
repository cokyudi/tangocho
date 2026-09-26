import type { ChangelogEntry } from '@/constants/changelog';
import type { Language } from '@/constants/aboutCopy';

export function formatDate(date: string, language: Language, options: Intl.DateTimeFormatOptions) {
  // Parse as UTC so the day never shifts with the viewer's time zone.
  return new Intl.DateTimeFormat(language === 'ja' ? 'ja-JP' : 'en-US', { ...options, timeZone: 'UTC' }).format(
    new Date(`${date}T00:00:00Z`),
  );
}

// Vertical timeline: square markers on an ink rule, newest first.
export default function ChangelogList({
  entries,
  language,
  readPost,
}: {
  entries: ChangelogEntry[];
  language: Language;
  readPost: string;
}) {
  return (
    <ol className="space-y-5 border-l-2 border-ink pl-5">
      {entries.map((e) => (
        <li key={`${e.date}-${e.en.title}`} className="relative space-y-1">
          <span aria-hidden className="absolute -left-[27px] top-1.5 h-3 w-3 border-2 border-ink bg-accent" />
          <time dateTime={e.date} className="block font-display text-xs font-bold text-muted">
            {formatDate(e.date, language, { year: 'numeric', month: 'short', day: 'numeric' })}
          </time>
          <h3 className="font-display font-bold text-ink">{e[language].title}</h3>
          <p className="text-sm text-muted">{e[language].body}</p>
          {e.post && (
            <a href={e.post[language]} className="inline-block font-display text-sm font-bold text-accent">
              {readPost}
            </a>
          )}
        </li>
      ))}
    </ol>
  );
}
