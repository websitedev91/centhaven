// zod/mini keeps the client bundle small (same validation, tree-shakable API).
import * as z from 'zod/mini';
import { CURRENCIES, type CurrencyCode } from '@/lib/format';
import { currencyVariant, defaultsForCurrency, switchCurrency, type CurrencyPresets } from '@/lib/currency-defaults';
import { fieldErrors } from '@/lib/field-errors';
import { percentTotal, totalsHundred, type Bucket } from './calc';

const num = () => z.number({ error: 'Enter a number' });
const money = () => num().check(z.minimum(0, 'Can’t be negative'), z.maximum(1_000_000_000, 'Maximum is 1,000,000,000'));
const pct = () => num().check(z.minimum(0, 'Can’t be negative'), z.maximum(100, 'Maximum is 100%'));

export const budgetSchema = z.object({
  currency: z.enum(CURRENCIES),
  pay: money(),
  needs: pct(),
  wants: pct(),
  save: pct(),
  aNeeds: money(),
  aWants: money(),
  aSave: money(),
});

export type BudgetState = z.infer<typeof budgetSchema>;

/** Example values only (CurrencyPresets pattern). Percentages never change with currency. */
export const budgetCurrencyPresets: CurrencyPresets<BudgetState> = {
  USD: { pay: 4_000 },
  CAD: { pay: 4_000 },
  AUD: { pay: 4_000 },
  GBP: { pay: 2_800 },
  EUR: { pay: 2_800 },
  INR: { pay: 80_000 },
};

const base: BudgetState = { currency: 'USD', pay: 4_000, needs: 50, wants: 30, save: 20, aNeeds: 0, aWants: 0, aSave: 0 };

export const budgetDefaults = defaultsForCurrency(base, budgetCurrencyPresets, 'USD');
export const budgetVariant = currencyVariant(budgetDefaults, budgetCurrencyPresets);

export function switchBudgetCurrency(state: BudgetState, next: CurrencyCode, touched?: ReadonlySet<string>): BudgetState {
  return switchCurrency(state, next, budgetDefaults, budgetCurrencyPresets, touched);
}

/** Actual spending boxes: optional, 0 = not compared. */
export const OPTIONAL = ['aNeeds', 'aWants', 'aSave'] as const;

export const pctOf = (s: Pick<BudgetState, 'needs' | 'wants' | 'save'>): Record<Bucket, number> => ({
  needs: s.needs,
  wants: s.wants,
  savings: s.save,
});

/**
 * "Your percentages add up to 105%. They need to total 100%." when the three valid percentages
 * don't total 100; null otherwise (including while a box is empty: that box shows its own error).
 */
export function totalError(s: BudgetState, errors: Partial<Record<keyof BudgetState, string>>): string | null {
  if (errors.needs || errors.wants || errors.save) return null;
  const p = pctOf(s);
  if (totalsHundred(p)) return null;
  return `Your percentages add up to ${percentTotal(p).toLocaleString('en-US', { maximumFractionDigits: 2 })}%. They need to total 100%.`;
}

export { fieldErrors };
