// zod/mini keeps the client bundle small (same validation, tree-shakable API).
import * as z from 'zod/mini';
import { CURRENCIES, type CurrencyCode } from '@/lib/format';
import { currencyVariant, defaultsForCurrency, switchCurrency, type CurrencyPresets } from '@/lib/currency-defaults';
import type { RetainerInput } from './calc';

const num = () => z.number({ error: 'Enter a number' });
const pct = (max: number) => num().check(z.minimum(0, 'Minimum is 0%'), z.maximum(max, `Maximum is ${max}%`));

/** Percentages are whole numbers in the UI/URL (10 = 10%); toCalcInput converts them. */
export const retainerSchema = z.object({
  currency: z.enum(CURRENCIES),
  rate: num().check(z.minimum(0, 'Rate can’t be negative'), z.maximum(1_000_000, 'Maximum is 1,000,000')),
  hours: num().check(z.minimum(1, 'Minimum is 1 hour'), z.maximum(744, 'Maximum is 744 hours (a 31-day month)')),
  discount: pct(50),
  months: num().check(
    z.refine((v) => Number.isInteger(v), 'Use whole months'),
    z.minimum(1, 'Minimum is 1 month'),
    z.maximum(60, 'Maximum is 60 months'),
  ),
  usage: pct(100),
});

export type RetainerState = z.infer<typeof retainerSchema>;

/** Currency-dependent defaults (spec, approved): starting values for the inputs, not rates. */
export const retainerCurrencyPresets: CurrencyPresets<RetainerState> = {
  USD: { rate: 100 },
  CAD: { rate: 100 },
  AUD: { rate: 100 },
  GBP: { rate: 75 },
  EUR: { rate: 75 },
  INR: { rate: 2_000 },
};

const base: RetainerState = { currency: 'USD', rate: 100, hours: 20, discount: 10, months: 6, usage: 80 };

export const retainerDefaults = defaultsForCurrency(base, retainerCurrencyPresets, 'USD');
export const retainerVariant = currencyVariant(retainerDefaults, retainerCurrencyPresets);

export function switchRetainerCurrency(state: RetainerState, next: CurrencyCode): RetainerState {
  return switchCurrency(state, next, retainerDefaults, retainerCurrencyPresets);
}

export function toCalcInput(s: Omit<RetainerState, 'currency'>): RetainerInput {
  return { rate: s.rate, hours: s.hours, discount: s.discount / 100, months: s.months, usage: s.usage / 100 };
}

/** Plan B for "Compare two plans": different committed hours and discount. */
export const planBSchema = z.pick(retainerSchema, { hours: true, discount: true });
export type PlanBState = z.infer<typeof planBSchema>;
export const planBDefaults: PlanBState = { hours: 40, discount: 15 };

export { fieldErrors } from '@/lib/field-errors';
