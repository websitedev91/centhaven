// zod/mini keeps the client bundle small (same validation, tree-shakable API).
import * as z from 'zod/mini';
import { CURRENCIES, type CurrencyCode } from '@/lib/format';
import { currencyVariant, defaultsForCurrency, switchCurrency, type CurrencyPresets } from '@/lib/currency-defaults';
import { fieldErrors } from '@/lib/field-errors';
import type { PartTimeInput, PartTimeMode } from './calc';

const num = () => z.number({ error: 'Enter a number' });
const money = (max: number) => num().check(z.minimum(0, 'Can’t be negative'), z.maximum(max, `Maximum is ${max.toLocaleString('en-US')}`));
const hours = () => num().check(z.minimum(0, 'Can’t be negative'), z.maximum(168, 'Maximum is 168 hours'));

export const MODES = ['prorata', 'hourly'] as const satisfies readonly PartTimeMode[];

export const partTimeSchema = z.object({
  mode: z.enum(MODES),
  currency: z.enum(CURRENCIES),
  ftSalary: money(1_000_000_000),
  ftHours: hours(),
  ptHours: hours(),
  rate: money(1_000_000),
  hours: hours(),
  weeks: num().check(z.minimum(0, 'Can’t be negative'), z.maximum(53, 'Maximum is 53 weeks')),
});

export type PartTimeState = z.infer<typeof partTimeSchema>;

/** Example values only (CurrencyPresets pattern). Hours and weeks never change with currency. */
export const partTimeCurrencyPresets: CurrencyPresets<PartTimeState> = {
  USD: { ftSalary: 50_000, rate: 20 },
  CAD: { ftSalary: 50_000, rate: 20 },
  AUD: { ftSalary: 50_000, rate: 20 },
  GBP: { ftSalary: 35_000, rate: 15 },
  EUR: { ftSalary: 35_000, rate: 15 },
  INR: { ftSalary: 600_000, rate: 300 },
};

/** 40 full-time hours is an example only: the user's own contract decides. */
const base: PartTimeState = { mode: 'prorata', currency: 'USD', ftSalary: 50_000, ftHours: 40, ptHours: 24, rate: 20, hours: 20, weeks: 52 };

export const partTimeDefaults = defaultsForCurrency(base, partTimeCurrencyPresets, 'USD');
export const partTimeVariant = currencyVariant(partTimeDefaults, partTimeCurrencyPresets);

export function switchPartTimeCurrency(state: PartTimeState, next: CurrencyCode, touched?: ReadonlySet<string>): PartTimeState {
  return switchCurrency(state, next, partTimeDefaults, partTimeCurrencyPresets, touched);
}

export const FT_ABOVE_0 = 'Enter full-time hours above 0';
export const PT_TOO_MANY = 'Part-time hours can’t be more than full-time hours';

/** Errors for the fields the current mode uses, plus the hours rules. */
export function partTimeErrors(s: PartTimeState): Partial<Record<keyof PartTimeState, string>> {
  const all = fieldErrors(partTimeSchema, s);
  const used: (keyof PartTimeState)[] = s.mode === 'prorata' ? ['ftSalary', 'ftHours', 'ptHours'] : ['rate', 'hours', 'weeks'];
  const out: Partial<Record<keyof PartTimeState, string>> = {};
  for (const k of used) if (all[k]) out[k] = all[k];
  if (s.mode === 'prorata') {
    if (!out.ftHours && s.ftHours === 0) out.ftHours = FT_ABOVE_0;
    if (!out.ftHours && !out.ptHours && s.ptHours > s.ftHours) out.ptHours = PT_TOO_MANY;
  }
  return out;
}

export function toCalcInput(s: PartTimeState): PartTimeInput {
  return { mode: s.mode, ftSalary: s.ftSalary, ftHours: s.ftHours, ptHours: s.ptHours, rate: s.rate, hours: s.hours, weeks: s.weeks };
}

/** Plan B for "Compare two schedules": other weekly hours, everything else the same. */
export const planBSchema = z.object({ hours: hours() });
export type PlanBState = z.infer<typeof planBSchema>;
export const planBDefaults: PlanBState = { hours: 30 };

export { fieldErrors };
