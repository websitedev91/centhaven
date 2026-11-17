'use client';

import { useRef } from 'react';
import { CalculatorGrid, InputsPanel } from '@/components/CalculatorGrid';
import { CurrencySelect } from '@/components/CurrencySelect';
import { InputCurrency } from '@/components/InputCurrency';
import { InputNumber } from '@/components/InputNumber';
import { ResetIcon } from '@/components/icons';
import { ResultCard } from '@/components/ResultCard';
import { ScenarioCompare } from '@/components/ScenarioCompare';
import { Slider } from '@/components/Slider';
import { track } from '@/lib/analytics';
import { formatMoney, formatNumber, type CurrencyCode } from '@/lib/format';
import { useUrlState } from '@/lib/url-state';
import { retainerFee, type RetainerError, type RetainerResult } from './calc';
import {
  fieldErrors,
  planBDefaults,
  planBSchema,
  retainerDefaults,
  retainerSchema,
  retainerVariant,
  switchRetainerCurrency,
  toCalcInput,
  type RetainerState,
} from './schema';

const SLUG = 'retainer-fee-calculator';
const FIX_FIELDS = 'Check the highlighted fields to see your retainer.';

export default function RetainerFeeCalculator() {
  const { state: s, setField, setAll, reset } = useUrlState(retainerSchema, retainerDefaults, { variant: retainerVariant });
  const { state: b, setField: setB } = useUrlState(planBSchema, planBDefaults, { prefix: 'b_' });
  const tracked = useRef(false);

  function update<K extends keyof RetainerState>(key: K, value: RetainerState[K]) {
    setField(key, value);
    if (!tracked.current) {
      tracked.current = true;
      track('calculate', { tool: SLUG });
    }
  }

  const c = s.currency;
  const money = (n: number) => formatMoney(n, c);
  const errors = fieldErrors(retainerSchema, s);
  const result: RetainerResult | RetainerError =
    Object.keys(errors).length > 0 ? { ok: false, error: FIX_FIELDS } : retainerFee(toCalcInput(s));

  const bErrors = fieldErrors(planBSchema, b);
  const resultB: RetainerResult | RetainerError =
    result.ok && Object.keys(bErrors).length === 0 ? retainerFee(toCalcInput({ ...s, ...b })) : { ok: false, error: FIX_FIELDS };

  const effective = (r: RetainerResult) => (r.effectiveRate === null ? 'No hours used' : money(r.effectiveRate));
  const label = 'Monthly retainer fee';

  return (
    <div className="flex flex-col gap-6">
      <CalculatorGrid
        inputs={
          <InputsPanel
            label="Your retainer"
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
                <CurrencySelect value={c} onChange={(next: CurrencyCode) => setAll(switchRetainerCurrency(s, next))} />
              </div>
              <InputCurrency
                label="Your hourly rate"
                currency={c}
                value={s.rate}
                onChange={(v) => update('rate', v)}
                error={errors.rate}
              />
              <InputNumber
                label="Hours committed per month"
                value={s.hours}
                onChange={(v) => update('hours', v)}
                suffix="hours"
                error={errors.hours}
              />
              <div className="sm:col-span-2">
                <Slider
                  label="Retainer discount"
                  help="Many freelancers give a small discount for guaranteed monthly work. Your choice."
                  value={s.discount}
                  onChange={(v) => update('discount', v)}
                  min={0}
                  max={50}
                  format={(v) => `${v}%`}
                  unit="%"
                  error={errors.discount}
                />
              </div>
              <div className="sm:col-span-2">
                <InputNumber
                  label="Agreement length"
                  value={s.months}
                  onChange={(v) => update('months', v)}
                  suffix="months"
                  error={errors.months}
                />
              </div>
              <div className="sm:col-span-2">
                <Slider
                  label="Hours the client actually uses"
                  help="For the effective rate. Unused hours usually don't roll over; say so in the agreement."
                  value={s.usage}
                  onChange={(v) => update('usage', v)}
                  min={0}
                  max={100}
                  format={(v) => `${v}%`}
                  unit="%"
                  error={errors.usage}
                />
              </div>
            </div>
          </InputsPanel>
        }
        result={
          result.ok ? (
            <ResultCard
              label={label}
              value={money(result.monthlyFee)}
              unit={`per month · ${c}`}
              rows={[
                { label: 'Same hours billed hourly', value: money(result.hourlyBilling) },
                { label: 'Discount given', note: 'Per month', value: money(result.discountGiven) },
                { label: 'Agreement value', note: `${formatNumber(s.months)} ${s.months === 1 ? 'month' : 'months'}`, value: money(result.contractValue) },
                {
                  label: 'Effective hourly rate',
                  note:
                    result.effectiveRate === null
                      ? 'Shown once the client uses some hours'
                      : `At ${formatNumber(result.hoursUsed, 1)} hours used a month`,
                  value: effective(result),
                },
              ]}
            />
          ) : (
            <ResultCard label={label} value="" unit="" rows={[]} error={result.error} />
          )
        }
      />

      <ScenarioCompare
        title="Compare two retainers"
        aName="Plan A (your inputs)"
        bName="Plan B"
        toolSlug={SLUG}
        error={!result.ok || !resultB.ok ? FIX_FIELDS : undefined}
        planA={
          <dl className="type-small grid grid-cols-2 gap-y-2">
            <dt className="text-ink-muted">Hours per month</dt>
            <dd className="text-right font-[550] tabular-nums">{s.hours}</dd>
            <dt className="text-ink-muted">Discount</dt>
            <dd className="text-right font-[550] tabular-nums">{s.discount}%</dd>
            <dd className="col-span-2 mt-2 text-ink-muted">Change these in the calculator above.</dd>
          </dl>
        }
        planB={
          <>
            <InputNumber
              label="Hours committed per month"
              value={b.hours}
              onChange={(v) => setB('hours', v)}
              suffix="hours"
              error={bErrors.hours}
            />
            <Slider
              label="Retainer discount"
              value={b.discount}
              onChange={(v) => setB('discount', v)}
              min={0}
              max={50}
              format={(v) => `${v}%`}
              unit="%"
              error={bErrors.discount}
            />
          </>
        }
        rows={
          result.ok && resultB.ok
            ? [
                { label: 'Monthly fee', a: money(result.monthlyFee), b: money(resultB.monthlyFee) },
                { label: 'Same hours billed hourly', a: money(result.hourlyBilling), b: money(resultB.hourlyBilling) },
                { label: 'Agreement value', a: money(result.contractValue), b: money(resultB.contractValue) },
                { label: 'Effective hourly rate', a: effective(result), b: effective(resultB) },
              ]
            : []
        }
      />
    </div>
  );
}
