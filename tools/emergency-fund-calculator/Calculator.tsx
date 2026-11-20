'use client';

import dynamic from 'next/dynamic';
import { useRef, useState, useSyncExternalStore } from 'react';
import { ChartLazy, ChartPlaceholder } from '@/components/ChartLazy';
import { CalculatorGrid, InputsPanel } from '@/components/CalculatorGrid';
import { CurrencySelect } from '@/components/CurrencySelect';
import { InputCurrency } from '@/components/InputCurrency';
import { InputNumber } from '@/components/InputNumber';
import { ChevronDownIcon, ResetIcon } from '@/components/icons';
import { Num } from '@/components/Num';
import { ResultCard } from '@/components/ResultCard';
import { SelectField } from '@/components/SelectField';
import { SplitBar } from '@/components/SplitBar';
import { track } from '@/lib/analytics';
import { CATEGORICAL, MUTED_FILL } from '@/lib/chart-palette';
import { formatMoney, formatPercent, type CurrencyCode } from '@/lib/format';
import { lastPaymentMonth } from '@/lib/dates';
import { optionalOff } from '@/lib/field-errors';
import { plural } from '@/lib/duration';
import { useUrlState } from '@/lib/url-state';
import {
  emergencyFund,
  ESSENTIALS,
  savingsPath,
  suggestedMonths,
  sumEssentials,
  type EmergencyFundError,
  type EmergencyFundResult,
  type Essential,
  type IncomeType,
} from './calc';
import {
  effectiveMonths,
  emergencyDefaults,
  emergencySchema,
  emergencyVariant,
  fieldErrors,
  switchEmergencyCurrency,
  toCalcInput,
  type EmergencyState,
} from './schema';

const SLUG = 'emergency-fund-calculator';
/** Optional fields: an invalid one shows its own error, and the result still shows (treated as 0). */
const OPTIONAL = ['saved', 'monthlySaving'] as const;
const FIX_FIELDS = 'Check the highlighted fields to see your target.';
const INCOME_LABEL: Record<IncomeType, string> = {
  steady: 'Steady salary',
  variable: 'Variable or commission',
  'self-employed': 'Freelance or self-employed',
};
/** Same ceiling as the expenses field, so the helper never fills it with a value it rejects. */
const ESSENTIALS_MAX = 100_000_000;
function essentialError(v: number | undefined): string | undefined {
  if (v === undefined || !Number.isFinite(v)) return undefined;
  if (v < 0) return 'Can’t be negative';
  if (v > ESSENTIALS_MAX) return 'That number is too large';
  return undefined;
}
const monthsText = (n: number) => plural(n, 'month');

const ESSENTIAL_LABEL: Record<Essential, string> = {
  housing: 'Rent or mortgage',
  food: 'Food and groceries',
  utilities: 'Utilities and phone',
  insurance: 'Insurance',
  transport: 'Transport',
  loans: 'Loan and card payments',
  other: 'Other essentials',
};

const SavingsGrowthChart = dynamic(() => import('./Chart'), { ssr: false, loading: () => <ChartPlaceholder /> });

/**
 * This month as year × 12 + month (0-based), read in the browser only. The page is built ahead
 * of time, so the server snapshot is null and the "Fully funded by" row appears after hydration.
 */
const noSubscribe = () => () => {};
function useThisMonth(): number | null {
  return useSyncExternalStore(
    noSubscribe,
    () => {
      const d = new Date();
      return d.getFullYear() * 12 + d.getMonth();
    },
    () => null,
  );
}

export default function EmergencyFundCalculator() {
  const { state: s, setField, setAll, reset, touched } = useUrlState(emergencySchema, emergencyDefaults, { variant: emergencyVariant });
  const tracked = useRef(false);

  function update<K extends keyof EmergencyState>(key: K, value: EmergencyState[K]) {
    setField(key, value);
    if (!tracked.current) {
      tracked.current = true;
      track('calculate', { tool: SLUG });
    }
  }

  const c = s.currency;
  const money = (n: number) => formatMoney(n, c);
  const errors = fieldErrors(emergencySchema, s);
  const { blocking, calc } = optionalOff(s, errors, OPTIONAL);
  const result: EmergencyFundResult | EmergencyFundError =
    Object.keys(blocking).length > 0 ? { ok: false, error: FIX_FIELDS } : emergencyFund(toCalcInput(calc));

  const suggestion = suggestedMonths(s.incomeType, s.dependants);
  const months = effectiveMonths(s);
  const usingSuggestion = s.months === 0;
  const why = usingSuggestion
    ? `Suggested for ${INCOME_LABEL[s.incomeType].toLowerCase()}${s.dependants > 0 ? `, +${s.dependants} for dependants` : ''}`
    : 'Your own choice';
  const label = 'Emergency fund target';

  // "Help me add up my essentials": kept on this page only (not in the share link).
  // Each box is optional: an invalid one shows its own error and counts as 0 (Puru, 2026-11-19).
  const [essentials, setEssentials] = useState<Partial<Record<Essential, number>>>({});
  const validEssentials = (all: Partial<Record<Essential, number>>) =>
    Object.fromEntries(Object.entries(all).filter(([, v]) => essentialError(v) === undefined)) as Partial<Record<Essential, number>>;
  const essentialsTotal = sumEssentials(validEssentials(essentials));
  function setEssential(k: Essential, v: number) {
    const next = { ...essentials, [k]: v };
    setEssentials(next);
    const total = sumEssentials(validEssentials(next));
    if (total > 0 && total <= ESSENTIALS_MAX) update('expenses', total);
  }

  const thisMonth = useThisMonth();
  const path = result.ok ? savingsPath(calc.saved, calc.monthlySaving, result.target, result.monthsToBuild) : [];

  return (
    <div className="flex flex-col gap-6">
      <CalculatorGrid
        inputs={
          <InputsPanel
            label="Your situation"
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
                <CurrencySelect value={c} onChange={(next: CurrencyCode) => setAll(switchEmergencyCurrency(s, next, touched))} />
              </div>
              <div className="flex flex-col gap-3 sm:col-span-2">
                <InputCurrency
                  label="Monthly essential expenses"
                  help="Rent, food, bills, insurance, loan payments. Leave out things you'd cut in an emergency."
                  currency={c}
                  value={s.expenses}
                  onChange={(v) => update('expenses', v)}
                  error={errors.expenses}
                />
                <details className="no-print group rounded-field border border-line bg-paper">
                  <summary className="type-small flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-[550] text-haven [&::-webkit-details-marker]:hidden">
                    Help me add up my essentials
                    <ChevronDownIcon size={16} className="shrink-0 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="border-t border-line px-4 pt-5 pb-4">
                    <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
                      {ESSENTIALS.map((k) => (
                        <InputCurrency
                          optional
                          key={k}
                          label={ESSENTIAL_LABEL[k]}
                          currency={c}
                          value={essentials[k] ?? 0}
                          onChange={(v) => setEssential(k, v)}
                          error={essentialError(essentials[k])}
                        />
                      ))}
                    </div>
                    <p className="type-small mt-4 text-ink-muted" aria-live="polite">
                      Total{' '}
                      <span className="font-[650] text-ink">
                        <Num>{money(essentialsTotal)}</Num>
                      </span>
                      {essentialsTotal > 0 ? ' a month, used as your essential expenses above.' : '. Fill in what applies; it fills the field above.'}
                    </p>
                  </div>
                </details>
              </div>
              <SelectField<IncomeType>
                label="Income type"
                value={s.incomeType}
                onChange={(v) => update('incomeType', v)}
                options={(Object.keys(INCOME_LABEL) as IncomeType[]).map((value) => ({ value, label: INCOME_LABEL[value] }))}
              />
              <InputNumber
                label="Dependants"
                help="People who rely on your income."
                value={s.dependants}
                onChange={(v) => update('dependants', v)}
                suffix="people"
                error={errors.dependants}
              />
              <div className="flex flex-col gap-2 sm:col-span-2">
                <InputNumber
                  label="Months to cover"
                  help={
                    Number.isFinite(suggestion)
                      ? `Suggested: ${monthsText(suggestion)}. A common rule of thumb, not a rule. Type your own if you prefer.`
                      : 'Enter your dependants to see a suggestion. Type your own if you prefer.'
                  }
                  value={months}
                  onChange={(v) => update('months', v)}
                  suffix="months"
                  error={errors.months}
                />
                {!usingSuggestion ? (
                  <button
                    type="button"
                    onClick={() => update('months', 0)}
                    className="no-print type-small self-start font-[550] text-haven hover:underline"
                  >
                    Use the suggestion ({monthsText(suggestion)})
                  </button>
                ) : null}
              </div>
              <InputCurrency optional
                label="Saved so far"
                currency={c}
                value={s.saved}
                onChange={(v) => update('saved', v)}
                error={errors.saved}
              />
              <InputCurrency optional
                label="Monthly saving"
                help="What you can put aside each month."
                currency={c}
                value={s.monthlySaving}
                onChange={(v) => update('monthlySaving', v)}
                error={errors.monthlySaving}
              />
            </div>
          </InputsPanel>
        }
        result={
          result.ok ? (
            <ResultCard
              label={label}
              value={money(result.target)}
              unit={`${monthsText(months)} of essentials · ${c}`}
              tone={result.shortfall === 0 && result.target > 0 ? 'positive' : undefined}
              rows={[
                { label: 'Months covered', note: why, value: monthsText(months) },
                result.shortfall === 0
                  ? {
                      label: 'Still to save',
                      note: result.surplus > 0 ? `You're covered, with ${money(result.surplus)} extra` : "You're covered",
                      value: money(0),
                    }
                  : { label: 'Still to save', value: money(result.shortfall) },
                {
                  label: 'Time to build it',
                  note: result.monthsToBuild === null ? 'Add a monthly saving amount to see how long it takes' : undefined,
                  value:
                    result.monthsToBuild === null ? '—' : result.monthsToBuild === 0 ? 'Done' : monthsText(result.monthsToBuild),
                },
                ...(result.monthsToBuild !== null && result.monthsToBuild > 0 && thisMonth !== null
                  ? [
                      {
                        label: 'Fully funded by',
                        note: `Saving ${money(calc.monthlySaving)} a month from this month`,
                        value: lastPaymentMonth(Math.floor(thisMonth / 12), thisMonth % 12, result.monthsToBuild),
                      },
                    ]
                  : []),
                { label: 'Progress', value: result.progress === null ? '—' : formatPercent(result.progress, 2) },
              ]}
              footnote="Suggested months are a common rule of thumb, not a rule, and not financial advice."
            />
          ) : (
            <ResultCard label={label} value="" unit="" rows={[]} error={result.error} />
          )
        }
      />

      {result.ok && result.target > 0 ? (
        <SplitBar
          title="How close you are"
          description={`${money(Math.min(calc.saved, result.target))} saved of ${money(result.target)}.`}
          total={result.target}
          parts={[
            {
              key: 'saved',
              label: 'Saved so far',
              value: Math.min(calc.saved, result.target),
              display: money(calc.saved),
              color: CATEGORICAL[0],
            },
            { key: 'left', label: 'Still to save', value: result.shortfall, display: money(result.shortfall), color: MUTED_FILL },
          ]}
        />
      ) : null}

      {result.ok && path.length > 1 ? (
        <ChartLazy
          title="Your savings growing to the target"
          description={`Saving ${money(calc.monthlySaving)} a month takes you from ${money(calc.saved)} to ${money(result.target)} in ${monthsText(result.monthsToBuild ?? 0)}.`}
        >
          <SavingsGrowthChart path={path} target={result.target} currency={c} />
        </ChartLazy>
      ) : null}
    </div>
  );
}
