'use client';

import { useRef } from 'react';
import { CalculatorGrid, InputsPanel } from '@/components/CalculatorGrid';
import { CurrencySelect } from '@/components/CurrencySelect';
import { InputCurrency } from '@/components/InputCurrency';
import { InputNumber } from '@/components/InputNumber';
import { ResetIcon } from '@/components/icons';
import { ResultCard } from '@/components/ResultCard';
import { SegmentedControl } from '@/components/SegmentedControl';
import { track } from '@/lib/analytics';
import { optionalOff } from '@/lib/field-errors';
import { formatMoney, formatNumber, type CurrencyCode } from '@/lib/format';
import { useUrlState } from '@/lib/url-state';
import { biweeklyPay, type BiweeklyMode } from './calc';
import {
  OPTIONAL,
  biweeklyDefaults,
  biweeklyErrors,
  biweeklySchema,
  biweeklyVariant,
  switchBiweeklyCurrency,
  toCalcInput,
  type BiweeklyState,
} from './schema';

const SLUG = 'biweekly-pay-calculator';
const FIX_FIELDS = 'Check the highlighted fields to see your result.';

const MODE_OPTIONS: readonly { value: BiweeklyMode; label: string }[] = [
  { value: 'salary', label: 'From a salary' },
  { value: 'hourly', label: 'From an hourly wage' },
];

export default function BiweeklyPayCalculator() {
  const { state: s, setField, setAll, reset, touched } = useUrlState(biweeklySchema, biweeklyDefaults, { variant: biweeklyVariant });
  const tracked = useRef(false);

  function update<K extends keyof BiweeklyState>(key: K, value: BiweeklyState[K]) {
    setField(key, value);
    if (!tracked.current) {
      tracked.current = true;
      track('calculate', { tool: SLUG });
    }
  }

  const c = s.currency;
  const money = (n: number) => formatMoney(n, c);
  const errors = biweeklyErrors(s);
  const { blocking, calc } = optionalOff(s, errors, OPTIONAL);
  const r = Object.keys(blocking).length > 0 ? null : biweeklyPay(toCalcInput(calc));
  const hourly = s.mode === 'hourly';
  // The overtime rate box shows once there are overtime hours (or it holds a value, e.g. from a link).
  const showOtRate = hourly && (s.otH !== 0 || s.otRate !== 0);
  const label = 'Biweekly gross pay';

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
                <SegmentedControl<BiweeklyMode> label="Work it out" value={s.mode} options={MODE_OPTIONS} onChange={(v) => update('mode', v)} />
              </div>
              <div className="sm:col-span-2">
                <CurrencySelect value={c} onChange={(next: CurrencyCode) => setAll(switchBiweeklyCurrency(s, next, touched))} />
              </div>
              {hourly ? (
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
                    optional
                    label="Overtime hours per pay period (optional)"
                    help="Extra hours across the two weeks. 0 = off."
                    value={s.otH}
                    onChange={(v) => update('otH', v)}
                    suffix="hours"
                    error={errors.otH}
                  />
                  {showOtRate ? (
                    <InputCurrency
                      optional
                      label="Overtime hourly rate (optional)"
                      help="Your own overtime rate. Example values only."
                      currency={c}
                      value={s.otRate}
                      onChange={(v) => update('otRate', v)}
                      error={errors.otRate}
                    />
                  ) : null}
                </>
              ) : (
                <div className="sm:col-span-2">
                  <InputCurrency
                    label="Annual salary"
                    help="Before tax. Example value — use your own numbers."
                    currency={c}
                    value={s.salary}
                    onChange={(v) => update('salary', v)}
                    error={errors.salary}
                  />
                </div>
              )}
            </div>
          </InputsPanel>
        }
        result={
          r ? (
            <ResultCard
              label={label}
              value={money(r.biweekly)}
              unit={`every two weeks · before tax · ${c}`}
              rows={[
                ...(hourly && calc.otH > 0
                  ? [
                      calc.otRate > 0
                        ? { label: 'Overtime', note: `Per pay period: ${formatNumber(calc.otH, 2)} hours at ${money(calc.otRate)}`, value: money(r.overtime) }
                        : { label: 'Overtime', note: 'Add your overtime rate', value: money(0) },
                    ]
                  : []),
                { label: 'Yearly gross', note: hourly ? '26 paydays' : 'Your salary', value: money(r.yearly) },
                hourly
                  ? { label: 'In a 27-payday year', note: '27 paydays for the year', value: money(r.twentySeven) }
                  : { label: 'In a 27-payday year', note: 'If your salary is split over 27 paydays, each', value: money(r.twentySeven) },
                { label: 'Paid twice a month', note: '24 paydays', value: money(r.semiMonthly) },
                { label: 'Monthly average', value: money(r.monthly) },
                { label: 'Weekly', value: money(r.weekly) },
              ]}
              footnote={
                <>
                  <p className="font-[550]">Gross pay before tax and deductions. Your payslip will show less.</p>
                  <p className="mt-2">
                    A year has 52 weeks and 1 or 2 extra days, so paydays every two weeks fall 26 times in most years and 27 in some.
                  </p>
                </>
              }
            />
          ) : (
            <ResultCard label={label} value="" unit="" rows={[]} error={FIX_FIELDS} />
          )
        }
      />
    </div>
  );
}
