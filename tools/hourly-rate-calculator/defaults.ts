import type { CurrencyCode } from '@/lib/format';
import { currencyVariant, defaultsForCurrency, switchCurrency, type CurrencyPresets } from '@/lib/currency-defaults';
import type { HourlyRateInput } from './calc';

/**
 * State, defaults and currency presets WITHOUT Zod, so light pages (the homepage hero) can
 * reuse them without loading the validator. schema.ts re-exports everything here and checks
 * at compile time that `HourlyRateState` matches the Zod schema.
 *
 * Percentages are stored as whole numbers (25 = 25%) because that is what users see and
 * share; `toCalcInput` converts them to fractions for calc.ts.
 */
export type HourlyRateState = {
  currency: CurrencyCode;
  targetIncome: number;
  expenses: number;
  taxRate: number;
  weeksOff: number;
  hoursPerWeek: number;
  billablePct: number;
  /** Optional buffer for slow months, whole % (0–50). */
  buffer: number;
};

export type HourlyRateField = keyof HourlyRateState;

/**
 * Currency-dependent defaults. Untouched fields follow the currency when it changes;
 * values the user typed are kept (see lib/currency-defaults.ts).
 */
export const hourlyRateCurrencyPresets: CurrencyPresets<HourlyRateState> = {
  USD: { targetIncome: 60_000, expenses: 6_000, taxRate: 25 },
  CAD: { targetIncome: 60_000, expenses: 6_000, taxRate: 25 },
  AUD: { targetIncome: 60_000, expenses: 6_000, taxRate: 25 },
  GBP: { targetIncome: 45_000, expenses: 4_500, taxRate: 25 },
  EUR: { targetIncome: 45_000, expenses: 4_500, taxRate: 25 },
  INR: { targetIncome: 1_200_000, expenses: 120_000, taxRate: 10 },
};

const baseDefaults: HourlyRateState = {
  currency: 'USD',
  targetIncome: 60_000,
  expenses: 6_000,
  taxRate: 25,
  weeksOff: 6,
  hoursPerWeek: 40,
  billablePct: 75,
  buffer: 0,
};

/** Page-load defaults (USD). */
export const hourlyRateDefaults: HourlyRateState = defaultsForCurrency(baseDefaults, hourlyRateCurrencyPresets, 'USD');

export const hourlyRateVariant = currencyVariant(hourlyRateDefaults, hourlyRateCurrencyPresets);

export function switchHourlyRateCurrency(state: HourlyRateState, next: CurrencyCode): HourlyRateState {
  return switchCurrency(state, next, hourlyRateDefaults, hourlyRateCurrencyPresets);
}

export function toCalcInput(s: Omit<HourlyRateState, 'currency'>): HourlyRateInput {
  return {
    targetIncome: s.targetIncome,
    expenses: s.expenses,
    taxRate: s.taxRate / 100,
    weeksOff: s.weeksOff,
    hoursPerWeek: s.hoursPerWeek,
    billablePct: s.billablePct / 100,
    buffer: s.buffer / 100,
  };
}
