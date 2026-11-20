'use client';

import { useRef } from 'react';
import { CalculatorGrid, InputsPanel } from '@/components/CalculatorGrid';
import { CurrencySelect } from '@/components/CurrencySelect';
import { InputCurrency } from '@/components/InputCurrency';
import { InputNumber } from '@/components/InputNumber';
import { ResetIcon } from '@/components/icons';
import { ResultCard } from '@/components/ResultCard';
import { SegmentedControl } from '@/components/SegmentedControl';
import { SplitBar } from '@/components/SplitBar';
import { track } from '@/lib/analytics';
import { CATEGORICAL } from '@/lib/chart-palette';
import { formatMoney, type CurrencyCode } from '@/lib/format';
import { useUrlState } from '@/lib/url-state';
import { formatPct } from '@/tools/margin-vs-markup-calculator/calc';
import { dishFoodCost, menuPrice, periodFoodCost, type FoodCostMode } from './calc';
import { foodCostDefaults, foodCostErrors, foodCostSchema, foodCostVariant, switchFoodCostCurrency, type FoodCostState } from './schema';

const SLUG = 'food-cost-calculator';
const FIX_FIELDS = 'Check the highlighted fields to see your result.';

const MODE_OPTIONS: readonly { value: FoodCostMode; label: string }[] = [
  { value: 'percent', label: 'Food cost %' },
  { value: 'price', label: 'Menu price' },
  { value: 'period', label: 'For a period' },
];
const LABEL: Record<FoodCostMode, string> = {
  percent: 'Food cost percentage',
  price: 'Menu price',
  period: 'Food cost percentage',
};

export default function FoodCostCalculator() {
  const { state: s, setField, setAll, reset, touched } = useUrlState(foodCostSchema, foodCostDefaults, { variant: foodCostVariant });
  const tracked = useRef(false);

  function update<K extends keyof FoodCostState>(key: K, value: FoodCostState[K]) {
    setField(key, value);
    if (!tracked.current) {
      tracked.current = true;
      track('calculate', { tool: SLUG });
    }
  }

  const c = s.currency;
  const money = (n: number) => formatMoney(n, c);
  const errors = foodCostErrors(s);
  const ok = Object.keys(errors).length === 0;
  const mode = s.mode;
  const label = LABEL[mode];

  // The plate split (percent and price modes): ingredients vs gross profit.
  let plate: { price: number; cost: number } | null = null;
  let result;
  if (!ok) {
    result = <ResultCard label={label} value="" unit="" rows={[]} error={FIX_FIELDS} />;
  } else if (mode === 'percent') {
    const r = dishFoodCost(s.cost, s.price);
    plate = { price: s.price, cost: s.cost };
    result = (
      <ResultCard
        label={label}
        value={formatPct(r.pct)}
        unit={`of a ${money(s.price)} menu price`}
        tone={r.pct > 1 ? 'negative' : undefined}
        rows={[
          { label: 'Ingredient cost', value: money(s.cost) },
          { label: 'Gross profit per plate', note: 'Menu price − ingredient cost, before labour and other costs', value: money(r.profit) },
        ]}
        footnote={r.pct > 1 ? <p className="font-[550] text-danger">Your ingredients cost more than the menu price.</p> : undefined}
      />
    );
  } else if (mode === 'price') {
    const r = menuPrice(s.cost, s.target / 100);
    plate = { price: r.price, cost: s.cost };
    result = (
      <ResultCard
        label={label}
        value={money(r.price)}
        unit={`for a ${formatPct(s.target / 100)} food cost · ${c}`}
        rows={[
          { label: 'Ingredient cost', value: money(s.cost) },
          { label: 'Gross profit per plate', note: 'Before labour and other costs', value: money(r.profit) },
        ]}
        footnote={<p>Before any sales tax you add on top. Round the price to suit your menu.</p>}
      />
    );
  } else {
    const r = periodFoodCost(s.open, s.buy, s.close, s.sales);
    result = (
      <ResultCard
        label={label}
        value={formatPct(r.pct)}
        unit={`of ${money(s.sales)} food sales`}
        rows={[
          { label: 'Cost of food used', note: 'Opening inventory + purchases − closing inventory', value: money(r.used) },
          { label: 'Food sales', value: money(s.sales) },
        ]}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <CalculatorGrid
        inputs={
          <InputsPanel
            label="Your numbers"
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
                <SegmentedControl<FoodCostMode> label="What do you want to work out?" value={mode} options={MODE_OPTIONS} onChange={(v) => update('mode', v)} />
              </div>
              <div className="sm:col-span-2">
                <CurrencySelect value={c} onChange={(next: CurrencyCode) => setAll(switchFoodCostCurrency(s, next, touched))} />
              </div>
              {mode !== 'period' ? (
                <InputCurrency
                  label="Ingredient cost per dish"
                  help="What the ingredients in one portion cost you. Example values — use your own numbers."
                  currency={c}
                  value={s.cost}
                  onChange={(v) => update('cost', v)}
                  error={errors.cost}
                />
              ) : null}
              {mode === 'percent' ? (
                <InputCurrency
                  label="Menu price"
                  help="Before any sales tax you add on top. Must be above 0."
                  currency={c}
                  value={s.price}
                  onChange={(v) => update('price', v)}
                  error={errors.price}
                />
              ) : null}
              {mode === 'price' ? (
                <InputNumber
                  label="Target food cost"
                  help="Your own target. Example value only."
                  value={s.target}
                  onChange={(v) => update('target', v)}
                  suffix="%"
                  error={errors.target}
                />
              ) : null}
              {mode === 'period' ? (
                <>
                  <InputCurrency
                    label="Opening inventory"
                    help="Food in stock at the start of the period. Example values."
                    currency={c}
                    value={s.open}
                    onChange={(v) => update('open', v)}
                    error={errors.open}
                  />
                  <InputCurrency
                    label="Purchases"
                    help="Food bought during the period."
                    currency={c}
                    value={s.buy}
                    onChange={(v) => update('buy', v)}
                    error={errors.buy}
                  />
                  <InputCurrency
                    label="Closing inventory"
                    help="Food in stock at the end of the period."
                    currency={c}
                    value={s.close}
                    onChange={(v) => update('close', v)}
                    error={errors.close}
                  />
                  <InputCurrency
                    label="Food sales"
                    help="Food sales for the same period, before sales tax."
                    currency={c}
                    value={s.sales}
                    onChange={(v) => update('sales', v)}
                    error={errors.sales}
                  />
                </>
              ) : null}
            </div>
          </InputsPanel>
        }
        result={result}
      />

      {plate && plate.price > plate.cost && plate.price > 0 ? (
        <SplitBar
          title="Where the menu price goes"
          description={`${money(plate.price)} menu price: ${formatPct(plate.cost / plate.price)} ingredients, ${formatPct((plate.price - plate.cost) / plate.price)} gross profit.`}
          parts={[
            { key: 'cost', label: 'Ingredients', value: plate.cost, display: money(plate.cost), color: CATEGORICAL[1]! },
            { key: 'profit', label: 'Gross profit', value: plate.price - plate.cost, display: money(plate.price - plate.cost), color: CATEGORICAL[0]! },
          ]}
        />
      ) : null}
    </div>
  );
}
