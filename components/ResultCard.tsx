'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

export interface BreakdownRow {
  label: string;
  value: string;
  note?: string;
}

export interface ResultCardProps {
  label: string;
  /** Pre-formatted main number (formatting happens in lib/format.ts). */
  value: string;
  /** e.g. "per hour, USD" — every result shows currency and period. */
  unit: string;
  rows: readonly BreakdownRow[];
  /** Shown instead of the result when inputs can't produce one. */
  error?: string;
  footnote?: ReactNode;
}

/** Main result + breakdown. Shows a sticky summary bar on mobile when scrolled away. */
export function ResultCard(props: ResultCardProps) {
  const { label, value, unit, rows, error, footnote } = props;
  const ref = useRef<HTMLElement>(null);
  const [offscreen, setOffscreen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => setOffscreen(!entry?.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <section
        ref={ref}
        aria-live="polite"
        aria-label="Result"
        className="print-break-avoid rounded-card border border-line bg-bg p-5 shadow-sm sm:p-6"
      >
        {error ? (
          <div role="alert" className="rounded-field border border-error/40 bg-error/5 p-4 text-sm font-semibold text-error">
            {error}
          </div>
        ) : (
          <>
            <p className="text-sm font-semibold text-muted">{label}</p>
            <p className="mt-1 flex flex-wrap items-baseline gap-x-2">
              <span className="border-b-4 border-accent text-4xl font-bold tabular-nums text-primary sm:text-5xl">
                {value}
              </span>
              <span className="text-sm text-muted">{unit}</span>
            </p>
            <dl className="mt-5 divide-y divide-line border-t border-line text-sm">
              {rows.map((r) => (
                <div key={r.label} className="flex items-baseline justify-between gap-4 py-2.5">
                  <dt className="text-muted">
                    {r.label}
                    {r.note ? <span className="block text-xs">{r.note}</span> : null}
                  </dt>
                  <dd className="text-right font-semibold tabular-nums text-ink">{r.value}</dd>
                </div>
              ))}
            </dl>
            {footnote ? <div className="mt-3 text-xs text-muted">{footnote}</div> : null}
          </>
        )}
      </section>
      {!error && offscreen ? (
        <div
          className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 px-4 py-2.5 shadow-[0_-4px_12px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden"
          aria-hidden="true"
        >
          <p className="flex items-baseline justify-between gap-3 text-sm">
            <span className="text-muted">{label}</span>
            <span>
              <span className="text-lg font-bold tabular-nums text-primary">{value}</span>{' '}
              <span className="text-xs text-muted">{unit}</span>
            </span>
          </p>
        </div>
      ) : null}
    </>
  );
}
