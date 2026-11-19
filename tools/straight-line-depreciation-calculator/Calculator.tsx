'use client';

import { useRef, useState } from 'react';
import { CalculatorGrid, InputsPanel } from '@/components/CalculatorGrid';
import { CurrencySelect } from '@/components/CurrencySelect';
import { InputCurrency } from '@/components/InputCurrency';
import { InputNumber } from '@/components/InputNumber';
import { secondaryButtonClass } from '@/components/actionButtonClass';
import { DownloadIcon, ResetIcon } from '@/components/icons';
import { Num } from '@/components/Num';
import { ResultCard } from '@/components/ResultCard';
import { SegmentedControl } from '@/components/SegmentedControl';
import { track } from '@/lib/analytics';
import { CATEGORICAL } from '@/lib/chart-palette';
import { formatMoney, formatPercent, type CurrencyCode } from '@/lib/format';
import { downloadCsv, toCsv } from '@/lib/csv';
import { useUrlState } from '@/lib/url-state';
import { monthlySchedule, straightLine, type DepreciationError, type DepreciationResult } from './calc';
import {
  depreciationDefaults,
  depreciationSchema,
  depreciationVariant,
  fieldErrors,
  switchDepreciationCurrency,
  toCalcInput,
  type DepreciationState,
} from './schema';

const SLUG = 'straight-line-depreciation-calculator';
const FIX_FIELDS = 'Check the highlighted fields to see the schedule.';

type View = 'year' | 'month';

export default function StraightLineDepreciationCalculator() {
  const { state: s, setField, setAll, reset, touched } = useUrlState(depreciationSchema, depreciationDefaults, { variant: depreciationVariant });
  const tracked = useRef(false);

  function update<K extends keyof DepreciationState>(key: K, value: DepreciationState[K]) {
    setField(key, value);
    if (!tracked.current) {
      tracked.current = true;
      track('calculate', { tool: SLUG });
    }
  }

  const c = s.currency;
  const money = (n: number) => formatMoney(n, c);
  const errors = fieldErrors(depreciationSchema, s);
  const result: DepreciationResult | DepreciationError =
    Object.keys(errors).length > 0 ? { ok: false, error: FIX_FIELDS } : straightLine(toCalcInput(s));
  const label = 'Depreciation per year';

  const [view, setView] = useState<View>('year');
  const months = result.ok && view === 'month' ? monthlySchedule(toCalcInput(s)) : [];
  const rows = !result.ok
    ? []
    : view === 'year' || !Array.isArray(months)
      ? result.schedule.map((r) => ({ key: r.year, label: String(r.year), ...r }))
      : months.map((m) => ({ key: m.month, label: `${m.month} (year ${m.year})`, ...m }));

  function downloadSchedule() {
    const all = monthlySchedule(toCalcInput(s));
    if (!result.ok || !Array.isArray(all)) return;
    const csv =
      view === 'year'
        ? toCsv(
            ['Year', `Depreciation (${c})`, `Accumulated (${c})`, `Book value (${c})`],
            result.schedule.map((r) => [r.year, r.depreciation, r.accumulated, r.bookValue]),
          )
        : toCsv(
            ['Month', 'Year', `Depreciation (${c})`, `Accumulated (${c})`, `Book value (${c})`],
            all.map((m) => [m.month, m.year, m.depreciation, m.accumulated, m.bookValue]),
          );
    downloadCsv(`depreciation-schedule-${view === 'year' ? 'yearly' : 'monthly'}.csv`, csv);
    track('download_csv', { tool: SLUG, view });
  }

  return (
    <div className="flex flex-col gap-6">
      <CalculatorGrid
        inputs={
          <InputsPanel
            label="Your asset"
            footer={
              <button
                type="button"
                onClick={reset}
                className="no-print type-small inline-flex items-center gap-1.5 font-[550] text-ink-muted hover:text-ink"
              >
                <ResetIcon size={16} />
                Reset to defaults
              </button>
            }
          >
            <div className="grid gap-x-6 gap-y-7 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <CurrencySelect value={c} onChange={(next: CurrencyCode) => setAll(switchDepreciationCurrency(s, next, touched))} />
              </div>
              <InputCurrency
                label="Asset cost"
                help="What you paid, including delivery and setup."
                currency={c}
                value={s.cost}
                onChange={(v) => update('cost', v)}
                error={errors.cost}
              />
              <InputCurrency
                label="Salvage value"
                help="What it will be worth at the end. Use 0 if nothing."
                currency={c}
                value={s.salvage}
                onChange={(v) => update('salvage', v)}
                error={errors.salvage}
              />
              <InputNumber
                label="Useful life"
                value={s.lifeYears}
                onChange={(v) => update('lifeYears', v)}
                suffix="years"
                error={errors.lifeYears}
              />
              <InputNumber
                label="Months used in the first year"
                help="12 if you bought it at the start of your year."
                value={s.firstYearMonths}
                onChange={(v) => update('firstYearMonths', v)}
                suffix="months"
                error={errors.firstYearMonths}
              />
            </div>
          </InputsPanel>
        }
        result={
          result.ok ? (
            <ResultCard
              label={label}
              value={money(result.annual)}
              unit={`per full year · ${c}`}
              rows={[
                { label: 'Depreciation per month', value: money(result.monthly) },
                { label: 'Yearly rate', note: 'Of the depreciable amount', value: formatPercent(result.rate, 2) },
                { label: 'Depreciable amount', note: 'Cost minus salvage value', value: money(result.depreciable) },
                { label: 'Book value at the end', value: money(s.salvage) },
              ]}
              footnote="Straight-line accounting method. Tax depreciation follows your country's own rules."
            />
          ) : (
            <ResultCard label={label} value="" unit="" rows={[]} error={result.error} />
          )
        }
      />

      {result.ok ? (
        <section aria-labelledby="schedule-heading" className="print-break-avoid min-w-0 rounded-panel border border-line bg-surface p-5 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="schedule-heading" className="type-h3 text-ink">
                Depreciation schedule
              </h2>
              <p className="type-small mt-1 text-ink-muted">
                Book value at the end of each {view === 'year' ? 'year' : 'month'}. The bar shows how much of the cost is left.
              </p>
            </div>
            <div className="no-print flex flex-wrap items-end gap-3">
              <SegmentedControl<View>
                label="Show"
                value={view}
                onChange={setView}
                options={[
                  { value: 'year', label: 'Yearly' },
                  { value: 'month', label: 'Monthly' },
                ]}
              />
              <button type="button" onClick={downloadSchedule} className={`${secondaryButtonClass} h-12`}>
                <DownloadIcon size={18} />
                Download schedule (CSV)
              </button>
            </div>
          </div>
          <div className={`mt-6 overflow-x-auto ${view === 'month' ? 'max-h-[480px] overflow-y-auto' : ''}`}>
            <table className="type-small w-full">
              <thead className={view === 'month' ? 'sticky top-0 bg-surface' : undefined}>
                <tr className="border-b border-line text-left text-ink-muted">
                  <th scope="col" className="py-2 pr-3 font-[550]">
                    {view === 'year' ? 'Year' : 'Month'}
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-[550]">
                    Depreciation
                  </th>
                  <th scope="col" className="hidden py-2 pr-3 text-right font-[550] sm:table-cell">
                    Accumulated
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-[550]">
                    Book value
                  </th>
                  <th scope="col" className="hidden w-[28%] py-2 font-[550] sm:table-cell">
                    <span className="sr-only">Share of cost left</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.key} className="border-b border-line last:border-0">
                    <th scope="row" className="py-3 pr-3 text-left font-normal text-ink-muted">
                      {row.label}
                    </th>
                    <td className="type-figure py-3 pr-3 text-right text-ink">
                      <Num>{money(row.depreciation)}</Num>
                    </td>
                    <td className="type-figure hidden py-3 pr-3 text-right text-ink sm:table-cell">
                      <Num>{money(row.accumulated)}</Num>
                    </td>
                    <td className="type-figure py-3 pr-3 text-right text-ink">
                      <Num>{money(row.bookValue)}</Num>
                    </td>
                    <td className="hidden py-3 sm:table-cell" aria-hidden="true">
                      <div className="h-2 w-full rounded-[4px] bg-paper">
                        <div
                          className="h-2 rounded-[4px]"
                          style={{ width: `${s.cost > 0 ? (row.bookValue / s.cost) * 100 : 0}%`, background: CATEGORICAL[0] }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}
