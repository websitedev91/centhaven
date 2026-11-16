// zod/mini keeps the client bundle small (same validation, tree-shakable API).
import * as z from 'zod/mini';
import { CURRENCIES, type CurrencyCode } from '@/lib/format';
import { currencyVariant, defaultsForCurrency, switchCurrency, type CurrencyPresets } from '@/lib/currency-defaults';
import type { RateIncreaseInput } from './calc';

const num = () => z.number({ error: 'Enter a number' });
const pct = (min: number, max: number) => num().check(z.minimum(min, `Minimum is ${min}%`), z.maximum(max, `Maximum is ${max}%`));

/** Percentages are whole numbers in the UI/URL (20 = 20%); toCalcInput converts them. */
export const rateIncreaseSchema = z.object({
  currency: z.enum(CURRENCIES),
  rate: num().check(z.minimum(0.01, 'Minimum is 0.01'), z.maximum(1_000_000, 'Maximum is 1,000,000')),
  hours: num().check(z.minimum(1, 'Minimum is 1 hour'), z.maximum(744, 'Maximum is 744 hours (a 31-day month)')),
  increase: pct(1, 200),
  loss: pct(0, 100),
});

export type RateIncreaseState = z.infer<typeof rateIncreaseSchema>;

/**
 * Currency-dependent defaults (CurrencyPresets pattern). The spec sets USD 50 and INR 1,000;
 * the other currencies start at 50. These are starting values for the inputs, not rates.
 */
export const rateIncreaseCurrencyPresets: CurrencyPresets<RateIncreaseState> = {
  USD: { rate: 50 },
  GBP: { rate: 50 },
  EUR: { rate: 50 },
  CAD: { rate: 50 },
  AUD: { rate: 50 },
  INR: { rate: 1_000 },
};

const base: RateIncreaseState = { currency: 'USD', rate: 50, hours: 100, increase: 20, loss: 10 };

export const rateIncreaseDefaults = defaultsForCurrency(base, rateIncreaseCurrencyPresets, 'USD');
export const rateIncreaseVariant = currencyVariant(rateIncreaseDefaults, rateIncreaseCurrencyPresets);

export function switchRateIncreaseCurrency(state: RateIncreaseState, next: CurrencyCode): RateIncreaseState {
  return switchCurrency(state, next, rateIncreaseDefaults, rateIncreaseCurrencyPresets);
}

export function toCalcInput(s: { rate: number; hours: number; increase: number; loss: number }): RateIncreaseInput {
  return { rate: s.rate, hours: s.hours, increase: s.increase / 100, loss: s.loss / 100 };
}

/** Plan B for "Compare two plans": a different increase and expected loss of work. */
export const planBSchema = z.pick(rateIncreaseSchema, { increase: true, loss: true });
export type PlanBState = z.infer<typeof planBSchema>;
export const planBDefaults: PlanBState = { increase: 10, loss: 0 };

export { fieldErrors } from '@/lib/field-errors';
