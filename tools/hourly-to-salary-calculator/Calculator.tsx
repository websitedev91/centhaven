'use client';

import { useRef } from 'react';
import { CalculatorGrid, InputsPanel } from '@/components/CalculatorGrid';
import { CurrencySelect } from '@/components/CurrencySelect';
import { InputCurrency } from '@/components/InputCurrency';
import { InputNumber } from '@/components/InputNumber';
import { ResetIcon } from '@/components/icons';
import { Num } from '@/components/Num';
import { ResultCard } from '@/components/ResultCard';
import { SegmentedControl } from '@/components/SegmentedControl';
import { track } from '@/lib/analytics';
import { formatMoney, formatNumber, type CurrencyCode } from '@/lib/format';
import { useUrlState } from '@/lib/url-state';
import { hourlyToSalary, quickTable, salaryToHourly } from './calc';
import {
  fieldErrors,
  hourlyToSalaryDefaults,
  hourlyToSalarySchema,
  hourlyToSalaryVariant,
  switchHourlyToSalaryCurrency,
  type HourlyToSalaryState,
  type Mode,
} from './schema';

const SLUG = 'hourly-to-salary-calculator';
const FIX_FIELDS = 'Check the highlighted fields to see your pay.';

export default function HourlyToSalaryCalculator() {
  const { state: s, setField, setAll, reset } = useUrlState(hourlyToSalarySchema, hourlyToSalaryDefaults, {
    variant: hourlyToSalaryVariant,
  });
  const tracked = useRef(false);

  function update<K extends keyof HourlyToSalaryState>(key: K, value: HourlyToSalaryState[K]) {
    setField(key, value);
    if (!tracked.current) {
      tracked.current = true;
      track('calculate', { tool: SLUG });
    }
  }

  const c = s.currency;
  const money = (n: number) => formatMoney(n, c);
  const errors = fieldErrors(hourlyToSalarySchema, s);
  const pattern = { hoursPerWeek: s.hoursPerWeek, daysPerWeek: s.daysPerWeek, paidWeeks: s.paidWeeks };
  const hourlyMode = s.mode === 'hourly';
  const result =
    Object.keys(errors).length > 0
      ? ({ ok: false, error: FIX_FIELDS } as const)
      : hourlyMode
        ? hourlyToSalary({ hourly: s.hourly, ...pattern })
        : salaryToHourly({ annual: s.salary, ...pattern });

  const days = formatNumber(s.daysPerWeek, 2);
  const rows = result.ok
    ? [
        ...(hourlyMode ? [] : [{ label: 'Annual salary', value: money(result.annual) }]),
        { label: 'Monthly', value: money(result.monthly) },
        { label: 'Bi-weekly', note: '26 pay periods a year', value: money(result.biweekly) },
        { label: 'Weekly', value: money(result.weekly) },
        { label: 'Daily', note: `${days}-day week`, value: money(result.daily) },
        { label: 'Hours paid per year', value: formatNumber(result.hoursPerYear, 1) },
      ]
    : [];

  const table = result.ok ? quickTable(s.mode, hourlyMode ? s.hourly : s.salary, s.paidWeeks) : [];

  return (
    <div className="flex flex-col gap-6">
      <CalculatorGrid
        inputs={
          <InputsPanel
            label="Your pay"
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
                    { value: 'hourly', label: 'Hourly to salary' },
                    { value: 'salary', label: 'Salary to hourly' },
                  ]}
                />
              </div>
              <CurrencySelect value={c} onChange={(next: CurrencyCode) => setAll(switchHourlyToSalaryCurrency(s, next))} />
              {hourlyMode ? (
                <InputCurrency
                  label="Hourly wage"
                  help="Before tax."
                  currency={c}
                  value={s.hourly}
                  onChange={(v) => update('hourly', v)}
                  error={errors.hourly}
                />
              ) : (
                <InputCurrency
                  label="Annual salary"
                  help="Before tax."
                  currency={c}
                  value={s.salary}
                  onChange={(v) => update('salary', v)}
                  error={errors.salary}
                />
              )}
              <InputNumber
                label="Hours per week"
                value={s.hoursPerWeek}
                onChange={(v) => update('hoursPerWeek', v)}
                suffix="hours"
                help="Your regular paid hours (1–100)."
                error={errors.hoursPerWeek}
              />
              <InputNumber
                label="Days per week"
                value={s.daysPerWeek}
                onChange={(v) => update('daysPerWeek', v)}
                suffix="days"
                help="Only used for the daily figure."
                error={errors.daysPerWeek}
              />
              <div className="sm:col-span-2">
                <InputNumber
                  label="Paid weeks per year"
                  value={s.paidWeeks}
                  onChange={(v) => update('paidWeeks', v)}
                  suffix="weeks"
                  help="Use 52 if your holidays are paid. Lower it for unpaid time off."
                  error={errors.paidWeeks}
                />
              </div>
            </div>
          </InputsPanel>
        }
        result={
          result.ok ? (
            <ResultCard
              label={hourlyMode ? 'Annual salary' : 'Hourly wage'}
              value={money(hourlyMode ? result.annual : result.hourly)}
              unit={`${hourlyMode ? 'per year' : 'per hour'} · ${c} · before tax`}
              rows={rows}
            />
          ) : (
            <ResultCard label={hourlyMode ? 'Annual salary' : 'Hourly wage'} value="" unit="" rows={[]} error={result.error} />
          )
        }
      />

      {result.ok ? (
        <section aria-labelledby="quick-table-heading" className="print-break-avoid rounded-panel border border-line bg-surface p-5 sm:p-8">
          <h2 id="quick-table-heading" className="type-h3 text-ink">
            {hourlyMode ? `${money(s.hourly)} an hour at different weekly hours` : `${money(s.salary)} a year at different weekly hours`}
          </h2>
          <p className="type-small mt-1 text-ink-muted">
            {hourlyMode ? 'Yearly pay' : 'Hourly wage'} with {formatNumber(s.paidWeeks, 1)} paid weeks, before tax.
          </p>
          <table className="type-small mt-6 w-full max-w-md">
            <thead>
              <tr className="border-b border-line text-left text-ink-muted">
                <th scope="col" className="py-2 pr-3 font-[550]">
                  Hours per week
                </th>
                <th scope="col" className="py-2 text-right font-[550]">
                  {hourlyMode ? 'Yearly pay' : 'Hourly wage'}
                </th>
              </tr>
            </thead>
            <tbody>
              {table.map((row) => (
                <tr key={row.hoursPerWeek} className="border-b border-line last:border-0">
                  <th scope="row" className="py-3 pr-3 text-left font-normal text-ink-muted">
                    {row.hoursPerWeek} hours{row.hoursPerWeek === s.hoursPerWeek ? ' (yours)' : ''}
                  </th>
                  <td className="type-figure py-3 text-right text-ink">
                    <Num>{money(row.value)}</Num>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}
    </div>
  );
}
