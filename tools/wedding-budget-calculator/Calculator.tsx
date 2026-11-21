'use client';

import { useRef } from 'react';
import { CalculatorGrid, InputsPanel } from '@/components/CalculatorGrid';
import { CurrencySelect } from '@/components/CurrencySelect';
import { InputCurrency } from '@/components/InputCurrency';
import { InputNumber } from '@/components/InputNumber';
import { ResetIcon } from '@/components/icons';
import { ResultCard } from '@/components/ResultCard';
import { ScenarioCompare } from '@/components/ScenarioCompare';
import { SplitBar } from '@/components/SplitBar';
import { track } from '@/lib/analytics';
import { CATEGORICAL } from '@/lib/chart-palette';
import { optionalOff } from '@/lib/field-errors';
import { formatMoney, formatNumber, type CurrencyCode } from '@/lib/format';
import { useUrlState } from '@/lib/url-state';
import { CATEGORIES, CATEGORY_NAME, weddingSplit } from './calc';
import {
  EXAMPLE_SPLIT,
  OPTIONAL,
  fieldErrors,
  pctOf,
  planBDefaults,
  planBSchema,
  switchWeddingCurrency,
  totalError,
  weddingDefaults,
  weddingSchema,
  weddingVariant,
  type WeddingState,
} from './schema';

const SLUG = 'wedding-budget-calculator';
const FIX_FIELDS = 'Check the highlighted fields to see your budget split.';
const LABEL = 'Total budget';

const pctText = (n: number) => `${n.toLocaleString('en-US', { maximumFractionDigits: 2 })}%`;

export default function WeddingBudgetCalculator() {
  const { state: s, setField, setAll, reset, touched } = useUrlState(weddingSchema, weddingDefaults, { variant: weddingVariant });
  const { state: b, setField: setB } = useUrlState(planBSchema, planBDefaults, { prefix: 'b_' });
  const tracked = useRef(false);

  function update<K extends keyof WeddingState>(key: K, value: WeddingState[K]) {
    setField(key, value);
    if (!tracked.current) {
      tracked.current = true;
      track('calculate', { tool: SLUG });
    }
  }

  const c = s.currency;
  const money = (n: number) => formatMoney(n, c);
  const errors = fieldErrors(weddingSchema, s);
  const { blocking, calc } = optionalOff(s, errors, OPTIONAL);
  const total = totalError(s, errors);
  const r = Object.keys(blocking).length > 0 || total ? null : weddingSplit(calc.budget, pctOf(calc), calc.guests);

  const bErrors = fieldErrors(planBSchema, b);
  const rb = r && !bErrors.guests ? weddingSplit(calc.budget, pctOf(calc), b.guests) : null;

  return (
    <div className="flex flex-col gap-6">
      <CalculatorGrid
        inputs={
          <InputsPanel
            label="Your budget"
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
                <CurrencySelect value={c} onChange={(next: CurrencyCode) => setAll(switchWeddingCurrency(s, next, touched))} />
              </div>
              <InputCurrency
                label="Total budget"
                help="Your own budget. Example value only."
                currency={c}
                value={s.budget}
                onChange={(v) => update('budget', v)}
                error={errors.budget}
              />
              <InputNumber
                optional
                label="Guests (optional)"
                help="For the cost per guest. 0 = skip."
                value={s.guests}
                onChange={(v) => update('guests', v)}
                suffix="guests"
                error={errors.guests}
              />
              <fieldset className="flex flex-col gap-4 sm:col-span-2">
                <legend className="type-small float-left mb-1 w-full font-[550] text-ink">Example split: change it to yours</legend>
                <p className="type-small text-ink-muted">
                  These percentages are a starting point, not an average. Set each one to fit your plans: they need to total 100%.
                </p>
                <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
                  {CATEGORIES.map((k) => (
                    <InputNumber key={k} label={CATEGORY_NAME[k]} value={s[k]} onChange={(v) => update(k, v)} suffix="%" error={errors[k]} />
                  ))}
                </div>
                {total ? (
                  <p role="alert" className="type-small flex flex-wrap items-center gap-x-3 gap-y-1 font-[550] text-danger">
                    {total}
                    <button type="button" onClick={() => setAll({ ...s, ...EXAMPLE_SPLIT })} className="no-print font-[550] text-haven hover:underline">
                      Reset to the example split
                    </button>
                  </p>
                ) : null}
              </fieldset>
            </div>
          </InputsPanel>
        }
        result={
          r ? (
            <ResultCard
              label={LABEL}
              value={money(calc.budget)}
              unit={`split across ${CATEGORIES.length} categories · ${c}`}
              rows={[
                ...CATEGORIES.map((k, i) => ({ label: `${CATEGORY_NAME[k]} (${pctText(calc[k])})`, value: money(r.amounts[i]!) })),
                ...(r.perGuest !== null && r.venuePerGuest !== null
                  ? [
                      { label: 'Cost per guest', note: `${money(calc.budget)} ÷ ${formatNumber(calc.guests)} guests`, value: money(r.perGuest) },
                      { label: 'Venue & catering per guest', value: money(r.venuePerGuest) },
                    ]
                  : []),
              ]}
              footnote={
                <p>
                  Each category is rounded down to the cent, then any leftover cents go to the first categories in order, so the categories add up to the
                  budget exactly.
                </p>
              }
            />
          ) : (
            <ResultCard label={LABEL} value="" unit="" rows={[]} error={total ?? FIX_FIELDS} />
          )
        }
      />

      {r && calc.budget > 0 ? (
        <SplitBar
          title="Your budget, split"
          description={`${money(calc.budget)} across ${CATEGORIES.length} categories.`}
          parts={CATEGORIES.map((k, i) => ({
            key: k,
            label: CATEGORY_NAME[k],
            value: r.amounts[i]!,
            display: money(r.amounts[i]!),
            color: CATEGORICAL[i % CATEGORICAL.length]!,
          }))}
        />
      ) : null}

      <ScenarioCompare
        title="Compare two guest counts"
        aName="Guests A (your inputs)"
        bName="Guests B"
        toolSlug={SLUG}
        error={!r || !rb || r.perGuest === null ? 'Enter your budget, split and guests to compare.' : undefined}
        planA={
          <dl className="type-small grid grid-cols-2 gap-y-2">
            <dt className="text-ink-muted">Guests</dt>
            <dd className="text-right font-[550] tabular-nums">{formatNumber(calc.guests)}</dd>
            <dd className="col-span-2 mt-2 text-ink-muted">Guests B uses the same budget and split.</dd>
          </dl>
        }
        planB={<InputNumber label="Guests" value={b.guests} onChange={(v) => setB('guests', v)} suffix="guests" error={bErrors.guests} />}
        rows={
          r && rb && r.perGuest !== null && rb.perGuest !== null
            ? [
                { label: 'Cost per guest', a: money(r.perGuest), b: money(rb.perGuest) },
                { label: 'Venue & catering per guest', a: money(r.venuePerGuest!), b: money(rb.venuePerGuest!) },
              ]
            : []
        }
      />
    </div>
  );
}
