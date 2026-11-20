// zod/mini keeps the client bundle small (same validation, tree-shakable API).
import * as z from 'zod/mini';
import { CURRENCIES, type CurrencyCode } from '@/lib/format';
import { currencyVariant, defaultsForCurrency, switchCurrency, type CurrencyPresets } from '@/lib/currency-defaults';
import { fieldErrors } from '@/lib/field-errors';
import type { PaybackInput, PaybackMode } from './calc';

const num = () => z.number({ error: 'Enter a number' });
const money = () => num().check(z.minimum(0, 'Can’t be negative'), z.maximum(10_000_000_000, 'Maximum is 10,000,000,000'));
/** A yearly cash flow in "Different each year" can be negative: a year that loses money (Puru, 2026-11-20). */
const signedMoney = () =>
  num().check(z.minimum(-10_000_000_000, 'Minimum is −10,000,000,000'), z.maximum(10_000_000_000, 'Maximum is 10,000,000,000'));

export const MODES = ['even', 'uneven'] as const satisfies readonly PaybackMode[];
export const MAX_YEARS = 10;
export type YearKey = `y${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10}`;
export const YEAR_KEYS = Array.from({ length: MAX_YEARS }, (_, i) => `y${i + 1}` as YearKey);

const yearShape = Object.fromEntries(YEAR_KEYS.map((k) => [k, signedMoney()])) as Record<YearKey, ReturnType<typeof signedMoney>>;

export const paybackSchema = z.object({
  mode: z.enum(MODES),
  currency: z.enum(CURRENCIES),
  inv: money(),
  flow: money(),
  years: num().check(
    z.refine((v) => Number.isInteger(v), 'Enter a whole number'),
    z.minimum(1, 'Enter at least 1 year'),
    z.maximum(MAX_YEARS, `Maximum is ${MAX_YEARS} years`),
  ),
  ...yearShape,
});

export type PaybackState = z.infer<typeof paybackSchema>;

const zeroYears = Object.fromEntries(YEAR_KEYS.map((k) => [k, 0])) as Record<YearKey, number>;

/** Example values only (CurrencyPresets pattern). The number of years never changes with currency. */
const examples = { inv: 50_000, flow: 12_500, y1: 10_000, y2: 12_000, y3: 15_000, y4: 18_000, y5: 20_000 };
export const paybackCurrencyPresets: CurrencyPresets<PaybackState> = {
  USD: examples,
  GBP: examples,
  EUR: examples,
  CAD: examples,
  AUD: examples,
  INR: { inv: 500_000, flow: 150_000, y1: 100_000, y2: 120_000, y3: 150_000, y4: 180_000, y5: 200_000 },
};

const base: PaybackState = { mode: 'even', currency: 'USD', years: 5, ...zeroYears, ...examples };

export const paybackDefaults = defaultsForCurrency(base, paybackCurrencyPresets, 'USD');
export const paybackVariant = currencyVariant(paybackDefaults, paybackCurrencyPresets);

export function switchPaybackCurrency(state: PaybackState, next: CurrencyCode, touched?: ReadonlySet<string>): PaybackState {
  return switchCurrency(state, next, paybackDefaults, paybackCurrencyPresets, touched);
}

/** Year boxes shown (1…years); an invalid "years" box shows 1 so the page never breaks. */
export function shownYears(s: Pick<PaybackState, 'years'>): number {
  return Number.isInteger(s.years) ? Math.min(MAX_YEARS, Math.max(1, s.years)) : 1;
}

/** Errors for the fields the current mode uses (hidden year boxes are ignored). */
export function paybackErrors(s: PaybackState): Partial<Record<keyof PaybackState, string>> {
  const all = fieldErrors(paybackSchema, s);
  const used: (keyof PaybackState)[] = s.mode === 'even' ? ['inv', 'flow'] : ['inv', 'years', ...YEAR_KEYS.slice(0, shownYears(s))];
  const out: Partial<Record<keyof PaybackState, string>> = {};
  for (const k of used) if (all[k]) out[k] = all[k];
  return out;
}

/** Uneven mode's cash flows (even mode uses evenPayback, plus a 10-year table). */
export function toCalcInput(s: PaybackState): PaybackInput {
  const flows = s.mode === 'even' ? YEAR_KEYS.map(() => s.flow) : YEAR_KEYS.slice(0, shownYears(s)).map((k) => s[k]);
  return { investment: s.inv, flows };
}

/** Plan B for "Compare two investments" (even mode). */
export const planBSchema = z.pick(paybackSchema, { inv: true, flow: true });
export type PlanBState = z.infer<typeof planBSchema>;
export const planBDefaults: PlanBState = { inv: 20_000, flow: 7_000 };

export { fieldErrors };
