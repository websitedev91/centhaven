'use client';

import dynamic from 'next/dynamic';
import { useRef } from 'react';
import { secondaryButtonClass } from '@/components/actionButtonClass';
import { CalculatorGrid, InputsPanel } from '@/components/CalculatorGrid';
import { ChartLazy, ChartPlaceholder } from '@/components/ChartLazy';
import { CurrencySelect } from '@/components/CurrencySelect';
import { InputCurrency } from '@/components/InputCurrency';
import { InputNumber } from '@/components/InputNumber';
import { PlusIcon, ResetIcon, TrashIcon } from '@/components/icons';
import { Num } from '@/components/Num';
import { ResultCard } from '@/components/ResultCard';
import { useThisMonth } from '@/components/useThisMonth';
import { track } from '@/lib/analytics';
import { lastPaymentMonth } from '@/lib/dates';
import { optionalOff } from '@/lib/field-errors';
import { formatMoney, type CurrencyCode } from '@/lib/format';
import { useUrlState } from '@/lib/url-state';
import { monthsToDuration as yearsAndMonths, plural } from '@/lib/duration';
import { chartPoints, debtPayoff, formatOrder, type MethodResult } from './calc';

const monthsText = (n: number) => plural(n, 'month');
import {
  MAX_DEBTS,
  OPTIONAL,
  ROWS,
  addRow,
  debtDefaults,
  debtErrors,
  debtSchema,
  debtVariant,
  keysFrom,
  removeRow,
  shownDifference,
  shownRows,
  switchDebtCurrency,
  toCalcInput,
  type DebtState,
} from './schema';

const SLUG = 'debt-snowball-calculator';
const FIX_FIELDS = 'Check the highlighted fields to see your payoff plan.';
const LABEL = 'Debt-free in';

const DebtBalanceChart = dynamic(() => import('./Chart'), { ssr: false, loading: () => <ChartPlaceholder /> });

export default function DebtSnowballCalculator() {
  const { state: s, setField, setAll, reset, touched, markTouched } = useUrlState(debtSchema, debtDefaults, { variant: debtVariant });
  const tracked = useRef(false);
  const thisMonth = useThisMonth();

  function touch() {
    if (!tracked.current) {
      tracked.current = true;
      track('calculate', { tool: SLUG });
    }
  }
  function update<K extends keyof DebtState>(key: K, value: DebtState[K]) {
    setField(key, value);
    touch();
  }

  const c = s.currency;
  const money = (n: number) => formatMoney(n, c);
  const errors = debtErrors(s);
  const { blocking, calc } = optionalOff(s, errors, OPTIONAL);
  const r = Object.keys(blocking).length > 0 ? null : debtPayoff(toCalcInput(calc));
  const n = shownRows(s);
  const around = (months: number) =>
    thisMonth === null ? null : lastPaymentMonth(Math.floor(thisMonth / 12), thisMonth % 12, months);

  let result;
  if (!r) {
    result = <ResultCard label={LABEL} value="" unit="" rows={[]} error={FIX_FIELDS} />;
  } else if (r.kind === 'none') {
    result = <ResultCard label={LABEL} value="0 months" unit="You have no debt to pay off." rows={[]} />;
  } else if (r.kind === 'never') {
    result = (
      <ResultCard
        label={LABEL}
        value=""
        unit=""
        rows={[]}
        error={`Your monthly payment (${money(r.payment)}) doesn’t cover the interest (${money(r.interest)}). Add to the extra payment to see a payoff date.`}
      />
    );
  } else if (r.kind === 'cap') {
    result = <ResultCard label={LABEL} value="" unit="" rows={[]} error="This would take more than 50 years. Add to the extra payment to see a payoff date." />;
  } else {
    const fastest = Math.min(r.snowball.months, r.avalanche.months);
    const date = around(fastest);
    result = (
      <ResultCard
        label={LABEL}
        value={monthsText(fastest)}
        unit={`about ${yearsAndMonths(fastest)}${date ? ` · around ${date}` : ''}`}
        rows={[
          { label: 'Snowball interest', note: `${monthsText(r.snowball.months)}`, value: money(r.snowball.totalInterest) },
          { label: 'Avalanche interest', note: `${monthsText(r.avalanche.months)}`, value: money(r.avalanche.totalInterest) },
          { label: 'Monthly payment', note: `Minimums ${money(r.minimums)} + extra ${money(calc.extra)}`, value: money(r.payment) },
        ]}
        footnote={<p className="font-[550]">{differenceText(r.snowball, r.avalanche, money)}</p>}
      />
    );
  }

  const plan = r && r.kind === 'plan' ? r : null;

  return (
    <div className="flex flex-col gap-6">
      <CalculatorGrid
        inputs={
          <InputsPanel
            label="Your debts"
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
            <div className="flex flex-col gap-7">
              <CurrencySelect value={c} onChange={(next: CurrencyCode) => setAll(switchDebtCurrency(s, next, touched))} />
              {ROWS.slice(0, n).map((k, i) => (
                <fieldset key={k.b} className="flex flex-col gap-4 rounded-field border border-line p-4">
                  <legend className="type-small px-1 font-[550] text-ink">Debt {i + 1}</legend>
                  <div className="grid gap-x-4 gap-y-5 sm:grid-cols-3">
                    <InputCurrency label="Balance" currency={c} value={s[k.b]} onChange={(v) => update(k.b, v)} error={errors[k.b]} />
                    <InputNumber
                      label="Interest rate (APR)"
                      help="From your statement. Example values only."
                      value={s[k.r]}
                      onChange={(v) => update(k.r, v)}
                      suffix="%"
                      error={errors[k.r]}
                    />
                    <InputCurrency label="Minimum payment" currency={c} value={s[k.m]} onChange={(v) => update(k.m, v)} error={errors[k.m]} />
                  </div>
                  {n > 1 ? (
                    <button
                      type="button"
                      onClick={() => {
                        const next = removeRow(s, i);
                        setAll(next);
                        // Debts after the removed one moved up: keep their typed values on a currency switch.
                        markTouched(keysFrom(i, next.rows));
                        touch();
                      }}
                      aria-label={`Remove debt ${i + 1}`}
                      className="no-print type-small inline-flex items-center gap-1.5 self-start font-[550] text-ink-muted hover:text-danger"
                    >
                      <TrashIcon size={16} />
                      Remove
                    </button>
                  ) : null}
                </fieldset>
              ))}
              {n < MAX_DEBTS ? (
                <button
                  type="button"
                  onClick={() => {
                    setAll(addRow(s));
                    touch();
                  }}
                  className={`no-print self-start ${secondaryButtonClass}`}
                >
                  <PlusIcon size={16} />
                  Add a debt
                </button>
              ) : (
                <p className="type-small text-ink-muted">Up to {MAX_DEBTS} debts.</p>
              )}
              <InputCurrency
                optional
                label="Extra payment each month"
                help="On top of the minimums. Example value. 0 = minimums only."
                currency={c}
                value={s.extra}
                onChange={(v) => update('extra', v)}
                error={errors.extra}
              />
            </div>
          </InputsPanel>
        }
        result={result}
      />

      {plan ? (
        <>
          {plan.minBelowInterest.map((row) => (
            <p key={row} role="note" className="type-small rounded-field border border-line bg-paper px-4 py-3 text-ink">
              Debt {row + 1}’s minimum doesn’t cover its interest. It is paid off only once other debts are cleared.
            </p>
          ))}
          <div className="grid gap-6 md:grid-cols-2">
            <MethodColumn
              title="Snowball"
              about="Extra money goes to the smallest balance first."
              r={plan.snowball}
              money={money}
              date={around(plan.snowball.months)}
            />
            <MethodColumn
              title="Avalanche"
              about="Extra money goes to the highest interest rate first."
              r={plan.avalanche}
              money={money}
              date={around(plan.avalanche.months)}
            />
          </div>
          <ChartLazy
            title="Total debt left, month by month"
            description={`Snowball (solid line): ${monthsText(plan.snowball.months)}, ${money(plan.snowball.totalInterest)} interest. Avalanche (dashed line): ${monthsText(plan.avalanche.months)}, ${money(plan.avalanche.totalInterest)} interest. Both pay the same each month; only the order changes.`}
          >
            <DebtBalanceChart points={chartPoints(plan)} currency={c} />
          </ChartLazy>
        </>
      ) : null}
    </div>
  );
}

function MethodColumn(props: { title: string; about: string; r: MethodResult; money: (n: number) => string; date: string | null }) {
  const { title, about, r, money, date } = props;
  return (
    <section className="print-break-avoid rounded-panel border border-line bg-surface p-5 sm:p-6" aria-label={title}>
      <h3 className="type-h3 text-ink">{title}</h3>
      <p className="type-small mt-1 text-ink-muted">{about}</p>
      <dl className="type-small mt-4 border-t border-line">
        {(
          [
            ['Debt-free in', `${monthsText(r.months)} (about ${yearsAndMonths(r.months)})`],
            ...(date ? [['Debt-free around', date] as const] : []),
            ['Total interest', money(r.totalInterest)],
            ['Total paid', money(r.totalPaid)],
          ] as const
        ).map(([k, v]) => (
          <div key={k} className="flex items-baseline justify-between gap-4 border-b border-line py-2.5">
            <dt className="text-ink-muted">{k}</dt>
            <dd className="text-right font-[550] tabular-nums text-ink">
              <Num>{v}</Num>
            </dd>
          </div>
        ))}
      </dl>
      <p className="type-small mt-4 text-ink">
        <span className="font-[550]">Payoff order: </span>
        {formatOrder(r.order)}
      </p>
    </section>
  );
}

/** The headline comparison (amounts as shown, so the page adds up). */
function differenceText(snow: MethodResult, aval: MethodResult, money: (n: number) => string): string {
  const saved = shownDifference(snow.totalInterest, aval.totalInterest);
  const months = snow.months - aval.months;
  const firstSnow = snow.order[0]?.month ?? 0;
  const firstAval = aval.order[0]?.month ?? 0;
  if (saved === 0 && months === 0) {
    return firstSnow < firstAval
      ? `Both methods cost the same, but snowball clears your first debt ${monthsText(firstAval - firstSnow)} sooner.`
      : 'Both methods give the same result.';
  }
  const parts: string[] = [];
  if (saved > 0) {
    parts.push(
      months > 0
        ? `Avalanche saves ${money(saved)} in interest and ${monthsText(months)}.`
        : months < 0
          ? `Avalanche saves ${money(saved)} in interest, but takes ${monthsText(-months)} longer.`
          : `Avalanche saves ${money(saved)} in interest; both take ${monthsText(snow.months)}.`,
    );
  } else if (saved < 0) {
    parts.push(`Snowball saves ${money(-saved)} in interest${months < 0 ? ` and ${monthsText(-months)}` : ''}.`);
  } else {
    parts.push(months > 0 ? `Avalanche is ${monthsText(months)} faster for the same interest.` : `Snowball is ${monthsText(-months)} faster for the same interest.`);
  }
  if (firstSnow < firstAval) parts.push(`Snowball clears your first debt ${monthsText(firstAval - firstSnow)} sooner.`);
  return parts.join(' ');
}
