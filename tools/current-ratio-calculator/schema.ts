// zod/mini keeps the client bundle small (same validation, tree-shakable API).
import * as z from 'zod/mini';
import { CURRENCIES, type CurrencyCode } from '@/lib/format';
import { currencyVariant, defaultsForCurrency, switchCurrency, type CurrencyPresets } from '@/lib/currency-defaults';
import { fieldErrors } from '@/lib/field-errors';
import type { RatioInput } from './calc';

const num = () => z.number({ error: 'Enter a number' });
const MAX = 1_000_000_000_000;
const money = () => num().check(z.minimum(0, 'Can’t be negative'), z.maximum(MAX, 'Maximum is 1,000,000,000,000'));

const fields = { assets: money(), liab: money(), inv: money(), prepaid: money() };

export const ratioSchema = z.object({ currency: z.enum(CURRENCIES), ...fields });
export type RatioState = z.infer<typeof ratioSchema>;

/** Example values only (CurrencyPresets pattern). The ratios come out the same; only the size changes. */
const usd = { assets: 250_000, liab: 125_000, inv: 60_000, prepaid: 10_000 };
const gbp = { assets: 200_000, liab: 100_000, inv: 50_000, prepaid: 8_000 };
export const ratioCurrencyPresets: CurrencyPresets<RatioState> = {
  USD: usd,
  CAD: usd,
  AUD: usd,
  GBP: gbp,
  EUR: gbp,
  INR: { assets: 5_000_000, liab: 2_500_000, inv: 1_200_000, prepaid: 200_000 },
};

const base: RatioState = { currency: 'USD', ...usd };

export const ratioDefaults = defaultsForCurrency(base, ratioCurrencyPresets, 'USD');
export const ratioVariant = currencyVariant(ratioDefaults, ratioCurrencyPresets);

export function switchRatioCurrency(state: RatioState, next: CurrencyCode, touched?: ReadonlySet<string>): RatioState {
  return switchCurrency(state, next, ratioDefaults, ratioCurrencyPresets, touched);
}

/** Optional: empty = 0. An invalid one keeps the current ratio and working capital on screen. */
export const OPTIONAL = ['inv', 'prepaid'] as const;

export const LIAB_ABOVE_0 = 'Enter current liabilities above 0';
export const QUICK_TOO_BIG = 'Inventory and prepaid expenses can’t be more than current assets';

type Values = Pick<RatioState, 'assets' | 'liab' | 'inv' | 'prepaid'>;

/** Errors for the four boxes, plus the "above 0" and inventory rules. */
export function ratioErrors(s: Values): Partial<Record<keyof Values, string>> {
  const out: Partial<Record<keyof Values, string>> = fieldErrors(z.object(fields), s);
  if (!out.liab && s.liab === 0) out.liab = LIAB_ABOVE_0;
  if (!out.assets && !out.inv && !out.prepaid && s.inv + s.prepaid > s.assets) out.inv = QUICK_TOO_BIG;
  return out;
}

export function toCalcInput(s: Values): RatioInput {
  return { assets: s.assets, liabilities: s.liab, inventory: s.inv, prepaid: s.prepaid };
}

/** Plan B for "Compare two periods": another period's (or company's) four numbers. Example values. */
export const planBSchema = z.object(fields);
export type PlanBState = z.infer<typeof planBSchema>;
export const planBDefaults: PlanBState = { assets: 300_000, liab: 120_000, inv: 90_000, prepaid: 10_000 };

export { fieldErrors };
