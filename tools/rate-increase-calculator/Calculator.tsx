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
import { Slider } from '@/components/Slider';
import { track } from '@/lib/analytics';
import { formatMoney, formatNumber, formatPercent, type CurrencyCode } from '@/lib/format';
import { useUrlState } from '@/lib/url-state';
import { incomeCurve, quickComparison, rateIncrease, type RateIncreaseError, type RateIncreaseResult } from './calc';
import { ClientNotice } from './ClientNotice';
import { Num } from '@/components/Num';
import {
  fieldErrors,
  planBDefaults,
  planBSchema,
  rateIncreaseDefaults,
  rateIncreaseSchema,
  rateIncreaseVariant,
  switchRateIncreaseCurrency,
  toCalcInput,
  type RateIncreaseState,
} from './schema';

const IncomeCurveChart = dynamic(() => import('./Chart'), { ssr: false, loading: () => <ChartPlaceholder /> });

const SLUG = 'rate-increase-calculator';
const FIX_FIELDS = 'Check the highlighted fields to see your result.';

export default function RateIncreaseCalculator() {
  const { state: s, setField, setAll, reset, touched } = useUrlState(rateIncreaseSchema, rateIncreaseDefaults, {
    variant: rateIncreaseVariant,
  });
  const { state: b, setField: setB } = useUrlState(planBSchema, planBDefaults, { prefix: 'b_' });
  const tracked = useRef(false);

  function update<K extends keyof RateIncreaseState>(key: K, value: RateIncreaseState[K]) {
    setField(key, value);
    if (!tracked.current) {
      tracked.current = true;
      track('calculate', { tool: SLUG });
    }
  }

  const c = s.currency;
  const money = (n: number) => formatMoney(n, c);
  const signed = (n: number) => `${n > 0 ? '+' : n < 0 ? '−' : ''}${money(Math.abs(n))}`;
  const pct2 = (f: number) => formatPercent(f, 2);
  const hrs = (n: number) => formatNumber(n, 1);

  const errors = fieldErrors(rateIncreaseSchema, s);
  const result: RateIncreaseResult | RateIncreaseError =
    Object.keys(errors).length > 0 ? { ok: false, error: FIX_FIELDS } : rateIncrease(toCalcInput(s));

  const bErrors = fieldErrors(planBSchema, b);
  const resultB: RateIncreaseResult | RateIncreaseError =
    result.ok && Object.keys(bErrors).length === 0
      ? rateIncrease(toCalcInput({ ...s, increase: b.increase, loss: b.loss }))
      : { ok: false, error: FIX_FIELDS };

  const label = 'Change in monthly income';

  return (
    <div className="flex flex-col gap-6">
      <CalculatorGrid
        inputs={
          <InputsPanel
            label="Your numbers"
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
                <CurrencySelect value={c} onChange={(next: CurrencyCode) => setAll(switchRateIncreaseCurrency(s, next, touched))} />
              </div>
              <InputCurrency
                label="Current rate (per hour)"
                currency={c}
                value={s.rate}
                onChange={(v) => update('rate', v)}
                error={errors.rate}
              />
              <InputNumber
                label="Billable hours per month now"
                value={s.hours}
                onChange={(v) => update('hours', v)}
                suffix="hours"
                help="A typical month (1–744)."
                error={errors.hours}
              />
              <div className="sm:col-span-2">
                <Slider
                  label="Rate increase"
                  value={s.increase}
                  onChange={(v) => update('increase', v)}
                  min={1}
                  max={200}
                  format={(v) => `${v}%`}
                  unit="%"
                  error={errors.increase}
                />
              </div>
              <div className="sm:col-span-2">
                <Slider
                  label="Work you might lose"
                  value={s.loss}
                  onChange={(v) => update('loss', v)}
                  min={0}
                  max={100}
                  format={(v) => `${v}%`}
                  unit="%"
                  help="Share of hours or clients that may leave after the increase."
                  error={errors.loss}
                />
              </div>
            </div>
          </InputsPanel>
        }
        result={
          result.ok ? (
            <ResultCard
              label={label}
              value={signed(result.change)}
              unit={`per month · ${c}`}
              tone={result.change > 0 ? 'positive' : result.change < 0 ? 'negative' : undefined}
              rows={[
                { label: 'New rate', value: money(result.newRate) },
                { label: 'Monthly income now', value: money(result.currentRevenue) },
                { label: 'Monthly income after', value: money(result.newRevenue) },
                { label: 'Change per year', note: 'Monthly change × 12', value: signed(result.yearlyChange) },
                {
                  label: 'Hours after the change',
                  note: result.hoursFreed > 0 ? `${hrs(result.hoursFreed)} hours freed up` : undefined,
                  value: hrs(result.newHours),
                },
              ]}
              footnote={
                <p>
                  <strong className="font-[550] text-ink">
                    You can lose up to {pct2(result.breakEvenLoss)} of your work
                  </strong>{' '}
                  and still earn the same as today.
                </p>
              }
            />
          ) : (
            <ResultCard label={label} value="" unit="" rows={[]} error={result.error} />
          )
        }
      />

      {result.ok ? (
        <ChartLazy
          title="Your income as work is lost"
          description={`At ${money(result.newRate)} an hour. The dashed line is today's income; where they cross is your break-even at ${pct2(result.breakEvenLoss)}.`}
          height={280}
        >
          <IncomeCurveChart
            curve={incomeCurve({ rate: s.rate, hours: s.hours, increase: s.increase / 100 })}
            today={result.currentRevenue}
            breakEvenLoss={result.breakEvenLoss}
            currency={c}
          />
        </ChartLazy>
      ) : null}

      {result.ok ? (
        <section aria-labelledby="quick-compare-heading" className="print-break-avoid min-w-0 rounded-panel border border-line bg-surface p-5 sm:p-8">
          <h2 id="quick-compare-heading" className="type-h3 text-ink">
            10%, 20% or 30%?
          </h2>
          <p className="type-small mt-1 text-ink-muted">
            The same three increases, if you lose {s.loss}% of your work.
          </p>
          <div className="mt-6 overflow-x-auto">
            <table className="type-small w-full">
              <thead>
                <tr className="border-b border-line text-left text-ink-muted">
                  <th scope="col" className="py-2 pr-3 font-[550]">Increase</th>
                  <th scope="col" className="py-2 pr-3 text-right font-[550]">New rate</th>
                  <th scope="col" className="py-2 pr-3 text-right font-[550]">Change per month</th>
                  <th scope="col" className="hidden py-2 text-right font-[550] sm:table-cell">Break-even loss</th>
                </tr>
              </thead>
              <tbody>
                {quickComparison({ rate: s.rate, hours: s.hours, loss: s.loss / 100 }).map(({ increase, result: q }) => (
                  <tr key={increase} className="border-b border-line last:border-0">
                    <th scope="row" className="py-3 pr-3 text-left font-normal text-ink-muted">+{Math.round(increase * 100)}%</th>
                    <td className="type-figure py-3 pr-3 text-right text-ink"><Num>{money(q.newRate)}</Num></td>
                    <td className={`type-figure py-3 pr-3 text-right ${q.change < 0 ? 'text-danger' : 'text-ink'}`}><Num>{signed(q.change)}</Num></td>
                    <td className="type-figure hidden py-3 text-right text-ink sm:table-cell"><Num>{pct2(q.breakEvenLoss)}</Num></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {result.ok ? <ClientNotice oldRate={money(s.rate)} newRate={money(result.newRate)} toolSlug={SLUG} /> : null}

      <ScenarioCompare
        title="Compare two plans"
        aName="Plan A (your inputs)"
        bName="Plan B"
        toolSlug={SLUG}
        error={!result.ok || !resultB.ok ? FIX_FIELDS : undefined}
        planA={
          <dl className="type-small grid grid-cols-2 gap-y-2">
            <dt className="text-ink-muted">Rate increase</dt>
            <dd className="text-right font-[550] tabular-nums">{s.increase}%</dd>
            <dt className="text-ink-muted">Work lost</dt>
            <dd className="text-right font-[550] tabular-nums">{s.loss}%</dd>
            <dd className="col-span-2 mt-2 text-ink-muted">Change these in the calculator above.</dd>
          </dl>
        }
        planB={
          <>
            <Slider
              label="Rate increase"
              value={b.increase}
              onChange={(v) => setB('increase', v)}
              min={1}
              max={200}
              format={(v) => `${v}%`}
              unit="%"
              error={bErrors.increase}
            />
            <Slider
              label="Work you might lose"
              value={b.loss}
              onChange={(v) => setB('loss', v)}
              min={0}
              max={100}
              format={(v) => `${v}%`}
              unit="%"
              error={bErrors.loss}
            />
          </>
        }
        rows={
          result.ok && resultB.ok
            ? [
                { label: 'New rate', a: money(result.newRate), b: money(resultB.newRate) },
                {
                  label: 'Monthly income after',
                  a: money(result.newRevenue),
                  b: money(resultB.newRevenue),
                  better: result.newRevenue > resultB.newRevenue ? 'a' : resultB.newRevenue > result.newRevenue ? 'b' : undefined,
                },
                { label: 'Change per month', a: signed(result.change), b: signed(resultB.change) },
                { label: 'Hours after', a: hrs(result.newHours), b: hrs(resultB.newHours) },
                { label: 'Break-even loss', a: pct2(result.breakEvenLoss), b: pct2(resultB.breakEvenLoss) },
              ]
            : []
        }
      />
    </div>
  );
}
