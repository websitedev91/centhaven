'use client';

import { useRef } from 'react';
import { CalculatorGrid, InputsPanel } from '@/components/CalculatorGrid';
import { CurrencySelect } from '@/components/CurrencySelect';
import { InputCurrency } from '@/components/InputCurrency';
import { InputNumber } from '@/components/InputNumber';
import { ResetIcon } from '@/components/icons';
import { ResultCard } from '@/components/ResultCard';
import { ScenarioCompare } from '@/components/ScenarioCompare';
import { SegmentedControl } from '@/components/SegmentedControl';
import { track } from '@/lib/analytics';
import { optionalOff } from '@/lib/field-errors';
import { formatMoney, type CurrencyCode } from '@/lib/format';
import { useUrlState } from '@/lib/url-state';
import { formatPct } from '@/tools/margin-vs-markup-calculator/calc';
import { bonus, type BonusMode } from './calc';
import {
  OPTIONAL,
  bonusDefaults,
  bonusErrors,
  bonusSchema,
  bonusVariant,
  fieldErrors,
  planBDefaults,
  planBSchema,
  switchBonusCurrency,
  toCalcInput,
  type BonusState,
} from './schema';

const SLUG = 'bonus-calculator';
const FIX_FIELDS = 'Check the highlighted fields to see your result.';
const LABEL = 'Bonus (gross)';

const MODE_OPTIONS: readonly { value: BonusMode; label: string }[] = [
  { value: 'percent', label: '% of salary' },
  { value: 'fixed', label: 'Fixed amount' },
  { value: 'target', label: 'Target × achievement' },
];

export default function BonusCalculator() {
  const { state: s, setField, setAll, reset, touched } = useUrlState(bonusSchema, bonusDefaults, { variant: bonusVariant });
  const { state: b, setField: setB } = useUrlState(planBSchema, planBDefaults, { prefix: 'b_' });
  const tracked = useRef(false);

  function update<K extends keyof BonusState>(key: K, value: BonusState[K]) {
    setField(key, value);
    if (!tracked.current) {
      tracked.current = true;
      track('calculate', { tool: SLUG });
    }
  }

  const c = s.currency;
  const money = (n: number) => formatMoney(n, c);
  const errors = bonusErrors(s);
  const { blocking, calc } = optionalOff(s, errors, OPTIONAL);
  const input = toCalcInput(calc);
  const r = Object.keys(blocking).length > 0 ? null : bonus(input);
  const checks = calc.checks;

  const bErrors = fieldErrors(planBSchema, b);
  const compareMode = s.mode === 'percent' || s.mode === 'target';
  const rb =
    r && compareMode && Object.keys(bErrors).length === 0
      ? bonus(s.mode === 'percent' ? { ...input, pct: b.pct } : { ...input, achievement: b.ach })
      : null;

  return (
    <div className="flex flex-col gap-6">
      <CalculatorGrid
        inputs={
          <InputsPanel
            label="Your salary and bonus"
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
                <SegmentedControl<BonusMode> label="Bonus type" value={s.mode} options={MODE_OPTIONS} onChange={(v) => update('mode', v)} />
              </div>
              <CurrencySelect value={c} onChange={(next: CurrencyCode) => setAll(switchBonusCurrency(s, next, touched))} />
              <InputCurrency
                label="Annual salary"
                help="Before tax. Example value — use your own numbers."
                currency={c}
                value={s.salary}
                onChange={(v) => update('salary', v)}
                error={errors.salary}
              />
              {s.mode === 'percent' ? (
                <InputNumber
                  label="Bonus %"
                  help="Your own bonus %. Example value only."
                  value={s.pct}
                  onChange={(v) => update('pct', v)}
                  suffix="%"
                  error={errors.pct}
                />
              ) : null}
              {s.mode === 'fixed' ? (
                <InputCurrency
                  label="Bonus amount"
                  help="Before tax. Example value only."
                  currency={c}
                  value={s.amount}
                  onChange={(v) => update('amount', v)}
                  error={errors.amount}
                />
              ) : null}
              {s.mode === 'target' ? (
                <>
                  <InputNumber
                    label="Target bonus %"
                    help="The target % in your plan. Example value only."
                    value={s.target}
                    onChange={(v) => update('target', v)}
                    suffix="%"
                    error={errors.target}
                  />
                  <InputNumber
                    label="Achievement (payout) %"
                    help="The % of target your plan pays out. If it differs from what you achieved, use the payout %."
                    value={s.ach}
                    onChange={(v) => update('ach', v)}
                    suffix="%"
                    error={errors.ach}
                  />
                </>
              ) : null}
              <div className="sm:col-span-2">
                <InputNumber
                  optional
                  label="Spread over paychecks (optional)"
                  help="Only if your bonus is split across paychecks. Empty or 0 = one lump sum."
                  value={s.checks}
                  onChange={(v) => update('checks', v)}
                  suffix="paychecks"
                  error={errors.checks}
                />
              </div>
            </div>
          </InputsPanel>
        }
        result={
          r ? (
            <ResultCard
              label={LABEL}
              value={money(r.bonus)}
              unit={`for the year · before tax · ${c}`}
              rows={[
                ...(s.mode !== 'percent' && r.ofSalary !== null
                  ? [{ label: 'Bonus as % of salary', note: s.mode === 'target' ? `${formatPct(calc.target / 100)} target × ${formatPct(calc.ach / 100)} payout` : undefined, value: formatPct(r.ofSalary) }]
                  : []),
                { label: 'Total pay for the year', note: 'Salary + bonus', value: money(r.total) },
                ...(r.perCheck !== null && r.payPerCheck !== null
                  ? [
                      { label: 'Bonus per paycheck', note: `Spread over ${checks} paycheck${checks === 1 ? '' : 's'}`, value: money(r.perCheck) },
                      { label: 'Pay per paycheck with the bonus', note: `If your salary is paid over the same ${checks} paycheck${checks === 1 ? '' : 's'}`, value: money(r.payPerCheck) },
                    ]
                  : [{ label: 'Paid as', note: 'Enter a number of paychecks to spread it', value: 'One lump sum' }]),
              ]}
              footnote={<p className="font-[550]">Gross bonus before tax and deductions. The amount paid to you will be less.</p>}
            />
          ) : (
            <ResultCard label={LABEL} value="" unit="" rows={[]} error={FIX_FIELDS} />
          )
        }
      />

      {compareMode ? (
        <ScenarioCompare
          title={s.mode === 'percent' ? 'Compare two bonus percentages' : 'Compare two achievement levels'}
          aName="Bonus A (your inputs)"
          bName="Bonus B"
          toolSlug={SLUG}
          error={!r || !rb ? FIX_FIELDS : undefined}
          planA={
            <dl className="type-small grid grid-cols-2 gap-y-2">
              <dt className="text-ink-muted">{s.mode === 'percent' ? 'Bonus %' : 'Achievement (payout)'}</dt>
              <dd className="text-right font-[550] tabular-nums">{formatPct((s.mode === 'percent' ? calc.pct : calc.ach) / 100)}</dd>
              <dd className="col-span-2 mt-2 text-ink-muted">Bonus B uses the same salary{s.mode === 'target' ? ' and target' : ''}.</dd>
            </dl>
          }
          planB={
            s.mode === 'percent' ? (
              <InputNumber label="Bonus %" value={b.pct} onChange={(v) => setB('pct', v)} suffix="%" error={bErrors.pct} />
            ) : (
              <InputNumber label="Achievement (payout) %" value={b.ach} onChange={(v) => setB('ach', v)} suffix="%" error={bErrors.ach} />
            )
          }
          rows={
            r && rb
              ? [
                  { label: 'Bonus', a: money(r.bonus), b: money(rb.bonus) },
                  { label: 'Total pay', a: money(r.total), b: money(rb.total) },
                ]
              : []
          }
        />
      ) : null}
    </div>
  );
}
