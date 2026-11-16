import Link from 'next/link';
import { toolPath } from '@/lib/registry';
import type { RegistryRow } from '@/lib/tool-types';

/** Related live tools (3–6). Renders nothing if none are live yet. */
export function RelatedTools({ tools }: { tools: readonly RegistryRow[] }) {
  if (tools.length === 0) return null;
  return (
    <section aria-labelledby="related-heading" className="no-print">
      <h2 id="related-heading" className="type-h2">
        Related tools
      </h2>
      <ul className="mt-6 border-t border-line">
        {tools.map((t) => (
          <li key={t.slug} className="border-b border-line">
            <Link
              href={toolPath(t)}
              className="group block py-4 no-underline"
            >
              <span className="font-[550] text-ink group-hover:text-haven">{t.title}</span>
              <span className="type-small mt-1 block text-ink-muted">{t.meta.subtitle}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
