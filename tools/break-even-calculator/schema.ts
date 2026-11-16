// zod/mini keeps the client bundle small (same validation, tree-shakable API).
import * as z from 'zod/mini';
import { CURRENCIES, type CurrencyCode } from '@/lib/format';
import { currencyVariant, defaultsForCurrency, switchCurrency, type CurrencyPresets } from '@/lib/currency-defaults';
import type { BreakEvenInput } from './calc';

const num = () => z.number({ error: 'Enter a number' });
const MAX = 1_000_000_000;
const money = (min: number, minMsg: string) => num().check(z.minimum(min, minMsg), z.maximum(MAX, 'Maximum is 1,000,000,000'));

export const SELLS = ['units', 'projects', 'clients'] as const;
export type Sells = (typeof SELLS)[number];

export const breakEvenSchema = z.object({
  sells: z.enum(SELLS),
  currency: z.enum(CURRENCIES),
  fixedCosts: money(0, 'Fixed costs can’t be negative'),
  price: money(0.01, 'Minimum is 0.01'),
  variableCost: money(0, 'Variable cost can’t be negative'),
  targetProfit: money(0, 'Target profit can’t be negative'),
});

export type BreakEvenState = z.infer<typeof breakEvenSchema>;

/**
 * Currency-dependent defaults (CurrencyPresets pattern). The spec sets USD 10,000 / 50 / 30 and
 * INR 1,00,000 / 5,000 / 2,000; the other currencies start from the USD figures.
 * These are starting values for the inputs, not rates.
 */
export const breakEvenCurrencyPresets: CurrencyPresets<BreakEvenState> = {
  USD: { fixedCosts: 10_000, price: 50, variableCost: 30 },
  GBP: { fixedCosts: 10_000, price: 50, variableCost: 30 },
  EUR: { fixedCosts: 10_000, price: 50, variableCost: 30 },
  CAD: { fixedCosts: 10_000, price: 50, variableCost: 30 },
  AUD: { fixedCosts: 10_000, price: 50, variableCost: 30 },
  INR: { fixedCosts: 100_000, price: 5_000, variableCost: 2_000 },
};

const base: BreakEvenState = { sells: 'units', currency: 'USD', fixedCosts: 10_000, price: 50, variableCost: 30, targetProfit: 0 };

export const breakEvenDefaults = defaultsForCurrency(base, breakEvenCurrencyPresets, 'USD');
export const breakEvenVariant = currencyVariant(breakEvenDefaults, breakEvenCurrencyPresets);

export function switchBreakEvenCurrency(state: BreakEvenState, next: CurrencyCode): BreakEvenState {
  return switchCurrency(state, next, breakEvenDefaults, breakEvenCurrencyPresets);
}

export function toCalcInput(s: BreakEvenState): BreakEvenInput {
  return { fixedCosts: s.fixedCosts, price: s.price, variableCost: s.variableCost, targetProfit: s.targetProfit };
}

/** Plan B for "Compare two prices": a price change in %, so it works in any currency. */
export const planBSchema = z.object({
  priceChange: num().check(z.minimum(-90, 'Minimum is −90%'), z.maximum(500, 'Maximum is +500%')),
});
export type PlanBState = z.infer<typeof planBSchema>;
export const planBDefaults: PlanBState = { priceChange: 20 };

export { fieldErrors } from '@/lib/field-errors';
