'use client';

import dynamic from 'next/dynamic';
import { useRef } from 'react';
import Link from 'next/link';
import { CalculatorGrid, InputsPanel } from '@/components/CalculatorGrid';
import { ChartLazy, ChartPlaceholder } from '@/components/ChartLazy';
import { ResetIcon } from '@/components/icons';
import { Num } from '@/components/Num';
import { CurrencySelect } from '@/components/CurrencySelect';
import { InputCurrency } from '@/components/InputCurrency';
import { InputNumber } from '@/components/InputNumber';
import { ResultCard } from '@/components/ResultCard';
import { ScenarioCompare } from '@/components/ScenarioCompare';
import { Slider } from '@/components/Slider';
import { track } from '@/lib/analytics';
import { formatMoney, formatNumber, formatPercent, type CurrencyCode } from '@/lib/format';
import { optionalOff } from '@/lib/field-errors';
import { useUrlState } from '@/lib/url-state';
import { calcHourlyRate, WEEKS_PER_YEAR, type HourlyRateError, type HourlyRateResult } from './calc';
import {
  fieldErrors,
  hourlyRateDefaults,
  hourlyRateSchema,
  planBDefaults,
  planBSchema,
  switchHourlyRateCurrency,
  toCalcInput,
  hourlyRateVariant,
  type HourlyRateState,
} from './schema';
import { DAY_RATE_TOOL } from './links';
import { SLICES } from './slices';

const HourSplitChart = dynamic(() => import('./Chart'), { ssr: false, loading: () => <ChartPlaceholder shape="donut" /> });

const SLUG = 'hourly-rate-calculator';
/** Optional fields: an invalid one shows its own error, and the result still shows (treated as 0). */
const OPTIONAL = ['buffer'] as const;
const FIX_FIELDS = 'Check the highlighted fields to see your rate.';

function money(n: number, c: CurrencyCode) {
  return formatMoney(n, c);
}

export default function HourlyRateCalculator() {
  const { state: s, setField: set, setAll, reset, touched } = useUrlState(hourlyRateSchema, hourlyRateDefaults, {
    variant: hourlyRateVariant,
  });
  const { state: b, setField: setB } = useUrlState(planBSchema, planBDefaults, { prefix: 'b_' });
  const tracked = useRef(false);

  function markCalculated() {
    if (!tracked.current) {
      tracked.current = true;
      track('calculate', { tool: SLUG });
    }
  }

  function update<K extends keyof HourlyRateState>(key: K, value: HourlyRateState[K]) {
    set(key, value);
    markCalculated();
  }

  /** Untouched income/expenses/tax follow the currency; typed values are kept. */
  function changeCurrency(next: CurrencyCode) {
    setAll(switchHourlyRateCurrency(s, next, touched));
    markCalculated();
  }

  const errors = fieldErrors(hourlyRateSchema, s);
  const { blocking, calc } = optionalOff(s, errors, OPTIONAL);
  const result: HourlyRateResult | HourlyRateError =
    Object.keys(blocking).length > 0 ? { ok: false, error: FIX_FIELDS } : calcHourlyRate(toCalcInput(calc));
  const c = s.currency;

  const bErrors = fieldErrors(planBSchema, b);
  const resultB: HourlyRateResult | HourlyRateError =
    Object.keys(bErrors).length > 0 ? { ok: false, error: FIX_FIELDS } : calcHourlyRate(toCalcInput({ ...calc, ...b }));

  return (
    <div className="flex flex-col gap-6">
      <CalculatorGrid
        inputs={
        <InputsPanel
          label="Your numbers"
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
              <CurrencySelect value={c} onChange={changeCurrency} />
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
                unit="%"
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
                unit="%"
                error={errors.billablePct}
              />
            </div>
            <div className="sm:col-span-2">
              <Slider optional
                label="Buffer for slow months"
                help="Optional. Adds a margin on top of your minimum rate for quiet months and late payers."
                value={s.buffer}
                onChange={(v) => update('buffer', v)}
                min={0}
                max={50}
                format={(v) => `${v}%`}
                unit="%"
                error={errors.buffer}
              />
            </div>
          </div>
        </InputsPanel>
        }
        result={
          result.ok ? (
            <ResultCard
              label="Minimum hourly rate"
              value={money(result.hourlyRate, c)}
              unit={`per hour · ${c}`}
              rows={[
                ...(s.buffer > 0
                  ? [
                      {
                        label: `Rate with ${s.buffer}% buffer`,
                        note: `Day rate ${money(result.bufferedDayRate, c)}`,
                        value: money(result.bufferedRate, c),
                      },
                    ]
                  : []),
                {
                  label: 'Day rate',
                  note: `${formatNumber(result.hoursPerDay, 2)}-hour day`,
                  value: money(result.dayRate, c),
                },
                { label: 'Gross revenue needed per year', value: money(result.grossNeeded, c) },
                { label: 'Gross revenue needed per month', value: money(result.monthlyRevenue, c) },
                { label: 'Billable hours per year', value: formatNumber(result.billableHours, 1) },
              ]}
              footnote={
                <>
                  <p>Gross revenue covers your take-home pay, tax and expenses.</p>
                  <p className="mt-2">
                    <span className="font-[550] text-ink">Salary equivalent:</span>{' '}
                    {/* Pre-fills the live day rate tool with this day rate (its URL state reads currency, then dayRate). */}
                    <Link
                      href={`${DAY_RATE_TOOL.path}?currency=${c}&dayRate=${Math.round(result.bufferedDayRate * 100) / 100}`}
                    >
                      see what a {money(result.bufferedDayRate, c)} day rate is worth as a salary
                    </Link>
                  </p>
                </>
              }
            />
          ) : (
            <ResultCard label="Minimum hourly rate" value="" unit="" rows={[]} error={result.error} />
          )
        }
      />

      {result.ok ? (
        <ChartLazy
          title="Where each hour's rate goes"
          description={`Of every ${money(result.hourlyRate, c)} you bill, this is where it goes.`}
          height={220}
          placeholder="donut"
          footer={
              <ul className="type-small flex max-w-md flex-col border-t border-line">
                {SLICES.map((sl) => (
                  <li key={sl.key} className="flex items-center justify-between gap-3 border-b border-line py-2.5">
                    <span className="flex items-center gap-2">
                      <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: sl.color }} aria-hidden="true" />
                      {sl.label}
                    </span>
                    <span className="tabular-nums text-ink-muted">
                      <strong className="font-[550] text-ink">
                        <Num>{money(result.perHour[sl.key], c)}</Num>
                      </strong>{' '}
                      <span>
                        (<Num>{formatPercent(result.perHour[sl.key] / result.hourlyRate)}</Num>)
                      </span>
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
          <dl className="type-small grid grid-cols-2 gap-y-2">
            <dt className="text-ink-muted">Weeks off</dt>
            <dd className="text-right font-[550] tabular-nums">{s.weeksOff}</dd>
            <dt className="text-ink-muted">Hours per week</dt>
            <dd className="text-right font-[550] tabular-nums">{s.hoursPerWeek}</dd>
            <dt className="text-ink-muted">Billable time</dt>
            <dd className="text-right font-[550] tabular-nums">{s.billablePct}%</dd>
            <dd className="col-span-2 mt-2 text-ink-muted">Change these in the calculator above.</dd>
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
                unit="%"
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
