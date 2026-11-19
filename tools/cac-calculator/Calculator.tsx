'use client';

import { useRef } from 'react';
import { CalculatorGrid, InputsPanel } from '@/components/CalculatorGrid';
import { CurrencySelect } from '@/components/CurrencySelect';
import { InputCurrency } from '@/components/InputCurrency';
import { InputNumber } from '@/components/InputNumber';
import { ResetIcon } from '@/components/icons';
import { ResultCard } from '@/components/ResultCard';
import { ScenarioCompare } from '@/components/ScenarioCompare';
import { SplitBar } from '@/components/SplitBar';
import { track } from '@/lib/analytics';
import { CATEGORICAL } from '@/lib/chart-palette';
import { formatMoney, formatNumber, type CurrencyCode } from '@/lib/format';
import { useUrlState } from '@/lib/url-state';
import { cac, formatRatio } from './calc';
import {
  cacDefaults,
  cacSchema,
  cacVariant,
  fieldErrors,
  planBDefaults,
  planBSchema,
  switchCacCurrency,
  toCalcInput,
  type CacState,
} from './schema';

const SLUG = 'cac-calculator';
const FIX_FIELDS = 'Check the highlighted fields to see your result.';

export default function CacCalculator() {
  const { state: s, setField, setAll, reset } = useUrlState(cacSchema, cacDefaults, { variant: cacVariant });
  const { state: b, setField: setB } = useUrlState(planBSchema, planBDefaults, { prefix: 'b_' });
  const tracked = useRef(false);

  function update<K extends keyof CacState>(key: K, value: CacState[K]) {
    setField(key, value);
    if (!tracked.current) {
      tracked.current = true;
      track('calculate', { tool: SLUG });
    }
  }

  const c = s.currency;
  const money = (n: number) => formatMoney(n, c);
  const errors = fieldErrors(cacSchema, s);
  const r = Object.keys(errors).length > 0 ? null : cac(toCalcInput(s));
  const bErrors = fieldErrors(planBSchema, b);
  const rb = r && Object.keys(bErrors).length === 0 ? cac(toCalcInput({ ...s, ...b })) : null;
  const ltvOn = s.ltv > 0;

  const ltvRows =
    r && ltvOn
      ? r.ratio === null
        ? []
        : [
            { label: 'LTV:CAC ratio', note: `Lifetime value ${money(s.ltv)}`, value: formatRatio(r.ratio) },
            { label: 'Left after acquisition cost', note: 'LTV − CAC', value: money(r.leftOver!) },
            ...(r.maxCac !== null ? [{ label: `Highest CAC for ${formatNumber(s.target, 1)} : 1`, value: money(r.maxCac) }] : []),
          ]
      : [];

  const targetText =
    r && r.meetsTarget !== null
      ? r.meetsTarget
        ? `At or above your ${formatNumber(s.target, 1)} : 1 target.`
        : `Below your ${formatNumber(s.target, 1)} : 1 target. To reach it, CAC needs to be ${money(r.maxCac!)} or less: ${formatNumber(r.customersNeeded!)} new customers for the same spend.`
      : null;

  return (
    <div className="flex flex-col gap-6">
      <CalculatorGrid
        inputs={
          <InputsPanel
            label="Your spend and customers"
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
              <CurrencySelect value={c} onChange={(next: CurrencyCode) => setAll(switchCacCurrency(s, next))} />
              <InputCurrency
                label="Marketing spend"
                help="Ads, tools, content, agency fees: everything spent on marketing in the period. Example values — use your own numbers."
                currency={c}
                value={s.mkt}
                onChange={(v) => update('mkt', v)}
                error={errors.mkt}
              />
              <InputCurrency
                optional
                label="Sales spend (optional)"
                help="Sales salaries, commissions and tools for the same period."
                currency={c}
                value={s.sales}
                onChange={(v) => update('sales', v)}
                error={errors.sales}
              />
              <InputNumber
                label="New customers"
                help="New paying customers won in the same period."
                value={s.cust}
                onChange={(v) => update('cust', v)}
                suffix="customers"
                grouping
                error={errors.cust}
              />
              <InputCurrency
                optional
                label="Customer lifetime value (optional)"
                help="What one customer brings you over their whole time with you. Use profit, not revenue, if you can. 0 = off."
                currency={c}
                value={s.ltv}
                onChange={(v) => update('ltv', v)}
                error={errors.ltv}
              />
              {ltvOn ? (
                <InputNumber
                  optional
                  label="Target LTV:CAC (optional)"
                  help="3 : 1 is a common rule of thumb, not a rule. Change it to your own target. 0 = off."
                  value={s.target}
                  onChange={(v) => update('target', v)}
                  suffix=": 1"
                  error={errors.target}
                />
              ) : null}
            </div>
          </InputsPanel>
        }
        result={
          r ? (
            <ResultCard
              label="Customer acquisition cost"
              value={money(r.cac)}
              unit={`per new customer · ${c}`}
              tone={r.meetsTarget === false || (r.leftOver !== null && r.leftOver < 0) ? 'negative' : undefined}
              rows={[
                { label: 'Total acquisition spend', note: s.sales > 0 ? 'Marketing + sales' : 'Marketing', value: money(r.spend) },
                { label: 'New customers', value: formatNumber(s.cust) },
                ...ltvRows,
              ]}
              footnote={
                ltvOn && r.ratio === null ? (
                  <p>No acquisition cost, so there is no ratio.</p>
                ) : r.leftOver !== null && r.leftOver < 0 ? (
                  <>
                    <p className="font-[550] text-danger">You spend more to win a customer than they bring in.</p>
                    {targetText ? <p className="mt-2">{targetText}</p> : null}
                  </>
                ) : targetText ? (
                  <p>{targetText}</p>
                ) : undefined
              }
            />
          ) : (
            <ResultCard label="Customer acquisition cost" value="" unit="" rows={[]} error={FIX_FIELDS} />
          )
        }
      />

      {r && s.sales > 0 && s.mkt > 0 ? (
        <SplitBar
          title="Where the acquisition spend goes"
          description={`${money(r.spend)} in total.`}
          parts={[
            { key: 'mkt', label: 'Marketing', value: s.mkt, display: money(s.mkt), color: CATEGORICAL[0] },
            { key: 'sales', label: 'Sales', value: s.sales, display: money(s.sales), color: CATEGORICAL[1] },
          ]}
        />
      ) : null}

      <ScenarioCompare
        title="Compare two plans"
        aName="Plan A (your inputs)"
        bName="Plan B"
        toolSlug={SLUG}
        error={!r || !rb ? FIX_FIELDS : undefined}
        planA={
          <dl className="type-small grid grid-cols-2 gap-y-2">
            <dt className="text-ink-muted">Marketing spend</dt>
            <dd className="text-right font-[550] tabular-nums">{money(s.mkt)}</dd>
            <dt className="text-ink-muted">Sales spend</dt>
            <dd className="text-right font-[550] tabular-nums">{money(s.sales)}</dd>
            <dt className="text-ink-muted">New customers</dt>
            <dd className="text-right font-[550] tabular-nums">{formatNumber(s.cust)}</dd>
            <dd className="col-span-2 mt-2 text-ink-muted">Change these in the calculator above.</dd>
          </dl>
        }
        planB={
          <>
            <InputCurrency label="Marketing spend" currency={c} value={b.mkt} onChange={(v) => setB('mkt', v)} error={bErrors.mkt} />
            <InputCurrency label="Sales spend" currency={c} value={b.sales} onChange={(v) => setB('sales', v)} error={bErrors.sales} />
            <InputNumber label="New customers" value={b.cust} onChange={(v) => setB('cust', v)} grouping error={bErrors.cust} />
          </>
        }
        rows={
          r && rb
            ? [
                {
                  label: 'CAC',
                  a: money(r.cac),
                  b: money(rb.cac),
                  better: r.cac < rb.cac ? 'a' : rb.cac < r.cac ? 'b' : undefined,
                },
                ...(r.ratio !== null && rb.ratio !== null
                  ? [{ label: 'LTV:CAC', a: formatRatio(r.ratio), b: formatRatio(rb.ratio) }]
                  : []),
              ]
            : []
        }
      />
    </div>
  );
}
