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
import { optionalOff } from '@/lib/field-errors';
import { formatMoney, type CurrencyCode } from '@/lib/format';
import { useUrlState } from '@/lib/url-state';
import { formatPct } from '@/tools/margin-vs-markup-calculator/calc';
import { savingsRate, type IncomeBasis } from './calc';
import {
  OPTIONAL,
  planBDefaults,
  planBSchema,
  rateDefaults,
  rateErrors,
  rateSchema,
  rateVariant,
  switchRateCurrency,
  toCalcInput,
  type RateState,
} from './schema';

const SLUG = 'savings-rate-calculator';
const FIX_FIELDS = 'Check the highlighted fields to see your savings rate.';
const LABEL = 'Savings rate';

const BASIS_OPTIONS: readonly { value: IncomeBasis; label: string }[] = [
  { value: 'net', label: 'Take-home pay' },
  { value: 'gross', label: 'Gross income' },
];

export default function SavingsRateCalculator() {
  const { state: s, setField, setAll, reset, touched } = useUrlState(rateSchema, rateDefaults, { variant: rateVariant });
  const { state: b, setField: setB } = useUrlState(planBSchema, planBDefaults, { prefix: 'b_' });
  const tracked = useRef(false);

  function update<K extends keyof RateState>(key: K, value: RateState[K]) {
    setField(key, value);
    if (!tracked.current) {
      tracked.current = true;
      track('calculate', { tool: SLUG });
    }
  }

  const c = s.currency;
  const money = (n: number) => formatMoney(n, c);
  const net = s.basis === 'net';
  const incomeWords = net ? 'take-home pay' : 'gross income';
  const errors = rateErrors(s);
  const { blocking, calc } = optionalOff(s, errors, OPTIONAL);
  const r = Object.keys(blocking).length > 0 ? null : savingsRate(toCalcInput(calc));

  const bErrors = rateErrors({ ...calc, saved: b.saved, target: 0 });
  const rb = r && !bErrors.saved ? savingsRate(toCalcInput({ ...calc, saved: b.saved, target: 0 })) : null;

  const targetPct = formatPct(calc.target / 100);
  const gapRow =
    r && r.gap !== null
      ? {
          label: 'Gap to your target',
          value:
            Math.abs(r.gap) < 0.005
              ? 'Exactly on target'
              : r.gap > 0
                ? `${money(r.gap)} more a month to reach ${targetPct}`
                : `${money(-r.gap)} a month above your ${targetPct} target`,
        }
      : null;

  return (
    <div className="flex flex-col gap-6">
      <CalculatorGrid
        inputs={
          <InputsPanel
            label="Your income and savings"
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
                <SegmentedControl<IncomeBasis> label="Work it out from" value={s.basis} options={BASIS_OPTIONS} onChange={(v) => update('basis', v)} />
              </div>
              <div className="sm:col-span-2">
                <CurrencySelect value={c} onChange={(next: CurrencyCode) => setAll(switchRateCurrency(s, next, touched))} />
              </div>
              <InputCurrency
                label={net ? 'Monthly take-home pay' : 'Monthly gross income'}
                help={net ? 'What reaches your bank account each month. We don’t work out tax. Example value.' : 'Before tax and deductions. We don’t work out tax. Example value.'}
                currency={c}
                value={s.income}
                onChange={(v) => update('income', v)}
                error={errors.income}
              />
              <InputCurrency
                label="Monthly savings"
                help="Everything you put aside: savings, investments, extra debt payments if you count them. Example value."
                currency={c}
                value={s.saved}
                onChange={(v) => update('saved', v)}
                error={errors.saved}
              />
              <div className="sm:col-span-2">
                <InputNumber
                  optional
                  label="Your target savings rate (optional)"
                  help="Only if you have a target of your own. 0 = off."
                  value={s.target}
                  onChange={(v) => update('target', v)}
                  suffix="%"
                  error={errors.target}
                />
              </div>
            </div>
          </InputsPanel>
        }
        result={
          r ? (
            <ResultCard
              label={LABEL}
              value={formatPct(r.rate)}
              unit={`of your ${incomeWords} · saving ${money(calc.saved)} a month`}
              rows={[
                { label: 'Saved each year', note: 'Monthly savings × 12', value: money(r.yearly) },
                { label: 'Not saved each month', note: `${net ? 'Take-home pay' : 'Gross income'} − savings`, value: money(r.notSaved) },
                ...(r.targetAmount !== null ? [{ label: `Your ${targetPct} target`, note: `${targetPct} of ${money(calc.income)}`, value: `${money(r.targetAmount)} a month` }] : []),
                ...(gapRow ? [gapRow] : []),
              ]}
              footnote={
                <p>
                  Savings ÷ {incomeWords} × 100. The same savings give a smaller rate against gross income than against take-home pay, because the income is bigger.
                </p>
              }
            />
          ) : (
            <ResultCard label={LABEL} value="" unit="" rows={[]} error={FIX_FIELDS} />
          )
        }
      />

      <ScenarioCompare
        title="Compare two amounts"
        aName="Savings A (your inputs)"
        bName="Savings B"
        toolSlug={SLUG}
        error={!r || !rb ? FIX_FIELDS : undefined}
        planA={
          <dl className="type-small grid grid-cols-2 gap-y-2">
            <dt className="text-ink-muted">Monthly savings</dt>
            <dd className="text-right font-[550] tabular-nums">{money(calc.saved)}</dd>
            <dd className="col-span-2 mt-2 text-ink-muted">Savings B uses the same {incomeWords}.</dd>
          </dl>
        }
        planB={<InputCurrency label="Monthly savings" currency={c} value={b.saved} onChange={(v) => setB('saved', v)} error={bErrors.saved} />}
        rows={
          r && rb
            ? [
                { label: 'Savings rate', a: formatPct(r.rate), b: formatPct(rb.rate) },
                { label: 'Saved each year', a: money(r.yearly), b: money(rb.yearly) },
              ]
            : []
        }
      />
    </div>
  );
}
