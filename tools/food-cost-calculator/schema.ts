// zod/mini keeps the client bundle small (same validation, tree-shakable API).
import * as z from 'zod/mini';
import { CURRENCIES, type CurrencyCode } from '@/lib/format';
import { currencyVariant, defaultsForCurrency, switchCurrency, type CurrencyPresets } from '@/lib/currency-defaults';
import { fieldErrors } from '@/lib/field-errors';
import type { FoodCostMode } from './calc';

const num = () => z.number({ error: 'Enter a number' });
const money = (max: number) => num().check(z.minimum(0, 'Can’t be negative'), z.maximum(max, `Maximum is ${max.toLocaleString('en-US')}`));

export const MODES = ['percent', 'price', 'period'] as const satisfies readonly FoodCostMode[];

export const foodCostSchema = z.object({
  mode: z.enum(MODES),
  currency: z.enum(CURRENCIES),
  cost: money(1_000_000),
  price: money(1_000_000),
  target: num().check(z.minimum(0, 'Can’t be negative'), z.maximum(100, 'Maximum is 100%')),
  open: money(1_000_000_000),
  buy: money(1_000_000_000),
  close: money(1_000_000_000),
  sales: money(1_000_000_000),
});

export type FoodCostState = z.infer<typeof foodCostSchema>;

/** Example values only (CurrencyPresets pattern). The target % never changes with currency. */
const examples = { cost: 3.5, price: 12, open: 4_000, buy: 12_000, close: 3_500, sales: 40_000 };
export const foodCostCurrencyPresets: CurrencyPresets<FoodCostState> = {
  USD: examples,
  GBP: examples,
  EUR: examples,
  CAD: examples,
  AUD: examples,
  INR: { cost: 90, price: 300, open: 100_000, buy: 300_000, close: 80_000, sales: 1_000_000 },
};

/** 32% target: an example only, labelled on the page (Puru, 2026-11-20: deliberately not a "typical" figure). */
const base: FoodCostState = { mode: 'percent', currency: 'USD', target: 32, ...examples };

export const foodCostDefaults = defaultsForCurrency(base, foodCostCurrencyPresets, 'USD');
export const foodCostVariant = currencyVariant(foodCostDefaults, foodCostCurrencyPresets);

export function switchFoodCostCurrency(state: FoodCostState, next: CurrencyCode, touched?: ReadonlySet<string>): FoodCostState {
  return switchCurrency(state, next, foodCostDefaults, foodCostCurrencyPresets, touched);
}

/** Errors for the fields the current mode uses, plus the "above 0" and inventory rules. */
export function foodCostErrors(s: FoodCostState): Partial<Record<keyof FoodCostState, string>> {
  const all = fieldErrors(foodCostSchema, s);
  const used: (keyof FoodCostState)[] =
    s.mode === 'percent' ? ['cost', 'price'] : s.mode === 'price' ? ['cost', 'target'] : ['open', 'buy', 'close', 'sales'];
  const out: Partial<Record<keyof FoodCostState, string>> = {};
  for (const k of used) if (all[k]) out[k] = all[k];
  if (s.mode === 'percent' && !out.price && s.price === 0) out.price = 'Enter a menu price above 0';
  if (s.mode === 'price' && !out.target && s.target === 0) out.target = 'Enter a target above 0';
  if (s.mode === 'period') {
    if (!out.sales && s.sales === 0) out.sales = 'Enter food sales above 0';
    if (!out.open && !out.buy && !out.close && s.close > s.open + s.buy)
      out.close = 'Closing inventory can’t be more than opening inventory plus purchases';
  }
  return out;
}

export { fieldErrors };
