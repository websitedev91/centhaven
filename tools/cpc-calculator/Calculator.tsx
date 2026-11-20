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
import { formatMoney, formatNumber, type CurrencyCode } from '@/lib/format';
import { useUrlState } from '@/lib/url-state';
import { cpc, formatClicks, formatClicksPerConversion, formatConversions, type CpcMode, type CpcResult } from './calc';
import {
  cpcDefaults,
  cpcErrors,
  cpcSchema,
  cpcVariant,
  fieldErrors,
  planBDefaults,
  planBSchema,
  switchCpcCurrency,
  toCalcInput,
  type CpcState,
} from './schema';

const SLUG = 'cpc-calculator';
/** Optional fields: an invalid one shows its own error, and the result still shows (treated as 0). */
const OPTIONAL = ['conv'] as const;
const FIX_FIELDS = 'Check the highlighted fields to see your result.';

const MODE_OPTIONS: readonly { value: CpcMode; label: string }[] = [
  { value: 'find', label: 'Find my CPC' },
  { value: 'clicks', label: 'Clicks from a budget' },
];

export default function CpcCalculator() {
  const { state: s, setField, setAll, reset, touched } = useUrlState(cpcSchema, cpcDefaults, { variant: cpcVariant });
  const { state: b, setField: setB } = useUrlState(planBSchema, planBDefaults, { prefix: 'b_' });
  const tracked = useRef(false);

  function update<K extends keyof CpcState>(key: K, value: CpcState[K]) {
    setField(key, value);
    if (!tracked.current) {
      tracked.current = true;
      track('calculate', { tool: SLUG });
    }
  }

  const c = s.currency;
  const money = (n: number) => formatMoney(n, c);
  const errors = cpcErrors(s);
  const { blocking, calc } = optionalOff(s, errors, OPTIONAL);
  const r = Object.keys(blocking).length > 0 ? null : cpc(toCalcInput(calc));
  const find = s.mode === 'find';
  const label = find ? 'Cost per click' : 'Clicks your budget buys';

  const bErrors = fieldErrors(planBSchema, b);
  const rb = r && find && Object.keys(bErrors).length === 0 ? cpc(toCalcInput({ ...s, ...b, mode: 'find' })) : null;

  const conversionRows = (x: CpcResult) =>
    x.conversions !== null
      ? [
          { label: 'Conversions', note: `At a ${formatNumber(calc.conv, 2)}% conversion rate`, value: formatConversions(x.conversions) },
          { label: 'Cost per conversion', note: formatClicksPerConversion(x.clicksPerConversion!), value: money(x.costPerConversion!) },
        ]
      : [];

  return (
    <div className="flex flex-col gap-6">
      <CalculatorGrid
        inputs={
          <InputsPanel
            label="Your ad numbers"
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
                <SegmentedControl<CpcMode> label="What do you want to know?" value={s.mode} options={MODE_OPTIONS} onChange={(v) => update('mode', v)} />
              </div>
              <div className="sm:col-span-2">
                <CurrencySelect value={c} onChange={(next: CurrencyCode) => setAll(switchCpcCurrency(s, next, touched))} />
              </div>
              {find ? (
                <>
                  <InputCurrency
                    label="Ad spend"
                    help="What you spent on the ads. Example values — use your own numbers."
                    currency={c}
                    value={s.spend}
                    onChange={(v) => update('spend', v)}
                    error={errors.spend}
                  />
                  <InputNumber
                    label="Clicks"
                    help="Clicks the ads got for that spend."
                    value={s.clicks}
                    onChange={(v) => update('clicks', v)}
                    suffix="clicks"
                    grouping
                    error={errors.clicks}
                  />
                </>
              ) : (
                <>
                  <InputCurrency
                    label="Budget"
                    help="What you plan to spend. Example value."
                    currency={c}
                    value={s.budget}
                    onChange={(v) => update('budget', v)}
                    error={errors.budget}
                  />
                  <InputCurrency
                    label="Cost per click"
                    help="From your ad account, or the CPC you expect. Example value."
                    currency={c}
                    value={s.cpc}
                    onChange={(v) => update('cpc', v)}
                    error={errors.cpc}
                  />
                </>
              )}
              <div className="sm:col-span-2">
                <InputNumber
                  optional
                  label="Conversion rate (optional)"
                  help="Clicks that become a sale, lead or sign-up. 0 = off."
                  value={s.conv}
                  onChange={(v) => update('conv', v)}
                  suffix="%"
                  error={errors.conv}
                />
              </div>
            </div>
          </InputsPanel>
        }
        result={
          r ? (
            find ? (
              <ResultCard
                label={label}
                value={money(r.cpc)}
                unit={`per click · ${formatNumber(s.clicks)} clicks for ${money(s.spend)} · ${c}`}
                rows={conversionRows(r)}
                footnote={r.conversions === null ? <p>Add a conversion rate to see your cost per conversion.</p> : undefined}
              />
            ) : (
              <ResultCard
                label={label}
                value={formatClicks(r.clicks)}
                unit={`for ${money(s.budget)} at ${money(s.cpc)} a click`}
                rows={conversionRows(r)}
                footnote={
                  <p>
                    {Number.isInteger(Number(r.clicks.toPrecision(12)))
                      ? 'Your ad platform may spend a little more or less than the budget.'
                      : 'Rounded down: you can’t buy part of a click.'}
                  </p>
                }
              />
            )
          ) : (
            <ResultCard label={label} value="" unit="" rows={[]} error={FIX_FIELDS} />
          )
        }
      />

      {find ? (
        <ScenarioCompare
          title="Compare two campaigns"
          aName="Campaign A (your inputs)"
          bName="Campaign B"
          toolSlug={SLUG}
          error={!r || !rb ? FIX_FIELDS : undefined}
          planA={
            <dl className="type-small grid grid-cols-2 gap-y-2">
              <dt className="text-ink-muted">Ad spend</dt>
              <dd className="text-right font-[550] tabular-nums">{money(s.spend)}</dd>
              <dt className="text-ink-muted">Clicks</dt>
              <dd className="text-right font-[550] tabular-nums">{formatNumber(s.clicks)}</dd>
              <dt className="text-ink-muted">Conversion rate</dt>
              <dd className="text-right font-[550] tabular-nums">{formatNumber(calc.conv, 2)}%</dd>
              <dd className="col-span-2 mt-2 text-ink-muted">Change these in the calculator above.</dd>
            </dl>
          }
          planB={
            <>
              <InputCurrency label="Ad spend" currency={c} value={b.spend} onChange={(v) => setB('spend', v)} error={bErrors.spend} />
              <InputNumber label="Clicks" value={b.clicks} onChange={(v) => setB('clicks', v)} grouping error={bErrors.clicks} />
              <InputNumber optional label="Conversion rate" value={b.conv} onChange={(v) => setB('conv', v)} suffix="%" error={bErrors.conv} />
            </>
          }
          rows={
            r && rb
              ? [
                  { label: 'Cost per click', a: money(r.cpc), b: money(rb.cpc), better: r.cpc < rb.cpc ? 'a' : rb.cpc < r.cpc ? 'b' : undefined },
                  ...(r.costPerConversion !== null && rb.costPerConversion !== null
                    ? [
                        {
                          label: 'Cost per conversion',
                          a: money(r.costPerConversion),
                          b: money(rb.costPerConversion),
                          better:
                            r.costPerConversion < rb.costPerConversion
                              ? ('a' as const)
                              : rb.costPerConversion < r.costPerConversion
                                ? ('b' as const)
                                : undefined,
                        },
                      ]
                    : []),
                ]
              : []
          }
        />
      ) : null}
    </div>
  );
}
