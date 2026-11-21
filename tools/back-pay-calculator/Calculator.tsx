'use client';

import { useRef } from 'react';
import { CalculatorGrid, InputsPanel } from '@/components/CalculatorGrid';
import { CurrencySelect } from '@/components/CurrencySelect';
import { InputCurrency } from '@/components/InputCurrency';
import { InputNumber } from '@/components/InputNumber';
import { ResetIcon } from '@/components/icons';
import { ResultCard } from '@/components/ResultCard';
import { SegmentedControl } from '@/components/SegmentedControl';
import { SelectField } from '@/components/SelectField';
import { track } from '@/lib/analytics';
import { formatMoney, formatNumber, type CurrencyCode } from '@/lib/format';
import { useUrlState } from '@/lib/url-state';
import { backPay, type BackPayMode } from './calc';
import {
  PERIODS,
  PERIOD_WORDS,
  backPayDefaults,
  backPayErrors,
  backPaySchema,
  backPayVariant,
  switchBackPayCurrency,
  toCalcInput,
  type BackPayState,
  type PayPeriod,
} from './schema';

const SLUG = 'back-pay-calculator';
const FIX_FIELDS = 'Check the highlighted fields to see your result.';
const LABEL = 'Back pay (gross)';

const MODE_OPTIONS: readonly { value: BackPayMode; label: string }[] = [
  { value: 'rate', label: 'Hourly raise paid late' },
  { value: 'salary', label: 'Salary raise paid late' },
  { value: 'missed', label: 'Missed pay' },
];
const PERIOD_OPTIONS = PERIODS.map((p) => ({ value: p, label: PERIOD_WORDS[p].label }));

export default function BackPayCalculator() {
  const { state: s, setField, setAll, reset, touched } = useUrlState(backPaySchema, backPayDefaults, { variant: backPayVariant });
  const tracked = useRef(false);

  function update<K extends keyof BackPayState>(key: K, value: BackPayState[K]) {
    setField(key, value);
    if (!tracked.current) {
      tracked.current = true;
      track('calculate', { tool: SLUG });
    }
  }

  const c = s.currency;
  const money = (n: number) => formatMoney(n, c);
  const errors = backPayErrors(s);
  const r = Object.keys(errors).length > 0 ? null : backPay(toCalcInput(s));
  const weeksText = `${formatNumber(s.weeks, 2)} ${s.weeks === 1 ? 'week' : 'weeks'}`;
  const weeksField = (
    <InputNumber
      label="Weeks owed"
      help="Weeks between when the new pay should have started and when it did. Example value."
      value={s.weeks}
      onChange={(v) => update('weeks', v)}
      suffix="weeks"
      error={errors.weeks}
    />
  );

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
                <SegmentedControl<BackPayMode> label="What happened" value={s.mode} options={MODE_OPTIONS} onChange={(v) => update('mode', v)} />
              </div>
              <div className="sm:col-span-2">
                <CurrencySelect value={c} onChange={(next: CurrencyCode) => setAll(switchBackPayCurrency(s, next, touched))} />
              </div>
              {s.mode === 'rate' ? (
                <>
                  <InputCurrency label="Old hourly rate" help="Before tax. Example value." currency={c} value={s.oldRate} onChange={(v) => update('oldRate', v)} error={errors.oldRate} />
                  <InputCurrency label="New hourly rate" help="Before tax. Example value." currency={c} value={s.newRate} onChange={(v) => update('newRate', v)} error={errors.newRate} />
                  <InputNumber label="Hours per week" value={s.hours} onChange={(v) => update('hours', v)} suffix="hours" error={errors.hours} />
                  {weeksField}
                </>
              ) : null}
              {s.mode === 'salary' ? (
                <>
                  <InputCurrency label="Old yearly salary" help="Before tax. Example value." currency={c} value={s.oldSalary} onChange={(v) => update('oldSalary', v)} error={errors.oldSalary} />
                  <InputCurrency label="New yearly salary" help="Before tax. Example value." currency={c} value={s.newSalary} onChange={(v) => update('newSalary', v)} error={errors.newSalary} />
                  <div className="sm:col-span-2">{weeksField}</div>
                </>
              ) : null}
              {s.mode === 'missed' ? (
                <>
                  <div className="sm:col-span-2">
                    <SelectField<PayPeriod> label="Pay period" help="Only changes the wording." value={s.period} options={PERIOD_OPTIONS} onChange={(v) => update('period', v)} />
                  </div>
                  <InputCurrency label="Pay per period" help="Gross pay for one period. Example value." currency={c} value={s.amount} onChange={(v) => update('amount', v)} error={errors.amount} />
                  <InputNumber
                    label="Pay periods missed"
                    help="Use 0.5 for half a period. Example value."
                    value={s.periods}
                    onChange={(v) => update('periods', v)}
                    suffix="periods"
                    error={errors.periods}
                  />
                </>
              ) : null}
            </div>
          </InputsPanel>
        }
        result={
          r ? (
            <ResultCard
              label={LABEL}
              value={money(r.total)}
              unit={`before tax · ${c}`}
              rows={[
                ...(r.perHour !== null ? [{ label: 'Difference per hour', note: `${money(s.newRate)} − ${money(s.oldRate)}`, value: money(r.perHour) }] : []),
                ...(r.perYear !== null ? [{ label: 'Difference per year', note: `${money(s.newSalary)} − ${money(s.oldSalary)}`, value: money(r.perYear) }] : []),
                ...(r.perWeek !== null
                  ? [{ label: 'Difference per week', note: s.mode === 'salary' ? 'Yearly difference ÷ 52' : `${formatNumber(s.hours, 2)} hours a week`, value: money(r.perWeek) }]
                  : []),
                ...(s.mode !== 'missed' ? [{ label: 'Weeks owed', value: weeksText }] : []),
                ...(s.mode === 'missed'
                  ? [
                      { label: 'Pay per period', note: `Each period: ${PERIOD_WORDS[s.period].one}`, value: money(s.amount) },
                      { label: 'Periods missed', value: `${formatNumber(s.periods, 2)} × ${PERIOD_WORDS[s.period].one}` },
                    ]
                  : []),
              ]}
              footnote={<p className="font-[550]">Gross amount before tax and deductions.</p>}
            />
          ) : (
            <ResultCard label={LABEL} value="" unit="" rows={[]} error={FIX_FIELDS} />
          )
        }
      />
    </div>
  );
}
