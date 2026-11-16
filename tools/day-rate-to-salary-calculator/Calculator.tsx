'use client';

import { useRef } from 'react';
import { CalculatorGrid, InputsPanel } from '@/components/CalculatorGrid';
import { CurrencySelect } from '@/components/CurrencySelect';
import { InputCurrency } from '@/components/InputCurrency';
import { InputNumber } from '@/components/InputNumber';
import { ResetIcon } from '@/components/icons';
import { ResultCard } from '@/components/ResultCard';
import { ScenarioCompare } from '@/components/ScenarioCompare';
import { SegmentedControl } from '@/components/SegmentedControl';
import { Slider } from '@/components/Slider';
import { SplitBar } from '@/components/SplitBar';
import { track } from '@/lib/analytics';
import { CATEGORICAL } from '@/lib/chart-palette';
import { formatMoney, formatNumber, type CurrencyCode } from '@/lib/format';
import { useUrlState } from '@/lib/url-state';
import { dayRateToSalary, salaryToDayRate, type DayRateError, type DayRateResult } from './calc';
import {
  dayRateDefaults,
  dayRateSchema,
  dayRateVariant,
  fieldErrors,
  planBDefaults,
  planBSchema,
  switchDayRateCurrency,
  toDaysInput,
  type DayRateState,
  type Mode,
} from './schema';

const SLUG = 'day-rate-to-salary-calculator';
const FIX_FIELDS = 'Check the highlighted fields to see your result.';

const days = (n: number) => `${formatNumber(n, 1)} ${n === 1 ? 'day' : 'days'}`;

export default function DayRateToSalaryCalculator() {
  const { state: s, setField, setAll, reset } = useUrlState(dayRateSchema, dayRateDefaults, { variant: dayRateVariant });
  const { state: b, setField: setB } = useUrlState(planBSchema, planBDefaults, { prefix: 'b_' });
  const tracked = useRef(false);

  function update<K extends keyof DayRateState>(key: K, value: DayRateState[K]) {
    setField(key, value);
    if (!tracked.current) {
      tracked.current = true;
      track('calculate', { tool: SLUG });
    }
  }

  const c = s.currency;
  const money = (n: number) => formatMoney(n, c);
  const rateMode = s.mode === 'rate';
  const errors = fieldErrors(dayRateSchema, s);
  const d = toDaysInput(s);
  const result: DayRateResult | DayRateError =
    Object.keys(errors).length > 0
      ? { ok: false, error: FIX_FIELDS }
      : rateMode
        ? dayRateToSalary({ dayRate: s.dayRate, ...d })
        : salaryToDayRate({ salary: s.salary, ...d });

  const bErrors = fieldErrors(planBSchema, b);
  const resultB: DayRateResult | DayRateError =
    result.ok && Object.keys(bErrors).length === 0
      ? dayRateToSalary({ dayRate: result.dayRate * (1 + b.rateChange / 100), ...d, gapDays: b.gapDays })
      : { ok: false, error: FIX_FIELDS };

  const label = rateMode ? 'Annual contractor income' : 'Day rate needed';
  const rows = result.ok
    ? [
        { label: 'Billable days per year', value: formatNumber(result.billableDays, 1) },
        rateMode
          ? { label: 'Equivalent employee salary', note: `Approx., with a ${s.uplift}% benefits uplift`, value: money(result.equivalentSalary) }
          : { label: 'Annual contractor income', value: money(result.annualIncome) },
        { label: 'Monthly income', value: money(result.monthlyIncome) },
        { label: 'Hourly equivalent', note: '8-hour day', value: money(result.hourlyEquivalent) },
      ]
    : [];

  const better = (a: number, bb: number) => (a > bb ? 'a' : bb > a ? 'b' : undefined);

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
                <SegmentedControl<Mode>
                  label="Convert"
                  value={s.mode}
                  onChange={(v) => update('mode', v)}
                  options={[
                    { value: 'rate', label: 'Day rate to salary' },
                    { value: 'salary', label: 'Salary to day rate' },
                  ]}
                />
              </div>
              <CurrencySelect value={c} onChange={(next: CurrencyCode) => setAll(switchDayRateCurrency(s, next))} />
              {rateMode ? (
                <InputCurrency
                  label="Day rate"
                  help="Before tax."
                  currency={c}
                  value={s.dayRate}
                  onChange={(v) => update('dayRate', v)}
                  error={errors.dayRate}
                />
              ) : (
                <InputCurrency
                  label="Salary to match"
                  help="Yearly, before tax."
                  currency={c}
                  value={s.salary}
                  onChange={(v) => update('salary', v)}
                  error={errors.salary}
                />
              )}
              <InputNumber
                label="Working days in the year"
                value={s.workingDays}
                onChange={(v) => update('workingDays', v)}
                suffix="days"
                help="52 weeks × 5 days = 260."
                error={errors.workingDays}
              />
              <InputNumber
                label="Holidays"
                value={s.holidays}
                onChange={(v) => update('holidays', v)}
                suffix="days"
                help="Unpaid for a contractor."
                error={errors.holidays}
              />
              <InputNumber
                label="Public holidays"
                value={s.publicHolidays}
                onChange={(v) => update('publicHolidays', v)}
                suffix="days"
                error={errors.publicHolidays}
              />
              <InputNumber
                label="Sick days"
                value={s.sickDays}
                onChange={(v) => update('sickDays', v)}
                suffix="days"
                error={errors.sickDays}
              />
              <div className="sm:col-span-2">
                <InputNumber
                  label="Days between contracts"
                  value={s.gapDays}
                  onChange={(v) => update('gapDays', v)}
                  suffix="days"
                  help="Gaps when you're not billing."
                  error={errors.gapDays}
                />
              </div>
              <div className="sm:col-span-2">
                <Slider
                  label="Benefits uplift"
                  value={s.uplift}
                  onChange={(v) => update('uplift', v)}
                  min={0}
                  max={50}
                  format={(v) => `${v}%`}
                  unit="%"
                  help="Extra value an employee gets (pension, paid leave, insurance). Your own estimate."
                  error={errors.uplift}
                />
              </div>
            </div>
          </InputsPanel>
        }
        result={
          result.ok ? (
            <ResultCard
              label={label}
              value={money(rateMode ? result.annualIncome : result.dayRate)}
              unit={`${rateMode ? 'per year' : 'per day'} · ${c} · before tax`}
              rows={rows}
            />
          ) : (
            <ResultCard label={label} value="" unit="" rows={[]} error={result.error} />
          )
        }
      />

      {result.ok ? (
        <SplitBar
          title="Where your working days go"
          description={`${days(s.workingDays)} in the year, ${days(result.billableDays)} you can bill.`}
          total={s.workingDays}
          parts={[
            { key: 'billable', label: 'Billable days', value: result.billableDays, display: days(result.billableDays), color: CATEGORICAL[0] },
            { key: 'holidays', label: 'Holidays', value: s.holidays, display: days(s.holidays), color: CATEGORICAL[1] },
            { key: 'public', label: 'Public holidays', value: s.publicHolidays, display: days(s.publicHolidays), color: CATEGORICAL[2] },
            { key: 'sick', label: 'Sick days', value: s.sickDays, display: days(s.sickDays), color: CATEGORICAL[3] },
            { key: 'gaps', label: 'Between contracts', value: s.gapDays, display: days(s.gapDays), color: CATEGORICAL[4] },
          ]}
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
            <dt className="text-ink-muted">Day rate</dt>
            <dd className="text-right font-[550] tabular-nums">{result.ok ? money(result.dayRate) : '—'}</dd>
            <dt className="text-ink-muted">Days between contracts</dt>
            <dd className="text-right font-[550] tabular-nums">{s.gapDays}</dd>
            <dd className="col-span-2 mt-2 text-ink-muted">Change these in the calculator above.</dd>
          </dl>
        }
        planB={
          <>
            <Slider
              label="Day rate change"
              value={b.rateChange}
              onChange={(v) => setB('rateChange', v)}
              min={-50}
              max={100}
              format={(v) => `${v > 0 ? '+' : ''}${v}%`}
              unit="%"
              help="E.g. −10% for a longer contract at a lower rate."
              error={bErrors.rateChange}
            />
            <InputNumber
              label="Days between contracts"
              value={b.gapDays}
              onChange={(v) => setB('gapDays', v)}
              suffix="days"
              error={bErrors.gapDays}
            />
          </>
        }
        rows={
          result.ok && resultB.ok
            ? [
                { label: 'Day rate', a: money(result.dayRate), b: money(resultB.dayRate) },
                { label: 'Billable days', a: formatNumber(result.billableDays, 1), b: formatNumber(resultB.billableDays, 1) },
                {
                  label: 'Annual income',
                  a: money(result.annualIncome),
                  b: money(resultB.annualIncome),
                  better: better(result.annualIncome, resultB.annualIncome),
                },
                { label: 'Equivalent salary', a: money(result.equivalentSalary), b: money(resultB.equivalentSalary) },
                { label: 'Monthly income', a: money(result.monthlyIncome), b: money(resultB.monthlyIncome) },
              ]
            : []
        }
      />
    </div>
  );
}
