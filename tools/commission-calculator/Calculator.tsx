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
import { formatMoney, formatNumber, formatPercent, type CurrencyCode } from '@/lib/format';
import { useUrlState } from '@/lib/url-state';
import { commission, type CommissionError, type CommissionResult, type PlanType } from './calc';
import {
  commissionDefaults,
  commissionSchema,
  commissionVariant,
  fieldErrors,
  planBDefaults,
  planBSchema,
  switchCommissionCurrency,
  toCalcInput,
  type CommissionState,
} from './schema';

const SLUG = 'commission-calculator';
const FIX_FIELDS = 'Check the highlighted fields to see your result.';

export default function CommissionCalculator() {
  const { state: s, setField, setAll, reset } = useUrlState(commissionSchema, commissionDefaults, { variant: commissionVariant });
  const { state: b, setField: setB } = useUrlState(planBSchema, planBDefaults, { prefix: 'b_' });
  const tracked = useRef(false);

  function update<K extends keyof CommissionState>(key: K, value: CommissionState[K]) {
    setField(key, value);
    if (!tracked.current) {
      tracked.current = true;
      track('calculate', { tool: SLUG });
    }
  }

  const c = s.currency;
  const money = (n: number) => formatMoney(n, c);
  const tiered = s.plan === 'tiered';

  const errors = fieldErrors(commissionSchema, s);
  const result: CommissionResult | CommissionError =
    Object.keys(errors).length > 0 ? { ok: false, error: FIX_FIELDS } : commission(toCalcInput(s));

  const bErrors = fieldErrors(planBSchema, b);
  const resultB: CommissionResult | CommissionError =
    result.ok && Object.keys(bErrors).length === 0
      ? commission({ ...toCalcInput(s), plan: 'flat', rate: b.rate / 100 })
      : { ok: false, error: FIX_FIELDS };

  const effective = (r: CommissionResult) => (r.effective === null ? '—' : formatPercent(r.effective, 2));
  const tierRow = (n: 2 | 3 | 4) => {
    const fromKey = `t${n}From` as const;
    const rateKey = `t${n}Rate` as const;
    return (
      <div key={n} className="grid grid-cols-2 gap-x-4">
        <InputCurrency
          label={`Tier ${n} starts at`}
          currency={c}
          value={s[fromKey]}
          onChange={(v) => update(fromKey, v)}
          error={errors[fromKey]}
        />
        <InputNumber label={`Tier ${n} rate`} value={s[rateKey]} onChange={(v) => update(rateKey, v)} min={0} max={100} step={0.1} suffix="%" error={errors[rateKey]} />
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <CalculatorGrid
        inputs={
          <InputsPanel
            label="Your sales and plan"
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
                <SegmentedControl<PlanType>
                  label="Commission plan"
                  value={s.plan}
                  onChange={(v) => update('plan', v)}
                  options={[
                    { value: 'flat', label: 'Flat rate' },
                    { value: 'tiered', label: 'Tiered rates' },
                  ]}
                />
              </div>
              <CurrencySelect value={c} onChange={(next: CurrencyCode) => setAll(switchCommissionCurrency(s, next))} />
              <InputCurrency label="Sales amount" help="For the period you're paid for." currency={c} value={s.sales} onChange={(v) => update('sales', v)} error={errors.sales} />
              {tiered ? (
                <fieldset className="flex flex-col gap-5 sm:col-span-2">
                  <legend className="type-small mb-2 font-[550] text-ink">Your tiers</legend>
                  <div className="grid grid-cols-2 gap-x-4">
                    <InputNumber
                      label="Tier 1 rate"
                      help={`From ${money(0)}.`}
                      value={s.t1Rate}
                      onChange={(v) => update('t1Rate', v)}
                      min={0}
                      max={100}
                      step={0.1}
                      suffix="%"
                      error={errors.t1Rate}
                    />
                  </div>
                  {tierRow(2)}
                  {tierRow(3)}
                  {tierRow(4)}
                  <p className="type-small text-ink-muted">
                    Each rate applies only to sales inside its tier. Example tiers — use your own plan. Set &ldquo;starts at&rdquo; to 0 to skip a tier.
                  </p>
                </fieldset>
              ) : (
                <InputNumber
                  label="Commission rate"
                  help="Example only. Use the rate in your plan."
                  value={s.rate}
                  onChange={(v) => update('rate', v)}
                  min={0}
                  max={100}
                  step={0.1}
                  suffix="%"
                  error={errors.rate}
                />
              )}
              <InputCurrency
                label="Base pay (optional)"
                help="For the same period. Leave at 0 to skip."
                currency={c}
                value={s.base}
                onChange={(v) => update('base', v)}
                error={errors.base}
              />
            </div>
          </InputsPanel>
        }
        result={
          result.ok ? (
            <ResultCard
              label="Your commission"
              value={money(result.commission)}
              unit={`${c} · effective rate ${effective(result)}`}
              rows={[
                ...(tiered
                  ? result.rows.map((r, i) => ({
                      label: `Tier ${i + 1}: ${formatNumber(r.rate * 100, 2)}%`,
                      note: `${money(r.inTier)} of sales${r.to === null ? ` above ${money(r.from)}` : ` from ${money(r.from)} to ${money(r.to)}`}`,
                      value: money(r.amount),
                    }))
                  : [{ label: 'Commission rate', value: `${formatNumber(s.rate, 2)}%` }]),
                ...(s.base > 0 ? [{ label: 'Base pay', value: money(s.base) }] : []),
                { label: 'Total earnings', note: s.base > 0 ? 'Base pay + commission' : undefined, value: money(result.total) },
                { label: 'Effective rate', note: 'Commission ÷ sales', value: effective(result) },
              ]}
            />
          ) : (
            <ResultCard label="Your commission" value="" unit="" rows={[]} error={result.error} />
          )
        }
      />

      <ScenarioCompare
        title="Compare two commission plans"
        aName="Your plan"
        bName="A flat rate"
        toolSlug={SLUG}
        error={!result.ok || !resultB.ok ? FIX_FIELDS : undefined}
        planA={
          <dl className="type-small grid grid-cols-2 gap-y-2">
            <dt className="text-ink-muted">Plan</dt>
            <dd className="text-right font-[550]">{tiered ? 'Tiered rates' : `${formatNumber(s.rate, 2)}% flat`}</dd>
            <dd className="col-span-2 mt-2 text-ink-muted">Change this in the calculator above.</dd>
          </dl>
        }
        planB={
          <InputNumber label="Flat rate" value={b.rate} onChange={(v) => setB('rate', v)} min={0} max={100} step={0.1} suffix="%" error={bErrors.rate} />
        }
        rows={
          result.ok && resultB.ok
            ? [
                {
                  label: 'Commission',
                  a: money(result.commission),
                  b: money(resultB.commission),
                  better: result.commission > resultB.commission ? 'a' : resultB.commission > result.commission ? 'b' : undefined,
                },
                { label: 'Total earnings', a: money(result.total), b: money(resultB.total) },
                { label: 'Effective rate', a: effective(result), b: effective(resultB) },
              ]
            : []
        }
      />
    </div>
  );
}
