// zod/mini keeps the client bundle small (same validation, tree-shakable API).
import * as z from 'zod/mini';
import { CURRENCIES, type CurrencyCode } from '@/lib/format';
import { currencyVariant, defaultsForCurrency, switchCurrency, type CurrencyPresets } from '@/lib/currency-defaults';
import type { DaysInput } from './calc';

const num = () => z.number({ error: 'Enter a number' });
const days = (min: number, max: number) =>
  num().check(z.minimum(min, `Minimum is ${min} days`), z.maximum(max, `Maximum is ${max} days`));

export const MODES = ['rate', 'salary'] as const;
export type Mode = (typeof MODES)[number];

/** Percentages are whole numbers in the UI/URL (20 = 20%); toDaysInput converts them. */
export const dayRateSchema = z.object({
  mode: z.enum(MODES),
  currency: z.enum(CURRENCIES),
  dayRate: num().check(z.minimum(0, 'Day rate can’t be negative'), z.maximum(100_000, 'Maximum is 100,000')),
  salary: num().check(z.minimum(0, 'Salary can’t be negative'), z.maximum(100_000_000, 'Maximum is 100,000,000')),
  workingDays: days(200, 270),
  holidays: days(0, 60),
  publicHolidays: days(0, 20),
  sickDays: days(0, 30),
  gapDays: days(0, 120),
  uplift: num().check(z.minimum(0, 'Minimum is 0%'), z.maximum(50, 'Maximum is 50%')),
});

export type DayRateState = z.infer<typeof dayRateSchema>;

/**
 * Currency-dependent defaults (CurrencyPresets pattern). The spec sets GBP 500 / 60,000 (the
 * main audience) and INR 8,000 / 15,00,000; other currencies start from the same figures as GBP.
 * These are starting values for the inputs, not rates.
 */
export const dayRateCurrencyPresets: CurrencyPresets<DayRateState> = {
  GBP: { dayRate: 500, salary: 60_000 },
  USD: { dayRate: 500, salary: 60_000 },
  EUR: { dayRate: 500, salary: 60_000 },
  CAD: { dayRate: 500, salary: 60_000 },
  AUD: { dayRate: 500, salary: 60_000 },
  INR: { dayRate: 8_000, salary: 1_500_000 },
};

const base: DayRateState = {
  mode: 'rate',
  currency: 'GBP',
  dayRate: 500,
  salary: 60_000,
  workingDays: 260,
  holidays: 25,
  publicHolidays: 8,
  sickDays: 5,
  gapDays: 10,
  uplift: 20,
};

/** Page-load defaults (GBP: UK contractors are the main audience). */
export const dayRateDefaults = defaultsForCurrency(base, dayRateCurrencyPresets, 'GBP');
export const dayRateVariant = currencyVariant(dayRateDefaults, dayRateCurrencyPresets);

export function switchDayRateCurrency(state: DayRateState, next: CurrencyCode, touched?: ReadonlySet<string>): DayRateState {
  return switchCurrency(state, next, dayRateDefaults, dayRateCurrencyPresets, touched);
}

export function toDaysInput(s: Omit<DayRateState, 'mode' | 'currency' | 'dayRate' | 'salary'>): DaysInput {
  return {
    workingDays: s.workingDays,
    holidays: s.holidays,
    publicHolidays: s.publicHolidays,
    sickDays: s.sickDays,
    gapDays: s.gapDays,
    uplift: s.uplift / 100,
  };
}

/**
 * Plan B for "Compare two plans": a day rate change (%, so it works in any currency) and its own
 * gap between contracts. Default: a longer contract at 10% less with no gaps.
 */
export const planBSchema = z.object({
  rateChange: num().check(z.minimum(-50, 'Minimum is −50%'), z.maximum(100, 'Maximum is +100%')),
  gapDays: days(0, 120),
});
export type PlanBState = z.infer<typeof planBSchema>;
export const planBDefaults: PlanBState = { rateChange: -10, gapDays: 0 };

export { fieldErrors } from '@/lib/field-errors';
