// zod/mini keeps the client bundle small (same validation, tree-shakable API).
import * as z from 'zod/mini';
import { CURRENCIES, type CurrencyCode } from '@/lib/format';
import { currencyVariant, defaultsForCurrency, switchCurrency, type CurrencyPresets } from '@/lib/currency-defaults';
import type { CommissionInput, PlanType, Tier } from './calc';

const num = () => z.number({ error: 'Enter a number' });
const money = () => num().check(z.minimum(0, 'Can’t be negative'), z.maximum(1_000_000_000, 'Maximum is 1,000,000,000'));
const pct = () => num().check(z.minimum(0, 'Minimum is 0%'), z.maximum(100, 'Maximum is 100%'));

export const PLANS = ['flat', 'tiered'] as const satisfies readonly PlanType[];

/**
 * Flat fields so the state fits the URL. Tier 1 always starts at 0. Tiers 2–4 with "From" 0
 * are off. Percentages are whole numbers in the UI/URL (5 = 5%).
 */
export const commissionSchema = z.object({
  plan: z.enum(PLANS),
  currency: z.enum(CURRENCIES),
  sales: money(),
  rate: pct(),
  base: money(),
  t1Rate: pct(),
  t2From: money(),
  t2Rate: pct(),
  t3From: money(),
  t3Rate: pct(),
  t4From: money(),
  t4Rate: pct(),
});

export type CommissionState = z.infer<typeof commissionSchema>;

/** Example values only (CurrencyPresets pattern), not market data. */
export const commissionCurrencyPresets: CurrencyPresets<CommissionState> = {
  USD: { sales: 50_000, t2From: 20_000, t3From: 50_000 },
  GBP: { sales: 50_000, t2From: 20_000, t3From: 50_000 },
  EUR: { sales: 50_000, t2From: 20_000, t3From: 50_000 },
  CAD: { sales: 50_000, t2From: 20_000, t3From: 50_000 },
  AUD: { sales: 50_000, t2From: 20_000, t3From: 50_000 },
  INR: { sales: 500_000, t2From: 200_000, t3From: 500_000 },
};

const base: CommissionState = {
  plan: 'flat',
  currency: 'USD',
  sales: 50_000,
  rate: 5,
  base: 0,
  t1Rate: 3,
  t2From: 20_000,
  t2Rate: 5,
  t3From: 50_000,
  t3Rate: 8,
  t4From: 0,
  t4Rate: 0,
};

export const commissionDefaults = defaultsForCurrency(base, commissionCurrencyPresets, 'USD');
export const commissionVariant = currencyVariant(commissionDefaults, commissionCurrencyPresets);

export function switchCommissionCurrency(state: CommissionState, next: CurrencyCode, touched?: ReadonlySet<string>): CommissionState {
  return switchCurrency(state, next, commissionDefaults, commissionCurrencyPresets, touched);
}

/** Active tiers: tier 1 from 0, then every tier whose "From" is above 0. */
export function activeTiers(s: CommissionState): Tier[] {
  const tiers: Tier[] = [{ from: 0, rate: s.t1Rate / 100 }];
  for (const [from, rate] of [
    [s.t2From, s.t2Rate],
    [s.t3From, s.t3Rate],
    [s.t4From, s.t4Rate],
  ] as const) {
    if (from > 0) tiers.push({ from, rate: rate / 100 });
  }
  return tiers;
}

export function toCalcInput(s: CommissionState): CommissionInput {
  return { plan: s.plan, sales: s.sales, rate: s.rate / 100, tiers: activeTiers(s), base: s.base };
}

/** Plan B for "Compare two commission plans": a flat rate. */
export const planBSchema = z.object({ rate: pct() });
export type PlanBState = z.infer<typeof planBSchema>;
export const planBDefaults: PlanBState = { rate: 6 };

export { fieldErrors } from '@/lib/field-errors';
