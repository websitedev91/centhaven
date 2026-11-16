import type { SourceLink } from '@/lib/rates';
import { formatIsoDate } from '@/lib/dates';

/** Official sources for every rate the tool uses (from /rates metadata). */
export function Sources({ sources, pureMathsNote }: { sources: readonly SourceLink[]; pureMathsNote?: string }) {
  return (
    <section id="sources" aria-labelledby="sources-heading" className="scroll-mt-24">
      <h2 id="sources-heading" className="type-h2">
        Sources
      </h2>
      {sources.length === 0 ? (
        <p className="mt-4 measure text-ink-muted">
          {pureMathsNote ??
            'This calculator uses only the numbers you enter. It does not rely on any external fees, tax rates or limits.'}
        </p>
      ) : (
        <ul className="type-small mt-4 border-t border-line">
          {sources.map((s) => (
            <li key={s.id} className="border-b border-line py-3">
              <a href={s.url} rel="noopener" target="_blank">
                {new URL(s.url).hostname}
              </a>{' '}
              <span className="text-ink-muted">
                · effective {formatIsoDate(s.effectiveFrom)}, verified {formatIsoDate(s.verifiedOn)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
