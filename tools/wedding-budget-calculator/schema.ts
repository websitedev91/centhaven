// zod/mini keeps the client bundle small (same validation, tree-shakable API).
import * as z from 'zod/mini';
import { CURRENCIES, type CurrencyCode } from '@/lib/format';
import { currencyVariant, defaultsForCurrency, switchCurrency, type CurrencyPresets } from '@/lib/currency-defaults';
import { fieldErrors } from '@/lib/field-errors';
import { CATEGORIES, percentTotal, type Category } from './calc';

const num = () => z.number({ error: 'Enter a number' });
const pct = () => num().check(z.minimum(0, 'Can’t be negative'), z.maximum(100, 'Maximum is 100%'));

const pctShape = Object.fromEntries(CATEGORIES.map((k) => [k, pct()])) as Record<Category, ReturnType<typeof pct>>;

export const weddingSchema = z.object({
  currency: z.enum(CURRENCIES),
  budget: num().check(z.minimum(0, 'Can’t be negative'), z.maximum(1_000_000_000, 'Maximum is 1,000,000,000')),
  guests: num().check(
    z.minimum(0, 'Can’t be negative'),
    z.refine((v) => Number.isInteger(v), 'Enter a whole number'),
    z.maximum(10_000, 'Maximum is 10,000'),
  ),
  ...pctShape,
});

export type WeddingState = z.infer<typeof weddingSchema>;

/** Example split only: labelled "Example split: change it to yours", never an average. */
export const EXAMPLE_SPLIT: Record<Category, number> = { venue: 45, photo: 12, attire: 8, flowers: 10, music: 7, rings: 5, paper: 3, other: 10 };

/** Example budgets only (CurrencyPresets pattern). Guests and percentages never change with currency. */
export const weddingCurrencyPresets: CurrencyPresets<WeddingState> = {
  USD: { budget: 25_000 },
  CAD: { budget: 25_000 },
  AUD: { budget: 25_000 },
  GBP: { budget: 20_000 },
  EUR: { budget: 20_000 },
  INR: { budget: 1_500_000 },
};

const base: WeddingState = { currency: 'USD', budget: 25_000, guests: 100, ...EXAMPLE_SPLIT };

export const weddingDefaults = defaultsForCurrency(base, weddingCurrencyPresets, 'USD');
export const weddingVariant = currencyVariant(weddingDefaults, weddingCurrencyPresets);

export function switchWeddingCurrency(state: WeddingState, next: CurrencyCode, touched?: ReadonlySet<string>): WeddingState {
  return switchCurrency(state, next, weddingDefaults, weddingCurrencyPresets, touched);
}

/** Optional: empty = 0 = no per-guest rows. */
export const OPTIONAL = ['guests'] as const;

export const pctOf = (s: WeddingState): number[] => CATEGORIES.map((k) => s[k]);

/**
 * "Your percentages add up to 105%. They need to total 100%." when every box is valid but the
 * total isn't 100; null otherwise (a box with its own error shows that instead).
 */
export function totalError(s: WeddingState, errors: Partial<Record<keyof WeddingState, string>>): string | null {
  if (CATEGORIES.some((k) => errors[k])) return null;
  const total = percentTotal(pctOf(s));
  if (total === 100) return null;
  return `Your percentages add up to ${total.toLocaleString('en-US', { maximumFractionDigits: 2 })}%. They need to total 100%.`;
}

export { fieldErrors };

/** Plan B for "Compare two guest counts". Example value. */
export const planBSchema = z.object({
  guests: num().check(z.minimum(1, 'Enter at least 1 guest'), z.refine((v) => Number.isInteger(v), 'Enter a whole number'), z.maximum(10_000, 'Maximum is 10,000')),
});
export type PlanBState = z.infer<typeof planBSchema>;
export const planBDefaults: PlanBState = { guests: 120 };
