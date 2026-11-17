// zod/mini keeps the client bundle small (same validation, tree-shakable API).
import * as z from 'zod/mini';
import { CURRENCIES, type CurrencyCode } from '@/lib/format';
import { currencyVariant, defaultsForCurrency, switchCurrency, type CurrencyPresets } from '@/lib/currency-defaults';
import type { DepreciationInput } from './calc';

const num = () => z.number({ error: 'Enter a number' });
const whole = (msg: string) => z.refine<number>((v) => Number.isInteger(v), msg);

export const depreciationSchema = z.object({
  currency: z.enum(CURRENCIES),
  cost: num().check(z.minimum(0.01, 'Minimum is 0.01'), z.maximum(1_000_000_000, 'Maximum is 1,000,000,000')),
  salvage: num().check(z.minimum(0, 'Salvage value can’t be negative'), z.maximum(1_000_000_000, 'Maximum is 1,000,000,000')),
  lifeYears: num().check(whole('Use whole years'), z.minimum(1, 'Minimum is 1 year'), z.maximum(50, 'Maximum is 50 years')),
  firstYearMonths: num().check(whole('Use whole months'), z.minimum(1, 'Minimum is 1 month'), z.maximum(12, 'Maximum is 12 months')),
});

export type DepreciationState = z.infer<typeof depreciationSchema>;

/** Currency-dependent defaults (spec, approved): starting values for the inputs, not rates. */
export const depreciationCurrencyPresets: CurrencyPresets<DepreciationState> = {
  USD: { cost: 1_500, salvage: 300 },
  CAD: { cost: 1_500, salvage: 300 },
  AUD: { cost: 1_500, salvage: 300 },
  GBP: { cost: 1_200, salvage: 200 },
  EUR: { cost: 1_200, salvage: 200 },
  INR: { cost: 100_000, salvage: 10_000 },
};

const base: DepreciationState = { currency: 'USD', cost: 1_500, salvage: 300, lifeYears: 3, firstYearMonths: 12 };

export const depreciationDefaults = defaultsForCurrency(base, depreciationCurrencyPresets, 'USD');
export const depreciationVariant = currencyVariant(depreciationDefaults, depreciationCurrencyPresets);

export function switchDepreciationCurrency(state: DepreciationState, next: CurrencyCode): DepreciationState {
  return switchCurrency(state, next, depreciationDefaults, depreciationCurrencyPresets);
}

export function toCalcInput(s: DepreciationState): DepreciationInput {
  return { cost: s.cost, salvage: s.salvage, lifeYears: s.lifeYears, firstYearMonths: s.firstYearMonths };
}

export { fieldErrors } from '@/lib/field-errors';
