'use client';

import { useRef } from 'react';
import { CalculatorGrid, InputsPanel } from '@/components/CalculatorGrid';
import { CurrencySelect } from '@/components/CurrencySelect';
import { InputCurrency } from '@/components/InputCurrency';
import { InputNumber } from '@/components/InputNumber';
import { ResetIcon } from '@/components/icons';
import { Num } from '@/components/Num';
import { ResultCard } from '@/components/ResultCard';
import { ScenarioCompare } from '@/components/ScenarioCompare';
import { SegmentedControl } from '@/components/SegmentedControl';
import { useEmbed } from '@/components/EmbedMode';
import { track } from '@/lib/analytics';
import { optionalOff } from '@/lib/field-errors';
import { formatMoney, type CurrencyCode } from '@/lib/format';
import { useUrlState } from '@/lib/url-state';
import { formatPct } from '@/tools/margin-vs-markup-calculator/calc';
import { compaRatio, formatRatio, midpointOf, position, rangePenetration, type MidpointFrom, type Position } from './calc';
import {
  compaDefaults,
  compaErrors,
  compaSchema,
  compaVariant,
  fieldErrors,
  optionalFields,
  planBDefaults,
  planBSchema,
  rangeOf,
  switchCompaCurrency,
  type CompaState,
} from './schema';

const SLUG = 'compa-ratio-calculator';
const FIX_FIELDS = 'Check the highlighted fields to see your result.';
const LABEL = 'Compa ratio';

const MID_OPTIONS: readonly { value: MidpointFrom; label: string }[] = [
  { value: 'range', label: 'The range' },
  { value: 'own', label: 'My own midpoint' },
];

export default function CompaRatioCalculator() {
  const { state: s, setField, setAll, reset, touched } = useUrlState(compaSchema, compaDefaults, { variant: compaVariant });
  const { state: b, setField: setB } = useUrlState(planBSchema, planBDefaults, { prefix: 'b_' });
  const tracked = useRef(false);

  function update<K extends keyof CompaState>(key: K, value: CompaState[K]) {
    setField(key, value);
    if (!tracked.current) {
      tracked.current = true;
      track('calculate', { tool: SLUG });
    }
  }

  const c = s.currency;
  const money = (n: number) => formatMoney(n, c);
  const errors = compaErrors(s);
  const { blocking, calc } = optionalOff(s, errors, optionalFields(s));
  const ok = Object.keys(blocking).length === 0;
  const own = s.mid === 'own';
  const range = ok ? rangeOf(calc) : null;
  const midpoint = ok ? (own ? calc.midpoint : midpointOf(calc.min, calc.max)) : 0;
  const ratio = ok ? compaRatio(calc.salary, midpoint) : 0;
  const pen = range ? rangePenetration(calc.salary, range.min, range.max) : null;
  const pos = ok ? position(calc.salary, midpoint, range) : null;
  const diff = calc.salary - midpoint;

  const bErrors = fieldErrors(planBSchema, b);
  const bSalary = ok && Object.keys(bErrors).length === 0 ? calc.salary * (1 + b.raise / 100) : null;

  const positionText = (p: Position, d: number) =>
    p === 'below-range'
      ? `Below the bottom of the range, ${money(Math.abs(d))} below the midpoint`
      : p === 'above-range'
        ? `Above the top of the range, ${money(Math.abs(d))} above the midpoint`
        : p === 'at-mid'
          ? 'At the midpoint'
          : `${money(Math.abs(d))} ${p === 'below-mid' ? 'below' : 'above'} the midpoint`;

  return (
    <div className="flex flex-col gap-6">
      <CalculatorGrid
        inputs={
          <InputsPanel
            label="Your salary and range"
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
                <SegmentedControl<MidpointFrom> label="Midpoint from" value={s.mid} options={MID_OPTIONS} onChange={(v) => update('mid', v)} />
              </div>
              <CurrencySelect value={c} onChange={(next: CurrencyCode) => setAll(switchCompaCurrency(s, next, touched))} />
              <InputCurrency
                label="Salary"
                help="The salary you're checking: yours, an offer or an employee's."
                currency={c}
                value={s.salary}
                onChange={(v) => update('salary', v)}
                error={errors.salary}
              />
              {own ? (
                <div className="sm:col-span-2">
                  <InputCurrency
                    label="Midpoint"
                    help="From your employer's pay band. Must be above 0. Example value only."
                    currency={c}
                    value={s.midpoint}
                    onChange={(v) => update('midpoint', v)}
                    error={errors.midpoint}
                  />
                </div>
              ) : null}
              <InputCurrency
                optional={own}
                label={own ? 'Range minimum (optional)' : 'Range minimum'}
                help="From the pay band or job posting. Example values only."
                currency={c}
                value={s.min}
                onChange={(v) => update('min', v)}
                error={errors.min}
              />
              <InputCurrency
                optional={own}
                label={own ? 'Range maximum (optional)' : 'Range maximum'}
                help={own ? 'Add the range to see range penetration. 0 = no range.' : 'Must be above the minimum.'}
                currency={c}
                value={s.max}
                onChange={(v) => update('max', v)}
                error={errors.max}
              />
            </div>
          </InputsPanel>
        }
        result={
          ok && pos ? (
            <ResultCard
              label={LABEL}
              value={formatRatio(ratio)}
              unit={`${formatPct(ratio)} of the midpoint`}
              rows={[
                { label: 'Midpoint', note: own ? 'The midpoint you entered' : `Halfway between ${money(calc.min)} and ${money(calc.max)}`, value: money(midpoint) },
                { label: 'Difference from the midpoint', value: pos === 'at-mid' ? 'At the midpoint' : `${diff < 0 ? '−' : '+'}${money(Math.abs(diff))}` },
                pen !== null
                  ? { label: 'Range penetration', note: 'How far the salary is from the bottom of the range to the top', value: formatPct(pen) }
                  : { label: 'Range penetration', note: 'Add the range minimum and maximum to see range penetration', value: '—' },
              ]}
              footnote={<p className="font-[550]">{positionText(pos, diff)}.</p>}
            />
          ) : (
            <ResultCard label={LABEL} value="" unit="" rows={[]} error={FIX_FIELDS} />
          )
        }
      />

      {ok && range && calc.salary >= range.min && calc.salary <= range.max ? (
        <RangeBar min={range.min} max={range.max} midpoint={midpoint} salary={calc.salary} money={money} />
      ) : null}

      <ScenarioCompare
        title="Compare two salaries"
        aName="Salary A (your inputs)"
        bName="Salary B"
        toolSlug={SLUG}
        error={!ok || bSalary === null ? FIX_FIELDS : undefined}
        planA={
          <dl className="type-small grid grid-cols-2 gap-y-2">
            <dt className="text-ink-muted">Salary</dt>
            <dd className="text-right font-[550] tabular-nums">{money(calc.salary)}</dd>
            <dd className="col-span-2 mt-2 text-ink-muted">Salary B is this salary after a raise, in the same range.</dd>
          </dl>
        }
        planB={<InputNumber label="Raise" value={b.raise} onChange={(v) => setB('raise', v)} suffix="%" error={bErrors.raise} />}
        rows={
          ok && bSalary !== null
            ? [
                { label: 'Salary', a: money(calc.salary), b: money(bSalary) },
                { label: 'Compa ratio', a: formatRatio(ratio), b: formatRatio(compaRatio(bSalary, midpoint)) },
                ...(range
                  ? [{ label: 'Range penetration', a: formatPct(pen!), b: formatPct(rangePenetration(bSalary, range.min, range.max)) }]
                  : []),
              ]
            : []
        }
      />
    </div>
  );
}

/** Minimum → midpoint → maximum, with the salary marked (plain HTML/CSS, like SplitBar). */
function RangeBar(props: { min: number; max: number; midpoint: number; salary: number; money: (n: number) => string }) {
  const { min, max, midpoint, salary, money } = props;
  const embed = useEmbed();
  if (embed) return null;
  const at = (v: number) => `${Math.min(100, Math.max(0, ((v - min) / (max - min)) * 100))}%`;
  return (
    <figure className="print-break-avoid rounded-panel border border-line bg-surface p-5 sm:p-8">
      <figcaption className="type-h3 text-ink">Where the salary sits in the range</figcaption>
      <p className="type-small mt-1 text-ink-muted">
        {money(salary)} in a range of {money(min)} to {money(max)}.
      </p>
      <div className="relative mb-10 mt-12" aria-hidden="true">
        <div className="h-3 rounded-pill bg-mint" />
        <div className="absolute -top-2 h-7 w-0.5 bg-ink-muted" style={{ left: `calc(${at(midpoint)} - 1px)` }} />
        <span className="type-small absolute top-6 -translate-x-1/2 whitespace-nowrap text-ink-muted" style={{ left: at(midpoint) }}>
          Midpoint
        </span>
        <div
          className="absolute -top-1.5 h-6 w-6 -translate-x-1/2 rounded-pill border-[3px] border-white bg-haven"
          style={{ left: at(salary) }}
        />
        <span className="type-small absolute -top-9 -translate-x-1/2 whitespace-nowrap font-[650] text-ink" style={{ left: at(salary) }}>
          <Num>{money(salary)}</Num>
        </span>
      </div>
      <table className="type-small w-full max-w-md">
        <caption className="sr-only">The pay range</caption>
        <tbody>
          {(
            [
              ['Range minimum', min],
              ['Midpoint', midpoint],
              ['Range maximum', max],
              ['Salary', salary],
            ] as const
          ).map(([k, v]) => (
            <tr key={k} className="border-b border-line first:border-t">
              <th scope="row" className="py-2.5 pr-3 text-left font-normal text-ink">
                {k}
              </th>
              <td className="py-2.5 text-right font-[550] tabular-nums text-ink">
                <Num>{money(v)}</Num>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
