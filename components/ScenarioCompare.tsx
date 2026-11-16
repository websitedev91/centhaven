'use client';

import { useId, useState, type ReactNode } from 'react';
import { track } from '@/lib/analytics';
import { secondaryButtonClass } from './actionButtonClass';
import { Num } from './Num';
import { useEmbed } from './EmbedMode';

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
  const { title, buttonLabel = 'Show comparison', aName, bName, planA, planB, rows, toolSlug, error } = props;
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const embed = useEmbed();
  if (embed) return null;

  return (
    <section className="print-break-avoid rounded-panel border border-line bg-surface p-5 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="type-h3 text-ink">{title}</h2>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => {
            if (!open) track('scenario_compare', { tool: toolSlug });
            setOpen(!open);
          }}
          className={`no-print ${secondaryButtonClass}`}
        >
          {open ? 'Hide comparison' : buttonLabel}
        </button>
      </div>
      <div id={panelId} hidden={!open} className="mt-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="rounded-panel border border-line bg-paper p-4 sm:p-5">
            <h3 className="type-small mb-4 font-[550] text-ink">{aName}</h3>
            <div className="flex flex-col gap-4">{planA}</div>
          </div>
          <div className="rounded-panel border border-line bg-paper p-4 sm:p-5">
            <h3 className="type-small mb-4 font-[550] text-ink">{bName}</h3>
            <div className="flex flex-col gap-4">{planB}</div>
          </div>
        </div>
        {error ? (
          <p role="alert" className="type-small mt-4 font-[550] text-danger">
            {error}
          </p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="type-small w-full">
              <caption className="sr-only">
                {aName} compared with {bName}
              </caption>
              <thead>
                <tr className="border-b border-line text-left text-ink-muted">
                  <th scope="col" className="py-2 pr-3 font-[550]">
                    &nbsp;
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-[550]">
                    {aName}
                  </th>
                  <th scope="col" className="py-2 text-right font-[550]">
                    {bName}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.label} className="border-b border-line last:border-0">
                    <th scope="row" className="py-3 pr-3 text-left font-normal text-ink-muted">
                      {r.label}
                    </th>
                    <td className={`type-figure py-3 pr-3 text-right ${r.better === 'a' ? 'font-bold text-haven' : 'text-ink'}`}>
                      <Num>{r.a}</Num>
                    </td>
                    <td className={`type-figure py-3 text-right ${r.better === 'b' ? 'font-bold text-haven' : 'text-ink'}`}>
                      <Num>{r.b}</Num>
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
