'use client';

import { useRef } from 'react';
import { CalculatorGrid, InputsPanel } from '@/components/CalculatorGrid';
import { CurrencySelect } from '@/components/CurrencySelect';
import { InputCurrency } from '@/components/InputCurrency';
import { InputNumber } from '@/components/InputNumber';
import { ResetIcon } from '@/components/icons';
import { ResultCard } from '@/components/ResultCard';
import { ScenarioCompare } from '@/components/ScenarioCompare';
import { track } from '@/lib/analytics';
import { formatMoney, formatNumber, type CurrencyCode } from '@/lib/format';
import { useUrlState } from '@/lib/url-state';
import { costPerLead, formatCustomers } from './calc';
import {
  cplDefaults,
  cplSchema,
  cplVariant,
  fieldErrors,
  planBDefaults,
  planBSchema,
  switchCplCurrency,
  toCalcInput,
  type CplState,
} from './schema';

const SLUG = 'cost-per-lead-calculator';
const FIX_FIELDS = 'Check the highlighted fields to see your result.';

export default function CostPerLeadCalculator() {
  const { state: s, setField, setAll, reset } = useUrlState(cplSchema, cplDefaults, { variant: cplVariant });
  const { state: b, setField: setB } = useUrlState(planBSchema, planBDefaults, { prefix: 'b_' });
  const tracked = useRef(false);

  function update<K extends keyof CplState>(key: K, value: CplState[K]) {
    setField(key, value);
    if (!tracked.current) {
      tracked.current = true;
      track('calculate', { tool: SLUG });
    }
  }

  const c = s.currency;
  const money = (n: number) => formatMoney(n, c);
  const errors = fieldErrors(cplSchema, s);
  const r = Object.keys(errors).length > 0 ? null : costPerLead(toCalcInput(s));
  const bErrors = fieldErrors(planBSchema, b);
  const rb = r && Object.keys(bErrors).length === 0 ? costPerLead(toCalcInput(b)) : null;

  return (
    <div className="flex flex-col gap-6">
      <CalculatorGrid
        inputs={
          <InputsPanel
            label="Your campaign"
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
              <CurrencySelect value={c} onChange={(next: CurrencyCode) => setAll(switchCplCurrency(s, next))} />
              <InputCurrency
                label="Campaign spend"
                help="Example values — use your own numbers."
                currency={c}
                value={s.spend}
                onChange={(v) => update('spend', v)}
                error={errors.spend}
              />
              <InputNumber
                label="Leads"
                help="Enquiries, sign-ups or form fills from this spend."
                value={s.leads}
                onChange={(v) => update('leads', v)}
                suffix="leads"
                grouping
                error={errors.leads}
              />
              <InputNumber
                optional
                label="Lead-to-customer rate (optional)"
                help="Out of 100 leads, how many become paying customers? 0 = off."
                value={s.conv}
                onChange={(v) => update('conv', v)}
                suffix="%"
                error={errors.conv}
              />
            </div>
          </InputsPanel>
        }
        result={
          r ? (
            <ResultCard
              label="Cost per lead"
              value={money(r.cpl)}
              unit={`per lead · ${formatNumber(s.leads)} leads · ${c}`}
              rows={
                r.customers !== null
                  ? [
                      { label: 'Customers from these leads', note: `At ${formatNumber(s.conv, 2)}%`, value: formatCustomers(r.customers) },
                      { label: 'Cost per customer', note: 'Spend ÷ customers', value: money(r.costPerCustomer!) },
                      { label: 'Leads for each customer', value: `About ${formatNumber(r.leadsPerCustomer!, 1)}` },
                    ]
                  : [{ label: 'Campaign spend', value: money(s.spend) }]
              }
            />
          ) : (
            <ResultCard label="Cost per lead" value="" unit="" rows={[]} error={FIX_FIELDS} />
          )
        }
      />

      <ScenarioCompare
        title="Compare two channels"
        aName="Channel A (your inputs)"
        bName="Channel B"
        toolSlug={SLUG}
        error={!r || !rb ? FIX_FIELDS : undefined}
        planA={
          <dl className="type-small grid grid-cols-2 gap-y-2">
            <dt className="text-ink-muted">Spend</dt>
            <dd className="text-right font-[550] tabular-nums">{money(s.spend)}</dd>
            <dt className="text-ink-muted">Leads</dt>
            <dd className="text-right font-[550] tabular-nums">{formatNumber(s.leads)}</dd>
            <dt className="text-ink-muted">Lead-to-customer rate</dt>
            <dd className="text-right font-[550] tabular-nums">{formatNumber(s.conv, 2)}%</dd>
            <dd className="col-span-2 mt-2 text-ink-muted">Change these in the calculator above.</dd>
          </dl>
        }
        planB={
          <>
            <InputCurrency label="Spend" currency={c} value={b.spend} onChange={(v) => setB('spend', v)} error={bErrors.spend} />
            <InputNumber label="Leads" value={b.leads} onChange={(v) => setB('leads', v)} grouping error={bErrors.leads} />
            <InputNumber optional label="Lead-to-customer rate" value={b.conv} onChange={(v) => setB('conv', v)} suffix="%" error={bErrors.conv} />
          </>
        }
        rows={
          r && rb
            ? [
                { label: 'Cost per lead', a: money(r.cpl), b: money(rb.cpl), better: r.cpl < rb.cpl ? 'a' : rb.cpl < r.cpl ? 'b' : undefined },
                ...(r.costPerCustomer !== null && rb.costPerCustomer !== null
                  ? [
                      {
                        label: 'Cost per customer',
                        a: money(r.costPerCustomer),
                        b: money(rb.costPerCustomer),
                        better:
                          r.costPerCustomer < rb.costPerCustomer ? ('a' as const) : rb.costPerCustomer < r.costPerCustomer ? ('b' as const) : undefined,
                      },
                    ]
                  : []),
              ]
            : []
        }
      />
    </div>
  );
}
