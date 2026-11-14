import Link from 'next/link';
import { Logo } from './Logo';

export function SiteHeader() {
  return (
    <header className="no-print border-b border-line bg-bg">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Logo />
        <nav aria-label="Main">
          <ul className="flex gap-5 text-sm">
            <li>
              <Link href="/about" className="text-muted no-underline hover:text-ink">
                About
              </Link>
            </li>
            <li>
              <Link href="/methodology" className="text-muted no-underline hover:text-ink">
                Methodology
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
