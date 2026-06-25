'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PlusSquare, LayoutGrid, Layers } from 'lucide-react';

const tabs = [
  { href: '/capture', label: 'Capture', Icon: PlusSquare },
  { href: '/browse', label: 'Browse', Icon: LayoutGrid },
  { href: '/practice', label: 'Practice', Icon: Layers },
];

export default function BottomNav({ dueCount = 0 }: { dueCount?: number }) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-ink bg-paper/95 backdrop-blur">
      <ul className="mx-auto grid w-full max-w-3xl grid-cols-3">
        {tabs.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`flex flex-col items-center gap-1 py-3 text-xs font-display font-bold transition-colors ${
                  active ? 'text-accent' : 'text-muted hover:text-ink'
                }`}
              >
                <span className="relative">
                  <Icon className="h-6 w-6" strokeWidth={active ? 2.5 : 2} />
                  {href === '/practice' && dueCount > 0 && (
                    <span className="absolute -right-2.5 -top-2 inline-flex h-4 min-w-4 items-center justify-center border-2 border-ink bg-accent px-1 text-[10px] font-bold leading-none text-on-accent">
                      {dueCount > 99 ? '99+' : dueCount}
                    </span>
                  )}
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
