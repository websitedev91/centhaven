import type { FaqItem } from '@/lib/seo';

/** FAQ accordion. Answers stay in the HTML (good for SEO) and match the FAQPage JSON-LD. */
export function FaqList({ faqs, heading = 'Frequently asked questions' }: { faqs: readonly FaqItem[]; heading?: string }) {
  if (faqs.length === 0) return null;
  return (
    <section aria-labelledby="faq-heading" className="max-w-[70ch]">
      <h2 id="faq-heading" className="text-2xl">
        {heading}
      </h2>
      <div className="mt-4 divide-y divide-line rounded-card border border-line">
        {faqs.map((f) => (
          <details key={f.q} className="group p-4 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-semibold text-ink">
              <h3 className="text-base">{f.q}</h3>
              <span aria-hidden="true" className="mt-0.5 text-primary transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 text-muted">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
