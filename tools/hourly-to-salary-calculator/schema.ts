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
};

export const hourlyToSalaryDefaults = defaultsForCurrency(base, hourlyToSalaryCurrencyPresets, 'USD');
export const hourlyToSalaryVariant = currencyVariant(hourlyToSalaryDefaults, hourlyToSalaryCurrencyPresets);

export function switchHourlyToSalaryCurrency(state: HourlyToSalaryState, next: CurrencyCode): HourlyToSalaryState {
  return switchCurrency(state, next, hourlyToSalaryDefaults, hourlyToSalaryCurrencyPresets);
}

export { fieldErrors } from '@/lib/field-errors';
