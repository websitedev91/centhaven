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
import { formatConversions } from '@/tools/cpc-calculator/calc';
import { formatPct } from '@/tools/margin-vs-markup-calculator/calc';
import { conversionRate, formatVisitors, formatVisitorsEach, type ConversionMode } from './calc';
import {
  OPTIONAL,
  conversionDefaults,
  conversionErrors,
  conversionSchema,
  conversionVariant,
  planBDefaults,
  planBErrors,
  planBSchema,
  switchConversionCurrency,
  toCalcInput,
  type ConversionState,
} from './schema';

const SLUG = 'conversion-rate-calculator';
const FIX_FIELDS = 'Check the highlighted fields to see your result.';

const MODE_OPTIONS: readonly { value: ConversionMode; label: string }[] = [
  { value: 'rate', label: 'Find my rate' },
  { value: 'conversions', label: 'Conversions needed' },
  { value: 'visitors', label: 'Visitors needed' },
];
const LABEL: Record<ConversionMode, string> = {
  rate: 'Conversion rate',
  conversions: 'Conversions at your target',
  visitors: 'Visitors needed',
};

export default function ConversionRateCalculator() {
  const { state: s, setField, setAll, reset, touched } = useUrlState(conversionSchema, conversionDefaults, { variant: conversionVariant });
  const { state: b, setField: setB } = useUrlState(planBSchema, planBDefaults, { prefix: 'b_' });
  const tracked = useRef(false);

  function update<K extends keyof ConversionState>(key: K, value: ConversionState[K]) {
    setField(key, value);
    if (!tracked.current) {
      tracked.current = true;
      track('calculate', { tool: SLUG });
    }
  }

  const c = s.currency;
  const money = (n: number) => formatMoney(n, c);
  const errors = conversionErrors(s);
  const { blocking, calc } = optionalOff(s, errors, OPTIONAL);
  const r = Object.keys(blocking).length > 0 ? null : conversionRate(toCalcInput(calc));
  const mode = s.mode;
  const label = LABEL[mode];
  const bErrors = planBErrors(b);
  const rb = r && mode === 'rate' && Object.keys(bErrors).length === 0 ? conversionRate(toCalcInput({ ...calc, ...b, mode: 'rate' })) : null;

  const rows = r
    ? [
        ...(mode !== 'rate' ? [{ label: 'Target conversion rate', value: formatPct(r.rate) }] : []),
        ...(mode === 'visitors' ? [{ label: 'Conversions goal', value: formatConversions(r.conversions) }] : []),
        ...(r.visitorsPerConversion !== null ? [{ label: 'Visitors for each conversion', value: formatVisitorsEach(r.visitorsPerConversion) }] : []),
        ...(r.revenue !== null
          ? [
              { label: 'Revenue', note: `${formatConversions(r.conversions).replace(' (on average)', '')} × ${money(calc.value)}`, value: money(r.revenue) },
              ...(r.revenuePerVisitor !== null ? [{ label: 'Revenue per visitor', value: money(r.revenuePerVisitor) }] : []),
            ]
          : []),
      ]
    : [];

  const main = r ? (mode === 'rate' ? formatPct(r.rate) : mode === 'conversions' ? formatConversions(r.conversions) : formatVisitors(r.visitors)) : '';
  const unit = r
    ? mode === 'rate'
      ? `${formatNumber(s.conv)} conversions from ${formatVisitors(s.visits)}`
      : mode === 'conversions'
        ? `from ${formatVisitors(s.visits)} at ${formatPct(r.rate)}`
        : `to reach ${formatNumber(s.goal)} ${s.goal === 1 ? 'conversion' : 'conversions'} at ${formatPct(r.rate)}`
    : '';

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
                <SegmentedControl<ConversionMode> label="What do you want to know?" value={mode} options={MODE_OPTIONS} onChange={(v) => update('mode', v)} />
              </div>
              {mode !== 'visitors' ? (
                <InputNumber
                  label="Visitors"
                  help="Visitors, sessions or clicks: use the same count as your conversions. Example values."
                  value={s.visits}
                  onChange={(v) => update('visits', v)}
                  suffix="visitors"
                  grouping
                  error={errors.visits}
                />
              ) : (
                <InputNumber
                  label="Conversions goal"
                  help="The sales, leads or sign-ups you want. Example value."
                  value={s.goal}
                  onChange={(v) => update('goal', v)}
                  grouping
                  error={errors.goal}
                />
              )}
              {mode === 'rate' ? (
                <InputNumber
                  label="Conversions"
                  help="Sales, leads or sign-ups from those visitors."
                  value={s.conv}
                  onChange={(v) => update('conv', v)}
                  grouping
                  error={errors.conv}
                />
              ) : (
                <InputNumber
                  label="Target conversion rate"
                  help="Your own target. Example value only."
                  value={s.target}
                  onChange={(v) => update('target', v)}
                  suffix="%"
                  error={errors.target}
                />
              )}
              <CurrencySelect value={c} onChange={(next: CurrencyCode) => setAll(switchConversionCurrency(s, next, touched))} />
              <InputCurrency
                optional
                label="Value per conversion (optional)"
                help="What one sale or lead is worth to you. Example value. 0 = off."
                currency={c}
                value={s.value}
                onChange={(v) => update('value', v)}
                error={errors.value}
              />
            </div>
          </InputsPanel>
        }
        result={
          r ? (
            <ResultCard
              label={label}
              value={main}
              unit={unit}
              rows={rows}
              footnote={
                mode === 'visitors' ? (
                  <p>Rounded up: you need whole visitors to reach the goal.</p>
                ) : r.revenue === null ? (
                  <p>Add a value per conversion to see the revenue.</p>
                ) : undefined
              }
            />
          ) : (
            <ResultCard label={label} value="" unit="" rows={[]} error={FIX_FIELDS} />
          )
        }
      />

      {mode === 'rate' ? (
        <ScenarioCompare
          title="Compare two pages"
          aName="Page A (your inputs)"
          bName="Page B"
          toolSlug={SLUG}
          error={!r || !rb ? FIX_FIELDS : undefined}
          planA={
            <dl className="type-small grid grid-cols-2 gap-y-2">
              <dt className="text-ink-muted">Visitors</dt>
              <dd className="text-right font-[550] tabular-nums">{formatNumber(s.visits)}</dd>
              <dt className="text-ink-muted">Conversions</dt>
              <dd className="text-right font-[550] tabular-nums">{formatNumber(s.conv)}</dd>
              <dd className="col-span-2 mt-2 text-ink-muted">Change these in the calculator above.</dd>
            </dl>
          }
          planB={
            <>
              <InputNumber label="Visitors" value={b.visits} onChange={(v) => setB('visits', v)} grouping error={bErrors.visits} />
              <InputNumber label="Conversions" value={b.conv} onChange={(v) => setB('conv', v)} grouping error={bErrors.conv} />
            </>
          }
          rows={
            r && rb
              ? [
                  { label: 'Conversion rate', a: formatPct(r.rate), b: formatPct(rb.rate), better: r.rate > rb.rate ? 'a' : rb.rate > r.rate ? 'b' : undefined },
                  ...(r.revenuePerVisitor !== null && rb.revenuePerVisitor !== null
                    ? [
                        {
                          label: 'Revenue per visitor',
                          a: money(r.revenuePerVisitor),
                          b: money(rb.revenuePerVisitor),
                          better:
                            r.revenuePerVisitor > rb.revenuePerVisitor
                              ? ('a' as const)
                              : rb.revenuePerVisitor > r.revenuePerVisitor
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
