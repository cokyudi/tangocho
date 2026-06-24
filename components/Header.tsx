import Link from 'next/link';
import ThemeSwitch from '@/components/ThemeSwitch';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-paper/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-display text-xl font-bold text-ink">
          tangocho<span className="ml-1 text-accent">単語帳</span>
        </Link>
        <ThemeSwitch />
      </div>
    </header>
  );
}
