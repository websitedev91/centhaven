'use client';

import { useRef } from 'react';
import { CalculatorGrid, InputsPanel } from '@/components/CalculatorGrid';
import { CurrencySelect } from '@/components/CurrencySelect';
import { InputCurrency } from '@/components/InputCurrency';
import { ResetIcon } from '@/components/icons';
import { ResultCard } from '@/components/ResultCard';
import { ScenarioCompare } from '@/components/ScenarioCompare';
import { track } from '@/lib/analytics';
import { optionalOff } from '@/lib/field-errors';
import { formatMoney, type CurrencyCode } from '@/lib/format';
import { useUrlState } from '@/lib/url-state';
import { formatRatio } from '@/tools/compa-ratio-calculator/calc';
import { currentRatios } from './calc';
import {
  OPTIONAL,
  planBDefaults,
  planBSchema,
  ratioDefaults,
  ratioErrors,
  ratioSchema,
  ratioVariant,
  switchRatioCurrency,
  toCalcInput,
  type PlanBState,
  type RatioState,
} from './schema';

const SLUG = 'current-ratio-calculator';
const FIX_FIELDS = 'Check the highlighted fields to see your result.';
const LABEL = 'Current ratio';

export default function CurrentRatioCalculator() {
  const { state: s, setField, setAll, reset, touched } = useUrlState(ratioSchema, ratioDefaults, { variant: ratioVariant });
  const { state: b, setField: setB } = useUrlState(planBSchema, planBDefaults, { prefix: 'b_' });
  const tracked = useRef(false);

  function update<K extends keyof RatioState>(key: K, value: RatioState[K]) {
    setField(key, value);
    if (!tracked.current) {
      tracked.current = true;
      track('calculate', { tool: SLUG });
    }
  }

  const c = s.currency;
  const money = (n: number) => formatMoney(n, c);
  const signed = (n: number) => (n < 0 ? `−${money(-n)}` : money(n));
  const errors = ratioErrors(s);
  const { blocking, calc } = optionalOff(s, errors, OPTIONAL);
  const ok = Object.keys(blocking).length === 0;
  // An invalid inventory or prepaid box only hides the quick ratio (it needs them); the rest still shows.
  const quickOk = !errors.inv && !errors.prepaid;
  const r = ok ? currentRatios(toCalcInput(calc)) : null;

  const bErrors = ratioErrors(b);
  const rb = r && Object.keys(bErrors).length === 0 ? currentRatios(toCalcInput(b)) : null;

  const field = (key: keyof PlanBState, label: string) => (
    <InputCurrency optional={key === 'inv' || key === 'prepaid'} label={label} currency={c} value={b[key]} onChange={(v) => setB(key, v)} error={bErrors[key]} />
  );

  return (
    <div className="flex flex-col gap-6">
      <CalculatorGrid
        inputs={
          <InputsPanel
            label="Your balance sheet"
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
                <CurrencySelect value={c} onChange={(next: CurrencyCode) => setAll(switchRatioCurrency(s, next, touched))} />
              </div>
              <InputCurrency
                label="Current assets"
                help="Cash, receivables, inventory and other assets you expect to turn into cash within a year. Example value only."
                currency={c}
                value={s.assets}
                onChange={(v) => update('assets', v)}
                error={errors.assets}
              />
              <InputCurrency
                label="Current liabilities"
                help="Bills, loans and other debts due within a year. Must be above 0. Example value only."
                currency={c}
                value={s.liab}
                onChange={(v) => update('liab', v)}
                error={errors.liab}
              />
              <InputCurrency
                optional
                label="Inventory (optional)"
                help="Stock you hold to sell. Taken out for the quick ratio. 0 = none."
                currency={c}
                value={s.inv}
                onChange={(v) => update('inv', v)}
                error={errors.inv}
              />
              <InputCurrency
                optional
                label="Prepaid expenses (optional)"
                help="Costs paid in advance, like rent or insurance. 0 = none."
                currency={c}
                value={s.prepaid}
                onChange={(v) => update('prepaid', v)}
                error={errors.prepaid}
              />
            </div>
          </InputsPanel>
        }
        result={
          r ? (
            <ResultCard
              label={LABEL}
              value={formatRatio(r.current)}
              unit="current assets ÷ current liabilities"
              rows={[
                quickOk
                  ? { label: 'Quick ratio', note: '(current assets − inventory − prepaid) ÷ current liabilities', value: formatRatio(r.quick) }
                  : { label: 'Quick ratio', note: 'Fix inventory and prepaid expenses to see the quick ratio', value: '—' },
                ...(quickOk ? [{ label: 'Quick assets', note: 'Current assets − inventory − prepaid', value: money(r.quickAssets) }] : []),
                { label: 'Working capital', note: 'Current assets − current liabilities', value: signed(r.workingCapital) },
              ]}
              footnote={
                <>
                  <p className="font-[550]">
                    {money(r.current)} of current assets for every {money(1)} of current liabilities.
                  </p>
                  {quickOk ? (
                    <p className="mt-2">
                      {money(r.quick)} of quick assets for every {money(1)} of current liabilities.
                    </p>
                  ) : null}
                  {r.workingCapital < 0 ? (
                    <p className="mt-2">Current liabilities are {money(-r.workingCapital)} more than current assets.</p>
                  ) : null}
                </>
              }
            />
          ) : (
            <ResultCard label={LABEL} value="" unit="" rows={[]} error={FIX_FIELDS} />
          )
        }
      />

      <ScenarioCompare
        title="Compare two periods"
        aName="Period A (your inputs)"
        bName="Period B"
        toolSlug={SLUG}
        error={!r || !rb ? FIX_FIELDS : undefined}
        planA={
          <dl className="type-small grid grid-cols-2 gap-y-2">
            <dt className="text-ink-muted">Current assets</dt>
            <dd className="text-right font-[550] tabular-nums">{money(calc.assets)}</dd>
            <dt className="text-ink-muted">Current liabilities</dt>
            <dd className="text-right font-[550] tabular-nums">{money(calc.liab)}</dd>
            <dd className="col-span-2 mt-2 text-ink-muted">Period B: another period or another company. Example values.</dd>
          </dl>
        }
        planB={
          <div className="grid gap-5">
            {field('assets', 'Current assets')}
            {field('liab', 'Current liabilities')}
            {field('inv', 'Inventory (optional)')}
            {field('prepaid', 'Prepaid expenses (optional)')}
          </div>
        }
        rows={
          r && rb
            ? [
                { label: 'Current ratio', a: formatRatio(r.current), b: formatRatio(rb.current) },
                { label: 'Quick ratio', a: quickOk ? formatRatio(r.quick) : '—', b: formatRatio(rb.quick) },
                { label: 'Working capital', a: signed(r.workingCapital), b: signed(rb.workingCapital) },
              ]
            : []
        }
      />
    </div>
  );
}
