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
import { optionalOff } from '@/lib/field-errors';
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
/** Optional fields: an invalid one shows its own error, and the result still shows (treated as 0). */
const OPTIONAL = ['overageRate', 'extraHours'] as const;
const FIX_FIELDS = 'Check the highlighted fields to see your retainer.';
/** −10 → "−10%", 20 → "+20%", 0 → "0%". */
const signedPercent = (v: number) => (v > 0 ? `+${v}%` : v < 0 ? `−${Math.abs(v)}%` : '0%');

export default function RetainerFeeCalculator() {
  const { state: s, setField, setAll, reset, touched } = useUrlState(retainerSchema, retainerDefaults, { variant: retainerVariant });
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
  const { blocking, calc } = optionalOff(s, errors, OPTIONAL);
  const result: RetainerResult | RetainerError =
    Object.keys(blocking).length > 0 ? { ok: false, error: FIX_FIELDS } : retainerFee(toCalcInput(calc));

  const bErrors = fieldErrors(planBSchema, b);
  const resultB: RetainerResult | RetainerError =
    result.ok && Object.keys(bErrors).length === 0 ? retainerFee(toCalcInput({ ...calc, ...b })) : { ok: false, error: FIX_FIELDS };

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
                <CurrencySelect value={c} onChange={(next: CurrencyCode) => setAll(switchRetainerCurrency(s, next, touched))} />
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
                  label="Discount (−) or premium (+)"
                  help="A small discount rewards guaranteed monthly work; a premium suits priority or on-call access. Your choice."
                  value={s.adjust}
                  onChange={(v) => update('adjust', v)}
                  min={-50}
                  max={50}
                  format={signedPercent}
                  unit="%"
                  error={errors.adjust}
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
              <InputCurrency optional
                label="Overage rate for extra hours"
                help={s.overageRate > 0 ? 'Charged per hour beyond the retainer.' : `Leave at 0 to use your hourly rate (${money(s.rate)}).`}
                currency={c}
                value={s.overageRate}
                onChange={(v) => update('overageRate', v)}
                error={errors.overageRate}
              />
              <InputNumber optional
                label="Expected extra hours per month"
                help="Optional. Work beyond the hours in the retainer."
                value={s.extraHours}
                onChange={(v) => update('extraHours', v)}
                suffix="hours"
                error={errors.extraHours}
              />
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
                {
                  label: result.adjustmentAmount < 0 ? 'Discount given' : 'Premium added',
                  note: 'Per month',
                  value: money(Math.abs(result.adjustmentAmount)),
                },
                { label: 'Agreement value', note: `${formatNumber(s.months)} ${s.months === 1 ? 'month' : 'months'}`, value: money(result.contractValue) },
                {
                  label: 'Effective hourly rate',
                  note:
                    result.effectiveRate === null
                      ? 'Shown once the client uses some hours'
                      : `At ${formatNumber(result.hoursUsed, 1)} hours used a month`,
                  value: effective(result),
                },
                ...(result.overagePerMonth > 0
                  ? [
                      {
                        label: 'Extra hours',
                        note: `${formatNumber(s.extraHours, 1)} h × ${money(result.overageRate)}`,
                        value: money(result.overagePerMonth),
                      },
                      { label: 'Monthly total with extra hours', value: money(result.monthlyTotal) },
                      {
                        label: 'Agreement total with extra hours',
                        note: `${formatNumber(s.months)} ${s.months === 1 ? 'month' : 'months'}`,
                        value: money(result.contractTotal),
                      },
                    ]
                  : []),
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
            <dt className="text-ink-muted">Discount / premium</dt>
            <dd className="text-right font-[550] tabular-nums">{signedPercent(s.adjust)}</dd>
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
              label="Discount (−) or premium (+)"
              value={b.adjust}
              onChange={(v) => setB('adjust', v)}
              min={-50}
              max={50}
              format={signedPercent}
              unit="%"
              error={bErrors.adjust}
            />
          </>
        }
        rows={
          result.ok && resultB.ok
            ? [
                { label: 'Monthly fee', a: money(result.monthlyFee), b: money(resultB.monthlyFee) },
                { label: 'Same hours billed hourly', a: money(result.hourlyBilling), b: money(resultB.hourlyBilling) },
                { label: 'Agreement value', a: money(result.contractValue), b: money(resultB.contractValue) },
                ...(result.overagePerMonth > 0
                  ? [{ label: 'Monthly total with extra hours', a: money(result.monthlyTotal), b: money(resultB.monthlyTotal) }]
                  : []),
                { label: 'Effective hourly rate', a: effective(result), b: effective(resultB) },
              ]
            : []
        }
      />
    </div>
  );
}
