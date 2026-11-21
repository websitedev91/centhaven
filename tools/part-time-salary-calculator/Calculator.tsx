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
import { track } from '@/lib/analytics';
import { formatMoney, formatNumber, type CurrencyCode } from '@/lib/format';
import { useUrlState } from '@/lib/url-state';
import { formatPct } from '@/tools/margin-vs-markup-calculator/calc';
import { partTimePay, type PartTimeMode } from './calc';
import {
  partTimeDefaults,
  partTimeErrors,
  partTimeSchema,
  partTimeVariant,
  planBDefaults,
  planBSchema,
  switchPartTimeCurrency,
  toCalcInput,
  type PartTimeState,
} from './schema';

const SLUG = 'part-time-salary-calculator';
const FIX_FIELDS = 'Check the highlighted fields to see your result.';
const LABEL = 'Part-time yearly salary';

const MODE_OPTIONS: readonly { value: PartTimeMode; label: string }[] = [
  { value: 'prorata', label: 'From a full-time salary' },
  { value: 'hourly', label: 'From an hourly wage' },
];

export default function PartTimeSalaryCalculator() {
  const { state: s, setField, setAll, reset, touched } = useUrlState(partTimeSchema, partTimeDefaults, { variant: partTimeVariant });
  const { state: b, setField: setB } = useUrlState(planBSchema, planBDefaults, { prefix: 'b_' });
  const tracked = useRef(false);

  function update<K extends keyof PartTimeState>(key: K, value: PartTimeState[K]) {
    setField(key, value);
    if (!tracked.current) {
      tracked.current = true;
      track('calculate', { tool: SLUG });
    }
  }

  const c = s.currency;
  const money = (n: number) => formatMoney(n, c);
  const errors = partTimeErrors(s);
  const r = Object.keys(errors).length > 0 ? null : partTimePay(toCalcInput(s));
  const prorata = s.mode === 'prorata';

  // Plan B: the same inputs with other weekly hours (part-time hours or hours per week).
  const sb: PartTimeState = prorata ? { ...s, ptHours: b.hours } : { ...s, hours: b.hours };
  const bErrors = partTimeErrors(sb);
  const bError = prorata ? bErrors.ptHours : bErrors.hours;
  const rb = r && Object.keys(bErrors).length === 0 ? partTimePay(toCalcInput(sb)) : null;
  const hoursA = prorata ? s.ptHours : s.hours;

  return (
    <div className="flex flex-col gap-6">
      <CalculatorGrid
        inputs={
          <InputsPanel
            label="Your hours and pay"
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
                <SegmentedControl<PartTimeMode> label="Work it out" value={s.mode} options={MODE_OPTIONS} onChange={(v) => update('mode', v)} />
              </div>
              <div className="sm:col-span-2">
                <CurrencySelect value={c} onChange={(next: CurrencyCode) => setAll(switchPartTimeCurrency(s, next, touched))} />
              </div>
              {prorata ? (
                <>
                  <div className="sm:col-span-2">
                    <InputCurrency
                      label="Full-time annual salary"
                      help="The salary for the full-time job, before tax. Example value only."
                      currency={c}
                      value={s.ftSalary}
                      onChange={(v) => update('ftSalary', v)}
                      error={errors.ftSalary}
                    />
                  </div>
                  <InputNumber
                    label="Full-time hours per week"
                    help="The full-time week for this job. Example value only. Check your contract."
                    value={s.ftHours}
                    onChange={(v) => update('ftHours', v)}
                    suffix="hours"
                    error={errors.ftHours}
                  />
                  <InputNumber
                    label="Part-time hours per week"
                    help="The hours you work, or plan to."
                    value={s.ptHours}
                    onChange={(v) => update('ptHours', v)}
                    suffix="hours"
                    error={errors.ptHours}
                  />
                </>
              ) : (
                <>
                  <InputCurrency
                    label="Hourly rate"
                    help="Before tax. Example value — use your own numbers."
                    currency={c}
                    value={s.rate}
                    onChange={(v) => update('rate', v)}
                    error={errors.rate}
                  />
                  <InputNumber label="Hours per week" value={s.hours} onChange={(v) => update('hours', v)} suffix="hours" error={errors.hours} />
                  <InputNumber
                    label="Paid weeks per year"
                    help="Use fewer than 52 if some weeks are unpaid. Example value only."
                    value={s.weeks}
                    onChange={(v) => update('weeks', v)}
                    suffix="weeks"
                    error={errors.weeks}
                  />
                </>
              )}
            </div>
          </InputsPanel>
        }
        result={
          r ? (
            <ResultCard
              label={LABEL}
              value={money(r.yearly)}
              unit={`a year · before tax · ${c}`}
              rows={[
                ...(r.share !== null
                  ? [{ label: 'Share of full time', note: `${formatNumber(s.ptHours, 2)} of ${formatNumber(s.ftHours, 2)} hours`, value: `${formatPct(r.share)} of full time` }]
                  : []),
                { label: 'Monthly average', note: 'Yearly ÷ 12', value: money(r.monthly) },
                { label: 'Weekly', note: prorata ? 'Yearly ÷ 52' : `${formatNumber(s.hours, 2)} hours × ${money(s.rate)}`, value: money(r.weekly) },
                ...(r.hourly !== null ? [{ label: 'Hourly equivalent', note: 'Based on 52 paid weeks', value: money(r.hourly) }] : []),
                ...(!prorata ? [{ label: 'Paid weeks', value: `${formatNumber(s.weeks, 2)} a year` }] : []),
              ]}
              footnote={<p className="font-[550]">Gross pay before tax and deductions.</p>}
            />
          ) : (
            <ResultCard label={LABEL} value="" unit="" rows={[]} error={FIX_FIELDS} />
          )
        }
      />

      <ScenarioCompare
        title="Compare two schedules"
        aName="Schedule A (your inputs)"
        bName="Schedule B"
        toolSlug={SLUG}
        error={!r || !rb ? FIX_FIELDS : undefined}
        planA={
          <dl className="type-small grid grid-cols-2 gap-y-2">
            <dt className="text-ink-muted">Hours per week</dt>
            <dd className="text-right font-[550] tabular-nums">{formatNumber(hoursA, 2)}</dd>
            <dd className="col-span-2 mt-2 text-ink-muted">Schedule B uses the same pay with other weekly hours.</dd>
          </dl>
        }
        planB={<InputNumber label="Hours per week" value={b.hours} onChange={(v) => setB('hours', v)} suffix="hours" error={bError} />}
        rows={
          r && rb
            ? [
                { label: 'Yearly', a: money(r.yearly), b: money(rb.yearly) },
                { label: 'Monthly average', a: money(r.monthly), b: money(rb.monthly) },
                { label: 'Weekly', a: money(r.weekly), b: money(rb.weekly) },
              ]
            : []
        }
      />
    </div>
  );
}
