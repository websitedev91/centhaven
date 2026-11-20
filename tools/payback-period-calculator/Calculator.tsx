'use client';

import dynamic from 'next/dynamic';
import { useRef } from 'react';
import { CalculatorGrid, InputsPanel } from '@/components/CalculatorGrid';
import { ChartLazy, ChartPlaceholder } from '@/components/ChartLazy';
import { CurrencySelect } from '@/components/CurrencySelect';
import { InputCurrency } from '@/components/InputCurrency';
import { InputNumber } from '@/components/InputNumber';
import { ResetIcon } from '@/components/icons';
import { Num } from '@/components/Num';
import { ResultCard } from '@/components/ResultCard';
import { ScenarioCompare } from '@/components/ScenarioCompare';
import { SegmentedControl } from '@/components/SegmentedControl';
import { track } from '@/lib/analytics';
import { formatMoney, formatPercent, type CurrencyCode } from '@/lib/format';
import { useUrlState } from '@/lib/url-state';
import { yearsToDuration } from '@/lib/duration';
import { evenPayback, formatYears, payback, type PaybackMode, type PaybackResult } from './calc';
import {
  MAX_YEARS,
  YEAR_KEYS,
  fieldErrors,
  paybackDefaults,
  paybackErrors,
  paybackSchema,
  paybackVariant,
  planBDefaults,
  planBSchema,
  shownYears,
  switchPaybackCurrency,
  toCalcInput,
  type PaybackState,
} from './schema';

const SLUG = 'payback-period-calculator';
const FIX_FIELDS = 'Check the highlighted fields to see your result.';

const MODE_OPTIONS: readonly { value: PaybackMode; label: string }[] = [
  { value: 'even', label: 'Same every year' },
  { value: 'uneven', label: 'Different each year' },
];

const RunningTotalChart = dynamic(() => import('./Chart'), { ssr: false, loading: () => <ChartPlaceholder /> });

export default function PaybackPeriodCalculator() {
  const { state: s, setField, setAll, reset, touched } = useUrlState(paybackSchema, paybackDefaults, { variant: paybackVariant });
  const { state: b, setField: setB } = useUrlState(planBSchema, planBDefaults, { prefix: 'b_' });
  const tracked = useRef(false);

  function update<K extends keyof PaybackState>(key: K, value: PaybackState[K]) {
    setField(key, value);
    if (!tracked.current) {
      tracked.current = true;
      track('calculate', { tool: SLUG });
    }
  }

  const c = s.currency;
  const money = (n: number) => formatMoney(n, c);
  const errors = paybackErrors(s);
  const ok = Object.keys(errors).length === 0;
  const even = s.mode === 'even';
  const label = 'Payback period';
  const n = shownYears(s);

  // Even mode: exact payback from the formula; the table shows the first 10 years.
  const table: PaybackResult | null = ok ? payback(toCalcInput(s)) : null;
  const evenYears = ok && even ? evenPayback(s.inv, s.flow) : null;
  const years: number | null = !ok ? null : even ? evenYears : table!.paidBack ? table!.years : null;

  const bErrors = fieldErrors(planBSchema, b);
  const bYears = ok && even && Object.keys(bErrors).length === 0 ? evenPayback(b.inv, b.flow) : undefined;

  let result;
  if (!ok) {
    result = <ResultCard label={label} value="" unit="" rows={[]} error={FIX_FIELDS} />;
  } else if (years === 0) {
    result = (
      <ResultCard label={label} value={formatYears(0)} unit="Paid back straight away" rows={[]} footnote={<p>With no investment there is nothing to pay back.</p>} />
    );
  } else if (years !== null) {
    const recovered = !even && table ? [{ label: 'Recovered by the end', note: `${money(table.total - s.inv)} more than the investment`, value: money(table.total) }] : [];
    result = (
      <ResultCard
        label={label}
        value={formatYears(years)}
        unit={`${yearsToDuration(years)} · on ${money(s.inv)}`}
        rows={[
          { label: 'Investment', value: money(s.inv) },
          ...(even ? [{ label: 'Yearly cash flow', value: money(s.flow) }] : []),
          ...recovered,
        ]}
        footnote={<p>Assumes the cash comes in evenly through each year. Simple payback: no discounting.</p>}
      />
    );
  } else if (even) {
    result = <ResultCard label={label} value="" unit="" rows={[]} error="Never paid back at this cash flow. Enter a yearly cash flow above 0." />;
  } else {
    const t = table as Extract<PaybackResult, { paidBack: false }>;
    result = (
      <ResultCard
        label={label}
        value=""
        unit=""
        rows={[]}
        error={`Not paid back within ${n} ${n === 1 ? 'year' : 'years'}: ${money(t.total)} recovered, ${formatPercent(t.share)} of the investment.`}
      />
    );
  }

  const rows = table?.rows ?? [];

  return (
    <div className="flex flex-col gap-6">
      <CalculatorGrid
        inputs={
          <InputsPanel
            label="Your investment"
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
                <SegmentedControl<PaybackMode> label="Cash flow" value={s.mode} options={MODE_OPTIONS} onChange={(v) => update('mode', v)} />
              </div>
              <div className="sm:col-span-2">
                <CurrencySelect value={c} onChange={(next: CurrencyCode) => setAll(switchPaybackCurrency(s, next, touched))} />
              </div>
              <InputCurrency
                label="Investment"
                help="What you pay up front. Example values — use your own numbers."
                currency={c}
                value={s.inv}
                onChange={(v) => update('inv', v)}
                error={errors.inv}
              />
              {even ? (
                <InputCurrency
                  label="Yearly cash flow"
                  help="Extra money it brings in, or saves, each year."
                  currency={c}
                  value={s.flow}
                  onChange={(v) => update('flow', v)}
                  error={errors.flow}
                />
              ) : (
                <>
                  <InputNumber
                    label="Years"
                    help={`Up to ${MAX_YEARS}.`}
                    value={s.years}
                    onChange={(v) => update('years', v)}
                    suffix="years"
                    error={errors.years}
                  />
                  <fieldset className="flex flex-col gap-4 sm:col-span-2">
                    <legend className="type-small float-left mb-1 w-full font-[550] text-ink">Cash flow each year</legend>
                    <p className="type-small text-ink-muted">
                      Extra money it brings in, or saves, in each year. Use a minus sign for a year that loses money. Example values.
                    </p>
                    <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                      {YEAR_KEYS.slice(0, n).map((k, i) => (
                        <InputCurrency key={k} label={`Year ${i + 1}`} currency={c} value={s[k]} onChange={(v) => update(k, v)} error={errors[k]} />
                      ))}
                    </div>
                  </fieldset>
                </>
              )}
            </div>
          </InputsPanel>
        }
        result={result}
      />

      {ok && rows.length > 0 && s.inv > 0 ? (
        <>
          <ChartLazy title="Money recovered by year" description={`Running total of the cash flows against the ${money(s.inv)} investment (dashed line).`}>
            <RunningTotalChart rows={rows} investment={s.inv} currency={c} />
          </ChartLazy>
          <div className="print-break-avoid overflow-x-auto rounded-panel border border-line bg-surface p-4 sm:p-8">
            <h3 className="type-h3 text-ink">Year by year</h3>
            <table className="type-small mt-4 w-full">
              <caption className="sr-only">Cash flow, running total and amount still to recover for each year</caption>
              <thead>
                <tr className="border-b border-line text-left text-ink-muted">
                  <th scope="col" className="py-2 pr-2 font-[550]">Year</th>
                  <th scope="col" className="py-2 pr-2 text-right font-[550]">Cash flow</th>
                  <th scope="col" className="py-2 pr-2 text-right font-[550]">Running total</th>
                  <th scope="col" className="py-2 text-right font-[550]">Still to recover</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.year} className="border-b border-line last:border-b-0">
                    <th scope="row" className="py-2 pr-2 text-left font-normal">
                      {row.year}
                    </th>
                    <td className="py-2 pr-2 text-right tabular-nums">
                      <Num>{money(row.flow)}</Num>
                    </td>
                    <td className="py-2 pr-2 text-right tabular-nums">
                      <Num>{money(row.total)}</Num>
                    </td>
                    <td className="py-2 text-right tabular-nums">{row.left === 0 ? 'Paid back' : <Num>{money(row.left)}</Num>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}

      {even ? (
        <ScenarioCompare
          title="Compare two investments"
          aName="Investment A (your inputs)"
          bName="Investment B"
          toolSlug={SLUG}
          error={!ok || bYears === undefined ? FIX_FIELDS : undefined}
          planA={
            <dl className="type-small grid grid-cols-2 gap-y-2">
              <dt className="text-ink-muted">Investment</dt>
              <dd className="text-right font-[550] tabular-nums">{money(s.inv)}</dd>
              <dt className="text-ink-muted">Yearly cash flow</dt>
              <dd className="text-right font-[550] tabular-nums">{money(s.flow)}</dd>
              <dd className="col-span-2 mt-2 text-ink-muted">Change these in the calculator above.</dd>
            </dl>
          }
          planB={
            <>
              <InputCurrency label="Investment" currency={c} value={b.inv} onChange={(v) => setB('inv', v)} error={bErrors.inv} />
              <InputCurrency label="Yearly cash flow" currency={c} value={b.flow} onChange={(v) => setB('flow', v)} error={bErrors.flow} />
            </>
          }
          rows={
            ok && bYears !== undefined
              ? [
                  {
                    label: 'Payback period',
                    a: years === null ? 'Never' : formatYears(years),
                    b: bYears === null ? 'Never' : formatYears(bYears),
                    better:
                      years === null && bYears === null
                        ? undefined
                        : years === null
                          ? 'b'
                          : bYears === null
                            ? 'a'
                            : years < bYears
                              ? 'a'
                              : bYears < years
                                ? 'b'
                                : undefined,
                  },
                ]
              : []
          }
        />
      ) : null}
    </div>
  );
}
