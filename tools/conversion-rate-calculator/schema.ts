// zod/mini keeps the client bundle small (same validation, tree-shakable API).
import * as z from 'zod/mini';
import { CURRENCIES, type CurrencyCode } from '@/lib/format';
import { currencyVariant, defaultsForCurrency, switchCurrency, type CurrencyPresets } from '@/lib/currency-defaults';
import { fieldErrors } from '@/lib/field-errors';
import type { ConversionInput, ConversionMode } from './calc';

const num = () => z.number({ error: 'Enter a number' });
const whole = (min: number, minMsg: string) =>
  num().check(
    z.refine((v) => Number.isInteger(v), 'Enter a whole number'),
    z.minimum(min, minMsg),
    z.maximum(1_000_000_000, 'Maximum is 1,000,000,000'),
  );

export const MODES = ['rate', 'conversions', 'visitors'] as const satisfies readonly ConversionMode[];

export const conversionSchema = z.object({
  mode: z.enum(MODES),
  currency: z.enum(CURRENCIES),
  visits: whole(1, 'Enter at least 1 visitor'),
  conv: whole(0, 'Can’t be negative'),
  target: num().check(z.minimum(0.01, 'Enter a rate above 0'), z.maximum(100, 'Maximum is 100%')),
  goal: whole(1, 'Enter at least 1 conversion'),
  value: num().check(z.minimum(0, 'Can’t be negative'), z.maximum(10_000_000, 'Maximum is 10,000,000')),
});

export type ConversionState = z.infer<typeof conversionSchema>;

/** Example values only (CurrencyPresets pattern). Counts and rates never change with currency. */
export const conversionCurrencyPresets: CurrencyPresets<ConversionState> = {
  USD: { value: 50 },
  GBP: { value: 50 },
  EUR: { value: 50 },
  CAD: { value: 50 },
  AUD: { value: 50 },
  INR: { value: 2_000 },
};

const base: ConversionState = { mode: 'rate', currency: 'USD', visits: 5_000, conv: 150, target: 4, goal: 200, value: 50 };

export const conversionDefaults = defaultsForCurrency(base, conversionCurrencyPresets, 'USD');
export const conversionVariant = currencyVariant(conversionDefaults, conversionCurrencyPresets);

export function switchConversionCurrency(state: ConversionState, next: CurrencyCode, touched?: ReadonlySet<string>): ConversionState {
  return switchCurrency(state, next, conversionDefaults, conversionCurrencyPresets, touched);
}

/** Optional (0 = off): an invalid value shows its own error and the result still shows. */
export const OPTIONAL = ['value'] as const;

/** Errors for the fields the current mode uses. A negative target says "Can’t be negative". */
export function conversionErrors(s: ConversionState): Partial<Record<keyof ConversionState, string>> {
  const all = fieldErrors(conversionSchema, s);
  const used: (keyof ConversionState)[] =
    s.mode === 'rate' ? ['visits', 'conv', 'value'] : s.mode === 'conversions' ? ['visits', 'target', 'value'] : ['goal', 'target', 'value'];
  const out: Partial<Record<keyof ConversionState, string>> = {};
  for (const k of used) if (all[k]) out[k] = all[k];
  if (out.target && s.target < 0) out.target = 'Can’t be negative';
  if (s.mode === 'rate' && !out.conv && !out.visits && s.conv > s.visits) out.conv = 'Conversions can’t be more than visitors';
  return out;
}

export function toCalcInput(s: ConversionState): ConversionInput {
  return { mode: s.mode, visitors: s.visits, conversions: s.conv, target: s.target / 100, goal: s.goal, value: s.value };
}

/** Plan B for "Compare two pages" (rate mode): another page or campaign's visitors and conversions. */
export const planBSchema = z.pick(conversionSchema, { visits: true, conv: true });
export type PlanBState = z.infer<typeof planBSchema>;
export const planBDefaults: PlanBState = { visits: 4_000, conv: 140 };

export function planBErrors(b: PlanBState): Partial<Record<keyof PlanBState, string>> {
  const out = fieldErrors(planBSchema, b);
  if (!out.conv && !out.visits && b.conv > b.visits) out.conv = 'Conversions can’t be more than visitors';
  return out;
}

export { fieldErrors };
