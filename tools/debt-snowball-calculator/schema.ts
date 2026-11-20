// zod/mini keeps the client bundle small (same validation, tree-shakable API).
import * as z from 'zod/mini';
import { CURRENCIES, roundTo, type CurrencyCode } from '@/lib/format';
import { currencyVariant, defaultsForCurrency, switchCurrency, type CurrencyPresets } from '@/lib/currency-defaults';
import { fieldErrors } from '@/lib/field-errors';
import type { DebtInput } from './calc';

const num = () => z.number({ error: 'Enter a number' });
const money = () => num().check(z.minimum(0, 'Can’t be negative'), z.maximum(1_000_000_000, 'Maximum is 1,000,000,000'));
const apr = () => num().check(z.minimum(0, 'Can’t be negative'), z.maximum(100, 'Maximum is 100%'));

/**
 * Up to 5 debts, kept as flat b/r/m 1…5 keys so the state fits the URL. No name boxes:
 * names would end up in share links and analytics URLs (approved: "Debt 1–5").
 */
export const MAX_DEBTS = 5;
type N = 1 | 2 | 3 | 4 | 5;
export type BalanceKey = `b${N}`;
export type RateKey = `r${N}`;
export type MinKey = `m${N}`;
export const ROWS = Array.from({ length: MAX_DEBTS }, (_, i) => ({
  b: `b${i + 1}` as BalanceKey,
  r: `r${i + 1}` as RateKey,
  m: `m${i + 1}` as MinKey,
}));

const rowShape = Object.fromEntries(ROWS.flatMap((k) => [[k.b, money()], [k.r, apr()], [k.m, money()]]));

export const debtSchema = z.object({
  currency: z.enum(CURRENCIES),
  rows: num().check(
    z.refine((v) => Number.isInteger(v), 'Enter a whole number'),
    z.minimum(1, 'Add at least 1 debt'),
    z.maximum(MAX_DEBTS, `Up to ${MAX_DEBTS} debts`),
  ),
  ...(rowShape as Record<BalanceKey | RateKey | MinKey, ReturnType<typeof money>>),
  extra: money(),
});

export type DebtState = z.infer<typeof debtSchema>;

const zeroRows = Object.fromEntries(ROWS.flatMap((k) => [[k.b, 0], [k.r, 0], [k.m, 0]])) as Record<BalanceKey | RateKey | MinKey, number>;

/**
 * Example values only (CurrencyPresets pattern), approved by Puru. Interest rates are examples too
 * ("From your statement. Example values only."); INR uses its own example rates.
 */
const usd = { b1: 2_500, r1: 12, m1: 75, b2: 6_000, r2: 24, m2: 150, b3: 9_000, r3: 7, m3: 250, extra: 200 };
const gbp = { b1: 2_000, r1: 12, m1: 60, b2: 5_000, r2: 24, m2: 125, b3: 7_500, r3: 7, m3: 200, extra: 150 };
export const debtCurrencyPresets: CurrencyPresets<DebtState> = {
  USD: usd,
  CAD: usd,
  AUD: usd,
  GBP: gbp,
  EUR: gbp,
  INR: { b1: 50_000, r1: 36, m1: 2_500, b2: 200_000, r2: 14, m2: 6_000, b3: 120_000, r3: 18, m3: 4_000, extra: 5_000 },
};

const base: DebtState = { currency: 'USD', rows: 3, ...zeroRows, ...usd };

export const debtDefaults = defaultsForCurrency(base, debtCurrencyPresets, 'USD');
export const debtVariant = currencyVariant(debtDefaults, debtCurrencyPresets);

export function switchDebtCurrency(state: DebtState, next: CurrencyCode, touched?: ReadonlySet<string>): DebtState {
  return switchCurrency(state, next, debtDefaults, debtCurrencyPresets, touched);
}

/** Rows shown (1…rows); an invalid row count shows 1 so the page never breaks. */
export function shownRows(s: Pick<DebtState, 'rows'>): number {
  return Number.isInteger(s.rows) ? Math.min(MAX_DEBTS, Math.max(1, s.rows)) : 1;
}

/** Optional: empty = 0 (no extra payment). */
export const OPTIONAL = ['extra'] as const;

/** Errors for the boxes shown (hidden rows never block the result). */
export function debtErrors(s: DebtState): Partial<Record<keyof DebtState, string>> {
  const all = fieldErrors(debtSchema, s);
  const used: (keyof DebtState)[] = ['extra', ...ROWS.slice(0, shownRows(s)).flatMap((k) => [k.b, k.r, k.m])];
  const out: Partial<Record<keyof DebtState, string>> = {};
  for (const k of used) if (all[k]) out[k] = all[k];
  return out;
}

export function toCalcInput(s: DebtState): DebtInput {
  return {
    debts: ROWS.slice(0, shownRows(s)).map((k) => ({ balance: s[k.b], apr: s[k.r], minimum: s[k.m] })),
    extra: s.extra,
  };
}

/** Add a debt (copies the last debt's numbers, so the result changes and the user edits from there). */
export function addRow(s: DebtState): DebtState {
  const n = shownRows(s);
  if (n >= MAX_DEBTS) return s;
  const from = ROWS[n - 1]!;
  const to = ROWS[n]!;
  const keep = (v: number) => (Number.isFinite(v) ? v : 0);
  return { ...s, rows: n + 1, [to.b]: keep(s[from.b]), [to.r]: keep(s[from.r]), [to.m]: keep(s[from.m]) };
}

/** Remove debt `index` (0-based); later debts move up. The last debt can't be removed. */
export function removeRow(s: DebtState, index: number): DebtState {
  const n = shownRows(s);
  if (n <= 1) return s;
  const next: DebtState = { ...s, rows: n - 1 };
  for (let i = index; i < MAX_DEBTS - 1; i++) {
    const to = ROWS[i]!;
    const from = ROWS[i + 1]!;
    next[to.b] = s[from.b];
    next[to.r] = s[from.r];
    next[to.m] = s[from.m];
  }
  const last = ROWS[MAX_DEBTS - 1]!;
  next[last.b] = 0;
  next[last.r] = 0;
  next[last.m] = 0;
  // Hidden rows stay valid, so a stale empty box never blocks the result.
  for (const k of ROWS.slice(next.rows)) for (const key of [k.b, k.r, k.m]) if (!Number.isFinite(next[key])) next[key] = 0;
  return next;
}

/** Keys of every row from `index` on (they moved up when a row was removed). */
export function keysFrom(index: number): (keyof DebtState)[] {
  return ROWS.slice(index).flatMap((k) => [k.b, k.r, k.m]);
}

export { fieldErrors };

/**
 * Interest saved, as the difference of the two totals AS SHOWN (each rounded to cents), so the
 * page adds up: 841.34 − 702.05 = 139.29 (unrounded it would be 139.295 → 139.30). Approved spec case 4.
 */
export function shownDifference(a: number, b: number): number {
  return roundTo(roundTo(a, 2) - roundTo(b, 2), 2);
}
