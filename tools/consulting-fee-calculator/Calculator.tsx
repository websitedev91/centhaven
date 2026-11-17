'use client';

import { useRef } from 'react';
import { CalculatorGrid, InputsPanel } from '@/components/CalculatorGrid';
import { CurrencySelect } from '@/components/CurrencySelect';
import { InputCurrency } from '@/components/InputCurrency';
import { InputNumber } from '@/components/InputNumber';
import { ResetIcon } from '@/components/icons';
import { Num } from '@/components/Num';
import { ResultCard } from '@/components/ResultCard';
import { ScenarioCompare } from '@/components/ScenarioCompare';
import { Slider } from '@/components/Slider';
import { SplitBar } from '@/components/SplitBar';
import { track } from '@/lib/analytics';
import { CATEGORICAL } from '@/lib/chart-palette';
import { formatMoney, formatNumber, formatPercent, type CurrencyCode } from '@/lib/format';
import { useUrlState } from '@/lib/url-state';
import { consultingFee, type ConsultingError, type ConsultingResult } from './calc';
import {
  consultingDefaults,
  consultingSchema,
  consultingVariant,
  fieldErrors,
  planBDefaults,
  planBSchema,
  switchConsultingCurrency,
  toCalcInput,
  type ConsultingState,
} from './schema';

const SLUG = 'consulting-fee-calculator';
const FIX_FIELDS = 'Check the highlighted fields to see your rate.';

export default function ConsultingFeeCalculator() {
  const { state: s, setField, setAll, reset } = useUrlState(consultingSchema, consultingDefaults, { variant: consultingVariant });
  const { state: b, setField: setB } = useUrlState(planBSchema, planBDefaults, { prefix: 'b_' });
  const tracked = useRef(false);

  function update<K extends keyof ConsultingState>(key: K, value: ConsultingState[K]) {
    setField(key, value);
    if (!tracked.current) {
      tracked.current = true;
      track('calculate', { tool: SLUG });
    }
  }

  const c = s.currency;
  const money = (n: number) => formatMoney(n, c);
  const errors = fieldErrors(consultingSchema, s);
  const result: ConsultingResult | ConsultingError =
    Object.keys(errors).length > 0 ? { ok: false, error: FIX_FIELDS } : consultingFee(toCalcInput(s));

  const bErrors = fieldErrors(planBSchema, b);
  const resultB: ConsultingResult | ConsultingError =
    result.ok && Object.keys(bErrors).length === 0 ? consultingFee(toCalcInput({ ...s, ...b })) : { ok: false, error: FIX_FIELDS };

  const label = 'Consulting rate';

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
                <CurrencySelect value={c} onChange={(next: CurrencyCode) => setAll(switchConsultingCurrency(s, next))} />
              </div>
              <InputCurrency
                label="Target take-home income (per year)"
                help="What you want to keep after tax."
                currency={c}
                value={s.income}
                onChange={(v) => update('income', v)}
                error={errors.income}
              />
              <InputCurrency
                label="Overheads (per year)"
                help="Software, insurance, travel, office, accounting, marketing."
                currency={c}
                value={s.overheads}
                onChange={(v) => update('overheads', v)}
                error={errors.overheads}
              />
              <div className="sm:col-span-2">
                <Slider
                  label="Estimated tax rate"
                  help="Your rough total rate. Not tax advice."
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
                label="Billable days per year"
                help="Days you actually bill, after holidays, sales and admin days."
                value={s.billableDays}
                onChange={(v) => update('billableDays', v)}
                suffix="days"
                error={errors.billableDays}
              />
              <InputNumber
                label="Hours per billable day"
                value={s.hoursPerDay}
                onChange={(v) => update('hoursPerDay', v)}
                suffix="hours"
                error={errors.hoursPerDay}
              />
              <div className="sm:col-span-2">
                <Slider
                  label="Profit margin"
                  help="Share of the price kept as profit, after your pay, tax and overheads (max 60%)."
                  value={s.margin}
                  onChange={(v) => update('margin', v)}
                  min={0}
                  max={60}
                  format={(v) => `${v}%`}
                  unit="%"
                  error={errors.margin}
                />
              </div>
              <div className="sm:col-span-2">
                <InputNumber
                  label="Project estimate"
                  help="Hours for a typical project, to price it as a fixed fee."
                  value={s.projectHours}
                  onChange={(v) => update('projectHours', v)}
                  suffix="hours"
                  error={errors.projectHours}
                />
              </div>
            </div>
          </InputsPanel>
        }
        result={
          result.ok ? (
            <ResultCard
              label={label}
              value={money(result.hourlyRate)}
              unit={`per hour · ${c}`}
              rows={[
                { label: 'Day rate', note: `${formatNumber(s.hoursPerDay, 1)}-hour day`, value: money(result.dayRate) },
                { label: 'Project fee', note: `${formatNumber(s.projectHours, 1)} hours`, value: money(result.projectFee) },
                { label: 'Revenue per year at this rate', value: money(result.annualRevenue) },
                { label: 'Profit margin per year', value: money(result.marginPerYear) },
                { label: 'Billable hours per year', value: formatNumber(result.billableHours, 1) },
              ]}
              footnote={
                <>
                  <div className="rounded-field border border-line bg-surface p-4">
                    <p className="font-[550] text-ink">Rate card</p>
                    <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
                      {[
                        ['Hourly', result.hourlyRate],
                        [`Half-day (${formatNumber(s.hoursPerDay / 2, 1)} h)`, result.halfDayRate],
                        [`Day (${formatNumber(s.hoursPerDay, 1)} h)`, result.dayRate],
                        ['Week (5 days)', result.weekRate],
                      ].map(([k, v]) => (
                        <div key={k as string}>
                          <dt className="text-ink-muted">{k}</dt>
                          <dd className="type-figure text-ink">
                            <Num>{money(v as number)}</Num>
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                  <p className="mt-3">Revenue covers your take-home pay, tax and overheads, plus the margin.</p>
                </>
              }
            />
          ) : (
            <ResultCard label={label} value="" unit="" rows={[]} error={result.error} />
          )
        }
      />

      {result.ok ? (
        <SplitBar
          title="Where each hour's fee goes"
          description={`Of every ${money(result.hourlyRate)} you bill:`}
          total={result.hourlyRate}
          parts={(
            [
              ['takeHome', 'Take-home pay', result.perHour.takeHome],
              ['tax', 'Tax', result.perHour.tax],
              ['overheads', 'Overheads', result.perHour.overheads],
              ['margin', 'Profit margin', result.perHour.margin],
            ] as const
          ).map(([key, label, value], i) => ({
            key,
            label,
            value,
            display: `${money(value)} (${formatPercent(value / result.hourlyRate)})`,
            color: CATEGORICAL[i]!,
          }))}
        />
      ) : null}

      <ScenarioCompare
        title="Compare two plans"
        aName="Plan A (your inputs)"
        bName="Plan B"
        toolSlug={SLUG}
        error={!result.ok || !resultB.ok ? FIX_FIELDS : undefined}
        planA={
          <dl className="type-small grid grid-cols-2 gap-y-2">
            <dt className="text-ink-muted">Profit margin</dt>
            <dd className="text-right font-[550] tabular-nums">{s.margin}%</dd>
            <dt className="text-ink-muted">Billable days</dt>
            <dd className="text-right font-[550] tabular-nums">{s.billableDays}</dd>
            <dd className="col-span-2 mt-2 text-ink-muted">Change these in the calculator above.</dd>
          </dl>
        }
        planB={
          <>
            <Slider
              label="Profit margin"
              value={b.margin}
              onChange={(v) => setB('margin', v)}
              min={0}
              max={60}
              format={(v) => `${v}%`}
              unit="%"
              error={bErrors.margin}
            />
            <InputNumber
              label="Billable days per year"
              value={b.billableDays}
              onChange={(v) => setB('billableDays', v)}
              suffix="days"
              error={bErrors.billableDays}
            />
          </>
        }
        rows={
          result.ok && resultB.ok
            ? [
                {
                  label: 'Consulting rate',
                  a: money(result.hourlyRate),
                  b: money(resultB.hourlyRate),
                  better: result.hourlyRate < resultB.hourlyRate ? 'a' : resultB.hourlyRate < result.hourlyRate ? 'b' : undefined,
                },
                { label: 'Day rate', a: money(result.dayRate), b: money(resultB.dayRate) },
                { label: 'Project fee', a: money(result.projectFee), b: money(resultB.projectFee) },
                { label: 'Profit margin per year', a: money(result.marginPerYear), b: money(resultB.marginPerYear) },
              ]
            : []
        }
      />
    </div>
  );
}
