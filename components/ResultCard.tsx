'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatedNumber } from './AnimatedNumber';
import { Num } from './Num';

export interface BreakdownRow {
  label: string;
  value: string;
  note?: string;
}

export interface ResultCardProps {
  label: string;
  /** Pre-formatted main number (formatting happens in lib/format.ts). */
  value: string;
  /** e.g. "per hour · USD": every result shows currency and period. */
  unit: string;
  rows: readonly BreakdownRow[];
  /** Shown instead of the result when inputs can't produce one. */
  error?: string;
  footnote?: ReactNode;
  /** Colours the main number for signed results: haven when good, danger when bad. */
  tone?: 'positive' | 'negative';
}

/** Long values step down a size so they never overflow the 4-column panel. */
function resultSize(value: string): string {
  if (value.length > 12) return 'type-result !text-[34px] !leading-[40px] md:!text-[44px] md:!leading-[48px]';
  if (value.length > 9) return 'type-result !text-[40px] !leading-[44px] md:!text-[52px] md:!leading-[56px]';
  return 'type-result';
}

/**
 * The result panel (DESIGN.md §5): mint, 12px radius, no shadow. Main number in the
 * `result` style with a 3px brass underline; breakdown as a two-column figure table.
 * On mobile a slim bar at the bottom keeps the main result visible once the panel scrolls away.
 */
export function ResultCard(props: ResultCardProps) {
  const { label, value, unit, rows, error, footnote, tone } = props;
  const toneClass = tone === 'positive' ? 'text-haven' : tone === 'negative' ? 'text-danger' : 'text-ink';
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
        className="print-break-avoid rounded-panel bg-mint p-5 sm:p-6"
      >
        {error ? (
          <div role="alert" className="type-small rounded-field border border-danger/40 bg-surface p-4 font-[550] text-danger">
            {error}
          </div>
        ) : (
          <>
            <p className="type-small font-[550] text-ink-muted">{label}</p>
            <p className="mt-3">
              <AnimatedNumber
                value={value}
                className={`${resultSize(value)} inline-block border-b-[3px] border-brass pb-1.5 ${toneClass}`}
              />
            </p>
            <p className="type-small mt-3 text-ink-muted">{unit}</p>
            <dl className="mt-6 border-t border-line">
              {rows.map((r) => (
                <div key={r.label} className="flex items-baseline justify-between gap-4 border-b border-line py-3 last:border-b-0">
                  <dt className="type-small text-ink-muted">
                    {r.label}
                    {r.note ? <span className="block text-[13px] leading-[18px]">{r.note}</span> : null}
                  </dt>
                  <dd className="type-figure text-right text-ink">
                    <Num>{r.value}</Num>
                  </dd>
                </div>
              ))}
            </dl>
            {footnote ? <div className="type-small mt-4 text-ink-muted">{footnote}</div> : null}
          </>
        )}
      </section>
      {!error && offscreen ? (
        <div
          className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface lg:hidden"
          aria-hidden="true"
        >
          <p className="wrap flex h-14 items-center justify-between gap-3">
            <span className="type-small text-ink-muted">{label}</span>
            <span className="flex items-baseline gap-2">
              <span className="border-b-2 border-brass text-[22px] font-bold leading-7 tabular-nums tracking-[-0.02em] text-ink">
                <Num>{value}</Num>
              </span>
              {/* Period only ("per year"): the full unit is in the panel above. */}
              <span className="type-small whitespace-nowrap text-ink-muted">{unit.split(' · ')[0]}</span>
            </span>
          </p>
        </div>
      ) : null}
    </>
  );
}
