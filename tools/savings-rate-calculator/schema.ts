// zod/mini keeps the client bundle small (same validation, tree-shakable API).
import * as z from 'zod/mini';
import { CURRENCIES, type CurrencyCode } from '@/lib/format';
import { currencyVariant, defaultsForCurrency, switchCurrency, type CurrencyPresets } from '@/lib/currency-defaults';
import { fieldErrors } from '@/lib/field-errors';
import type { IncomeBasis, SavingsRateInput } from './calc';

const num = () => z.number({ error: 'Enter a number' });
const money = () => num().check(z.minimum(0, 'Can’t be negative'), z.maximum(1_000_000_000, 'Maximum is 1,000,000,000'));
const pct = () => num().check(z.minimum(0, 'Can’t be negative'), z.maximum(100, 'Maximum is 100%'));

export const BASES = ['net', 'gross'] as const satisfies readonly IncomeBasis[];

const fields = { income: money(), saved: money(), target: pct() };
export const rateSchema = z.object({ basis: z.enum(BASES), currency: z.enum(CURRENCIES), ...fields });
export type RateState = z.infer<typeof rateSchema>;

/** Example values only (CurrencyPresets pattern); every currency gives 15%. */
export const rateCurrencyPresets: CurrencyPresets<RateState> = {
  USD: { income: 4_000, saved: 600 },
  CAD: { income: 4_000, saved: 600 },
  AUD: { income: 4_000, saved: 600 },
  GBP: { income: 3_000, saved: 450 },
  EUR: { income: 3_000, saved: 450 },
  INR: { income: 80_000, saved: 12_000 },
};

/** The target starts off (0), so the page never shows a suggested savings rate. */
const base: RateState = { basis: 'net', currency: 'USD', income: 4_000, saved: 600, target: 0 };

export const rateDefaults = defaultsForCurrency(base, rateCurrencyPresets, 'USD');
export const rateVariant = currencyVariant(rateDefaults, rateCurrencyPresets);

export function switchRateCurrency(state: RateState, next: CurrencyCode, touched?: ReadonlySet<string>): RateState {
  return switchCurrency(state, next, rateDefaults, rateCurrencyPresets, touched);
}

/** Optional: empty = 0 = no target. */
export const OPTIONAL = ['target'] as const;

export const INCOME_ABOVE_0 = 'Enter an income above 0';
export const SAVED_TOO_MUCH = 'Savings can’t be more than income';

type Values = Pick<RateState, 'income' | 'saved' | 'target'>;

export function rateErrors(s: Values): Partial<Record<keyof Values, string>> {
  const out: Partial<Record<keyof Values, string>> = fieldErrors(z.object(fields), s);
  if (!out.income && s.income === 0) out.income = INCOME_ABOVE_0;
  if (!out.income && !out.saved && s.saved > s.income) out.saved = SAVED_TOO_MUCH;
  return out;
}

export function toCalcInput(s: Values): SavingsRateInput {
  return { income: s.income, saved: s.saved, target: s.target };
}

/** Plan B for "Compare two amounts": another monthly saving, same income. Example value. */
export const planBSchema = z.object({ saved: money() });
export type PlanBState = z.infer<typeof planBSchema>;
export const planBDefaults: PlanBState = { saved: 800 };

export { fieldErrors };
