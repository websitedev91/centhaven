// zod/mini keeps the client bundle small (same validation, tree-shakable API).
import * as z from 'zod/mini';
import { CURRENCIES, type CurrencyCode } from '@/lib/format';
import { currencyVariant, defaultsForCurrency, switchCurrency, type CurrencyPresets } from '@/lib/currency-defaults';
import type { RetainerInput } from './calc';

const num = () => z.number({ error: 'Enter a number' });

/**
 * Percentages are whole numbers in the UI/URL (−10 = 10% discount); toCalcInput converts them.
 * `adjust` replaced `discount` (review #2 B3): negative = discount, positive = premium. The new
 * name means old share links with `discount=10` are ignored rather than read as a 10% premium.
 */
export const retainerSchema = z.object({
  currency: z.enum(CURRENCIES),
  rate: num().check(z.minimum(0, 'Rate can’t be negative'), z.maximum(1_000_000, 'Maximum is 1,000,000')),
  hours: num().check(z.minimum(1, 'Minimum is 1 hour'), z.maximum(744, 'Maximum is 744 hours (a 31-day month)')),
  adjust: num().check(z.minimum(-50, 'Minimum is −50%'), z.maximum(50, 'Maximum is +50%')),
  months: num().check(
    z.refine((v) => Number.isInteger(v), 'Use whole months'),
    z.minimum(1, 'Minimum is 1 month'),
    z.maximum(60, 'Maximum is 60 months'),
  ),
  usage: num().check(z.minimum(0, 'Minimum is 0%'), z.maximum(100, 'Maximum is 100%')),
  /** 0 = use the hourly rate. */
  overageRate: num().check(z.minimum(0, 'Rate can’t be negative'), z.maximum(1_000_000, 'Maximum is 1,000,000')),
  extraHours: num().check(z.minimum(0, 'Minimum is 0 hours'), z.maximum(744, 'Maximum is 744 hours')),
});

export type RetainerState = z.infer<typeof retainerSchema>;

/** Currency-dependent defaults (spec, approved): starting values for the inputs, not rates. */
export const retainerCurrencyPresets: CurrencyPresets<RetainerState> = {
  USD: { rate: 100 },
  CAD: { rate: 100 },
  AUD: { rate: 100 },
  GBP: { rate: 75 },
  EUR: { rate: 75 },
  INR: { rate: 2_000 },
};

const base: RetainerState = { currency: 'USD', rate: 100, hours: 20, adjust: -10, months: 6, usage: 80, overageRate: 0, extraHours: 0 };

export const retainerDefaults = defaultsForCurrency(base, retainerCurrencyPresets, 'USD');
export const retainerVariant = currencyVariant(retainerDefaults, retainerCurrencyPresets);

export function switchRetainerCurrency(state: RetainerState, next: CurrencyCode): RetainerState {
  return switchCurrency(state, next, retainerDefaults, retainerCurrencyPresets);
}

/** Overage rate actually used: the user's own, or the hourly rate when 0. */
export function effectiveOverageRate(s: Pick<RetainerState, 'overageRate' | 'rate'>): number {
  return s.overageRate > 0 ? s.overageRate : s.rate;
}

export function toCalcInput(s: Omit<RetainerState, 'currency'>): RetainerInput {
  return {
    rate: s.rate,
    hours: s.hours,
    adjustment: s.adjust / 100,
    months: s.months,
    usage: s.usage / 100,
    overageRate: s.overageRate,
    extraHours: s.extraHours,
  };
}

/** Plan B for "Compare two retainers": different committed hours and discount/premium. */
export const planBSchema = z.pick(retainerSchema, { hours: true, adjust: true });
export type PlanBState = z.infer<typeof planBSchema>;
export const planBDefaults: PlanBState = { hours: 40, adjust: -15 };

export { fieldErrors } from '@/lib/field-errors';
