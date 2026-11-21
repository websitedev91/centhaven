'use client';

import { useRef } from 'react';
import { secondaryButtonClass } from '@/components/actionButtonClass';
import { CalculatorGrid, InputsPanel } from '@/components/CalculatorGrid';
import { CurrencySelect } from '@/components/CurrencySelect';
import { InputCurrency } from '@/components/InputCurrency';
import { InputNumber } from '@/components/InputNumber';
import { PlusIcon, ResetIcon, TrashIcon } from '@/components/icons';
import { ResultCard } from '@/components/ResultCard';
import { SelectField } from '@/components/SelectField';
import { track } from '@/lib/analytics';
import { formatMoney, formatNumber, type CurrencyCode } from '@/lib/format';
import { useUrlState } from '@/lib/url-state';
import { formatPct } from '@/tools/margin-vs-markup-calculator/calc';
import { PER, UNITS, itemNames, unitPrices, type Per, type Unit } from './calc';
import {
  MAX_ITEMS,
  MIN_ITEMS,
  ROWS,
  addRow,
  keysFrom,
  kindOfState,
  perOf,
  removeRow,
  shownRows,
  switchUnitCurrency,
  toItems,
  unitDefaults,
  unitErrors,
  unitSchema,
  unitVariant,
  type UnitState,
} from './schema';

const SLUG = 'unit-price-calculator';
const FIX_FIELDS = 'Check the highlighted fields to compare the items.';
const LABEL = 'Cheapest per unit';

const UNIT_OPTIONS = (Object.keys(UNITS) as Unit[]).map((u) => ({ value: u, label: UNITS[u].label }));

export default function UnitPriceCalculator() {
  const { state: s, setField, setAll, reset, touched, markTouched } = useUrlState(unitSchema, unitDefaults, { variant: unitVariant });
  const tracked = useRef(false);

  function touch() {
    if (!tracked.current) {
      tracked.current = true;
      track('calculate', { tool: SLUG });
    }
  }
  function update<K extends keyof UnitState>(key: K, value: UnitState[K]) {
    setField(key, value);
    touch();
  }

  const c = s.currency;
  const money = (n: number) => formatMoney(n, c);
  const n = shownRows(s);
  const errors = unitErrors(s);
  const per = perOf(s);
  const kind = kindOfState(s);
  const perOptions = (Object.keys(PER) as Per[]).filter((p) => PER[p].kind === kind).map((p) => ({ value: p, label: PER[p].label }));
  const items = toItems(s);
  const r = Object.keys(errors).length > 0 ? null : unitPrices(items, per);
  const perLabel = PER[per].label;

  function remove(i: number) {
    const next = removeRow(s, i);
    setAll(next);
    markTouched(keysFrom(i, next.rows));
    touch();
  }

  return (
    <div className="flex flex-col gap-6">
      <CalculatorGrid
        inputs={
          <InputsPanel
            label="Your items"
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
              <div className="grid gap-x-6 gap-y-7 sm:grid-cols-2">
                <CurrencySelect value={c} onChange={(next: CurrencyCode) => setAll(switchUnitCurrency(s, next, touched))} />
                <SelectField<Per> label="Show price" value={per} options={perOptions} onChange={(v) => update('per', v)} />
              </div>
              {ROWS.slice(0, n).map((k, i) => (
                <fieldset key={k.p} className="flex flex-col gap-4 rounded-field border border-line p-4">
                  <legend className="type-small px-1 font-[550] text-ink">Item {i + 1}</legend>
                  <div className="grid gap-x-4 gap-y-5 sm:grid-cols-3">
                    <InputCurrency label="Price" currency={c} value={s[k.p]} onChange={(v) => update(k.p, v)} error={errors[k.p]} />
                    <InputNumber
                      label="Size"
                      help={i === 0 ? 'The total in the pack, e.g. 6 × 330 ml = 1,980 ml. Example values.' : undefined}
                      value={s[k.q]}
                      onChange={(v) => update(k.q, v)}
                      error={errors[k.q]}
                    />
                    <SelectField<Unit> label="Unit" value={s[k.u]} options={UNIT_OPTIONS} onChange={(v) => update(k.u, v)} />
                  </div>
                  {n > MIN_ITEMS ? (
                    <button
                      type="button"
                      onClick={() => remove(i)}
                      aria-label={`Remove item ${i + 1}`}
                      className="no-print type-small inline-flex items-center gap-1.5 self-start font-[550] text-ink-muted hover:text-danger"
                    >
                      <TrashIcon size={16} />
                      Remove
                    </button>
                  ) : null}
                </fieldset>
              ))}
              {n < MAX_ITEMS ? (
                <button
                  type="button"
                  onClick={() => {
                    setAll(addRow(s));
                    touch();
                  }}
                  className={`no-print self-start ${secondaryButtonClass}`}
                >
                  <PlusIcon size={16} />
                  Add an item
                </button>
              ) : (
                <p className="type-small text-ink-muted">Up to {MAX_ITEMS} items.</p>
              )}
            </div>
          </InputsPanel>
        }
        result={
          r ? (
            <ResultCard
              label={LABEL}
              value={itemNames(r.cheapest)}
              unit={`${money(r.shown[r.cheapest[0]!]!)} ${perLabel}`}
              rows={items.map((it, i) => ({
                label: `Item ${i + 1}`,
                note: `${money(it.price)} for ${formatNumber(it.quantity, 3)} ${UNITS[it.unit].label}`,
                value: `${money(r.shown[i]!)} ${perLabel} · ${r.cheapest.includes(i) ? 'Cheapest' : `${formatPct(r.more[i]!)} more per unit`}`,
              }))}
              footnote={
                <p className="font-[550]">
                  {r.saving
                    ? `Buying ${itemNames([r.saving.to])} instead of ${itemNames([r.saving.from])} saves ${formatPct(r.saving.fraction)} per unit.`
                    : `${itemNames(r.cheapest)} cost the same per unit.`}
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
