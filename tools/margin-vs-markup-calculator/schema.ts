// zod/mini keeps the client bundle small (same validation, tree-shakable API).
import * as z from 'zod/mini';
import { CURRENCIES, type CurrencyCode } from '@/lib/format';
import { currencyVariant, defaultsForCurrency, switchCurrency, type CurrencyPresets } from '@/lib/currency-defaults';
import { fieldErrors } from '@/lib/field-errors';
import type { MarginMode, PriceFrom } from './calc';

const num = () => z.number({ error: 'Enter a number' });
const money = () => num().check(z.minimum(0, 'Can’t be negative'), z.maximum(10_000_000_000, 'Maximum is 10,000,000,000'));

export const MODES = ['price', 'find', 'convert'] as const satisfies readonly MarginMode[];
export const PRICE_FROM = ['margin', 'markup'] as const satisfies readonly PriceFrom[];

export const marginSchema = z.object({
  mode: z.enum(MODES),
  currency: z.enum(CURRENCIES),
  cost: money(),
  price: money(),
  by: z.enum(PRICE_FROM),
  // A margin of 100% would need an infinite price.
  margin: num().check(z.minimum(0, 'Can’t be negative'), z.maximum(99.99, 'Margin must be below 100%')),
  markup: num().check(z.minimum(0, 'Can’t be negative'), z.maximum(10_000, 'Maximum is 10,000%')),
});

export type MarginState = z.infer<typeof marginSchema>;

/** Example values only (CurrencyPresets pattern). Percentages never change with currency. */
export const marginCurrencyPresets: CurrencyPresets<MarginState> = {
  USD: { cost: 60, price: 100 },
  GBP: { cost: 60, price: 100 },
  EUR: { cost: 60, price: 100 },
  CAD: { cost: 60, price: 100 },
  AUD: { cost: 60, price: 100 },
  INR: { cost: 800, price: 1_000 },
};

const base: MarginState = { mode: 'price', currency: 'USD', cost: 60, price: 100, by: 'margin', margin: 40, markup: 50 };

export const marginDefaults = defaultsForCurrency(base, marginCurrencyPresets, 'USD');
export const marginVariant = currencyVariant(marginDefaults, marginCurrencyPresets);

export function switchMarginCurrency(state: MarginState, next: CurrencyCode, touched?: ReadonlySet<string>): MarginState {
  return switchCurrency(state, next, marginDefaults, marginCurrencyPresets, touched);
}

/** The fields the current mode uses. */
export function usedFields(s: Pick<MarginState, 'mode' | 'by'>): (keyof MarginState)[] {
  if (s.mode === 'price') return ['cost', 'price'];
  if (s.mode === 'find') return ['cost', s.by];
  return [s.by];
}

/** Errors for the fields the current mode uses (hidden boxes never block the result). */
export function marginErrors(s: MarginState): Partial<Record<keyof MarginState, string>> {
  const all = fieldErrors(marginSchema, s);
  const out: Partial<Record<keyof MarginState, string>> = {};
  for (const k of usedFields(s)) if (all[k]) out[k] = all[k];
  // Cost and price: margin is profit ÷ price, so the price must be above 0 (Puru, 2026-11-20).
  if (s.mode === 'price' && !out.price && s.price === 0) out.price = 'Enter a price above 0';
  return out;
}

export { fieldErrors };
