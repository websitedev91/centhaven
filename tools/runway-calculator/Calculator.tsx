'use client';

import dynamic from 'next/dynamic';
import { useRef } from 'react';
import { CalculatorGrid, InputsPanel } from '@/components/CalculatorGrid';
import { ChartLazy, ChartPlaceholder } from '@/components/ChartLazy';
import { CurrencySelect } from '@/components/CurrencySelect';
import { InputCurrency } from '@/components/InputCurrency';
import { InputNumber } from '@/components/InputNumber';
import { ResetIcon } from '@/components/icons';
import { ResultCard } from '@/components/ResultCard';
import { ScenarioCompare } from '@/components/ScenarioCompare';
import { useThisMonth } from '@/components/useThisMonth';
import { track } from '@/lib/analytics';
import { monthYearAfter } from '@/lib/dates';
import { formatMoney, type CurrencyCode } from '@/lib/format';
import { optionalOff } from '@/lib/field-errors';
import { useUrlState } from '@/lib/url-state';
import { cashPath, formatMonths, runway, type RunwayResult } from './calc';
import {
  fieldErrors,
  planBDefaults,
  planBSchema,
  runwayDefaults,
  runwaySchema,
  runwayVariant,
  switchRunwayCurrency,
  toCalcInput,
  type RunwayState,
} from './schema';

const BalanceChart = dynamic(() => import('@/components/BalanceChart'), { ssr: false, loading: () => <ChartPlaceholder /> });

const SLUG = 'runway-calculator';
/** Optional fields: an invalid one shows its own error, and the result still shows (treated as 0). */
const OPTIONAL = ['revenue', 'target'] as const;
const FIX_FIELDS = 'Check the highlighted fields to see your result.';
const NOT_BURNING = "You're not burning cash: your revenue covers your costs.";

const monthsFmt = (n: number | null) => (n === null ? '—' : formatMonths(n));
const aboutText = (r: RunwayResult) => {
  if (r.wholeMonths === null || r.extraDays === null) return '';
  const m = `${r.wholeMonths} ${r.wholeMonths === 1 ? 'month' : 'months'}`;
  return r.extraDays > 0 ? `about ${m} and ${r.extraDays} ${r.extraDays === 1 ? 'day' : 'days'}` : `${m}`;
};

export default function RunwayCalculator() {
  const { state: s, setField, setAll, reset, touched } = useUrlState(runwaySchema, runwayDefaults, { variant: runwayVariant });
  const { state: b, setField: setB } = useUrlState(planBSchema, planBDefaults, { prefix: 'b_' });
  const tracked = useRef(false);
  const thisMonth = useThisMonth();

  function update<K extends keyof RunwayState>(key: K, value: RunwayState[K]) {
    setField(key, value);
    if (!tracked.current) {
      tracked.current = true;
      track('calculate', { tool: SLUG });
    }
  }

  const c = s.currency;
  const money = (n: number) => formatMoney(n, c);
  const errors = fieldErrors(runwaySchema, s);
  const { blocking, calc } = optionalOff(s, errors, OPTIONAL);
  const r = Object.keys(blocking).length > 0 ? null : runway(toCalcInput(calc));
  const bErrors = fieldErrors(planBSchema, b);
  const rb = r && Object.keys(bErrors).length === 0 ? runway(toCalcInput({ ...calc, ...b })) : null;

  const runsOut =
    r && r.runway !== null && thisMonth !== null && s.cash > 0
      ? monthYearAfter(Math.floor(thisMonth / 12), thisMonth % 12, Math.floor(r.runway))
      : null;

  return (
    <div className="flex flex-col gap-6">
      <CalculatorGrid
        inputs={
          <InputsPanel
            label="Your cash and spending"
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
              <CurrencySelect value={c} onChange={(next: CurrencyCode) => setAll(switchRunwayCurrency(s, next, touched))} />
              <InputCurrency label="Cash in the bank" help="Example values — use your own numbers." currency={c} value={s.cash} onChange={(v) => update('cash', v)} error={errors.cash} />
              <InputCurrency
                label="Monthly costs (gross burn)"
                help="Everything you spend in a typical month."
                currency={c}
                value={s.costs}
                onChange={(v) => update('costs', v)}
                error={errors.costs}
              />
              <InputCurrency optional
                label="Monthly revenue (optional)"
                help="Leave at 0 to see runway on costs alone."
                currency={c}
                value={s.revenue}
                onChange={(v) => update('revenue', v)}
                error={errors.revenue}
              />
              <div className="sm:col-span-2">
                <InputNumber optional
                  label="Target runway (optional)"
                  help="The months of runway you want. 0 = off."
                  value={s.target}
                  onChange={(v) => update('target', v)}
                  suffix="months"
                  error={errors.target}
                />
              </div>
            </div>
          </InputsPanel>
        }
        result={
          r ? (
            <ResultCard
              label="Your runway"
              value={r.notBurning ? 'Not burning' : monthsFmt(r.runway)}
              unit={r.notBurning ? 'Revenue covers your costs' : `${aboutText(r)} · ${c}`}
              tone={r.notBurning ? 'positive' : r.runway !== null && r.runway < 3 ? 'negative' : undefined}
              rows={[
                { label: 'Gross burn', note: 'Monthly costs', value: money(r.grossBurn) },
                { label: 'Net burn', note: s.revenue > 0 ? 'Costs − revenue' : undefined, value: r.notBurning ? `${money(0)} (covered)` : money(r.netBurn) },
                ...(s.revenue > 0 && r.grossRunway !== null && !r.notBurning
                  ? [{ label: 'Runway on costs alone', note: 'If revenue stopped', value: monthsFmt(r.grossRunway) }]
                  : []),
                ...(runsOut ? [{ label: 'Cash runs out around', note: 'From this month, at this burn', value: runsOut }] : []),
                ...(r.maxBurn !== null && !r.notBurning
                  ? [
                      { label: `Highest burn for ${s.target} months`, value: money(r.maxBurn) },
                      { label: 'Cut needed', note: 'Per month, to reach your target', value: r.cutNeeded! > 0 ? money(r.cutNeeded!) : 'None' },
                    ]
                  : []),
              ]}
              footnote={
                r.notBurning ? (
                  <p className="font-[550] text-haven">{NOT_BURNING}</p>
                ) : s.cash === 0 ? (
                  <p className="font-[550] text-danger">You&apos;re out of cash now.</p>
                ) : r.cutNeeded === 0 && r.maxBurn !== null ? (
                  <p>Your runway already meets the target.</p>
                ) : undefined
              }
            />
          ) : (
            <ResultCard label="Your runway" value="" unit="" rows={[]} error={FIX_FIELDS} />
          )
        }
      />

      {r && !r.notBurning && s.cash > 0 ? (
        <ChartLazy title="Your cash running down" description={`${money(s.cash)} at a net burn of ${money(r.netBurn)} a month lasts ${aboutText(r)}.`}>
          <BalanceChart points={cashPath(s.cash, r.netBurn)} currency={c} valueLabel="Cash left" />
        </ChartLazy>
      ) : null}

      <ScenarioCompare
        title="Compare two plans"
        aName="Plan A (your inputs)"
        bName="Plan B"
        toolSlug={SLUG}
        error={!r || !rb ? FIX_FIELDS : undefined}
        planA={
          <dl className="type-small grid grid-cols-2 gap-y-2">
            <dt className="text-ink-muted">Monthly costs</dt>
            <dd className="text-right font-[550] tabular-nums">{money(s.costs)}</dd>
            <dt className="text-ink-muted">Monthly revenue</dt>
            <dd className="text-right font-[550] tabular-nums">{money(s.revenue)}</dd>
            <dd className="col-span-2 mt-2 text-ink-muted">Change these in the calculator above.</dd>
          </dl>
        }
        planB={
          <>
            <InputCurrency label="Monthly costs" currency={c} value={b.costs} onChange={(v) => setB('costs', v)} error={bErrors.costs} />
            <InputCurrency label="Monthly revenue" currency={c} value={b.revenue} onChange={(v) => setB('revenue', v)} error={bErrors.revenue} />
          </>
        }
        rows={
          r && rb
            ? [
                { label: 'Net burn', a: money(Math.max(0, r.netBurn)), b: money(Math.max(0, rb.netBurn)) },
                {
                  label: 'Runway',
                  a: r.notBurning ? 'Not burning' : monthsFmt(r.runway),
                  b: rb.notBurning ? 'Not burning' : monthsFmt(rb.runway),
                  better:
                    (r.runway ?? Infinity) > (rb.runway ?? Infinity) ? 'a' : (rb.runway ?? Infinity) > (r.runway ?? Infinity) ? 'b' : undefined,
                },
              ]
            : []
        }
      />
    </div>
  );
}
