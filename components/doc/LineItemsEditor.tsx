'use client';

import { InputCurrency } from '../InputCurrency';
import { InputNumber } from '../InputNumber';
import { ArrowDownIcon, ArrowUpIcon, PlusIcon, TrashIcon } from '../icons';
import { secondaryButtonClass } from '../actionButtonClass';
import { Num } from '../Num';
import { TextField } from './TextField';
import { DOC_LIMITS, moveItem, newItemId, type DocErrors, type LineItem } from '@/lib/doc-schema';
import { formatMoney, type CurrencyCode } from '@/lib/format';

const iconButton =
  'inline-flex h-10 w-10 items-center justify-center rounded-field border border-line bg-surface text-ink-muted hover:border-haven hover:text-haven disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line disabled:hover:text-ink-muted';

/**
 * Line items for the quote and invoice generators: description, quantity (or hours), rate and
 * the rounded line amount. Rows can be added, removed and moved with labelled buttons
 * (keyboard-operable; each button names its row for screen readers).
 */
export function LineItemsEditor(props: {
  items: readonly LineItem[];
  /** Rounded line totals from lib/doc-calc.ts, same order as `items`. */
  lineTotals: readonly number[];
  currency: CurrencyCode;
  errors: DocErrors;
  onChange: (items: LineItem[]) => void;
  /** Rate for a newly added row. */
  newRate: number;
}) {
  const { items, lineTotals, currency, errors, onChange, newRate } = props;
  const set = (i: number, patch: Partial<LineItem>) => onChange(items.map((it, j) => (j === i ? { ...it, ...patch } : it)));
  const full = items.length >= DOC_LIMITS.items;

  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="type-h3 mb-4 text-ink">Line items</legend>
      <ol className="flex flex-col gap-4">
        {items.map((it, i) => {
          const name = it.desc.trim() || `Item ${i + 1}`;
          return (
            <li key={it.id} className="@container rounded-field border border-line bg-paper p-4">
              <div className="grid grid-cols-2 gap-4 @lg:grid-cols-[minmax(0,1fr)_7.5rem_9.5rem]">
                <div className="col-span-2 @lg:col-span-1">
                <TextField
                  label={`Item ${i + 1}: description`}
                  value={it.desc}
                  onChange={(desc) => set(i, { desc })}
                  maxLength={DOC_LIMITS.desc}
                  placeholder="What you'll deliver"
                />
                </div>
                <InputNumber label="Qty / hours" value={it.qty} onChange={(qty) => set(i, { qty })} error={errors[`${it.id}.qty`]} />
                <InputCurrency label="Rate" currency={currency} value={it.rate} onChange={(rate) => set(i, { rate })} error={errors[`${it.id}.rate`]} />
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p className="type-small text-ink-muted">
                  Amount: <span className="font-[550] tabular-nums text-ink"><Num>{formatMoney(lineTotals[i] ?? 0, currency)}</Num></span>
                </p>
                <div className="flex gap-2">
                  <button type="button" className={iconButton} disabled={i === 0} onClick={() => onChange(moveItem(items, i, -1))} aria-label={`Move ${name} up`}>
                    <ArrowUpIcon size={18} />
                  </button>
                  <button
                    type="button"
                    className={iconButton}
                    disabled={i === items.length - 1}
                    onClick={() => onChange(moveItem(items, i, 1))}
                    aria-label={`Move ${name} down`}
                  >
                    <ArrowDownIcon size={18} />
                  </button>
                  <button
                    type="button"
                    className={iconButton}
                    disabled={items.length === 1}
                    onClick={() => onChange(items.filter((_, j) => j !== i))}
                    aria-label={`Remove ${name}`}
                  >
                    <TrashIcon size={18} />
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className={secondaryButtonClass}
          disabled={full}
          onClick={() => onChange([...items, { id: newItemId(items), desc: '', qty: 1, rate: newRate }])}
        >
          <PlusIcon size={18} />
          Add a line
        </button>
        {full ? <p className="type-small text-ink-muted">Up to {DOC_LIMITS.items} lines.</p> : null}
      </div>
    </fieldset>
  );
}
