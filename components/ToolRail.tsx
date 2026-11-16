import Link from 'next/link';
import { toolPath } from '@/lib/registry';
import type { RegistryRow } from '@/lib/tool-types';

/**
 * Tool page right rail (DESIGN.md §9): "On this page" links and related live tools.
 * Sticky on desktop; hidden below lg, where related tools stay in the main column.
 */
export function ToolRail({ sections, related }: { sections: { id: string; text: string }[]; related: readonly RegistryRow[] }) {
  return (
    <aside aria-label="On this page and related tools" className="no-print sticky top-[92px] flex flex-col gap-10">
      {sections.length > 0 ? (
        <nav aria-labelledby="otp-heading">
          <h2 id="otp-heading" className="type-small font-[550] text-ink-muted">
            On this page
          </h2>
          <ul className="mt-3 border-l border-line">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="-ml-px block border-l border-transparent py-1.5 pl-4 text-[15px] leading-[22px] text-ink-muted no-underline hover:border-haven hover:text-ink"
                >
                  {s.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
      {related.length > 0 ? (
        <nav aria-labelledby="rail-related-heading">
          <h2 id="rail-related-heading" className="type-small font-[550] text-ink-muted">
            Related tools
          </h2>
          <ul className="mt-3 border-t border-line">
            {related.map((t) => (
              <li key={t.slug} className="border-b border-line">
                <Link href={toolPath(t)} className="block py-3 text-[15px] font-[550] leading-[22px] text-ink no-underline hover:text-haven">
                  {t.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </aside>
  );
}
