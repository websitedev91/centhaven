'use client';

import { useId, useState, type ReactNode } from 'react';
import { track } from '@/lib/analytics';

export interface CompareRow {
  label: string;
  a: string;
  b: string;
  /** Which side is "better" for this row, if any (adds a subtle highlight). */
  better?: 'a' | 'b';
}

/** "Compare A vs B" side by side. Collapsed by default. */
export function ScenarioCompare(props: {
  title: string;
  buttonLabel?: string;
  aName: string;
  bName: string;
  planA: ReactNode;
  planB: ReactNode;
  rows: readonly CompareRow[];
  toolSlug: string;
  error?: string;
}) {
  const { title, buttonLabel = 'Compare two plans', aName, bName, planA, planB, rows, toolSlug, error } = props;
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <section className="print-break-avoid rounded-card border border-line bg-section p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-ink">{title}</h2>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => {
            if (!open) track('scenario_compare', { tool: toolSlug });
            setOpen(!open);
          }}
          className="no-print rounded-field border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary hover:text-white"
        >
          {open ? 'Hide comparison' : buttonLabel}
        </button>
      </div>
      <div id={panelId} hidden={!open} className="mt-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="rounded-card border border-line bg-bg p-4">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted">{aName}</h3>
            <div className="flex flex-col gap-4">{planA}</div>
          </div>
          <div className="rounded-card border border-line bg-bg p-4">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted">{bName}</h3>
            <div className="flex flex-col gap-4">{planB}</div>
          </div>
        </div>
        {error ? (
          <p role="alert" className="mt-4 text-sm font-semibold text-error">
            {error}
          </p>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">
                {aName} compared with {bName}
              </caption>
              <thead>
                <tr className="border-b border-line text-left text-muted">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    &nbsp;
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    {aName}
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    {bName}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.label} className="border-b border-line last:border-0">
                    <th scope="row" className="py-2 pr-3 text-left font-normal text-muted">
                      {r.label}
                    </th>
                    <td className={`py-2 pr-3 text-right tabular-nums ${r.better === 'a' ? 'font-bold text-primary' : 'text-ink'}`}>
                      {r.a}
                    </td>
                    <td className={`py-2 text-right tabular-nums ${r.better === 'b' ? 'font-bold text-primary' : 'text-ink'}`}>
                      {r.b}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
