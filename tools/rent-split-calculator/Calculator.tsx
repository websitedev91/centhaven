'use client';

import { useRef } from 'react';
import { secondaryButtonClass } from '@/components/actionButtonClass';
import { CalculatorGrid, InputsPanel } from '@/components/CalculatorGrid';
import { CurrencySelect } from '@/components/CurrencySelect';
import { InputCurrency } from '@/components/InputCurrency';
import { InputNumber } from '@/components/InputNumber';
import { PlusIcon, ResetIcon, TrashIcon } from '@/components/icons';
import { ResultCard } from '@/components/ResultCard';
import { SegmentedControl } from '@/components/SegmentedControl';
import { SelectField } from '@/components/SelectField';
import { track } from '@/lib/analytics';
import { optionalOff } from '@/lib/field-errors';
import { formatMoney, type CurrencyCode } from '@/lib/format';
import { useUrlState } from '@/lib/url-state';
import { formatPct } from '@/tools/margin-vs-markup-calculator/calc';
import { rentSplit, type BillSplit, type SplitMode } from './calc';
import {
  MAX_PEOPLE,
  MIN_PEOPLE,
  OPTIONAL,
  ROWS,
  addRow,
  keysFrom,
  removeRow,
  shownRows,
  splitDefaults,
  splitErrors,
  splitSchema,
  splitVariant,
  switchSplitCurrency,
  toCalcInput,
  type SplitState,
  type Unit,
} from './schema';

const SLUG = 'rent-split-calculator';
const FIX_FIELDS = 'Check the highlighted fields to see each person’s share.';
const LABEL = 'Total to pay each month';

const MODE_OPTIONS: readonly { value: SplitMode; label: string }[] = [
  { value: 'equal', label: 'Equally' },
  { value: 'room', label: 'By room size' },
  { value: 'income', label: 'By income' },
];
const BILL_OPTIONS: readonly { value: BillSplit; label: string }[] = [
  { value: 'equal', label: 'Equally' },
  { value: 'rent', label: 'Same way as rent' },
];
const UNIT_OPTIONS: readonly { value: Unit; label: string }[] = [
  { value: 'sqft', label: 'sq ft' },
  { value: 'm2', label: 'm²' },
];

export default function RentSplitCalculator() {
  const { state: s, setField, setAll, reset, touched, markTouched } = useUrlState(splitSchema, splitDefaults, { variant: splitVariant });
  const tracked = useRef(false);

  function touch() {
    if (!tracked.current) {
      tracked.current = true;
      track('calculate', { tool: SLUG });
    }
  }
  function update<K extends keyof SplitState>(key: K, value: SplitState[K]) {
    setField(key, value);
    touch();
  }

  const c = s.currency;
  const money = (n: number) => formatMoney(n, c);
  const errors = splitErrors(s);
  const { blocking, calc } = optionalOff(s, errors, OPTIONAL);
  const r = Object.keys(blocking).length > 0 ? null : rentSplit(toCalcInput(calc));
  const n = shownRows(s);
  const unit = s.unit === 'm2' ? 'm²' : 'sq ft';
  const hasBills = calc.bills > 0;
  const showBillSplit = s.mode !== 'equal' && s.bills > 0;

  function remove(i: number) {
    const next = removeRow(s, i);
    setAll(next);
    // People after the removed one moved up: keep their typed values on a currency switch.
    markTouched(keysFrom(i, next.rows));
    touch();
  }

  return (
    <div className="flex flex-col gap-6">
      <CalculatorGrid
        inputs={
          <InputsPanel
            label="Your rent and people"
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
              <SegmentedControl<SplitMode> label="Split the rent" value={s.mode} options={MODE_OPTIONS} onChange={(v) => update('mode', v)} />
              <div className="grid gap-x-6 gap-y-7 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <CurrencySelect value={c} onChange={(next: CurrencyCode) => setAll(switchSplitCurrency(s, next, touched))} />
                </div>
                <InputCurrency
                  label="Monthly rent"
                  help="The whole rent for the home. Example value only."
                  currency={c}
                  value={s.rent}
                  onChange={(v) => update('rent', v)}
                  error={errors.rent}
                />
                <InputCurrency
                  optional
                  label="Shared bills per month (optional)"
                  help="Utilities, internet and other shared costs. Example value only. 0 = none."
                  currency={c}
                  value={s.bills}
                  onChange={(v) => update('bills', v)}
                  error={errors.bills}
                />
                {showBillSplit ? (
                  <div className="sm:col-span-2">
                    <SegmentedControl<BillSplit> label="Split bills" value={s.billSplit} options={BILL_OPTIONS} onChange={(v) => update('billSplit', v)} />
                  </div>
                ) : null}
                {s.mode === 'room' ? (
                  <>
                    <InputNumber
                      optional
                      label="Shared space: % of rent split equally (optional)"
                      help="For the kitchen, living room and other shared space. The rest is split by room size. 0 = off."
                      value={s.shared}
                      onChange={(v) => update('shared', v)}
                      suffix="%"
                      error={errors.shared}
                    />
                    <SelectField<Unit>
                      label="Room size unit"
                      help="Use the same unit for every room."
                      value={s.unit}
                      options={UNIT_OPTIONS}
                      onChange={(v) => update('unit', v)}
                    />
                  </>
                ) : null}
              </div>

              {ROWS.slice(0, n).map((k, i) => (
                <fieldset key={k.s} className="flex flex-col gap-4 rounded-field border border-line p-4">
                  <legend className="type-small px-1 font-[550] text-ink">Person {i + 1}</legend>
                  {s.mode === 'room' ? (
                    <InputNumber label="Room size" value={s[k.s]} onChange={(v) => update(k.s, v)} suffix={unit} error={errors[k.s]} />
                  ) : null}
                  {s.mode === 'income' ? (
                    <InputCurrency
                      label="Income"
                      help={i === 0 ? 'Use the same period for everyone, e.g. monthly take-home. Example values only.' : undefined}
                      currency={c}
                      value={s[k.i]}
                      onChange={(v) => update(k.i, v)}
                      error={errors[k.i]}
                    />
                  ) : null}
                  {n > MIN_PEOPLE ? (
                    <button
                      type="button"
                      onClick={() => remove(i)}
                      aria-label={`Remove person ${i + 1}`}
                      className="no-print type-small inline-flex items-center gap-1.5 self-start font-[550] text-ink-muted hover:text-danger"
                    >
                      <TrashIcon size={16} />
                      Remove
                    </button>
                  ) : null}
                </fieldset>
              ))}
              {n < MAX_PEOPLE ? (
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
                <p className="type-small text-ink-muted">Up to {MAX_PEOPLE} people.</p>
              )}
            </div>
          </InputsPanel>
        }
        result={
          r ? (
            <ResultCard
              label={LABEL}
              value={money(r.total)}
              unit={`rent${hasBills ? ' + bills' : ''} · split ${n} ways · ${c}`}
              rows={[
                ...r.people.map((p, i) => ({
                  label: `Person ${i + 1}`,
                  note: [
                    `Rent ${money(p.rent)}`,
                    hasBills ? `bills ${money(p.bills)}` : null,
                    `${formatPct(p.fraction)} of rent`,
                    p.incomeShare !== null ? `${formatPct(p.incomeShare)} of income` : null,
                  ]
                    .filter(Boolean)
                    .join(' · '),
                  value: money(p.total),
                })),
                ...(r.sharedPart !== null && r.roomPart !== null
                  ? [
                      { label: `Shared space (${formatPct(calc.shared / 100)})`, note: 'Split equally', value: money(r.sharedPart) },
                      { label: 'By room size', note: 'The rest of the rent', value: money(r.roomPart) },
                    ]
                  : []),
              ]}
              footnote={
                <p>
                  Each share is rounded down to the cent, then any leftover cents go to Person 1, Person 2 and so on, so the shares add up to the
                  total exactly.
                </p>
              }
            />
          ) : (
            <ResultCard label={LABEL} value="" unit="" rows={[]} error={FIX_FIELDS} />
          )
        }
      />
    </div>
  );
}
