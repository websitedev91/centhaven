'use client';

import { useRef } from 'react';
import { CalculatorGrid, InputsPanel } from '@/components/CalculatorGrid';
import { CurrencySelect } from '@/components/CurrencySelect';
import { InputCurrency } from '@/components/InputCurrency';
import { InputNumber } from '@/components/InputNumber';
import { ResetIcon } from '@/components/icons';
import { ResultCard } from '@/components/ResultCard';
import { SelectField } from '@/components/SelectField';
import { SplitBar } from '@/components/SplitBar';
import { track } from '@/lib/analytics';
import { CATEGORICAL, MUTED_FILL } from '@/lib/chart-palette';
import { formatMoney, formatPercent, type CurrencyCode } from '@/lib/format';
import { useUrlState } from '@/lib/url-state';
import { emergencyFund, suggestedMonths, type EmergencyFundError, type EmergencyFundResult, type IncomeType } from './calc';
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
const FIX_FIELDS = 'Check the highlighted fields to see your target.';
const INCOME_LABEL: Record<IncomeType, string> = {
  steady: 'Steady salary',
  variable: 'Variable or commission',
  'self-employed': 'Freelance or self-employed',
};
const monthsText = (n: number) => `${n} ${n === 1 ? 'month' : 'months'}`;

export default function EmergencyFundCalculator() {
  const { state: s, setField, setAll, reset } = useUrlState(emergencySchema, emergencyDefaults, { variant: emergencyVariant });
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
  const result: EmergencyFundResult | EmergencyFundError =
    Object.keys(errors).length > 0 ? { ok: false, error: FIX_FIELDS } : emergencyFund(toCalcInput(s));

  const suggestion = suggestedMonths(s.incomeType, s.dependants);
  const months = effectiveMonths(s);
  const usingSuggestion = s.months === 0;
  const why = usingSuggestion
    ? `Suggested for ${INCOME_LABEL[s.incomeType].toLowerCase()}${s.dependants > 0 ? `, +${s.dependants} for dependants` : ''}`
    : 'Your own choice';
  const label = 'Emergency fund target';

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
                <CurrencySelect value={c} onChange={(next: CurrencyCode) => setAll(switchEmergencyCurrency(s, next))} />
              </div>
              <div className="sm:col-span-2">
                <InputCurrency
                  label="Monthly essential expenses"
                  help="Rent, food, bills, insurance, loan payments. Leave out things you'd cut in an emergency."
                  currency={c}
                  value={s.expenses}
                  onChange={(v) => update('expenses', v)}
                  error={errors.expenses}
                />
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
                  help={`Suggested: ${monthsText(suggestion)}. A common rule of thumb, not a rule. Type your own if you prefer.`}
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
              <InputCurrency
                label="Saved so far"
                currency={c}
                value={s.saved}
                onChange={(v) => update('saved', v)}
                error={errors.saved}
              />
              <InputCurrency
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
          description={`${money(Math.min(s.saved, result.target))} saved of ${money(result.target)}.`}
          total={result.target}
          parts={[
            {
              key: 'saved',
              label: 'Saved so far',
              value: Math.min(s.saved, result.target),
              display: money(s.saved),
              color: CATEGORICAL[0],
            },
            { key: 'left', label: 'Still to save', value: result.shortfall, display: money(result.shortfall), color: MUTED_FILL },
          ]}
        />
      ) : null}
    </div>
  );
}
