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
import { findPrice, formatPct, fromCostAndPrice, marginFromMarkup, markupFromMargin, type MarginMode, type PriceFrom } from './calc';
import { marginDefaults, marginErrors, marginSchema, marginVariant, switchMarginCurrency, type MarginState } from './schema';

const SLUG = 'margin-vs-markup-calculator';
const FIX_FIELDS = 'Check the highlighted fields to see your result.';

const MODE_OPTIONS: readonly { value: MarginMode; label: string }[] = [
  { value: 'price', label: 'Cost and price' },
  { value: 'find', label: 'Find a price' },
  { value: 'convert', label: 'Convert %' },
];
const BY_OPTIONS: readonly { value: PriceFrom; label: string }[] = [
  { value: 'margin', label: 'Margin' },
  { value: 'markup', label: 'Markup' },
];

export default function MarginVsMarkupCalculator() {
  const { state: s, setField, setAll, reset, touched } = useUrlState(marginSchema, marginDefaults, { variant: marginVariant });
  const tracked = useRef(false);

  function update<K extends keyof MarginState>(key: K, value: MarginState[K]) {
    setField(key, value);
    if (!tracked.current) {
      tracked.current = true;
      track('calculate', { tool: SLUG });
    }
  }

  const c = s.currency;
  const money = (n: number) => formatMoney(n, c);
  const errors = marginErrors(s);
  const ok = Object.keys(errors).length === 0;
  const byMargin = s.by === 'margin';
  const pct = (byMargin ? s.margin : s.markup) / 100;

  let result;
  if (s.mode === 'price') {
    const label = 'Margin and markup';
    if (!ok) {
      result = <ResultCard label={label} value="" unit="" rows={[]} error={FIX_FIELDS} />;
    } else {
      const r = fromCostAndPrice(s.cost, s.price);
      const loss = r.profit < 0;
      result = (
        <ResultCard
          label={label}
          value={formatPct(r.margin!)}
          unit={`margin · on a price of ${money(s.price)}`}
          tone={loss ? 'negative' : undefined}
          rows={[
            r.markup === null
              ? { label: 'Markup', note: 'No cost, so markup can’t be worked out', value: '—' }
              : { label: 'Markup', note: `Profit as a share of the cost (${money(s.cost)})`, value: formatPct(r.markup) },
            { label: 'Profit per sale', note: 'Price − cost', value: money(r.profit) },
          ]}
          footnote={
            loss ? (
              <p className="font-[550] text-danger">You sell below cost.</p>
            ) : (
              <p>Margin is profit as a share of the price. Markup is profit as a share of the cost.</p>
            )
          }
        />
      );
    }
  } else if (s.mode === 'find') {
    const label = 'Selling price';
    if (!ok) {
      result = <ResultCard label={label} value="" unit="" rows={[]} error={FIX_FIELDS} />;
    } else {
      const r = findPrice(s.cost, s.by, pct);
      result = (
        <ResultCard
          label={label}
          value={money(r.price)}
          unit={`for a ${formatPct(pct)} ${s.by} on a cost of ${money(s.cost)} · ${c}`}
          rows={[
            { label: 'Profit per sale', value: money(r.profit) },
            byMargin
              ? { label: 'Markup', note: 'The same price as a markup on cost', value: formatPct(r.other) }
              : { label: 'Margin', note: 'The same price as a margin on price', value: formatPct(r.other) },
          ]}
        />
      );
    }
  } else {
    const label = byMargin ? 'Matching markup' : 'Matching margin';
    if (!ok) {
      result = <ResultCard label={label} value="" unit="" rows={[]} error={FIX_FIELDS} />;
    } else {
      const other = byMargin ? markupFromMargin(pct) : marginFromMarkup(pct);
      result = (
        <ResultCard
          label={label}
          value={formatPct(other)}
          unit={byMargin ? 'markup on cost' : 'margin on price'}
          rows={[
            {
              label: byMargin ? 'Margin you entered' : 'Markup you entered',
              value: formatPct(pct),
            },
          ]}
          footnote={
            <p className="font-[550]">
              {byMargin ? `A ${formatPct(pct)} margin = a ${formatPct(other)} markup.` : `A ${formatPct(pct)} markup = a ${formatPct(other)} margin.`}
            </p>
          }
        />
      );
    }
  }

  // The price split into cost and profit (price and find modes, profit above 0).
  const split =
    ok && s.mode !== 'convert'
      ? s.mode === 'price'
        ? { price: s.price, cost: s.cost }
        : { price: findPrice(s.cost, s.by, pct).price, cost: s.cost }
      : null;

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
                <SegmentedControl<MarginMode> label="What do you want to do?" value={s.mode} options={MODE_OPTIONS} onChange={(v) => update('mode', v)} />
              </div>
              {s.mode !== 'convert' ? (
                <>
                  <div className="sm:col-span-2">
                    <CurrencySelect value={c} onChange={(next: CurrencyCode) => setAll(switchMarginCurrency(s, next, touched))} />
                  </div>
                  <InputCurrency
                    label="Cost"
                    help="What one item or job costs you. Example value — use your own numbers."
                    currency={c}
                    value={s.cost}
                    onChange={(v) => update('cost', v)}
                    error={errors.cost}
                  />
                </>
              ) : null}
              {s.mode === 'price' ? (
                <InputCurrency
                  label="Selling price"
                  help="What the customer pays. Must be above 0. Example value."
                  currency={c}
                  value={s.price}
                  onChange={(v) => update('price', v)}
                  error={errors.price}
                />
              ) : (
                <>
                  <div className="sm:col-span-2">
                    <SegmentedControl<PriceFrom>
                      label={s.mode === 'find' ? 'Price from' : 'Convert from'}
                      value={s.by}
                      options={BY_OPTIONS}
                      onChange={(v) => update('by', v)}
                    />
                  </div>
                  {byMargin ? (
                    <InputNumber
                      label="Margin"
                      help="Profit as a share of the price. Must be below 100%. Example value."
                      value={s.margin}
                      onChange={(v) => update('margin', v)}
                      suffix="%"
                      error={errors.margin}
                    />
                  ) : (
                    <InputNumber
                      label="Markup"
                      help="Profit as a share of the cost. Example value."
                      value={s.markup}
                      onChange={(v) => update('markup', v)}
                      suffix="%"
                      error={errors.markup}
                    />
                  )}
                </>
              )}
            </div>
          </InputsPanel>
        }
        result={result}
      />

      {split && split.price > split.cost && split.price > 0 ? (
        <SplitBar
          title="Where the price goes"
          description={`${money(split.price)} price: ${formatPct((split.price - split.cost) / split.price)} margin, ${split.cost > 0 ? `${formatPct((split.price - split.cost) / split.cost)} markup` : 'no cost'}.`}
          parts={[
            { key: 'cost', label: 'Cost', value: split.cost, display: money(split.cost), color: CATEGORICAL[1]! },
            { key: 'profit', label: 'Profit', value: split.price - split.cost, display: money(split.price - split.cost), color: CATEGORICAL[0]! },
          ]}
        />
      ) : null}
    </div>
  );
}
