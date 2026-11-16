'use client';

import dynamic from 'next/dynamic';
import { useRef } from 'react';
import { CalculatorGrid, InputsPanel } from '@/components/CalculatorGrid';
import { ChartLazy, ChartPlaceholder } from '@/components/ChartLazy';
import { CurrencySelect } from '@/components/CurrencySelect';
import { InputCurrency } from '@/components/InputCurrency';
import { ResetIcon } from '@/components/icons';
import { ResultCard } from '@/components/ResultCard';
import { ScenarioCompare } from '@/components/ScenarioCompare';
import { SelectField } from '@/components/SelectField';
import { Slider } from '@/components/Slider';
import { track } from '@/lib/analytics';
import { formatMoney, formatNumber, formatPercent, type CurrencyCode } from '@/lib/format';
import { useUrlState } from '@/lib/url-state';
import { breakEven, breakEvenLines, ceilSales, type BreakEvenError, type BreakEvenResult } from './calc';
import {
  breakEvenDefaults,
  breakEvenSchema,
  breakEvenVariant,
  fieldErrors,
  planBDefaults,
  planBSchema,
  switchBreakEvenCurrency,
  toCalcInput,
  type BreakEvenState,
  type Sells,
} from './schema';

const BreakEvenChart = dynamic(() => import('./Chart'), { ssr: false, loading: () => <ChartPlaceholder /> });

const SLUG = 'break-even-calculator';
const FIX_FIELDS = 'Check the highlighted fields to see your break-even point.';
const NOUN: Record<Sells, { one: string; many: string }> = {
  units: { one: 'unit', many: 'units' },
  projects: { one: 'project', many: 'projects' },
  clients: { one: 'client', many: 'clients' },
};

export default function BreakEvenCalculator() {
  const { state: s, setField, setAll, reset } = useUrlState(breakEvenSchema, breakEvenDefaults, { variant: breakEvenVariant });
  const { state: b, setField: setB } = useUrlState(planBSchema, planBDefaults, { prefix: 'b_' });
  const tracked = useRef(false);

  function update<K extends keyof BreakEvenState>(key: K, value: BreakEvenState[K]) {
    setField(key, value);
    if (!tracked.current) {
      tracked.current = true;
      track('calculate', { tool: SLUG });
    }
  }

  const c = s.currency;
  const money = (n: number) => formatMoney(n, c);
  const noun = NOUN[s.sells];
  const count = (n: number) => `${formatNumber(n)} ${n === 1 ? noun.one : noun.many}`;

  const errors = fieldErrors(breakEvenSchema, s);
  const result: BreakEvenResult | BreakEvenError =
    Object.keys(errors).length > 0 ? { ok: false, error: FIX_FIELDS } : breakEven(toCalcInput(s));

  const bErrors = fieldErrors(planBSchema, b);
  const priceB = s.price * (1 + b.priceChange / 100);
  const resultB: BreakEvenResult | BreakEvenError =
    result.ok && Object.keys(bErrors).length === 0 ? breakEven({ ...toCalcInput(s), price: priceB }) : { ok: false, error: FIX_FIELDS };

  const label = 'Break-even sales';
  const units = result.ok ? ceilSales(result.breakEvenUnits) : 0;
  const chartMax = result.ok ? Math.max(10, Math.ceil(result.breakEvenUnits * 2)) : 0;

  return (
    <div className="flex flex-col gap-6">
      <CalculatorGrid
        inputs={
          <InputsPanel
            label="Your costs and price"
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
              <CurrencySelect value={c} onChange={(next: CurrencyCode) => setAll(switchBreakEvenCurrency(s, next))} />
              <SelectField<Sells>
                label="What you sell"
                value={s.sells}
                onChange={(v) => update('sells', v)}
                options={[
                  { value: 'units', label: 'Units' },
                  { value: 'projects', label: 'Projects' },
                  { value: 'clients', label: 'Clients' },
                ]}
              />
              <div className="sm:col-span-2">
                <InputCurrency
                  label="Fixed costs per month"
                  help="Rent, software, insurance, salaries…"
                  currency={c}
                  value={s.fixedCosts}
                  onChange={(v) => update('fixedCosts', v)}
                  error={errors.fixedCosts}
                />
              </div>
              <InputCurrency
                label={`Price per ${noun.one}`}
                currency={c}
                value={s.price}
                onChange={(v) => update('price', v)}
                error={errors.price}
              />
              <InputCurrency
                label={`Variable cost per ${noun.one}`}
                help="Materials, fees, contractor cost per sale."
                currency={c}
                value={s.variableCost}
                onChange={(v) => update('variableCost', v)}
                error={errors.variableCost}
              />
              <div className="sm:col-span-2">
                <InputCurrency
                  label="Target profit per month (optional)"
                  help="Leave at 0 to see only the break-even point."
                  currency={c}
                  value={s.targetProfit}
                  onChange={(v) => update('targetProfit', v)}
                  error={errors.targetProfit}
                />
              </div>
            </div>
          </InputsPanel>
        }
        result={
          result.ok ? (
            <ResultCard
              label={label}
              value={formatNumber(units)}
              unit={`${units === 1 ? noun.one : noun.many} a month · ${c}`}
              rows={[
                { label: 'Break-even revenue', note: 'Per month', value: money(result.breakEvenRevenue) },
                {
                  label: `Contribution per ${noun.one}`,
                  note: `Margin ${formatPercent(result.marginRatio, 2)}`,
                  value: money(result.contribution),
                },
                ...(s.targetProfit > 0
                  ? [{ label: `Sales for ${money(s.targetProfit)} profit`, value: count(ceilSales(result.targetUnits)) }]
                  : []),
              ]}
              footnote={`Exact break-even: ${formatNumber(result.breakEvenUnits, 2)} ${noun.many}. Rounded up, because part of a sale doesn't count.`}
            />
          ) : (
            <ResultCard label={label} value="" unit="" rows={[]} error={result.error} />
          )
        }
      />

      {result.ok ? (
        <ChartLazy
          title="Revenue and costs"
          description={`Monthly revenue and total cost from 0 to ${count(chartMax)}. They cross at ${count(units)}.`}
          height={300}
        >
          <BreakEvenChart
            lines={breakEvenLines(toCalcInput(s), chartMax)}
            breakEven={{ units: result.breakEvenUnits, revenue: result.breakEvenRevenue }}
            currency={c}
            noun={noun.many}
          />
        </ChartLazy>
      ) : null}

      <ScenarioCompare
        title="Compare two prices"
        buttonLabel="Show comparison"
        aName="Price A (your inputs)"
        bName="Price B"
        toolSlug={SLUG}
        error={!result.ok || !resultB.ok ? (resultB.ok ? FIX_FIELDS : resultB.error) : undefined}
        planA={
          <dl className="type-small grid grid-cols-2 gap-y-2">
            <dt className="text-ink-muted">Price</dt>
            <dd className="text-right font-[550] tabular-nums">{money(s.price)}</dd>
            <dd className="col-span-2 mt-2 text-ink-muted">Change it in the calculator above.</dd>
          </dl>
        }
        planB={
          <Slider
            label="Price change"
            value={b.priceChange}
            onChange={(v) => setB('priceChange', v)}
            min={-90}
            max={500}
            format={(v) => `${v > 0 ? '+' : ''}${v}%`}
            unit="%"
            help={`Price B: ${money(priceB)}`}
            error={bErrors.priceChange}
          />
        }
        rows={
          result.ok && resultB.ok
            ? [
                { label: 'Price', a: money(s.price), b: money(priceB) },
                { label: `Contribution per ${noun.one}`, a: money(result.contribution), b: money(resultB.contribution) },
                { label: 'Margin', a: formatPercent(result.marginRatio, 2), b: formatPercent(resultB.marginRatio, 2) },
                {
                  label: 'Break-even sales',
                  a: count(ceilSales(result.breakEvenUnits)),
                  b: count(ceilSales(resultB.breakEvenUnits)),
                  better:
                    result.breakEvenUnits < resultB.breakEvenUnits ? 'a' : resultB.breakEvenUnits < result.breakEvenUnits ? 'b' : undefined,
                },
                { label: 'Break-even revenue', a: money(result.breakEvenRevenue), b: money(resultB.breakEvenRevenue) },
              ]
            : []
        }
      />
    </div>
  );
}
