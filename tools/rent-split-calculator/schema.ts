// zod/mini keeps the client bundle small (same validation, tree-shakable API).
import * as z from 'zod/mini';
import { CURRENCIES, type CurrencyCode } from '@/lib/format';
import { currencyVariant, defaultsForCurrency, switchCurrency, type CurrencyPresets } from '@/lib/currency-defaults';
import { fieldErrors } from '@/lib/field-errors';
import type { BillSplit, SplitInput, SplitMode } from './calc';

const num = () => z.number({ error: 'Enter a number' });
const money = () => num().check(z.minimum(0, 'Can’t be negative'), z.maximum(1_000_000_000, 'Maximum is 1,000,000,000'));
const size = () => num().check(z.minimum(0, 'Can’t be negative'), z.maximum(100_000, 'Maximum is 100,000'));

/**
 * 2 to 6 people, kept as flat s/i 1…6 keys so the state fits the URL. No name boxes: names would
 * end up in share links and analytics URLs ("Person 1–6").
 */
export const MIN_PEOPLE = 2;
export const MAX_PEOPLE = 6;
type N = 1 | 2 | 3 | 4 | 5 | 6;
export type SizeKey = `s${N}`;
export type IncomeKey = `i${N}`;
export const ROWS = Array.from({ length: MAX_PEOPLE }, (_, k) => ({ s: `s${k + 1}` as SizeKey, i: `i${k + 1}` as IncomeKey }));

export const MODES = ['equal', 'room', 'income'] as const satisfies readonly SplitMode[];
export const BILL_SPLITS = ['equal', 'rent'] as const satisfies readonly BillSplit[];
export const UNITS = ['sqft', 'm2'] as const;
export type Unit = (typeof UNITS)[number];

const rowShape = Object.fromEntries(ROWS.flatMap((k) => [[k.s, size()], [k.i, money()]]));

export const splitSchema = z.object({
  mode: z.enum(MODES),
  currency: z.enum(CURRENCIES),
  rent: money(),
  bills: money(),
  billSplit: z.enum(BILL_SPLITS),
  shared: num().check(z.minimum(0, 'Can’t be negative'), z.maximum(100, 'Maximum is 100%')),
  unit: z.enum(UNITS),
  rows: num().check(
    z.refine((v) => Number.isInteger(v), 'Enter a whole number'),
    z.minimum(MIN_PEOPLE, `At least ${MIN_PEOPLE} people`),
    z.maximum(MAX_PEOPLE, `Up to ${MAX_PEOPLE} people`),
  ),
  ...(rowShape as Record<SizeKey | IncomeKey, ReturnType<typeof money>>),
});

export type SplitState = z.infer<typeof splitSchema>;

/** Example values only (CurrencyPresets pattern). Room sizes never change with currency. */
const usd = { rent: 2_400, bills: 300, i1: 4_000, i2: 3_000, i3: 3_000, i4: 3_000, i5: 3_000, i6: 3_000 };
const gbp = { rent: 1_800, bills: 240, i1: 3_000, i2: 2_250, i3: 2_250, i4: 2_250, i5: 2_250, i6: 2_250 };
export const splitCurrencyPresets: CurrencyPresets<SplitState> = {
  USD: usd,
  CAD: usd,
  AUD: usd,
  GBP: gbp,
  EUR: gbp,
  INR: { rent: 30_000, bills: 4_500, i1: 60_000, i2: 45_000, i3: 45_000, i4: 45_000, i5: 45_000, i6: 45_000 },
};

const sizes = { s1: 150, s2: 120, s3: 90, s4: 100, s5: 100, s6: 100 };
const base: SplitState = { mode: 'equal', currency: 'USD', billSplit: 'equal', shared: 0, unit: 'sqft', rows: 3, ...sizes, ...usd };

export const splitDefaults = defaultsForCurrency(base, splitCurrencyPresets, 'USD');
export const splitVariant = currencyVariant(splitDefaults, splitCurrencyPresets);

export function switchSplitCurrency(state: SplitState, next: CurrencyCode, touched?: ReadonlySet<string>): SplitState {
  return resetHiddenRows(switchCurrency(state, next, splitDefaults, splitCurrencyPresets, touched));
}

/** People shown (2…6); an invalid count shows 2 so the page never breaks. */
export function shownRows(s: Pick<SplitState, 'rows'>): number {
  return Number.isInteger(s.rows) ? Math.min(MAX_PEOPLE, Math.max(MIN_PEOPLE, s.rows)) : MIN_PEOPLE;
}

/** Optional: empty = 0 (no bills; no shared space). */
export const OPTIONAL = ['bills', 'shared'] as const;

export const ROOM_ABOVE_0 = 'Enter a room size above 0';
export const INCOME_NEEDED = 'Enter at least one income above 0';

/** Errors for the boxes shown (hidden rows and the other modes' boxes never block). */
export function splitErrors(s: SplitState): Partial<Record<keyof SplitState, string>> {
  const all = fieldErrors(splitSchema, s);
  const rows = ROWS.slice(0, shownRows(s));
  const used: (keyof SplitState)[] = ['rent', 'bills'];
  if (s.mode === 'room') used.push('shared', ...rows.map((k) => k.s));
  if (s.mode === 'income') used.push(...rows.map((k) => k.i));
  const out: Partial<Record<keyof SplitState, string>> = {};
  for (const k of used) if (all[k]) out[k] = all[k];
  if (s.mode === 'room') for (const k of rows) if (!out[k.s] && s[k.s] === 0) out[k.s] = ROOM_ABOVE_0;
  if (s.mode === 'income' && rows.every((k) => !out[k.i]) && rows.every((k) => s[k.i] === 0)) out.i1 = INCOME_NEEDED;
  return out;
}

export function toCalcInput(s: SplitState): SplitInput {
  const rows = ROWS.slice(0, shownRows(s));
  return {
    mode: s.mode,
    rent: s.rent,
    bills: s.bills,
    billSplit: s.billSplit,
    sharedPct: s.mode === 'room' ? s.shared : 0,
    weights: rows.map((k) => (s.mode === 'room' ? s[k.s] : s.mode === 'income' ? s[k.i] : 1)),
  };
}

/** Add a person (their boxes start at the defaults, which hidden rows always hold). */
export function addRow(s: SplitState): SplitState {
  const n = shownRows(s);
  return n >= MAX_PEOPLE ? s : { ...s, rows: n + 1 };
}

/**
 * Rows past `rows` go back to the current currency's defaults, so a removed person leaves nothing
 * in the share URL (only non-default values are written: lib/url-state.ts). Same rule as Debt Snowball.
 */
export function resetHiddenRows(s: SplitState): SplitState {
  const d = defaultsForCurrency(splitDefaults, splitCurrencyPresets, s.currency);
  const next = { ...s };
  for (const k of ROWS.slice(shownRows(s))) {
    next[k.s] = d[k.s];
    next[k.i] = d[k.i];
  }
  return next;
}

/** Remove person `index` (0-based); later people move up. Never fewer than 2. */
export function removeRow(s: SplitState, index: number): SplitState {
  const n = shownRows(s);
  if (n <= MIN_PEOPLE) return s;
  const next: SplitState = { ...s, rows: n - 1 };
  for (let k = index; k < MAX_PEOPLE - 1; k++) {
    const to = ROWS[k]!;
    const from = ROWS[k + 1]!;
    next[to.s] = s[from.s];
    next[to.i] = s[from.i];
  }
  return resetHiddenRows(next);
}

/** Keys of the shown rows from `index` to `end` (they moved up when a person was removed). */
export function keysFrom(index: number, end: number = MAX_PEOPLE): (keyof SplitState)[] {
  return ROWS.slice(index, end).flatMap((k) => [k.s, k.i]);
}

export { fieldErrors };
