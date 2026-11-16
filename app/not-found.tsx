import Link from 'next/link';
import { SearchLauncher } from '@/components/HeaderNav';
import { navCategories, searchIndex } from '@/lib/nav';

export const metadata = { title: 'Page not found | CentHaven', robots: { index: false } };

/** 404 (DESIGN.md §9): a short centred message, search and links to the top categories. */
export default function NotFound() {
  const categories = navCategories();
  const items = searchIndex();
  return (
    <div className="wrap flex flex-col items-center py-section text-center">
      <p className="type-figure text-haven">404</p>
      <h1 className="type-h1 mt-3">Page not found</h1>
      <p className="mt-4 max-w-[44ch] text-ink-muted">We couldn&apos;t find that page. It may have moved, or the link may be mistyped.</p>
      {items.length > 0 ? (
        <div className="mt-8 w-full max-w-sm [&>button]:w-full">
          <SearchLauncher items={items} shortcut={false} label="Search calculators" />
        </div>
      ) : null}
      <nav aria-label="Popular sections" className="mt-10">
        <ul className="flex flex-wrap justify-center gap-x-6 gap-y-3">
          <li>
            <Link href="/">Home</Link>
          </li>
          {categories.slice(0, 4).map((c) => (
            <li key={c.slug}>
              <Link href={c.href}>{c.name} calculators</Link>
            </li>
          ))}
          <li>
            <Link href="/methodology">How we check our numbers</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
