'use client';

import { useRef } from 'react';
import { CalculatorGrid, InputsPanel } from '@/components/CalculatorGrid';
import { CurrencySelect } from '@/components/CurrencySelect';
import { InputCurrency } from '@/components/InputCurrency';
import { InputNumber } from '@/components/InputNumber';
import { ChevronDownIcon, ResetIcon } from '@/components/icons';
import { ResultCard } from '@/components/ResultCard';
import { SplitBar } from '@/components/SplitBar';
import { track } from '@/lib/analytics';
import { CATEGORICAL } from '@/lib/chart-palette';
import { optionalOff } from '@/lib/field-errors';
import { formatMoney, type CurrencyCode } from '@/lib/format';
import { useUrlState } from '@/lib/url-state';
import { budget, compare, leftOver, type Bucket } from './calc';
import {
  OPTIONAL,
  budgetDefaults,
  budgetSchema,
  budgetVariant,
  fieldErrors,
  pctOf,
  switchBudgetCurrency,
  totalError,
  type BudgetState,
} from './schema';

const SLUG = '50-30-20-budget-calculator';
const FIX_FIELDS = 'Check the highlighted fields to see your budget.';
const NAME: Record<Bucket, string> = { needs: 'Needs', wants: 'Wants', savings: 'Savings' };
const ACTUAL_KEY: Record<Bucket, 'aNeeds' | 'aWants' | 'aSave'> = { needs: 'aNeeds', wants: 'aWants', savings: 'aSave' };
const PCT_KEY: Record<Bucket, 'needs' | 'wants' | 'save'> = { needs: 'needs', wants: 'wants', savings: 'save' };
const HELP: Record<Bucket, string> = {
  needs: 'Rent, bills, food, transport, minimum debt payments.',
  wants: 'Eating out, hobbies, holidays, subscriptions.',
  savings: 'Savings and extra debt payments.',
};

export default function BudgetCalculator() {
  const { state: s, setField, setAll, reset, touched } = useUrlState(budgetSchema, budgetDefaults, { variant: budgetVariant });
  const tracked = useRef(false);

  function update<K extends keyof BudgetState>(key: K, value: BudgetState[K]) {
    setField(key, value);
    if (!tracked.current) {
      tracked.current = true;
      track('calculate', { tool: SLUG });
    }
  }

  const c = s.currency;
  const money = (n: number) => formatMoney(n, c);
  const errors = fieldErrors(budgetSchema, s);
  const { blocking, calc } = optionalOff(s, errors, OPTIONAL);
  const total = totalError(s, errors);
  const plan = Object.keys(blocking).length > 0 || total ? null : budget({ pay: calc.pay, pct: pctOf(calc) });
  const pct = pctOf(calc);
  const actual: Record<Bucket, number> = { needs: calc.aNeeds, wants: calc.aWants, savings: calc.aSave };
  const allActual = actual.needs > 0 && actual.wants > 0 && actual.savings > 0;
  const label = 'Savings each month';

  const compareRows = plan
    ? (['needs', 'wants', 'savings'] as const)
        .filter((b) => actual[b] > 0)
        .map((b) => {
          const { diff, status } = compare(actual[b], plan[b]);
          const amount = money(Math.abs(diff));
          const text =
            status === 'on'
              ? 'On plan'
              : b === 'savings'
                ? status === 'under'
                  ? `${amount} less saved than planned`
                  : `${amount} more saved than planned`
                : status === 'over'
                  ? `${amount} over plan`
                  : `${amount} under plan`;
          return { label: b === 'savings' ? `Savings: you save ${money(actual[b])}` : `${NAME[b]}: you spend ${money(actual[b])}`, value: text };
        })
    : [];
  const left = plan && allActual ? leftOver(calc.pay, actual) : null;

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
              <CurrencySelect value={c} onChange={(next: CurrencyCode) => setAll(switchBudgetCurrency(s, next, touched))} />
              <InputCurrency
                label="Monthly take-home pay"
                help="What reaches your bank account each month, after tax. We don't work out tax. Example value."
                currency={c}
                value={s.pay}
                onChange={(v) => update('pay', v)}
                error={errors.pay}
              />
              <fieldset className="flex flex-col gap-4 sm:col-span-2">
                <legend className="type-small float-left mb-1 w-full font-[550] text-ink">Your split</legend>
                <p className="type-small text-ink-muted">
                  50/30/20 is a popular budgeting guideline, not a rule. Change the percentages to fit your life: they need to total 100%.
                </p>
                <div className="grid gap-x-4 gap-y-5 sm:grid-cols-3">
                  {(['needs', 'wants', 'savings'] as const).map((b) => (
                    <InputNumber
                      key={b}
                      label={NAME[b]}
                      help={HELP[b]}
                      value={s[PCT_KEY[b]]}
                      onChange={(v) => update(PCT_KEY[b], v)}
                      suffix="%"
                      error={errors[PCT_KEY[b]]}
                    />
                  ))}
                </div>
                {total ? (
                  <p role="alert" className="type-small flex flex-wrap items-center gap-x-3 gap-y-1 font-[550] text-danger">
                    {total}
                    <button
                      type="button"
                      onClick={() => setAll({ ...s, needs: 50, wants: 30, save: 20 })}
                      className="no-print font-[550] text-haven hover:underline"
                    >
                      Reset to 50/30/20
                    </button>
                  </p>
                ) : null}
              </fieldset>
              {/* Uncontrolled: opening it is the user's choice; React never closes it while they type. */}
              <details className="no-print group rounded-field border border-line bg-paper sm:col-span-2">
                <summary className="type-small flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-[550] text-haven [&::-webkit-details-marker]:hidden">
                  Compare with what you spend
                  <ChevronDownIcon size={16} className="shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <div className="border-t border-line px-4 pb-4 pt-5">
                  <p className="type-small mb-4 text-ink-muted">Optional. Enter what you actually spend or save each month; leave a box at 0 to skip it.</p>
                  <div className="grid gap-x-4 gap-y-5 sm:grid-cols-3">
                    {(['needs', 'wants', 'savings'] as const).map((b) => (
                      <InputCurrency
                        key={b}
                        optional
                        label={b === 'savings' ? 'Actual savings' : `Actual ${b}`}
                        currency={c}
                        value={s[ACTUAL_KEY[b]]}
                        onChange={(v) => update(ACTUAL_KEY[b], v)}
                        error={errors[ACTUAL_KEY[b]]}
                      />
                    ))}
                  </div>
                </div>
              </details>
            </div>
          </InputsPanel>
        }
        result={
          plan ? (
            <ResultCard
              label={label}
              value={money(plan.savings)}
              unit={`${pct.savings}% of ${money(calc.pay)} take-home pay · ${c}`}
              rows={[
                ...(['needs', 'wants', 'savings'] as const).map((b) => ({
                  label: `${NAME[b]} (${pct[b].toLocaleString('en-US', { maximumFractionDigits: 2 })}%)`,
                  note: `${money(plan[b] * 12)} a year`,
                  value: money(plan[b]),
                })),
                ...compareRows,
                ...(left !== null
                  ? [
                      {
                        label: 'Left over',
                        value:
                          Math.abs(left) < 0.005
                            ? 'Everything is assigned'
                            : left > 0
                              ? `${money(left)} not yet assigned`
                              : `${money(-left)} more than your take-home pay`,
                      },
                    ]
                  : []),
              ]}
              footnote={<p>A popular budgeting guideline, not a rule. Your take-home pay comes from you: we don&apos;t work out tax.</p>}
            />
          ) : (
            <ResultCard label={label} value="" unit="" rows={[]} error={total ?? FIX_FIELDS} />
          )
        }
      />

      {plan && calc.pay > 0 ? (
        <SplitBar
          title="Your take-home pay, split"
          description={`${money(calc.pay)} a month.`}
          parts={(['needs', 'wants', 'savings'] as const).map((b, i) => ({
            key: b,
            label: NAME[b],
            value: plan[b],
            display: money(plan[b]),
            color: CATEGORICAL[i % CATEGORICAL.length]!,
          }))}
        />
      ) : null}
    </div>
  );
}
