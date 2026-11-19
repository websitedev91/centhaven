// zod/mini keeps the client bundle small (same validation, tree-shakable API).
import * as z from 'zod/mini';
import { CURRENCIES, type CurrencyCode } from '@/lib/format';
import { currencyVariant, defaultsForCurrency, switchCurrency, type CurrencyPresets } from '@/lib/currency-defaults';

const num = () => z.number({ error: 'Enter a number' });

export const MODES = ['hourly', 'salary'] as const;
export type Mode = (typeof MODES)[number];

export const hourlyToSalarySchema = z.object({
  mode: z.enum(MODES),
  currency: z.enum(CURRENCIES),
  hourly: num().check(z.minimum(0, 'Wage can’t be negative'), z.maximum(100_000, 'Maximum is 100,000')),
  salary: num().check(z.minimum(0, 'Salary can’t be negative'), z.maximum(100_000_000, 'Maximum is 100,000,000')),
  hoursPerWeek: num().check(z.minimum(1, 'Minimum is 1 hour'), z.maximum(100, 'Maximum is 100 hours')),
  daysPerWeek: num().check(z.minimum(1, 'Minimum is 1 day'), z.maximum(7, 'Maximum is 7 days')),
  paidWeeks: num().check(z.minimum(1, 'Minimum is 1 week'), z.maximum(52, 'Maximum is 52 weeks')),
  /** Optional overtime, hourly mode only: 0 = off (default), 1 = on. */
  overtime: num().check(z.refine<number>((v) => v === 0 || v === 1, 'Use 0 or 1')),
  otHours: num().check(z.minimum(0, 'Minimum is 0 hours'), z.maximum(60, 'Maximum is 60 hours')),
  otMultiplier: num().check(z.minimum(1, 'Minimum is 1×'), z.maximum(3, 'Maximum is 3×')),
});

export type HourlyToSalaryState = z.infer<typeof hourlyToSalarySchema>;

/**
 * Currency-dependent defaults (CurrencyPresets pattern). The spec sets USD 25 / 75,000 and
 * INR 500 / 10,00,000; GBP and EUR use the spec's UK example wage (£15) and a matching salary.
 * These are starting values for the inputs, not rates.
 */
export const hourlyToSalaryCurrencyPresets: CurrencyPresets<HourlyToSalaryState> = {
  USD: { hourly: 25, salary: 75_000 },
  CAD: { hourly: 25, salary: 75_000 },
  AUD: { hourly: 25, salary: 75_000 },
  GBP: { hourly: 15, salary: 45_000 },
  EUR: { hourly: 15, salary: 45_000 },
  INR: { hourly: 500, salary: 1_000_000 },
};

const base: HourlyToSalaryState = {
  mode: 'hourly',
  currency: 'USD',
  hourly: 25,
  salary: 75_000,
  hoursPerWeek: 40,
  daysPerWeek: 5,
  paidWeeks: 52,
  overtime: 0,
  otHours: 5,
  otMultiplier: 1.5,
};

export const hourlyToSalaryDefaults = defaultsForCurrency(base, hourlyToSalaryCurrencyPresets, 'USD');
export const hourlyToSalaryVariant = currencyVariant(hourlyToSalaryDefaults, hourlyToSalaryCurrencyPresets);

export function switchHourlyToSalaryCurrency(state: HourlyToSalaryState, next: CurrencyCode, touched?: ReadonlySet<string>): HourlyToSalaryState {
  return switchCurrency(state, next, hourlyToSalaryDefaults, hourlyToSalaryCurrencyPresets, touched);
}

export { fieldErrors } from '@/lib/field-errors';

/** Calc overtime input from the UI state (undefined when overtime is off or in salary mode). */
export function overtimeOf(s: HourlyToSalaryState): { hoursPerWeek: number; multiplier: number } | undefined {
  return s.mode === 'hourly' && s.overtime === 1 ? { hoursPerWeek: s.otHours, multiplier: s.otMultiplier } : undefined;
}
