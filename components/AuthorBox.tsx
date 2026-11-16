import Link from 'next/link';
import { staticPages } from '@/config/site';

/**
 * Short trust note at the end of a tool page: how tools are checked, plus the reviewer when a tool
 * has one (red-risk tools must). No personal author name (removed at Puru's request, 2026-11-16).
 */
export function AuthorBox({ reviewedBy }: { reviewedBy?: string }) {
  const methodology = staticPages.find((p) => p.href === '/methodology')?.built;
  return (
    <section aria-label="How this calculator is checked" className="type-small border-t border-line pt-6">
      {reviewedBy ? <p className="font-[550] text-ink">Reviewed by {reviewedBy}</p> : null}
      <p className={reviewedBy ? 'mt-1 text-ink-muted' : 'text-ink-muted'}>
        Every formula is tested against worked examples before it goes live.
        {methodology ? (
          <>
            {' '}
            <Link href="/methodology">How we build our calculators</Link>.
          </>
        ) : null}
      </p>
    </section>
  );
}
