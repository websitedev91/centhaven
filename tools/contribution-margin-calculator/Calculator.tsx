'use client';

import { useRef } from 'react';
import { CalculatorGrid, InputsPanel } from '@/components/CalculatorGrid';
import { CurrencySelect } from '@/components/CurrencySelect';
import { InputCurrency } from '@/components/InputCurrency';
import { InputNumber } from '@/components/InputNumber';
import { ResetIcon } from '@/components/icons';
import { ResultCard } from '@/components/ResultCard';
import { ScenarioCompare } from '@/components/ScenarioCompare';
import { track } from '@/lib/analytics';
import { fieldErrors, optionalOff } from '@/lib/field-errors';
import { formatMoney, formatNumber, type CurrencyCode } from '@/lib/format';
import { useUrlState } from '@/lib/url-state';
import { formatPct } from '@/tools/margin-vs-markup-calculator/calc';
import { contributionMargin, type MarginResult } from './calc';
import {
  OPTIONAL,
  marginDefaults,
  marginErrors,
  marginSchema,
  marginVariant,
  planBDefaults,
  planBSchema,
  switchMarginCurrency,
  toCalcInput,
  type MarginState,
} from './schema';

const SLUG = 'contribution-margin-calculator';
const FIX_FIELDS = 'Check the highlighted fields to see your result.';
const LABEL = 'Contribution margin per unit';
const NO_BREAK_EVEN = 'Each unit doesn’t add anything towards fixed costs, so there is no break-even point.';

const unitsText = (n: number) => `${formatNumber(n)} ${n === 1 ? 'unit' : 'units'}`;

export default function ContributionMarginCalculator() {
  const { state: s, setField, setAll, reset, touched } = useUrlState(marginSchema, marginDefaults, { variant: marginVariant });
  const { state: b, setField: setB } = useUrlState(planBSchema, planBDefaults, { prefix: 'b_' });
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
  const signed = (n: number) => (n < 0 ? `−${money(-n)}` : money(n));
  const errors = marginErrors(s);
  const { blocking, calc } = optionalOff(s, errors, OPTIONAL);
  const r = Object.keys(blocking).length > 0 ? null : contributionMargin(toCalcInput(calc));

  const bErrors = fieldErrors(planBSchema, b);
  const rb = r && !bErrors.price ? contributionMargin(toCalcInput({ ...calc, price: b.price })) : null;

  const breakEvenText = (x: MarginResult) => (x.breakEven ? unitsText(x.breakEven.units) : x.noBreakEven ? 'None' : '—');

  return (
    <div className="flex flex-col gap-6">
      <CalculatorGrid
        inputs={
          <InputsPanel
            label="Your price and costs"
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
                <CurrencySelect value={c} onChange={(next: CurrencyCode) => setAll(switchMarginCurrency(s, next, touched))} />
              </div>
              <InputCurrency label="Price per unit" help="What a customer pays for one. Example value." currency={c} value={s.price} onChange={(v) => update('price', v)} error={errors.price} />
              <InputCurrency
                label="Variable cost per unit"
                help="Costs that rise with each unit: materials, packaging, per-sale fees. Example value."
                currency={c}
                value={s.vc}
                onChange={(v) => update('vc', v)}
                error={errors.vc}
              />
              <InputNumber
                label="Units sold"
                help="For a period you choose: a month, a year."
                value={s.units}
                onChange={(v) => update('units', v)}
                suffix="units"
                grouping
                error={errors.units}
              />
              <InputCurrency
                optional
                label="Fixed costs (optional)"
                help="Rent, salaries and other costs that stay the same, for the same period. 0 = skip break-even."
                currency={c}
                value={s.fixed}
                onChange={(v) => update('fixed', v)}
                error={errors.fixed}
              />
            </div>
          </InputsPanel>
        }
        result={
          r ? (
            <ResultCard
              label={LABEL}
              value={signed(r.perUnit)}
              unit={`${money(calc.price)} price − ${money(calc.vc)} variable cost · ${c}`}
              tone={r.perUnit < 0 ? 'negative' : undefined}
              rows={[
                { label: 'Contribution margin ratio', note: 'Margin per unit ÷ price', value: formatPct(r.ratio) },
                { label: 'Total contribution margin', note: `${unitsText(calc.units)} × ${signed(r.perUnit)}`, value: signed(r.total) },
                ...(r.breakEven
                  ? [
                      {
                        label: 'Break-even sales',
                        note: Number.isInteger(Number(r.breakEven.exact.toPrecision(12))) ? 'Fixed costs ÷ margin per unit' : `${formatNumber(r.breakEven.exact, 2)} exactly, rounded up`,
                        value: unitsText(r.breakEven.units),
                      },
                      { label: 'Break-even revenue', note: 'Fixed costs ÷ ratio', value: money(r.breakEven.revenue) },
                    ]
                  : []),
                ...(r.profit !== null
                  ? [{ label: r.profit < 0 ? 'Loss' : 'Profit', note: 'Total contribution margin − fixed costs', value: r.profit < 0 ? `Loss of ${money(-r.profit)}` : money(r.profit) }]
                  : []),
              ]}
              footnote={r.noBreakEven ? <p className="font-[550]">{NO_BREAK_EVEN}</p> : undefined}
            />
          ) : (
            <ResultCard label={LABEL} value="" unit="" rows={[]} error={FIX_FIELDS} />
          )
        }
      />

      <ScenarioCompare
        title="Compare two prices"
        aName="Price A (your inputs)"
        bName="Price B"
        toolSlug={SLUG}
        error={!r || !rb ? FIX_FIELDS : undefined}
        planA={
          <dl className="type-small grid grid-cols-2 gap-y-2">
            <dt className="text-ink-muted">Price per unit</dt>
            <dd className="text-right font-[550] tabular-nums">{money(calc.price)}</dd>
            <dd className="col-span-2 mt-2 text-ink-muted">Price B uses the same costs and units.</dd>
          </dl>
        }
        planB={<InputCurrency label="Price per unit" currency={c} value={b.price} onChange={(v) => setB('price', v)} error={bErrors.price} />}
        rows={
          r && rb
            ? [
                { label: 'Margin per unit', a: signed(r.perUnit), b: signed(rb.perUnit) },
                { label: 'Ratio', a: formatPct(r.ratio), b: formatPct(rb.ratio) },
                { label: 'Total', a: signed(r.total), b: signed(rb.total) },
                ...(calc.fixed > 0 ? [{ label: 'Break-even sales', a: breakEvenText(r), b: breakEvenText(rb) }] : []),
              ]
            : []
        }
      />
    </div>
  );
}
