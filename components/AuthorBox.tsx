import Link from 'next/link';
import { site } from '@/config/site';

export function AuthorBox({ reviewedBy }: { reviewedBy?: string }) {
  return (
    <section aria-label="About the author" className="flex items-start gap-4 rounded-card border border-line p-5">
      <div
        aria-hidden="true"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-white"
      >
        {site.author.charAt(0)}
      </div>
      <div className="text-sm">
        <p className="font-semibold text-ink">Built by {site.author}</p>
        {reviewedBy ? <p className="text-ink">Reviewed by {reviewedBy}</p> : null}
        <p className="mt-1 text-muted">
          Every formula is tested against worked examples before it goes live.{' '}
          <Link href="/methodology">How we build our calculators</Link>.
        </p>
      </div>
    </section>
  );
}
