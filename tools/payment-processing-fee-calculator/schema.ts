// zod/mini keeps the client bundle small (same validation, tree-shakable API).
import * as z from 'zod/mini';
import { CURRENCIES, type CurrencyCode } from '@/lib/format';
import { currencyVariant, defaultsForCurrency, switchCurrency, type CurrencyPresets } from '@/lib/currency-defaults';
import type { ProcessingInput, ProcessingMode } from './calc';

const num = () => z.number({ error: 'Enter a number' });
const pct = () => num().check(z.minimum(0, 'Minimum is 0%'), z.maximum(50, 'Maximum is 50%'));

export const MODES = ['gross', 'net'] as const satisfies readonly ProcessingMode[];

/**
 * Percentages are whole numbers in the UI/URL (3 = 3%); toCalcInput converts them.
 * Every fee is the user's own input; the defaults are examples only (scope rule).
 */
export const processingSchema = z.object({
  mode: z.enum(MODES),
  currency: z.enum(CURRENCIES),
  amount: num().check(z.minimum(0, 'Amount can’t be negative'), z.maximum(10_000_000, 'Maximum is 10,000,000')),
  percent: pct(),
  fixed: num().check(z.minimum(0, 'Fixed fee can’t be negative'), z.maximum(1_000, 'Maximum is 1,000')),
  extra: pct(),
});

export type ProcessingState = z.infer<typeof processingSchema>;

/**
 * Currency-dependent starting values (CurrencyPresets pattern). Examples, not rates:
 * 3% + 0.30 everywhere, and ₹10 for INR (approved by Puru, 2026-11-18).
 */
export const processingCurrencyPresets: CurrencyPresets<ProcessingState> = {
  USD: { amount: 100, fixed: 0.3 },
  GBP: { amount: 100, fixed: 0.3 },
  EUR: { amount: 100, fixed: 0.3 },
  CAD: { amount: 100, fixed: 0.3 },
  AUD: { amount: 100, fixed: 0.3 },
  INR: { amount: 10_000, fixed: 10 },
};

const base: ProcessingState = { mode: 'gross', currency: 'USD', amount: 100, percent: 3, fixed: 0.3, extra: 0 };

export const processingDefaults = defaultsForCurrency(base, processingCurrencyPresets, 'USD');
export const processingVariant = currencyVariant(processingDefaults, processingCurrencyPresets);

export function switchProcessingCurrency(state: ProcessingState, next: CurrencyCode, touched?: ReadonlySet<string>): ProcessingState {
  return switchCurrency(state, next, processingDefaults, processingCurrencyPresets, touched);
}

export function toCalcInput(s: Pick<ProcessingState, 'mode' | 'amount' | 'percent' | 'fixed' | 'extra'>): ProcessingInput {
  return { mode: s.mode, amount: s.amount, percent: s.percent / 100, extra: s.extra / 100, fixed: s.fixed };
}

/** Plan B for "Compare two providers": a different percentage, fixed fee and extra %. */
export const planBSchema = z.pick(processingSchema, { percent: true, fixed: true, extra: true });
export type PlanBState = z.infer<typeof planBSchema>;
/** Example only: a percentage-only provider, so it suits every currency. */
export const planBDefaults: PlanBState = { percent: 3.5, fixed: 0, extra: 0 };

export { fieldErrors } from '@/lib/field-errors';
