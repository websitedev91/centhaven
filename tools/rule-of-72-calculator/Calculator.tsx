'use client';

import { useRef } from 'react';
import { CalculatorGrid, InputsPanel } from '@/components/CalculatorGrid';
import { InputNumber } from '@/components/InputNumber';
import { ResetIcon } from '@/components/icons';
import { ResultCard } from '@/components/ResultCard';
import { ScenarioCompare } from '@/components/ScenarioCompare';
import { SegmentedControl } from '@/components/SegmentedControl';
import { track } from '@/lib/analytics';
import { useUrlState } from '@/lib/url-state';
import { formatShort, formatYears, rateToDouble, yearsToDouble, type DoubleMode, type DoubleResult } from './calc';
import { doubleDefaults, doubleErrors, doubleSchema, fieldErrors, planBDefaults, planBSchema, type DoubleState } from './schema';

const SLUG = 'rule-of-72-calculator';
const FIX_FIELDS = 'Check the highlighted field to see your result.';

const MODE_OPTIONS: readonly { value: DoubleMode; label: string }[] = [
  { value: 'years', label: 'Years to double' },
  { value: 'rate', label: 'Rate needed' },
];

const pct = (n: number) => `${formatShort(n)}%`;

/** How far the shortcut is from the exact answer, in words (maths only). */
function differenceText(mode: DoubleMode, r: DoubleResult): string {
  const d = r.exact - r.rule;
  const size = formatShort(Math.abs(d));
  if (size === '0') return 'The rule of 72 matches the exact answer to 2 decimals.';
  if (mode === 'years') return `The rule of 72 gives ${size} ${size === '1' ? 'year' : 'years'} ${d > 0 ? 'less' : 'more'} than the exact answer.`;
  return `The rule of 72 gives ${size} percentage ${size === '1' ? 'point' : 'points'} ${d > 0 ? 'less' : 'more'} than the exact answer.`;
}

export default function RuleOf72Calculator() {
  const { state: s, setField, reset } = useUrlState(doubleSchema, doubleDefaults);
  const { state: b, setField: setB } = useUrlState(planBSchema, planBDefaults, { prefix: 'b_' });
  const tracked = useRef(false);

  function update<K extends keyof DoubleState>(key: K, value: DoubleState[K]) {
    setField(key, value);
    if (!tracked.current) {
      tracked.current = true;
      track('calculate', { tool: SLUG });
    }
  }

  const years = s.mode === 'years';
  const errors = doubleErrors(s);
  const r = Object.keys(errors).length > 0 ? null : years ? yearsToDouble(s.rate) : rateToDouble(s.years);
  const show = (n: number) => (years ? formatYears(n) : pct(n));
  const label = years ? 'Years to double (rule of 72)' : 'Rate needed (rule of 72)';

  const bErrors = fieldErrors(planBSchema, b);
  const bError = years ? bErrors.rate : bErrors.years;
  const rb = r && !bError ? (years ? yearsToDouble(b.rate) : rateToDouble(b.years)) : null;

  return (
    <div className="flex flex-col gap-6">
      <CalculatorGrid
        inputs={
          <InputsPanel
            label="Your rate or time frame"
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
              <SegmentedControl<DoubleMode> label="Work out" value={s.mode} options={MODE_OPTIONS} onChange={(v) => update('mode', v)} />
              {years ? (
                <InputNumber
                  label="Yearly rate"
                  help="Your own rate. Example only, not a suggestion."
                  value={s.rate}
                  onChange={(v) => update('rate', v)}
                  suffix="% a year"
                  error={errors.rate}
                />
              ) : (
                <InputNumber
                  label="Years"
                  help="How soon you want the amount to double. Example only."
                  value={s.years}
                  onChange={(v) => update('years', v)}
                  suffix="years"
                  error={errors.years}
                />
              )}
            </div>
          </InputsPanel>
        }
        result={
          r ? (
            <ResultCard
              label={label}
              value={show(r.rule)}
              unit={years ? `to double at ${pct(s.rate)} a year · 72 ÷ ${formatShort(s.rate)}` : `a year to double in ${formatYears(s.years)} · 72 ÷ ${formatShort(s.years)}`}
              rows={[
                {
                  label: 'Exact answer',
                  note: years ? `ln 2 ÷ ln(1 + ${formatShort(s.rate)}%)` : `2 to the power of 1 ÷ ${formatShort(s.years)}, minus 1`,
                  value: show(r.exact),
                },
                { label: 'Rule of 72', note: 'The quick shortcut', value: show(r.rule) },
              ]}
              footnote={
                <>
                  <p className="font-[550]">{differenceText(s.mode, r)}</p>
                  <p className="mt-2">Assumes the rate stays the same every year and growth is added once a year. The answer is the same for any amount.</p>
                </>
              }
            />
          ) : (
            <ResultCard label={label} value="" unit="" rows={[]} error={FIX_FIELDS} />
          )
        }
      />

      <ScenarioCompare
        title={years ? 'Compare two rates' : 'Compare two time frames'}
        aName={years ? 'Rate A (your input)' : 'Time frame A (your input)'}
        bName={years ? 'Rate B' : 'Time frame B'}
        toolSlug={SLUG}
        error={!r || !rb ? FIX_FIELDS : undefined}
        planA={
          <dl className="type-small grid grid-cols-2 gap-y-2">
            <dt className="text-ink-muted">{years ? 'Yearly rate' : 'Years'}</dt>
            <dd className="text-right font-[550] tabular-nums">{years ? pct(s.rate) : formatYears(s.years)}</dd>
          </dl>
        }
        planB={
          years ? (
            <InputNumber label="Yearly rate" value={b.rate} onChange={(v) => setB('rate', v)} suffix="% a year" error={bErrors.rate} />
          ) : (
            <InputNumber label="Years" value={b.years} onChange={(v) => setB('years', v)} suffix="years" error={bErrors.years} />
          )
        }
        rows={
          r && rb
            ? [
                { label: 'Rule of 72', a: show(r.rule), b: show(rb.rule) },
                { label: 'Exact answer', a: show(r.exact), b: show(rb.exact) },
              ]
            : []
        }
      />
    </div>
  );
}
