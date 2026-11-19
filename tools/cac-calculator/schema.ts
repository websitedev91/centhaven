// zod/mini keeps the client bundle small (same validation, tree-shakable API).
import * as z from 'zod/mini';
import { CURRENCIES, type CurrencyCode } from '@/lib/format';
import { currencyVariant, defaultsForCurrency, switchCurrency, type CurrencyPresets } from '@/lib/currency-defaults';
import type { CacInput } from './calc';

const num = () => z.number({ error: 'Enter a number' });
const money = () => num().check(z.minimum(0, 'Can’t be negative'), z.maximum(10_000_000_000, 'Maximum is 10,000,000,000'));

export const cacSchema = z.object({
  currency: z.enum(CURRENCIES),
  mkt: money(),
  sales: money(),
  cust: num().check(
    z.refine((v) => Number.isInteger(v), 'Enter a whole number'),
    z.minimum(1, 'Enter at least 1 customer'),
    z.maximum(1_000_000_000, 'Maximum is 1,000,000,000'),
  ),
  ltv: money(),
  target: num().check(z.minimum(0, 'Can’t be negative'), z.maximum(100, 'Maximum is 100')),
});

export type CacState = z.infer<typeof cacSchema>;

/** Example values only (CurrencyPresets pattern). Customers and target never change with currency. */
export const cacCurrencyPresets: CurrencyPresets<CacState> = {
  USD: { mkt: 8_000, sales: 4_000, ltv: 900 },
  CAD: { mkt: 8_000, sales: 4_000, ltv: 900 },
  AUD: { mkt: 8_000, sales: 4_000, ltv: 900 },
  GBP: { mkt: 6_000, sales: 3_000, ltv: 675 },
  EUR: { mkt: 6_000, sales: 3_000, ltv: 675 },
  INR: { mkt: 400_000, sales: 200_000, ltv: 18_000 },
};

const base: CacState = { currency: 'USD', mkt: 8_000, sales: 4_000, cust: 60, ltv: 900, target: 3 };

export const cacDefaults = defaultsForCurrency(base, cacCurrencyPresets, 'USD');
export const cacVariant = currencyVariant(cacDefaults, cacCurrencyPresets);

export function switchCacCurrency(state: CacState, next: CurrencyCode, touched?: ReadonlySet<string>): CacState {
  return switchCurrency(state, next, cacDefaults, cacCurrencyPresets, touched);
}

export function toCalcInput(s: Pick<CacState, 'mkt' | 'sales' | 'cust' | 'ltv' | 'target'>): CacInput {
  return { marketing: s.mkt, sales: s.sales, customers: s.cust, ltv: s.ltv, target: s.target };
}

/** Plan B for "Compare two plans": different spend and customers. */
export const planBSchema = z.pick(cacSchema, { mkt: true, sales: true, cust: true });
export type PlanBState = z.infer<typeof planBSchema>;
export const planBDefaults: PlanBState = { mkt: 6_000, sales: 4_000, cust: 60 };

export { fieldErrors } from '@/lib/field-errors';
