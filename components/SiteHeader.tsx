import Link from 'next/link';
import { staticPages } from '@/config/site';
import { navCategories, searchIndex } from '@/lib/nav';
import { Logo } from './Logo';
import { CalculatorsMenu, HeaderFrame, MobileMenu, SearchLauncher } from './HeaderNav';

/**
 * Header (DESIGN.md §6): logo · Calculators ▾ · Methodology · About · Search ⌘K.
 * Mobile: logo + search icon + menu icon (full-height sheet).
 * Menu and search data come from the registry (live tools only).
 */
export function SiteHeader() {
  const categories = navCategories();
  const items = searchIndex();
  const headerLinks = staticPages.filter((p) => p.built && p.header);
  const mobileLinks = staticPages.filter((p) => p.built && (p.header || p.href === '/contact'));

  return (
    <HeaderFrame>
      <div className="wrap flex h-[68px] items-center justify-between gap-6">
        <Logo />
        <div className="hidden items-center gap-2 md:flex">
          <nav aria-label="Main" className="flex items-center gap-1">
            <CalculatorsMenu categories={categories} />
            {headerLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="inline-flex h-10 items-center rounded-field px-3 text-[15px] font-[550] text-ink no-underline hover:text-haven"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="ml-4">
            <SearchLauncher items={items} />
          </div>
        </div>
        <div className="flex items-center gap-1 md:hidden">
          <SearchLauncher items={items} compact />
          <MobileMenu categories={categories} links={mobileLinks.map((l) => ({ href: l.href, label: l.label }))} />
        </div>
      </div>
    </HeaderFrame>
  );
}
