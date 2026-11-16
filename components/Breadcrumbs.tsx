import Link from 'next/link';
import type { Crumb } from '@/lib/seo';
import { ChevronRightIcon } from './icons';

export function Breadcrumbs({ crumbs }: { crumbs: readonly Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="no-print type-small text-ink-muted">
      <ol className="flex flex-wrap items-center gap-1">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <li key={c.path} className="flex items-center gap-1">
              {last ? (
                <span aria-current="page" className="text-ink">
                  {c.name}
                </span>
              ) : (
                <>
                  <Link href={c.path} className="text-ink-muted no-underline hover:text-ink hover:underline">
                    {c.name}
                  </Link>
                  <ChevronRightIcon size={14} className="text-line" />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
