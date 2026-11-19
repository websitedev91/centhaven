/**
 * Shared shapes and checks for the quote and invoice generators (spec: freelance-quote-generator.md,
 * shared rules). Pure: no React. The draft schemas only check TYPES, so a half-finished draft
 * (e.g. a discount of 150% being typed) still reloads; limits are shown as inline errors instead.
 */
import * as z from 'zod/mini';
import { switchCurrency, type CurrencyPresets } from './currency-defaults';
import type { CurrencyCode } from './format';

export const DOC_LIMITS = {
  items: 30,
  desc: 200,
  qty: 100_000,
  rate: 10_000_000,
  number: 30,
  /** Names, emails, phone numbers, tax IDs, labels. */
  short: 120,
  address: 300,
  notes: 2_000,
  payment: 1_000,
} as const;

/**
 * `rateTyped`: the user edited this line's rate, so a currency switch keeps it even if it equals
 * the example (Puru, 2026-11-19). Optional so drafts saved before it still load.
 */
export const lineItemSchema = z.object({
  id: z.string(),
  desc: z.string(),
  qty: z.number(),
  rate: z.number(),
  rateTyped: z.optional(z.boolean()),
});
export type LineItem = z.infer<typeof lineItemSchema>;

export const fromSchema = z.object({ name: z.string(), email: z.string(), phone: z.string(), address: z.string(), taxId: z.string() });
export type FromParty = z.infer<typeof fromSchema>;
export const emptyFrom: FromParty = { name: '', email: '', phone: '', address: '', taxId: '' };

/** Inline errors, keyed by field name ("discount") or "<item id>.<field>" for line items. */
export type DocErrors = Record<string, string>;

const hasMoreThan2Decimals = (v: number) => Math.abs(Math.round(v * 100) - v * 100) > 1e-6;

function numberError(v: number, max: number, label = ''): string | undefined {
  if (!Number.isFinite(v)) return 'Enter a number';
  if (v < 0) return 'Can’t be negative';
  if (v > max) return `Maximum is ${max.toLocaleString('en-US')}${label}`;
  if (hasMoreThan2Decimals(v)) return 'Use up to 2 decimals';
  return undefined;
}

export function percentError(v: number, max: number): string | undefined {
  if (!Number.isFinite(v)) return 'Enter a number';
  if (v < 0) return 'Minimum is 0%';
  if (v > max) return `Maximum is ${max}%`;
  return undefined;
}

export function itemErrors(items: readonly LineItem[]): DocErrors {
  const out: DocErrors = {};
  for (const it of items) {
    const q = numberError(it.qty, DOC_LIMITS.qty);
    const r = numberError(it.rate, DOC_LIMITS.rate);
    if (q) out[`${it.id}.qty`] = q;
    if (r) out[`${it.id}.rate`] = r;
  }
  return out;
}

/** Adds an error when a number is out of range (helper for the per-tool error builders). */
export function addError(out: DocErrors, key: string, error: string | undefined): void {
  if (error) out[key] = error;
}

/** Example line-item rate: follows the currency until the user edits it (spec currency defaults). */
type RateState = { currency: CurrencyCode; rate: number };
export const DOC_RATE_PRESETS: CurrencyPresets<RateState> = {
  USD: { rate: 75 },
  CAD: { rate: 85 },
  AUD: { rate: 90 },
  GBP: { rate: 60 },
  EUR: { rate: 60 },
  INR: { rate: 1_500 },
};
const RATE_BASE: RateState = { currency: 'USD', rate: 75 };

export function exampleRate(currency: CurrencyCode): number {
  return DOC_RATE_PRESETS[currency].rate ?? RATE_BASE.rate;
}

/** Moves every line the user hasn't typed a rate into (and still at the example) to the new currency's example. */
export function switchItemsCurrency(items: readonly LineItem[], from: CurrencyCode, to: CurrencyCode): LineItem[] {
  return items.map((it) =>
    it.rateTyped ? it : { ...it, rate: switchCurrency({ currency: from, rate: it.rate }, to, RATE_BASE, DOC_RATE_PRESETS).rate },
  );
}

/** The one example row a fresh quote or invoice starts with. */
export function exampleItem(currency: CurrencyCode): LineItem {
  return { id: 'item-1', desc: 'Design and build', qty: 10, rate: exampleRate(currency) };
}

/** A unique id for a new row (only used as a React key and for error keys). */
export function newItemId(existing: readonly LineItem[]): string {
  const max = existing.reduce((n, it) => Math.max(n, Number(/^item-(\d+)$/.exec(it.id)?.[1] ?? 0)), 0);
  return `item-${max + 1}`;
}

/** Moves item `index` up (−1) or down (+1); out-of-range moves return the same list. */
export function moveItem<T>(items: readonly T[], index: number, by: -1 | 1): T[] {
  const to = index + by;
  if (index < 0 || index >= items.length || to < 0 || to >= items.length) return [...items];
  const out = [...items];
  [out[index], out[to]] = [out[to]!, out[index]!];
  return out;
}
