'use client';

import { useRef } from 'react';
import { CalculatorGrid, InputsPanel } from '@/components/CalculatorGrid';
import { CurrencySelect } from '@/components/CurrencySelect';
import { InputCurrency } from '@/components/InputCurrency';
import { InputNumber } from '@/components/InputNumber';
import { ResetIcon } from '@/components/icons';
import { Num } from '@/components/Num';
import { ResultCard } from '@/components/ResultCard';
import { track } from '@/lib/analytics';
import { formatMoney, formatNumber, type CurrencyCode } from '@/lib/format';
import { optionalOff } from '@/lib/field-errors';
import { useUrlState } from '@/lib/url-state';
import { compareOffers, type CompareError, type CompareResult, type OfferResult } from './calc';
import {
  fieldErrors,
  jobOfferDefaults,
  jobOfferSchema,
  jobOfferVariant,
  offerKey,
  switchJobOfferCurrency,
  toOfferInput,
  type JobOfferState,
  type OfferField,
  type OfferKey,
} from './schema';

const SLUG = 'job-offer-comparison-calculator';
/** Optional fields: an invalid one shows its own error, and the result still shows (treated as 0). */
const OPTIONAL = [offerKey('a', 'Bonus'), offerKey('b', 'Bonus'), offerKey('a', 'Office'), offerKey('b', 'Office'), 'timeValue'] as const;
const FIX_FIELDS = 'Check the highlighted fields to compare the offers.';
const NAME: Record<OfferKey, string> = { a: 'Offer A', b: 'Offer B' };

export default function JobOfferComparisonCalculator() {
  const { state: s, setField, setAll, reset, touched } = useUrlState(jobOfferSchema, jobOfferDefaults, { variant: jobOfferVariant });
  const tracked = useRef(false);

  function update<K extends keyof JobOfferState>(key: K, value: JobOfferState[K]) {
    setField(key, value);
    if (!tracked.current) {
      tracked.current = true;
      track('calculate', { tool: SLUG });
    }
  }

  const c = s.currency;
  const money = (n: number) => formatMoney(n, c);
  const errors = fieldErrors(jobOfferSchema, s);
  const { blocking, calc } = optionalOff(s, errors, OPTIONAL);
  const result: CompareResult | CompareError =
    Object.keys(blocking).length > 0
      ? { ok: false, error: FIX_FIELDS }
      : compareOffers(toOfferInput(calc, 'a'), toOfferInput(calc, 'b'), calc.timeValue);

  function offerFields(p: OfferKey) {
    const k = <F extends OfferField>(f: F) => offerKey(p, f);
    return (
      <fieldset className="flex min-w-0 flex-col gap-6">
        <legend className="type-h3 mb-5 text-ink">{NAME[p]}</legend>
        <InputCurrency label="Base salary per year" currency={c} value={s[k('Salary')]} onChange={(v) => update(k('Salary'), v)} error={errors[k('Salary')]} />
        <InputNumber optional
          label="Target bonus"
          help="From the offer letter. Enter 0 if none."
          value={s[k('Bonus')]}
          onChange={(v) => update(k('Bonus'), v)}
          suffix="% of salary"
          error={errors[k('Bonus')]}
        />
        <InputNumber
          label="Employer retirement contribution"
          help="Only what the employer pays in (401(k) match, pension, PF…)."
          value={s[k('Match')]}
          onChange={(v) => update(k('Match'), v)}
          suffix="% of salary"
          error={errors[k('Match')]}
        />
        <InputCurrency
          label="Other benefits per year"
          help="Health insurance the employer pays, allowances, stipends, a learning budget."
          currency={c}
          value={s[k('Benefits')]}
          onChange={(v) => update(k('Benefits'), v)}
          error={errors[k('Benefits')]}
        />
        <InputNumber
          label="Paid leave"
          help="Holidays plus public holidays."
          value={s[k('Leave')]}
          onChange={(v) => update(k('Leave'), v)}
          suffix="days a year"
          error={errors[k('Leave')]}
        />
        <InputNumber label="Working hours" value={s[k('Hours')]} onChange={(v) => update(k('Hours'), v)} suffix="hours a week" error={errors[k('Hours')]} />
        <InputNumber optional
          label="Office days"
          help="0 = fully remote."
          value={s[k('Office')]}
          onChange={(v) => update(k('Office'), v)}
          suffix="days a week"
          error={errors[k('Office')]}
        />
        <InputNumber label="Commute, one way" value={s[k('Mins')]} onChange={(v) => update(k('Mins'), v)} suffix="minutes" error={errors[k('Mins')]} />
        <InputCurrency
          label="Commute cost per office day"
          help="Round trip: fuel, parking, fares."
          currency={c}
          value={s[k('Cost')]}
          onChange={(v) => update(k('Cost'), v)}
          error={errors[k('Cost')]}
        />
      </fieldset>
    );
  }

  const label = 'Which offer is worth more';
  const headline = (r: CompareResult) =>
    r.winner === 'tie' ? 'Both offers are worth the same' : `${NAME[r.winner]} is worth more per year`;

  return (
    <div className="flex flex-col gap-6">
      <CalculatorGrid
        inputs={
          <InputsPanel
            label="Your two job offers"
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
            <div className="flex flex-col gap-8">
              <CurrencySelect value={c} onChange={(next: CurrencyCode) => setAll(switchJobOfferCurrency(s, next, touched))} />
              <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2">
                {offerFields('a')}
                {offerFields('b')}
              </div>
              <div className="border-t border-line pt-6">
                <InputCurrency optional
                  label="Value of your commute time (optional)"
                  help="What an hour of your free time is worth to you, per hour. Leave at 0 to ignore."
                  currency={c}
                  value={s.timeValue}
                  onChange={(v) => update('timeValue', v)}
                  error={errors.timeValue}
                />
              </div>
            </div>
          </InputsPanel>
        }
        result={
          result.ok ? (
            <ResultCard
              label={headline(result)}
              value={money(Math.abs(result.difference))}
              unit={`${result.winner === 'tie' ? 'difference' : 'more'} per year · ${c} · before tax`}
              rows={[
                { label: 'Offer A yearly value', value: money(result.a.yearlyValue) },
                { label: 'Offer B yearly value', value: money(result.b.yearlyValue) },
                { label: 'Offer A per hour', note: 'Incl. commute time', value: money(result.a.effectiveHourly) },
                { label: 'Offer B per hour', note: 'Incl. commute time', value: money(result.b.effectiveHourly) },
              ]}
              footnote="Before tax. Taxes, stock and one-off sign-on bonuses are not included."
            />
          ) : (
            <ResultCard label={label} value="" unit="" rows={[]} error={result.error} />
          )
        }
      />

      {result.ok ? <Breakdown a={result.a} b={result.b} money={money} showTime={s.timeValue > 0} /> : null}
    </div>
  );
}

function Breakdown(props: { a: OfferResult; b: OfferResult; money: (n: number) => string; showTime: boolean }) {
  const { a, b, money, showTime } = props;
  const hours = (n: number) => formatNumber(n, n % 1 === 0 ? 0 : 1);
  const rows: { label: string; a: string; b: string; strong?: boolean }[] = [
    { label: 'Base salary', a: money(a.salary), b: money(b.salary) },
    { label: 'Bonus', a: money(a.bonus), b: money(b.bonus) },
    { label: 'Retirement contribution', a: money(a.match), b: money(b.match) },
    { label: 'Other benefits', a: money(a.benefits), b: money(b.benefits) },
    { label: 'Total pay package', a: money(a.totalPay), b: money(b.totalPay), strong: true },
    { label: 'Commute costs (−)', a: money(a.commuteCost), b: money(b.commuteCost) },
    ...(showTime ? [{ label: 'Value of commute time (−)', a: money(a.timeCost), b: money(b.timeCost) }] : []),
    { label: 'Yearly value', a: money(a.yearlyValue), b: money(b.yearlyValue), strong: true },
    { label: 'Work hours per year', a: hours(a.workHours), b: hours(b.workHours) },
    { label: 'Commute hours per year', a: hours(a.commuteHours), b: hours(b.commuteHours) },
    { label: 'Effective pay per hour', a: money(a.effectiveHourly), b: money(b.effectiveHourly), strong: true },
  ];
  return (
    <section aria-labelledby="offer-breakdown-heading" className="print-break-avoid min-w-0 rounded-panel border border-line bg-surface p-5 sm:p-8">
      <h2 id="offer-breakdown-heading" className="type-h3 text-ink">
        Side-by-side breakdown
      </h2>
      <p className="type-small mt-1 text-ink-muted">
        Per year, before tax. Effective pay per hour counts commute hours as time given to the job.
      </p>
      <div className="mt-6 overflow-x-auto">
        <table className="type-small w-full">
          <thead>
            <tr className="border-b border-line text-left text-ink-muted">
              <th scope="col" className="py-2 pr-3 font-[550]">
                <span className="sr-only">Item</span>
              </th>
              <th scope="col" className="py-2 pr-3 text-right font-[550]">
                Offer A
              </th>
              <th scope="col" className="py-2 text-right font-[550]">
                Offer B
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-b border-line last:border-0">
                <th scope="row" className={`py-3 pr-3 text-left normal-nums ${r.strong ? 'font-[550] text-ink' : 'font-normal text-ink-muted'}`}>
                  {r.label}
                </th>
                <td className={`py-3 pr-3 text-right tabular-nums ${r.strong ? 'font-[550]' : ''}`}><Num>{r.a}</Num></td>
                <td className={`py-3 text-right tabular-nums ${r.strong ? 'font-[550]' : ''}`}><Num>{r.b}</Num></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
