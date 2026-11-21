// zod/mini keeps the client bundle small (same validation, tree-shakable API).
import * as z from 'zod/mini';
import { CURRENCIES, type CurrencyCode } from '@/lib/format';
import { currencyVariant, defaultsForCurrency, switchCurrency, type CurrencyPresets } from '@/lib/currency-defaults';
import { fieldErrors } from '@/lib/field-errors';
import { PER, UNITS, kindOf, perFor, type Item, type Kind, type Per, type Unit } from './calc';

const num = () => z.number({ error: 'Enter a number' });
const positive = (msg: string, max: number) =>
  num().check(z.minimum(0, 'Can’t be negative'), z.maximum(max, `Maximum is ${max.toLocaleString('en-US')}`), z.refine((v) => v !== 0, msg));

/** 2 to 4 items as flat p/q/u 1…4 keys so the state fits the URL. No name boxes ("Item 1–4"). */
export const MIN_ITEMS = 2;
export const MAX_ITEMS = 4;
type N = 1 | 2 | 3 | 4;
export type PriceKey = `p${N}`;
export type QtyKey = `q${N}`;
export type UnitKey = `u${N}`;
export const ROWS = Array.from({ length: MAX_ITEMS }, (_, k) => ({
  p: `p${k + 1}` as PriceKey,
  q: `q${k + 1}` as QtyKey,
  u: `u${k + 1}` as UnitKey,
}));

export const PRICE_ABOVE_0 = 'Enter a price above 0';
export const SIZE_ABOVE_0 = 'Enter a size above 0';

const UNIT_KEYS = Object.keys(UNITS) as [Unit, ...Unit[]];
const PER_KEYS = Object.keys(PER) as [Per, ...Per[]];
const unitEnum = () => z.enum(UNIT_KEYS);
const sizeNum = () => positive(SIZE_ABOVE_0, 1_000_000);

const rowShape = Object.fromEntries(
  ROWS.flatMap((k) => [
    [k.p, positive(PRICE_ABOVE_0, 1_000_000)],
    [k.q, sizeNum()],
    [k.u, unitEnum()],
  ]),
);

export const unitSchema = z.object({
  currency: z.enum(CURRENCIES),
  rows: num().check(
    z.refine((v) => Number.isInteger(v), 'Enter a whole number'),
    z.minimum(MIN_ITEMS, `At least ${MIN_ITEMS} items`),
    z.maximum(MAX_ITEMS, `Up to ${MAX_ITEMS} items`),
  ),
  per: z.enum(PER_KEYS),
  ...(rowShape as Record<PriceKey | QtyKey, ReturnType<typeof sizeNum>> & Record<UnitKey, ReturnType<typeof unitEnum>>),
});

export type UnitState = z.infer<typeof unitSchema>;

/** Example values only (CurrencyPresets pattern). USD in oz, the others in grams (Puru, 2026-11-21). */
const metric = (p: [number, number, number]) => ({ p1: p[0], q1: 500, u1: 'g', p2: p[1], q2: 1, u2: 'kg', p3: p[2], q3: 1.5, u3: 'kg', p4: p[2], q4: 1.5, u4: 'kg', per: 'per100g' }) as const;
export const unitCurrencyPresets: CurrencyPresets<UnitState> = {
  USD: { p1: 4.99, q1: 16, u1: 'oz', p2: 7.49, q2: 32, u2: 'oz', p3: 9.99, q3: 48, u3: 'oz', p4: 9.99, q4: 48, u4: 'oz', per: 'perOz' },
  CAD: metric([4.99, 7.49, 9.99]),
  AUD: metric([4.99, 7.49, 9.99]),
  GBP: metric([2.5, 4.2, 5.9]),
  EUR: metric([2.5, 4.2, 5.9]),
  INR: metric([120, 210, 300]),
};

const base = { currency: 'USD', rows: 2, ...unitCurrencyPresets.USD } as UnitState;

export const unitDefaults = defaultsForCurrency(base, unitCurrencyPresets, 'USD');
export const unitVariant = currencyVariant(unitDefaults, unitCurrencyPresets);

export function switchUnitCurrency(state: UnitState, next: CurrencyCode, touched?: ReadonlySet<string>): UnitState {
  return resetHiddenRows(switchCurrency(state, next, unitDefaults, unitCurrencyPresets, touched));
}

/** Items shown (2…4); an invalid count shows 2 so the page never breaks. */
export function shownRows(s: Pick<UnitState, 'rows'>): number {
  return Number.isInteger(s.rows) ? Math.min(MAX_ITEMS, Math.max(MIN_ITEMS, s.rows)) : MIN_ITEMS;
}

/** The kind every item must share: Item 1's. */
export const kindOfState = (s: UnitState): Kind => kindOf(s.u1);

const KIND_WORDS: Record<Kind, string> = {
  weight: 'a weight: use g, kg, oz or lb',
  volume: 'a volume: use ml, l or fl oz',
  count: 'a count: use items',
};

/** Errors for the items shown, plus "same kind as Item 1" (shown on that item's size box). */
export function unitErrors(s: UnitState): Partial<Record<keyof UnitState, string>> {
  const all = fieldErrors(unitSchema, s);
  const out: Partial<Record<keyof UnitState, string>> = {};
  const kind = kindOfState(s);
  ROWS.slice(0, shownRows(s)).forEach((k, i) => {
    if (all[k.p]) out[k.p] = all[k.p];
    if (all[k.q]) out[k.q] = all[k.q];
    else if (i > 0 && kindOf(s[k.u]) !== kind) out[k.q] = `Item 1 is ${KIND_WORDS[kind]}`;
  });
  return out;
}

export function toItems(s: UnitState): Item[] {
  return ROWS.slice(0, shownRows(s)).map((k) => ({ price: s[k.p], quantity: s[k.q], unit: s[k.u] }));
}

/** The "per" actually used (falls back when the chosen one doesn't fit Item 1's kind). */
export const perOf = (s: UnitState): Per => perFor(kindOfState(s), s.per);

export function addRow(s: UnitState): UnitState {
  const n = shownRows(s);
  return n >= MAX_ITEMS ? s : { ...s, rows: n + 1 };
}

/** Rows past `rows` go back to the currency's defaults, so a removed item leaves nothing in the share URL. */
export function resetHiddenRows(s: UnitState): UnitState {
  const d = defaultsForCurrency(unitDefaults, unitCurrencyPresets, s.currency);
  const next = { ...s };
  for (const k of ROWS.slice(shownRows(s))) {
    next[k.p] = d[k.p];
    next[k.q] = d[k.q];
    next[k.u] = d[k.u];
  }
  return next;
}

/** Remove item `index` (0-based); later items move up. Never fewer than 2. */
export function removeRow(s: UnitState, index: number): UnitState {
  const n = shownRows(s);
  if (n <= MIN_ITEMS) return s;
  const next: UnitState = { ...s, rows: n - 1 };
  for (let k = index; k < MAX_ITEMS - 1; k++) {
    const to = ROWS[k]!;
    const from = ROWS[k + 1]!;
    next[to.p] = s[from.p];
    next[to.q] = s[from.q];
    next[to.u] = s[from.u];
  }
  return resetHiddenRows(next);
}

export function keysFrom(index: number, end: number = MAX_ITEMS): (keyof UnitState)[] {
  return ROWS.slice(index, end).flatMap((k) => [k.p, k.q, k.u]);
}

export { fieldErrors };
