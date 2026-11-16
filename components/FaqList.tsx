import type { FaqItem } from '@/lib/seo';
import { PlusMinusIcon } from './icons';

/**
 * FAQ (DESIGN.md §5): a list with thin dividers, not boxed cards; plus turns to minus on open.
 * Answers stay in the HTML (good for SEO) and match the FAQPage JSON-LD.
 */
export function FaqList({ faqs, heading = 'Frequently asked questions' }: { faqs: readonly FaqItem[]; heading?: string }) {
  if (faqs.length === 0) return null;
  return (
    <section id="faq" aria-labelledby="faq-heading" className="measure scroll-mt-24">
      <h2 id="faq-heading" className="type-h2">
        {heading}
      </h2>
      <div className="mt-6 border-t border-line">
        {faqs.map((f) => (
          <details key={f.q} className="group border-b border-line [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 text-ink hover:text-haven">
              <h3 className="type-h3">{f.q}</h3>
              <PlusMinusIcon className="mt-0.5 shrink-0 text-haven" />
            </summary>
            <p className="-mt-1 pb-6 pr-10 text-ink-muted">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
