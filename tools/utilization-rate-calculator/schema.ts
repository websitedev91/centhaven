// zod/mini keeps the client bundle small (same validation, tree-shakable API).
import * as z from 'zod/mini';
import { CURRENCIES, type CurrencyCode } from '@/lib/format';
import { currencyVariant, defaultsForCurrency, switchCurrency, type CurrencyPresets } from '@/lib/currency-defaults';
import type { UtilizationInput } from './calc';

const num = () => z.number({ error: 'Enter a number' });
const hours = (min: number) => num().check(z.minimum(min, `Minimum is ${min} ${min === 1 ? 'hour' : 'hours'}`), z.maximum(10_000, 'Maximum is 10,000 hours'));

export const PERIODS = ['week', 'month', 'year'] as const;
export type Period = (typeof PERIODS)[number];

/** Target is a whole-number percentage in the UI/URL (75 = 75%); toCalcInput converts it. */
export const utilizationSchema = z.object({
  period: z.enum(PERIODS),
  currency: z.enum(CURRENCIES),
  billable: hours(0),
  available: hours(1),
  /** Optional leave/holiday hours to exclude (review C9). */
  leave: hours(0),
  target: num().check(z.minimum(10, 'Minimum is 10%'), z.maximum(100, 'Maximum is 100%')),
  rate: num().check(z.minimum(0, 'Rate can’t be negative'), z.maximum(1_000_000, 'Maximum is 1,000,000')),
});

export type UtilizationState = z.infer<typeof utilizationSchema>;

/**
 * Currency-dependent defaults (CurrencyPresets pattern). The spec sets a rate of 100; INR uses
 * 1,500 (the spec's consulting-team example). These are starting values for the inputs, not rates.
 */
export const utilizationCurrencyPresets: CurrencyPresets<UtilizationState> = {
  USD: { rate: 100 },
  GBP: { rate: 100 },
  EUR: { rate: 100 },
  CAD: { rate: 100 },
  AUD: { rate: 100 },
  INR: { rate: 1_500 },
};

const base: UtilizationState = { period: 'week', currency: 'USD', billable: 28, available: 40, leave: 0, target: 75, rate: 100 };

export const utilizationDefaults = defaultsForCurrency(base, utilizationCurrencyPresets, 'USD');
export const utilizationVariant = currencyVariant(utilizationDefaults, utilizationCurrencyPresets);

export function switchUtilizationCurrency(state: UtilizationState, next: CurrencyCode): UtilizationState {
  return switchCurrency(state, next, utilizationDefaults, utilizationCurrencyPresets);
}

export function toCalcInput(s: UtilizationState): UtilizationInput {
  return { billable: s.billable, available: s.available, leave: s.leave, target: s.target / 100, rate: s.rate };
}

export { fieldErrors } from '@/lib/field-errors';
