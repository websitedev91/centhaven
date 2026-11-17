import Link from 'next/link';
import { reportMistakeHref, site, staticPages } from '@/config/site';
import { absoluteUrl } from '@/lib/seo';

/**
 * Byline and trust note at the end of a tool page. Authorship is the brand only: no personal
 * author or reviewer names anywhere (Puru, 2026-11-18). "Report a mistake" opens the visitor's
 * email app addressed to the contact email, with the page URL in the subject.
 */
export function AuthorBox({ path }: { path: string }) {
  const methodology = staticPages.find((p) => p.href === '/methodology')?.built;
  return (
    <section aria-label="Who builds this calculator" className="type-small border-t border-line pt-6">
      <p className="font-[550] text-ink">{site.byline}</p>
      <p className="mt-1 text-ink-muted">
        Every formula is tested against worked examples before it goes live.
        {methodology ? (
          <>
            {' '}
            <Link href="/methodology">How we build our calculators</Link>.
          </>
        ) : null}
      </p>
      <p className="mt-1 text-ink-muted">
        Spotted an error? <a href={reportMistakeHref(absoluteUrl(path))}>Report a mistake</a> or email{' '}
        <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>.
      </p>
    </section>
  );
}
