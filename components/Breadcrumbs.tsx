import Link from 'next/link';
import type { Crumb } from '@/lib/seo';

export function Breadcrumbs({ crumbs }: { crumbs: readonly Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="no-print text-sm text-muted">
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
                  <Link href={c.path} className="text-muted hover:text-ink">
                    {c.name}
                  </Link>
                  <span aria-hidden="true">›</span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
