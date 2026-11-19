// zod/mini keeps the client bundle small (same validation, tree-shakable API).
import * as z from 'zod/mini';
import { CURRENCIES, type CurrencyCode } from '@/lib/format';
import { currencyVariant, defaultsForCurrency, switchCurrency, type CurrencyPresets } from '@/lib/currency-defaults';
import { FEE_TYPES, type LateFeeInput } from './calc';

const num = () => z.number({ error: 'Enter a number' });
const days = (max: number) => num().check(z.minimum(0, 'Can’t be negative'), z.maximum(max, `Maximum is ${max.toLocaleString('en-US')} days`));

/** The fee % is a whole number in the UI/URL (2 = 2%); toCalcInput converts it. */
export const lateFeeSchema = z.object({
  currency: z.enum(CURRENCIES),
  amount: num().check(z.minimum(0, 'Can’t be negative'), z.maximum(100_000_000, 'Maximum is 100,000,000')),
  days: days(3_650),
  type: z.enum(FEE_TYPES),
  pct: num().check(z.minimum(0, 'Minimum is 0%'), z.maximum(100, 'Maximum is 100%')),
  flat: num().check(z.minimum(0, 'Can’t be negative'), z.maximum(1_000_000, 'Maximum is 1,000,000')),
  grace: days(365),
});

export type LateFeeState = z.infer<typeof lateFeeSchema>;

/** Example values only (CurrencyPresets pattern). The fee always comes from the user's own terms. */
export const lateFeeCurrencyPresets: CurrencyPresets<LateFeeState> = {
  USD: { amount: 2_000, flat: 25 },
  CAD: { amount: 2_000, flat: 25 },
  AUD: { amount: 2_000, flat: 25 },
  GBP: { amount: 2_000, flat: 20 },
  EUR: { amount: 2_000, flat: 20 },
  INR: { amount: 50_000, flat: 500 },
};

const base: LateFeeState = { currency: 'USD', amount: 2_000, days: 45, type: 'monthly', pct: 2, flat: 25, grace: 0 };

export const lateFeeDefaults = defaultsForCurrency(base, lateFeeCurrencyPresets, 'USD');
export const lateFeeVariant = currencyVariant(lateFeeDefaults, lateFeeCurrencyPresets);

export function switchLateFeeCurrency(state: LateFeeState, next: CurrencyCode, touched?: ReadonlySet<string>): LateFeeState {
  return switchCurrency(state, next, lateFeeDefaults, lateFeeCurrencyPresets, touched);
}

export function toCalcInput(s: LateFeeState): LateFeeInput {
  return { amount: s.amount, daysLate: s.days, grace: s.grace, type: s.type, pct: s.pct / 100, flat: s.flat };
}

export { fieldErrors } from '@/lib/field-errors';
