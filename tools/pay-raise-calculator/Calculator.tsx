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
import { SelectField } from '@/components/SelectField';
import { track } from '@/lib/analytics';
import { formatMoney, formatPercent, type CurrencyCode } from '@/lib/format';
import { useUrlState } from '@/lib/url-state';
import { payRaise, type PayRaiseError, type PayRaiseResult, type Period, type RaiseMode } from './calc';
import {
  fieldErrors,
  payRaiseDefaults,
  payRaiseSchema,
  payRaiseVariant,
  planBDefaults,
  planBSchema,
  switchPayContext,
  toCalcInput,
  type PayRaiseState,
} from './schema';

const SLUG = 'pay-raise-calculator';
const FIX_FIELDS = 'Check the highlighted fields to see your result.';
const PER: Record<Period, string> = { hour: 'an hour', week: 'a week', month: 'a month', year: 'a year' };

export default function PayRaiseCalculator() {
  const { state: s, setField, setAll, reset } = useUrlState(payRaiseSchema, payRaiseDefaults, { variant: payRaiseVariant });
  const { state: b, setField: setB } = useUrlState(planBSchema, planBDefaults, { prefix: 'b_' });
  const tracked = useRef(false);

  function update<K extends keyof PayRaiseState>(key: K, value: PayRaiseState[K]) {
    setField(key, value);
    if (!tracked.current) {
      tracked.current = true;
      track('calculate', { tool: SLUG });
    }
  }

  const c = s.currency;
  const money = (n: number) => formatMoney(n, c);
  const signed = (n: number) => (n < 0 ? `−${money(-n)}` : `+${money(n)}`);
  const pct = (f: number) => formatPercent(f, 2);
  const per = PER[s.period];
  const percentMode = s.mode === 'percent';

  const errors = fieldErrors(payRaiseSchema, s);
  const result: PayRaiseResult | PayRaiseError =
    Object.keys(errors).length > 0 ? { ok: false, error: FIX_FIELDS } : payRaise(toCalcInput(s));

  const bErrors = fieldErrors(planBSchema, b);
  const resultB: PayRaiseResult | PayRaiseError =
    result.ok && Object.keys(bErrors).length === 0
      ? payRaise(toCalcInput({ ...s, mode: 'percent', raise: b.raise }))
      : { ok: false, error: FIX_FIELDS };

  const label = percentMode ? 'Your new pay' : result.ok && result.raise < 0 ? 'Your pay cut' : 'Your raise';
  const raiseText = (r: PayRaiseResult) => (r.raise < 0 ? `a ${pct(-r.raise)} pay cut` : `a ${pct(r.raise)} raise`);

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
                <SegmentedControl<RaiseMode>
                  label="I know"
                  value={s.mode}
                  onChange={(v) => update('mode', v)}
                  options={[
                    { value: 'percent', label: 'The raise %' },
                    { value: 'newpay', label: 'My new pay' },
                  ]}
                />
              </div>
              <CurrencySelect value={c} onChange={(next: CurrencyCode) => setAll(switchPayContext(s, { currency: next }))} />
              <SelectField<Period>
                label="Pay period"
                value={s.period}
                onChange={(v) => setAll(switchPayContext(s, { period: v }))}
                options={[
                  { value: 'hour', label: 'Per hour' },
                  { value: 'week', label: 'Per week' },
                  { value: 'month', label: 'Per month' },
                  { value: 'year', label: 'Per year' },
                ]}
              />
              <InputCurrency
                label="Current pay"
                help={`Before tax, ${per}. Example value — use your own.`}
                currency={c}
                value={s.current}
                onChange={(v) => update('current', v)}
                error={errors.current}
              />
              {percentMode ? (
                <InputNumber
                  label="Raise %"
                  help="Use a minus sign for a pay cut."
                  value={s.raise}
                  onChange={(v) => update('raise', v)}
                  min={-50}
                  max={200}
                  step={0.1}
                  suffix="%"
                  error={errors.raise}
                />
              ) : (
                <InputCurrency
                  label="New pay"
                  help={`Before tax, ${per}.`}
                  currency={c}
                  value={s.newPay}
                  onChange={(v) => update('newPay', v)}
                  error={errors.newPay}
                />
              )}
              {s.period === 'hour' ? (
                <InputNumber
                  label="Hours per week"
                  help="Used for the yearly figures."
                  value={s.hours}
                  onChange={(v) => update('hours', v)}
                  suffix="hours"
                  error={errors.hours}
                />
              ) : null}
              <InputNumber
                label="Inflation % (optional)"
                help="Optional. Enter a figure you trust; leave at 0 to skip."
                value={s.inflation}
                onChange={(v) => update('inflation', v)}
                min={0}
                max={50}
                step={0.1}
                suffix="%"
                error={errors.inflation}
              />
            </div>
          </InputsPanel>
        }
        result={
          result.ok ? (
            <ResultCard
              label={label}
              value={percentMode ? money(result.newPay) : pct(Math.abs(result.raise))}
              unit={percentMode ? `${per} · ${c} · ${raiseText(result)}` : `${signed(result.raiseAmount)} ${per}`}
              tone={result.raise < 0 ? 'negative' : result.raise > 0 ? 'positive' : undefined}
              rows={[
                { label: 'New pay', value: `${money(result.newPay)} ${per}` },
                { label: 'Change', note: raiseText(result), value: `${signed(result.raiseAmount)} ${per}` },
                ...(s.period === 'year'
                  ? []
                  : [
                      {
                        label: 'Change per year',
                        note: s.period === 'hour' ? `At ${s.hours} hours a week, 52 weeks` : undefined,
                        value: signed(result.raisePerYear),
                      },
                      { label: 'New pay per year', value: money(result.newPerYear) },
                    ]),
                ...(result.realRaise === null
                  ? []
                  : [{ label: 'After inflation', note: `With ${s.inflation}% inflation`, value: result.realRaise < 0 ? `−${pct(-result.realRaise)}` : pct(result.realRaise) }]),
              ]}
            />
          ) : (
            <ResultCard label={label} value="" unit="" rows={[]} error={result.error} />
          )
        }
      />

      <ScenarioCompare
        title="Compare two raises"
        aName={percentMode ? 'Raise A (your inputs)' : 'Your new pay'}
        bName="Raise B"
        toolSlug={SLUG}
        error={!result.ok || !resultB.ok ? FIX_FIELDS : undefined}
        planA={
          <dl className="type-small grid grid-cols-2 gap-y-2">
            <dt className="text-ink-muted">Raise</dt>
            <dd className="text-right font-[550] tabular-nums">{result.ok ? pct(result.raise) : '—'}</dd>
            <dd className="col-span-2 mt-2 text-ink-muted">Change this in the calculator above.</dd>
          </dl>
        }
        planB={
          <InputNumber
            label="Raise %"
            value={b.raise}
            onChange={(v) => setB('raise', v)}
            min={-50}
            max={200}
            step={0.1}
            suffix="%"
            error={bErrors.raise}
          />
        }
        rows={
          result.ok && resultB.ok
            ? [
                {
                  label: `New pay (${per})`,
                  a: money(result.newPay),
                  b: money(resultB.newPay),
                  better: result.newPay > resultB.newPay ? 'a' : resultB.newPay > result.newPay ? 'b' : undefined,
                },
                { label: 'New pay per year', a: money(result.newPerYear), b: money(resultB.newPerYear) },
                { label: 'Change per year', a: signed(result.raisePerYear), b: signed(resultB.raisePerYear) },
              ]
            : []
        }
      />
    </div>
  );
}
