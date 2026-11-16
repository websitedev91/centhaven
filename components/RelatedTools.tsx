import Link from 'next/link';
import { toolPath } from '@/lib/registry';
import type { RegistryRow } from '@/lib/tool-types';

/** Related live tools (3–6). Renders nothing if none are live yet. */
export function RelatedTools({ tools }: { tools: readonly RegistryRow[] }) {
  if (tools.length === 0) return null;
  return (
    <section aria-labelledby="related-heading" className="no-print">
      <h2 id="related-heading" className="text-2xl">
        Related tools
      </h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((t) => (
          <li key={t.slug}>
            <Link
              href={toolPath(t)}
              className="block h-full rounded-panel border border-line p-4 no-underline hover:border-haven"
            >
              <span className="font-semibold text-ink">{t.title}</span>
              <span className="mt-1 block text-sm text-ink-muted">{t.meta.subtitle}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
