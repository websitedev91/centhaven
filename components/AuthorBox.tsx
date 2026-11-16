import Link from 'next/link';
import { site, staticPages } from '@/config/site';

export function AuthorBox({ reviewedBy }: { reviewedBy?: string }) {
  const methodology = staticPages.find((p) => p.href === '/methodology')?.built;
  return (
    <section aria-label="About the author" className="flex items-start gap-4 border-t border-line pt-6">
      <div
        aria-hidden="true"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-mint text-lg font-bold text-haven"
      >
        {site.author.charAt(0)}
      </div>
      <div className="type-small">
        <p className="font-[550] text-ink">Built by {site.author}</p>
        {reviewedBy ? <p className="text-ink">Reviewed by {reviewedBy}</p> : null}
        <p className="mt-1 text-ink-muted">
          Every formula is tested against worked examples before it goes live.
          {methodology ? (
            <>
              {' '}
              <Link href="/methodology">How we build our calculators</Link>.
            </>
          ) : null}
        </p>
      </div>
    </section>
  );
}
