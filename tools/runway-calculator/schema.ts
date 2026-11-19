// zod/mini keeps the client bundle small (same validation, tree-shakable API).
import * as z from 'zod/mini';
import { CURRENCIES, type CurrencyCode } from '@/lib/format';
import { currencyVariant, defaultsForCurrency, switchCurrency, type CurrencyPresets } from '@/lib/currency-defaults';
import type { RunwayInput } from './calc';

const num = () => z.number({ error: 'Enter a number' });
const money = () => num().check(z.minimum(0, 'Can’t be negative'), z.maximum(10_000_000_000, 'Maximum is 10,000,000,000'));

export const runwaySchema = z.object({
  currency: z.enum(CURRENCIES),
  cash: money(),
  costs: money(),
  revenue: money(),
  target: num().check(z.minimum(0, 'Can’t be negative'), z.maximum(120, 'Maximum is 120 months')),
});

export type RunwayState = z.infer<typeof runwaySchema>;

/** Example values only (CurrencyPresets pattern). */
export const runwayCurrencyPresets: CurrencyPresets<RunwayState> = {
  USD: { cash: 120_000, costs: 25_000, revenue: 10_000 },
  GBP: { cash: 120_000, costs: 25_000, revenue: 10_000 },
  EUR: { cash: 120_000, costs: 25_000, revenue: 10_000 },
  CAD: { cash: 120_000, costs: 25_000, revenue: 10_000 },
  AUD: { cash: 120_000, costs: 25_000, revenue: 10_000 },
  INR: { cash: 5_000_000, costs: 800_000, revenue: 300_000 },
};

const base: RunwayState = { currency: 'USD', cash: 120_000, costs: 25_000, revenue: 10_000, target: 0 };

export const runwayDefaults = defaultsForCurrency(base, runwayCurrencyPresets, 'USD');
export const runwayVariant = currencyVariant(runwayDefaults, runwayCurrencyPresets);

export function switchRunwayCurrency(state: RunwayState, next: CurrencyCode, touched?: ReadonlySet<string>): RunwayState {
  return switchCurrency(state, next, runwayDefaults, runwayCurrencyPresets, touched);
}

export function toCalcInput(s: Pick<RunwayState, 'cash' | 'costs' | 'revenue' | 'target'>): RunwayInput {
  return { cash: s.cash, costs: s.costs, revenue: s.revenue, target: s.target };
}

/** Plan B for "Compare two plans": different monthly costs and revenue. */
export const planBSchema = z.pick(runwaySchema, { costs: true, revenue: true });
export type PlanBState = z.infer<typeof planBSchema>;
export const planBDefaults: PlanBState = { costs: 20_000, revenue: 10_000 };

export { fieldErrors } from '@/lib/field-errors';
