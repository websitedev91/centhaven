'use client';

import { useRef } from 'react';
import { secondaryButtonClass } from '@/components/actionButtonClass';
import { CalculatorGrid, InputsPanel } from '@/components/CalculatorGrid';
import { CurrencySelect } from '@/components/CurrencySelect';
import { InputCurrency } from '@/components/InputCurrency';
import { InputNumber } from '@/components/InputNumber';
import { PlusIcon, ResetIcon, TrashIcon } from '@/components/icons';
import { ResultCard } from '@/components/ResultCard';
import { ScenarioCompare } from '@/components/ScenarioCompare';
import { SegmentedControl } from '@/components/SegmentedControl';
import { SplitBar } from '@/components/SplitBar';
import { track } from '@/lib/analytics';
import { CATEGORICAL } from '@/lib/chart-palette';
import { formatMoney, formatNumber, type CurrencyCode } from '@/lib/format';
import { useUrlState } from '@/lib/url-state';
import { meetingCost } from './calc';
import {
  MAX_ROWS,
  ROW_KEYS,
  addRow,
  fieldErrors,
  meetingDefaults,
  meetingErrors,
  meetingSchema,
  meetingVariant,
  planBDefaults,
  planBInput,
  planBSchema,
  removeRow,
  switchMeetingCurrency,
  toCalcInput,
  type MeetingState,
} from './schema';

const SLUG = 'meeting-cost-calculator';
const FIX_FIELDS = 'Check the highlighted fields to see your result.';

const MODE_OPTIONS = [
  { value: 'same', label: 'Same rate for everyone' },
  { value: 'each', label: 'Rate per person' },
] as const;
const REPEAT_OPTIONS = [
  { value: 'once', label: 'One-off' },
  { value: 'repeats', label: 'Repeats' },
] as const;

const minutesText = (n: number) => `${formatNumber(n)} ${n === 1 ? 'minute' : 'minutes'}`;

export default function MeetingCostCalculator() {
  const { state: s, setField, setAll, reset, touched, markTouched } = useUrlState(meetingSchema, meetingDefaults, { variant: meetingVariant });
  const { state: b, setField: setB } = useUrlState(planBSchema, planBDefaults, { prefix: 'b_' });
  const tracked = useRef(false);

  function touch() {
    if (!tracked.current) {
      tracked.current = true;
      track('calculate', { tool: SLUG });
    }
  }
  function update<K extends keyof MeetingState>(key: K, value: MeetingState[K]) {
    setField(key, value);
    touch();
  }

  const c = s.currency;
  const money = (n: number) => formatMoney(n, c);
  const errors = meetingErrors(s);
  const input = Object.keys(errors).length === 0 ? toCalcInput(s) : null;
  const r = input ? meetingCost(input) : null;
  const bErrors = fieldErrors(planBSchema, b);
  const rb = input && Object.keys(bErrors).length === 0 ? meetingCost(planBInput(input, b)) : null;
  const each = s.mode === 'each';
  const repeats = s.rep === 'repeats';
  const rowCount = Math.min(MAX_ROWS, Math.max(1, Number.isInteger(s.rows) ? s.rows : 1));

  return (
    <div className="flex flex-col gap-6">
      <CalculatorGrid
        inputs={
          <InputsPanel
            label="Your meeting"
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
                <SegmentedControl label="Hourly cost" value={s.mode} options={MODE_OPTIONS} onChange={(v) => update('mode', v)} />
              </div>
              <div className="sm:col-span-2">
                <CurrencySelect value={c} onChange={(next: CurrencyCode) => setAll(switchMeetingCurrency(s, next, touched))} />
              </div>
              {each ? (
                <fieldset className="flex flex-col gap-4 sm:col-span-2">
                  <legend className="type-small float-left mb-1 w-full font-[550] text-ink">People and hourly costs</legend>
                  <p className="type-small text-ink-muted">
                    Hourly pay, or pay plus other employment costs if you know them. Example values — use your own numbers.
                  </p>
                  <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                    {ROW_KEYS.slice(0, rowCount).map((k, i) => (
                      <div key={k} className="flex items-end gap-2">
                        <div className="min-w-0 flex-1">
                          <InputCurrency label={`Person ${i + 1}`} currency={c} value={s[k]} onChange={(v) => update(k, v)} error={errors[k]} />
                        </div>
                        {rowCount > 1 ? (
                          <button
                            type="button"
                            onClick={() => {
                              setAll(removeRow(s, i));
                              // Rows after the removed one moved up: keep their typed values on a currency switch.
                              markTouched(ROW_KEYS.slice(i));
                              touch();
                            }}
                            aria-label={`Remove person ${i + 1}`}
                            className="no-print mb-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-field border border-line bg-surface text-ink-muted hover:border-haven hover:text-haven"
                          >
                            <TrashIcon size={18} />
                          </button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                  {rowCount < MAX_ROWS ? (
                    <button
                      type="button"
                      onClick={() => {
                        setAll(addRow(s));
                        touch();
                      }}
                      className={`no-print self-start ${secondaryButtonClass}`}
                    >
                      <PlusIcon size={16} />
                      Add a person
                    </button>
                  ) : (
                    <p className="type-small text-ink-muted">Up to {MAX_ROWS} people. For bigger meetings, use the same rate for everyone.</p>
                  )}
                </fieldset>
              ) : (
                <>
                  <InputNumber
                    label="Number of people"
                    value={s.people}
                    onChange={(v) => update('people', v)}
                    suffix="people"
                    grouping
                    error={errors.people}
                  />
                  <InputCurrency
                    label="Hourly cost per person"
                    help="Hourly pay, or pay plus other employment costs if you know them. Example value."
                    currency={c}
                    value={s.rate}
                    onChange={(v) => update('rate', v)}
                    error={errors.rate}
                  />
                </>
              )}
              <div className="sm:col-span-2">
                <InputNumber label="Length" value={s.min} onChange={(v) => update('min', v)} suffix="minutes" error={errors.min} />
              </div>
              <div className="sm:col-span-2">
                <SegmentedControl label="How often" value={s.rep} options={REPEAT_OPTIONS} onChange={(v) => update('rep', v)} />
              </div>
              {repeats ? (
                <>
                  <InputNumber
                    label="Meetings per week"
                    help="0.5 = every two weeks, 5 = every weekday."
                    value={s.perWeek}
                    onChange={(v) => update('perWeek', v)}
                    suffix="a week"
                    error={errors.perWeek}
                  />
                  <InputNumber
                    label="Weeks a year it runs"
                    help="Example value — leave out holidays if the meeting stops for them."
                    value={s.weeks}
                    onChange={(v) => update('weeks', v)}
                    suffix="weeks"
                    error={errors.weeks}
                  />
                </>
              ) : null}
            </div>
          </InputsPanel>
        }
        result={
          r ? (
            <ResultCard
              label={repeats ? 'Yearly cost of this meeting' : 'Cost of this meeting'}
              value={money(repeats ? r.yearly! : r.meetingCost)}
              unit={repeats ? `${formatNumber(s.perWeek, 2)} a week × ${formatNumber(s.weeks)} weeks · ${c}` : `${minutesText(s.min)} · ${c}`}
              rows={[
                ...(repeats
                  ? [
                      { label: 'Each meeting', value: money(r.meetingCost) },
                      { label: 'Per week', value: money(r.weekly!) },
                    ]
                  : []),
                { label: 'Cost per minute', value: money(r.perMinute) },
                { label: 'Person-hours', note: `${formatNumber(r.people)} ${r.people === 1 ? 'person' : 'people'}`, value: formatNumber(r.personHours, 1) },
                { label: 'Hourly cost of everyone in the room', value: money(r.hourlyTotal) },
              ]}
              footnote={<p>Counts meeting time only, from the hourly costs you enter.</p>}
            />
          ) : (
            <ResultCard label={repeats ? 'Yearly cost of this meeting' : 'Cost of this meeting'} value="" unit="" rows={[]} error={FIX_FIELDS} />
          )
        }
      />

      {r && each && r.meetingCost > 0 ? (
        <SplitBar
          title="Each person's share"
          description={`${money(r.meetingCost)} for one ${minutesText(s.min)} meeting.`}
          parts={r.shares.map((v, i) => ({
            key: `p${i + 1}`,
            label: `Person ${i + 1}`,
            value: v,
            display: money(v),
            color: CATEGORICAL[i % CATEGORICAL.length]!,
          }))}
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
            <dt className="text-ink-muted">People</dt>
            <dd className="text-right font-[550] tabular-nums">{r ? formatNumber(r.people) : '—'}</dd>
            <dt className="text-ink-muted">Length</dt>
            <dd className="text-right font-[550] tabular-nums">{minutesText(s.min)}</dd>
            <dd className="col-span-2 mt-2 text-ink-muted">Change these in the calculator above. Plan B uses the same average hourly cost.</dd>
          </dl>
        }
        planB={
          <>
            <InputNumber label="People" value={b.people} onChange={(v) => setB('people', v)} grouping error={bErrors.people} />
            <InputNumber label="Length" value={b.min} onChange={(v) => setB('min', v)} suffix="minutes" error={bErrors.min} />
          </>
        }
        rows={
          r && rb
            ? [
                {
                  label: 'Each meeting',
                  a: money(r.meetingCost),
                  b: money(rb.meetingCost),
                  better: r.meetingCost < rb.meetingCost ? 'a' : rb.meetingCost < r.meetingCost ? 'b' : undefined,
                },
                ...(r.yearly !== null && rb.yearly !== null
                  ? [
                      {
                        label: 'Per year',
                        a: money(r.yearly),
                        b: money(rb.yearly),
                        better: r.yearly < rb.yearly ? ('a' as const) : rb.yearly < r.yearly ? ('b' as const) : undefined,
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
