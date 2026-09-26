import Link from 'next/link';
import ThemeSwitch from '@/components/ThemeSwitch';
import type { AboutCopy } from '@/constants/aboutCopy';

// Shared by /about and /changelog.
export default function AboutHeader({ toggle, onToggle }: { toggle: AboutCopy['toggle']; onToggle: () => void }) {
  return (
    <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-4">
      <Link href="/" className="font-display text-xl font-bold text-ink">
        tangocho<span className="ml-1 text-accent">単語帳</span>
      </Link>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onToggle}
          aria-label={toggle.aria}
          className="inline-flex h-11 min-w-11 items-center justify-center border-2 border-ink bg-surface px-2 font-display text-sm font-bold text-fg shadow-retro-sm transition-transform duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:text-accent active:translate-x-0.5 active:translate-y-0.5 active:shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {toggle.label}
        </button>
        <ThemeSwitch />
      </div>
    </header>
  );
}
