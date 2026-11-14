'use client';

import dynamic from 'next/dynamic';
import { useRef } from 'react';
import { ChartLazy, ChartPlaceholder } from '@/components/ChartLazy';
import { CurrencySelect } from '@/components/CurrencySelect';
import { InputCurrency } from '@/components/InputCurrency';
import { InputNumber } from '@/components/InputNumber';
import { ResultCard } from '@/components/ResultCard';
import { ScenarioCompare } from '@/components/ScenarioCompare';
import { Slider } from '@/components/Slider';
import { track } from '@/lib/analytics';
import { formatMoney, formatNumber, formatPercent, type CurrencyCode } from '@/lib/format';
import { useUrlState } from '@/lib/url-state';
import { calcHourlyRate, WEEKS_PER_YEAR, type HourlyRateError, type HourlyRateResult } from './calc';
import {
  fieldErrors,
  hourlyRateDefaults,
  hourlyRateSchema,
  planBDefaults,
  planBSchema,
  toCalcInput,
  type HourlyRateState,
} from './schema';
import { SLICES } from './slices';

const HourSplitChart = dynamic(() => import('./Chart'), { ssr: false, loading: () => <ChartPlaceholder /> });

const SLUG = 'hourly-rate-calculator';
const FIX_FIELDS = 'Check the highlighted fields to see your rate.';

function money(n: number, c: CurrencyCode) {
  return formatMoney(n, c);
}

export default function HourlyRateCalculator() {
  const [s, set, reset] = useUrlState(hourlyRateSchema, hourlyRateDefaults);
  const [b, setB] = useUrlState(planBSchema, planBDefaults, 'b_');
  const tracked = useRef(false);

  function update<K extends keyof HourlyRateState>(key: K, value: HourlyRateState[K]) {
    set(key, value);
    if (!tracked.current) {
      tracked.current = true;
      track('calculate', { tool: SLUG });
    }
  }

  const errors = fieldErrors(hourlyRateSchema, s);
  const result: HourlyRateResult | HourlyRateError =
    Object.keys(errors).length > 0 ? { ok: false, error: FIX_FIELDS } : calcHourlyRate(toCalcInput(s));
  const c = s.currency;

  const bErrors = fieldErrors(planBSchema, b);
  const resultB: HourlyRateResult | HourlyRateError =
    Object.keys(bErrors).length > 0 ? { ok: false, error: FIX_FIELDS } : calcHourlyRate(toCalcInput({ ...s, ...b }));

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-start">
        <form
          className="rounded-card border border-line bg-bg p-5 shadow-sm sm:p-6"
          aria-label="Your numbers"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <CurrencySelect value={c} onChange={(v) => update('currency', v)} />
            </div>
            <InputCurrency
              label="Target take-home income (per year)"
              help="What you want to keep after tax."
              currency={c}
              value={s.targetIncome}
              onChange={(v) => update('targetIncome', v)}
              min={0}
              max={100_000_000}
              error={errors.targetIncome}
            />
            <InputCurrency
              label="Business expenses (per year)"
              help="Software, equipment, internet, insurance…"
              currency={c}
              value={s.expenses}
              onChange={(v) => update('expenses', v)}
              min={0}
              max={100_000_000}
              error={errors.expenses}
            />
            <div className="sm:col-span-2">
              <Slider
                label="Estimated tax rate"
                help="Your rough total tax rate. Not exact tax advice."
                value={s.taxRate}
                onChange={(v) => update('taxRate', v)}
                min={0}
                max={60}
                format={(v) => `${v}%`}
                error={errors.taxRate}
              />
            </div>
            <InputNumber
              label="Weeks off per year"
              help="Holidays, sick days, public holidays (0–26)."
              value={s.weeksOff}
              onChange={(v) => update('weeksOff', v)}
              min={0}
              max={26}
              suffix="weeks"
              error={errors.weeksOff}
            />
            <InputNumber
              label="Working hours per week"
              help="All hours you work, billable or not (1–80)."
              value={s.hoursPerWeek}
              onChange={(v) => update('hoursPerWeek', v)}
              min={1}
              max={80}
              suffix="hours"
              error={errors.hoursPerWeek}
            />
            <div className="sm:col-span-2">
              <Slider
                label="Billable time"
                help="Share of hours you can actually bill. The rest is admin and sales."
                value={s.billablePct}
                onChange={(v) => update('billablePct', v)}
                min={10}
                max={100}
                format={(v) => `${v}%`}
                error={errors.billablePct}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={reset}
            className="no-print mt-5 text-sm font-semibold text-muted underline hover:text-ink"
          >
            Reset to defaults
          </button>
        </form>

        <div className="lg:sticky lg:top-4">
          {result.ok ? (
            <ResultCard
              label="Minimum hourly rate"
              value={money(result.hourlyRate, c)}
              unit={`per hour · ${c}`}
              rows={[
                {
                  label: 'Day rate',
                  note: `${formatNumber(result.hoursPerDay, 2)}-hour day`,
                  value: money(result.dayRate, c),
                },
                { label: 'Gross revenue needed per year', value: money(result.grossNeeded, c) },
                { label: 'Gross revenue needed per month', value: money(result.monthlyRevenue, c) },
                { label: 'Billable hours per year', value: formatNumber(result.billableHours, 1) },
              ]}
              footnote="Gross revenue covers your take-home pay, tax and expenses."
            />
          ) : (
            <ResultCard label="Minimum hourly rate" value="" unit="" rows={[]} error={result.error} />
          )}
        </div>
      </div>

      {result.ok ? (
        <ChartLazy
          title="Where each hour's rate goes"
          description={`Of every ${money(result.hourlyRate, c)} you bill, per hour:`}
          height={220}
          footer={
              <ul className="flex flex-col gap-2 text-sm">
                {SLICES.map((sl) => (
                  <li key={sl.key} className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2">
                      <span className="inline-block h-3 w-3 rounded-sm" style={{ background: sl.color }} aria-hidden="true" />
                      {sl.label}
                    </span>
                    <span className="tabular-nums">
                      <strong>{money(result.perHour[sl.key], c)}</strong>{' '}
                      <span className="text-muted">({formatPercent(result.perHour[sl.key] / result.hourlyRate)})</span>
                    </span>
                  </li>
                ))}
              </ul>
          }
        >
          <HourSplitChart split={result.perHour} currency={c} />
        </ChartLazy>
      ) : null}

      <ScenarioCompare
        title="Compare two plans"
        aName="Plan A (your inputs)"
        bName="Plan B"
        toolSlug={SLUG}
        error={!result.ok || !resultB.ok ? FIX_FIELDS : undefined}
        planA={
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-muted">Weeks off</dt>
            <dd className="text-right font-semibold">{s.weeksOff}</dd>
            <dt className="text-muted">Hours per week</dt>
            <dd className="text-right font-semibold">{s.hoursPerWeek}</dd>
            <dt className="text-muted">Billable time</dt>
            <dd className="text-right font-semibold">{s.billablePct}%</dd>
            <dd className="col-span-2 text-xs text-muted">Change these in the calculator above.</dd>
          </dl>
        }
        planB={
          <>
            <InputNumber
              label="Weeks off per year"
              value={b.weeksOff}
              onChange={(v) => setB('weeksOff', v)}
              min={0}
              max={26}
              suffix="weeks"
              error={bErrors.weeksOff}
            />
            <InputNumber
              label="Working hours per week"
              value={b.hoursPerWeek}
              onChange={(v) => setB('hoursPerWeek', v)}
              min={1}
              max={80}
              suffix="hours"
              error={bErrors.hoursPerWeek}
            />
            <Slider
              label="Billable time"
              value={b.billablePct}
              onChange={(v) => setB('billablePct', v)}
              min={10}
              max={100}
              format={(v) => `${v}%`}
              error={bErrors.billablePct}
            />
          </>
        }
        rows={
          result.ok && resultB.ok
            ? [
                {
                  label: 'Minimum hourly rate',
                  a: money(result.hourlyRate, c),
                  b: money(resultB.hourlyRate, c),
                  better: result.hourlyRate < resultB.hourlyRate ? 'a' : resultB.hourlyRate < result.hourlyRate ? 'b' : undefined,
                },
                { label: 'Day rate', a: money(result.dayRate, c), b: money(resultB.dayRate, c) },
                {
                  label: 'Billable hours per year',
                  a: formatNumber(result.billableHours, 1),
                  b: formatNumber(resultB.billableHours, 1),
                },
                {
                  label: 'Hours worked per year',
                  a: formatNumber((WEEKS_PER_YEAR - s.weeksOff) * s.hoursPerWeek, 1),
                  b: formatNumber((WEEKS_PER_YEAR - b.weeksOff) * b.hoursPerWeek, 1),
                },
                { label: 'Gross revenue per year', a: money(result.grossNeeded, c), b: money(resultB.grossNeeded, c) },
              ]
            : []
        }
      />
    </div>
  );
}
