// zod/mini keeps the client bundle small (same validation, tree-shakable API).
import * as z from 'zod/mini';
import { CURRENCIES, type CurrencyCode } from '@/lib/format';
import { currencyVariant, defaultsForCurrency, switchCurrency, type CurrencyPresets } from '@/lib/currency-defaults';
import { fieldErrors } from '@/lib/field-errors';
import type { MarginInput } from './calc';

const num = () => z.number({ error: 'Enter a number' });
const money = () => num().check(z.minimum(0, 'Can’t be negative'), z.maximum(1_000_000_000, 'Maximum is 1,000,000,000'));

export const PRICE_ABOVE_0 = 'Enter a price above 0';

const price = () => money().check(z.refine((v) => v !== 0, PRICE_ABOVE_0));
const fields = {
  price: price(),
  vc: money(),
  units: num().check(
    z.minimum(0, 'Can’t be negative'),
    z.refine((v) => Number.isInteger(v), 'Enter a whole number'),
    z.maximum(1_000_000_000, 'Maximum is 1,000,000,000'),
  ),
  fixed: money(),
};

export const marginSchema = z.object({ currency: z.enum(CURRENCIES), ...fields });
export type MarginState = z.infer<typeof marginSchema>;

/** Example values only (CurrencyPresets pattern). Units never change with currency. */
export const marginCurrencyPresets: CurrencyPresets<MarginState> = {
  USD: { price: 50, vc: 30, fixed: 12_000 },
  CAD: { price: 50, vc: 30, fixed: 12_000 },
  AUD: { price: 50, vc: 30, fixed: 12_000 },
  GBP: { price: 40, vc: 24, fixed: 9_600 },
  EUR: { price: 40, vc: 24, fixed: 9_600 },
  INR: { price: 2_000, vc: 1_200, fixed: 480_000 },
};

const base: MarginState = { currency: 'USD', price: 50, vc: 30, units: 1_000, fixed: 12_000 };

export const marginDefaults = defaultsForCurrency(base, marginCurrencyPresets, 'USD');
export const marginVariant = currencyVariant(marginDefaults, marginCurrencyPresets);

export function switchMarginCurrency(state: MarginState, next: CurrencyCode, touched?: ReadonlySet<string>): MarginState {
  return switchCurrency(state, next, marginDefaults, marginCurrencyPresets, touched);
}

/** Optional: empty = 0 = no break-even rows. */
export const OPTIONAL = ['fixed'] as const;

type Values = Pick<MarginState, 'price' | 'vc' | 'units' | 'fixed'>;

export function marginErrors(s: Values): Partial<Record<keyof Values, string>> {
  return fieldErrors(z.object(fields), s);
}

export function toCalcInput(s: Values): MarginInput {
  return { price: s.price, variableCost: s.vc, units: s.units, fixed: s.fixed };
}

/** Plan B for "Compare two prices": same costs and units, another price. Example value. */
export const planBSchema = z.object({ price: price() });
export type PlanBState = z.infer<typeof planBSchema>;
export const planBDefaults: PlanBState = { price: 55 };

export { fieldErrors };
