// zod/mini keeps the client bundle small (same validation, tree-shakable API).
import * as z from 'zod/mini';
import { CURRENCIES, type CurrencyCode } from '@/lib/format';
import { currencyVariant, defaultsForCurrency, switchCurrency, type CurrencyPresets } from '@/lib/currency-defaults';
import { fieldErrors } from '@/lib/field-errors';
import type { MidpointFrom } from './calc';

const num = () => z.number({ error: 'Enter a number' });
const money = () => num().check(z.minimum(0, 'Can’t be negative'), z.maximum(1_000_000_000, 'Maximum is 1,000,000,000'));

export const MID_FROM = ['range', 'own'] as const satisfies readonly MidpointFrom[];

export const compaSchema = z.object({
  mid: z.enum(MID_FROM),
  currency: z.enum(CURRENCIES),
  salary: money(),
  min: money(),
  max: money(),
  midpoint: money(),
});

export type CompaState = z.infer<typeof compaSchema>;

/** Example values only (CurrencyPresets pattern): a pay range comes from the user's employer, never from us. */
export const compaCurrencyPresets: CurrencyPresets<CompaState> = {
  USD: { salary: 72_000, min: 60_000, max: 90_000, midpoint: 75_000 },
  CAD: { salary: 72_000, min: 60_000, max: 90_000, midpoint: 75_000 },
  AUD: { salary: 72_000, min: 60_000, max: 90_000, midpoint: 75_000 },
  GBP: { salary: 45_000, min: 40_000, max: 56_000, midpoint: 48_000 },
  EUR: { salary: 45_000, min: 40_000, max: 56_000, midpoint: 48_000 },
  INR: { salary: 1_200_000, min: 1_000_000, max: 1_500_000, midpoint: 1_250_000 },
};

const base: CompaState = { mid: 'range', currency: 'USD', salary: 72_000, min: 60_000, max: 90_000, midpoint: 75_000 };

export const compaDefaults = defaultsForCurrency(base, compaCurrencyPresets, 'USD');
export const compaVariant = currencyVariant(compaDefaults, compaCurrencyPresets);

export function switchCompaCurrency(state: CompaState, next: CurrencyCode, touched?: ReadonlySet<string>): CompaState {
  return switchCurrency(state, next, compaDefaults, compaCurrencyPresets, touched);
}

/** In "own midpoint" mode the range is optional: it only adds range penetration. */
export function optionalFields(s: Pick<CompaState, 'mid'>): readonly (keyof CompaState)[] {
  return s.mid === 'own' ? ['min', 'max'] : [];
}

export const MAX_ABOVE_MIN = 'Maximum must be above the minimum';

/** Errors for the fields the current mode uses, plus the range and midpoint rules. */
export function compaErrors(s: CompaState): Partial<Record<keyof CompaState, string>> {
  const all = fieldErrors(compaSchema, s);
  const used: (keyof CompaState)[] = s.mid === 'range' ? ['salary', 'min', 'max'] : ['salary', 'midpoint', 'min', 'max'];
  const out: Partial<Record<keyof CompaState, string>> = {};
  for (const k of used) if (all[k]) out[k] = all[k];
  if (s.mid === 'own' && !out.midpoint && s.midpoint === 0) out.midpoint = 'Enter a midpoint above 0';
  // Range mode: always checked. Own mode: only once a maximum is entered (0 = no range).
  const rangeGiven = s.mid === 'range' || s.max > 0;
  if (rangeGiven && !out.min && !out.max && s.max <= s.min) out.max = MAX_ABOVE_MIN;
  return out;
}

/** The range to use for penetration, or null when there is none (own mode without a valid range). */
export function rangeOf(s: Pick<CompaState, 'min' | 'max'>): { min: number; max: number } | null {
  return Number.isFinite(s.min) && Number.isFinite(s.max) && s.max > s.min ? { min: s.min, max: s.max } : null;
}

/** Plan B for "Compare two salaries": the same range, after a raise of x%. */
export const planBSchema = z.object({
  raise: num().check(z.minimum(-90, 'Minimum is −90%'), z.maximum(1_000, 'Maximum is 1,000%')),
});
export type PlanBState = z.infer<typeof planBSchema>;
export const planBDefaults: PlanBState = { raise: 5 };

export { fieldErrors };
