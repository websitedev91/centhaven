import type { SourceLink } from '@/lib/rates';
import { formatIsoDate } from '@/lib/dates';

/** Official sources for every rate the tool uses (from /rates metadata). */
export function Sources({ sources, pureMathsNote }: { sources: readonly SourceLink[]; pureMathsNote?: string }) {
  return (
    <section aria-labelledby="sources-heading">
      <h2 id="sources-heading" className="text-2xl">
        Sources
      </h2>
      {sources.length === 0 ? (
        <p className="mt-3 measure text-ink-muted">
          {pureMathsNote ??
            'This calculator uses only the numbers you enter. It does not rely on any external fees, tax rates or limits.'}
        </p>
      ) : (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
          {sources.map((s) => (
            <li key={s.id}>
              <a href={s.url} rel="noopener" target="_blank">
                {new URL(s.url).hostname}
              </a>{' '}
              <span className="text-ink-muted">
                — effective {formatIsoDate(s.effectiveFrom)}, verified {formatIsoDate(s.verifiedOn)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
