// zod/mini keeps the client bundle small (same validation, tree-shakable API).
import * as z from 'zod/mini';
import { CURRENCIES, type CurrencyCode } from '@/lib/format';
import { currencyVariant, defaultsForCurrency, switchCurrency, type CurrencyPresets } from '@/lib/currency-defaults';
import type { SavingsGoalInput } from './calc';

const num = () => z.number({ error: 'Enter a number' });

/** Interest is a whole-number % in the UI/URL (4 = 4%); toCalcInput converts it. */
export const savingsGoalSchema = z.object({
  currency: z.enum(CURRENCIES),
  goal: num().check(z.minimum(1, 'Enter a goal above zero'), z.maximum(1_000_000_000, 'Maximum is 1,000,000,000')),
  saved: num().check(z.minimum(0, 'Can’t be negative'), z.maximum(1_000_000_000, 'Maximum is 1,000,000,000')),
  months: num().check(z.minimum(1, 'Minimum is 1 month'), z.maximum(600, 'Maximum is 600 months')),
  rate: num().check(z.minimum(0, 'Minimum is 0%'), z.maximum(20, 'Maximum is 20%')),
});

export type SavingsGoalState = z.infer<typeof savingsGoalSchema>;

/** Example goals only (CurrencyPresets pattern). Interest always starts at 0 and is never suggested. */
export const savingsGoalCurrencyPresets: CurrencyPresets<SavingsGoalState> = {
  USD: { goal: 10_000 },
  GBP: { goal: 10_000 },
  EUR: { goal: 10_000 },
  CAD: { goal: 10_000 },
  AUD: { goal: 10_000 },
  INR: { goal: 500_000 },
};

const base: SavingsGoalState = { currency: 'USD', goal: 10_000, saved: 0, months: 24, rate: 0 };

export const savingsGoalDefaults = defaultsForCurrency(base, savingsGoalCurrencyPresets, 'USD');
export const savingsGoalVariant = currencyVariant(savingsGoalDefaults, savingsGoalCurrencyPresets);

export function switchSavingsGoalCurrency(state: SavingsGoalState, next: CurrencyCode, touched?: ReadonlySet<string>): SavingsGoalState {
  return switchCurrency(state, next, savingsGoalDefaults, savingsGoalCurrencyPresets, touched);
}

export function toCalcInput(s: Pick<SavingsGoalState, 'goal' | 'saved' | 'months' | 'rate'>): SavingsGoalInput {
  return { goal: s.goal, saved: s.saved, months: s.months, rate: s.rate / 100 };
}

/** Plan B for "Compare two timelines": a different number of months. */
export const planBSchema = z.pick(savingsGoalSchema, { months: true });
export type PlanBState = z.infer<typeof planBSchema>;
export const planBDefaults: PlanBState = { months: 36 };

export { fieldErrors } from '@/lib/field-errors';
