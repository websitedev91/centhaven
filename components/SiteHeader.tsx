import Link from 'next/link';
import { staticPages } from '@/config/site';
import { Logo } from './Logo';

export function SiteHeader() {
  const links = staticPages.filter((p) => p.built && p.header);
  return (
    <header className="no-print border-b border-line bg-surface">
      <div className="wrap flex items-center justify-between gap-4 py-3">
        <Logo />
        {links.length > 0 ? (
          <nav aria-label="Main">
            <ul className="flex gap-5 text-sm">
              {links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-ink-muted no-underline hover:text-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </div>
    </header>
  );
}
