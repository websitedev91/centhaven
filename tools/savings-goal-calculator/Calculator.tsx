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
import { lastPaymentMonth } from '@/lib/dates';
import { formatMoney, type CurrencyCode } from '@/lib/format';
import { useUrlState } from '@/lib/url-state';
import { savingsGoal, savingsPath, type SavingsGoalError, type SavingsGoalResult } from './calc';
import {
  fieldErrors,
  planBDefaults,
  planBSchema,
  savingsGoalDefaults,
  savingsGoalSchema,
  savingsGoalVariant,
  switchSavingsGoalCurrency,
  toCalcInput,
  type SavingsGoalState,
} from './schema';

const BalanceChart = dynamic(() => import('@/components/BalanceChart'), { ssr: false, loading: () => <ChartPlaceholder /> });

const SLUG = 'savings-goal-calculator';
const FIX_FIELDS = 'Check the highlighted fields to see your result.';
const monthsText = (n: number) => `${n} ${n === 1 ? 'month' : 'months'}`;

export default function SavingsGoalCalculator() {
  const { state: s, setField, setAll, reset } = useUrlState(savingsGoalSchema, savingsGoalDefaults, { variant: savingsGoalVariant });
  const { state: b, setField: setB } = useUrlState(planBSchema, planBDefaults, { prefix: 'b_' });
  const tracked = useRef(false);
  const thisMonth = useThisMonth();

  function update<K extends keyof SavingsGoalState>(key: K, value: SavingsGoalState[K]) {
    setField(key, value);
    if (!tracked.current) {
      tracked.current = true;
      track('calculate', { tool: SLUG });
    }
  }

  const c = s.currency;
  const money = (n: number) => formatMoney(n, c);

  const errors = fieldErrors(savingsGoalSchema, s);
  const result: SavingsGoalResult | SavingsGoalError =
    Object.keys(errors).length > 0 ? { ok: false, error: FIX_FIELDS } : savingsGoal(toCalcInput(s));

  const bErrors = fieldErrors(planBSchema, b);
  const resultB: SavingsGoalResult | SavingsGoalError =
    result.ok && Object.keys(bErrors).length === 0 ? savingsGoal(toCalcInput({ ...s, months: b.months })) : { ok: false, error: FIX_FIELDS };

  const label = 'Save each month';

  return (
    <div className="flex flex-col gap-6">
      <CalculatorGrid
        inputs={
          <InputsPanel
            label="Your goal"
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
              <CurrencySelect value={c} onChange={(next: CurrencyCode) => setAll(switchSavingsGoalCurrency(s, next))} />
              <InputCurrency label="Savings goal" help="Example value — use your own goal." currency={c} value={s.goal} onChange={(v) => update('goal', v)} error={errors.goal} />
              <InputCurrency label="Already saved" help="Leave at 0 if you're starting from nothing." currency={c} value={s.saved} onChange={(v) => update('saved', v)} error={errors.saved} />
              <InputNumber label="Months to reach it" value={s.months} onChange={(v) => update('months', v)} suffix="months" error={errors.months} />
              <div className="sm:col-span-2">
                <InputNumber
                  label="Interest % a year (optional)"
                  help="Optional. Use your account's rate, or leave at 0. Interest is added monthly."
                  value={s.rate}
                  onChange={(v) => update('rate', v)}
                  min={0}
                  max={20}
                  step={0.01}
                  suffix="%"
                  error={errors.rate}
                />
              </div>
            </div>
          </InputsPanel>
        }
        result={
          result.ok ? (
            <ResultCard
              label={label}
              value={money(result.monthly)}
              unit={`a month for ${monthsText(s.months)} · ${c}`}
              tone={result.reached ? 'positive' : undefined}
              rows={[
                { label: 'Your goal', value: money(s.goal) },
                ...(s.saved > 0
                  ? [{ label: 'Already saved', note: s.rate > 0 ? `Grows to ${money(result.savedGrows)} with interest` : undefined, value: money(s.saved) }]
                  : []),
                { label: 'You put in', note: `${money(result.monthly)} × ${s.months}`, value: money(result.contributions) },
                ...(s.rate > 0 ? [{ label: 'Interest earned', note: `At ${s.rate}% a year`, value: money(result.interest) }] : []),
                ...(thisMonth !== null && !result.reached
                  ? [{ label: 'Goal reached by', note: 'Saving from this month', value: lastPaymentMonth(Math.floor(thisMonth / 12), thisMonth % 12, s.months) }]
                  : []),
              ]}
              footnote={result.reached ? <p className="font-[550] text-haven">You&apos;ve already reached your goal.</p> : undefined}
            />
          ) : (
            <ResultCard label={label} value="" unit="" rows={[]} error={result.error} />
          )
        }
      />

      {result.ok && !result.reached ? (
        <ChartLazy
          title="Your savings growing to the goal"
          description={`Saving ${money(result.monthly)} a month takes you from ${money(s.saved)} to ${money(s.goal)} in ${monthsText(s.months)}.`}
        >
          <BalanceChart
            points={savingsPath(toCalcInput(s), result.monthly)}
            currency={c}
            valueLabel="Saved"
            reference={{ y: s.goal, label: `Goal ${formatMoney(s.goal, c, 0)}` }}
          />
        </ChartLazy>
      ) : null}

      <ScenarioCompare
        title="Compare two timelines"
        aName={`${monthsText(s.months)} (your inputs)`}
        bName="Another timeline"
        toolSlug={SLUG}
        error={!result.ok || !resultB.ok ? FIX_FIELDS : undefined}
        planA={
          <dl className="type-small grid grid-cols-2 gap-y-2">
            <dt className="text-ink-muted">Months</dt>
            <dd className="text-right font-[550] tabular-nums">{s.months}</dd>
            <dd className="col-span-2 mt-2 text-ink-muted">Change this in the calculator above.</dd>
          </dl>
        }
        planB={<InputNumber label="Months to reach it" value={b.months} onChange={(v) => setB('months', v)} suffix="months" error={bErrors.months} />}
        rows={
          result.ok && resultB.ok
            ? [
                {
                  label: 'Save each month',
                  a: money(result.monthly),
                  b: money(resultB.monthly),
                  better: result.monthly < resultB.monthly ? 'a' : resultB.monthly < result.monthly ? 'b' : undefined,
                },
                { label: 'You put in', a: money(result.contributions), b: money(resultB.contributions) },
                ...(s.rate > 0 ? [{ label: 'Interest earned', a: money(result.interest), b: money(resultB.interest) }] : []),
              ]
            : []
        }
      />
    </div>
  );
}
