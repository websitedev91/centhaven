// zod/mini keeps the client bundle small (same validation, tree-shakable API).
import * as z from 'zod/mini';
import { CURRENCIES, type CurrencyCode } from '@/lib/format';
import { currencyVariant, defaultsForCurrency, switchCurrency, type CurrencyPresets } from '@/lib/currency-defaults';
import { fieldErrors } from '@/lib/field-errors';
import type { BiweeklyInput, BiweeklyMode } from './calc';

const num = () => z.number({ error: 'Enter a number' });
const money = (max: number) =>
  num().check(z.minimum(0, 'Can’t be negative'), z.maximum(max, `Maximum is ${max.toLocaleString('en-US')}`));
const hours = (max: number) => num().check(z.minimum(0, 'Can’t be negative'), z.maximum(max, `Maximum is ${max} hours`));

export const MODES = ['salary', 'hourly'] as const satisfies readonly BiweeklyMode[];

export const biweeklySchema = z.object({
  mode: z.enum(MODES),
  currency: z.enum(CURRENCIES),
  salary: money(1_000_000_000),
  rate: money(1_000_000),
  hours: hours(168),
  otH: hours(336),
  otRate: money(1_000_000),
});

export type BiweeklyState = z.infer<typeof biweeklySchema>;

/** Example values only (CurrencyPresets pattern). Hours never change with currency. */
export const biweeklyCurrencyPresets: CurrencyPresets<BiweeklyState> = {
  USD: { salary: 52_000, rate: 25 },
  CAD: { salary: 52_000, rate: 25 },
  AUD: { salary: 52_000, rate: 25 },
  GBP: { salary: 36_000, rate: 18.5 },
  EUR: { salary: 36_000, rate: 18.5 },
  INR: { salary: 1_200_000, rate: 600 },
};

const base: BiweeklyState = { mode: 'salary', currency: 'USD', salary: 52_000, rate: 25, hours: 40, otH: 0, otRate: 0 };

export const biweeklyDefaults = defaultsForCurrency(base, biweeklyCurrencyPresets, 'USD');
export const biweeklyVariant = currencyVariant(biweeklyDefaults, biweeklyCurrencyPresets);

export function switchBiweeklyCurrency(state: BiweeklyState, next: CurrencyCode, touched?: ReadonlySet<string>): BiweeklyState {
  return switchCurrency(state, next, biweeklyDefaults, biweeklyCurrencyPresets, touched);
}

/** Optional fields (0 = off): an invalid one shows its own error, and the result still shows. */
export const OPTIONAL = ['otH', 'otRate'] as const;

/** Errors for the fields the current mode uses. */
export function biweeklyErrors(s: BiweeklyState): Partial<Record<keyof BiweeklyState, string>> {
  const all = fieldErrors(biweeklySchema, s);
  const used: (keyof BiweeklyState)[] = s.mode === 'salary' ? ['salary'] : ['rate', 'hours', 'otH', 'otRate'];
  const out: Partial<Record<keyof BiweeklyState, string>> = {};
  for (const k of used) if (all[k]) out[k] = all[k];
  return out;
}

export function toCalcInput(s: BiweeklyState): BiweeklyInput {
  return { mode: s.mode, salary: s.salary, rate: s.rate, hoursPerWeek: s.hours, overtimeHours: s.otH, overtimeRate: s.otRate };
}

export { fieldErrors };
