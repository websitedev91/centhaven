// zod/mini keeps the client bundle small (same validation, tree-shakable API).
import * as z from 'zod/mini';
import { CURRENCIES, type CurrencyCode } from '@/lib/format';
import { currencyVariant, defaultsForCurrency, switchCurrency, type CurrencyPresets } from '@/lib/currency-defaults';
import { INCOME_TYPES, suggestedMonths, type EmergencyFundInput } from './calc';

const num = () => z.number({ error: 'Enter a number' });
const whole = (msg: string) => z.refine<number>((v) => Number.isInteger(v), msg);
const money = (msg: string, max = 1_000_000_000) => num().check(z.minimum(0, msg), z.maximum(max, 'That number is too large'));

/**
 * `months` = 0 means "use the suggested months" (rule of thumb, follows income type and
 * dependants). Any other value is the user's own choice.
 */
export const emergencySchema = z.object({
  currency: z.enum(CURRENCIES),
  expenses: money('Expenses can’t be negative', 100_000_000),
  incomeType: z.enum(INCOME_TYPES),
  dependants: num().check(whole('Use a whole number'), z.minimum(0, 'Minimum is 0'), z.maximum(10, 'Maximum is 10')),
  months: num().check(whole('Use whole months'), z.minimum(0, 'Minimum is 1 month'), z.maximum(24, 'Maximum is 24 months')),
  saved: money('Savings can’t be negative'),
  monthlySaving: money('Monthly saving can’t be negative', 100_000_000),
});

export type EmergencyState = z.infer<typeof emergencySchema>;

/** Currency-dependent defaults (spec, approved): starting values for the inputs, not rates. */
export const emergencyCurrencyPresets: CurrencyPresets<EmergencyState> = {
  USD: { expenses: 3_000, saved: 2_000, monthlySaving: 500 },
  CAD: { expenses: 3_000, saved: 2_000, monthlySaving: 500 },
  AUD: { expenses: 3_000, saved: 2_000, monthlySaving: 500 },
  GBP: { expenses: 2_000, saved: 1_500, monthlySaving: 300 },
  EUR: { expenses: 2_000, saved: 1_500, monthlySaving: 300 },
  INR: { expenses: 50_000, saved: 100_000, monthlySaving: 20_000 },
};

const base: EmergencyState = {
  currency: 'USD',
  expenses: 3_000,
  incomeType: 'steady',
  dependants: 0,
  months: 0,
  saved: 2_000,
  monthlySaving: 500,
};

export const emergencyDefaults = defaultsForCurrency(base, emergencyCurrencyPresets, 'USD');
export const emergencyVariant = currencyVariant(emergencyDefaults, emergencyCurrencyPresets);

export function switchEmergencyCurrency(state: EmergencyState, next: CurrencyCode): EmergencyState {
  return switchCurrency(state, next, emergencyDefaults, emergencyCurrencyPresets);
}

/** Months actually used: the user's own number, or the rule-of-thumb suggestion when 0. */
export function effectiveMonths(s: Pick<EmergencyState, 'months' | 'incomeType' | 'dependants'>): number {
  return s.months > 0 ? s.months : suggestedMonths(s.incomeType, s.dependants);
}

export function toCalcInput(s: EmergencyState): EmergencyFundInput {
  return { expenses: s.expenses, months: effectiveMonths(s), saved: s.saved, monthlySaving: s.monthlySaving };
}

export { fieldErrors } from '@/lib/field-errors';
