// zod/mini keeps the client bundle small (same validation, tree-shakable API).
import * as z from 'zod/mini';
import { CURRENCIES, type CurrencyCode } from '@/lib/format';
import { currencyVariant, defaultsForCurrency, switchCurrency, type CurrencyPresets } from '@/lib/currency-defaults';
import { fieldErrors } from '@/lib/field-errors';
import type { RoasInput, RoasMode } from './calc';

const num = () => z.number({ error: 'Enter a number' });
const money = () => num().check(z.minimum(0, 'Can’t be negative'), z.maximum(10_000_000_000, 'Maximum is 10,000,000,000'));

export const MODES = ['find', 'needed'] as const satisfies readonly RoasMode[];

export const roasSchema = z.object({
  mode: z.enum(MODES),
  currency: z.enum(CURRENCIES),
  rev: money(),
  spend: money(),
  target: num().check(z.minimum(0, 'Can’t be negative'), z.maximum(1_000, 'Maximum is 1,000')),
  margin: num().check(z.minimum(0, 'Minimum is 0%'), z.maximum(100, 'Maximum is 100%')),
});

export type RoasState = z.infer<typeof roasSchema>;

/** Example values only (CurrencyPresets pattern). Target and margin never change with currency. */
export const roasCurrencyPresets: CurrencyPresets<RoasState> = {
  USD: { rev: 15_000, spend: 3_000 },
  GBP: { rev: 15_000, spend: 3_000 },
  EUR: { rev: 15_000, spend: 3_000 },
  CAD: { rev: 15_000, spend: 3_000 },
  AUD: { rev: 15_000, spend: 3_000 },
  INR: { rev: 250_000, spend: 50_000 },
};

const base: RoasState = { mode: 'find', currency: 'USD', rev: 15_000, spend: 3_000, target: 4, margin: 40 };

export const roasDefaults = defaultsForCurrency(base, roasCurrencyPresets, 'USD');
export const roasVariant = currencyVariant(roasDefaults, roasCurrencyPresets);

export function switchRoasCurrency(state: RoasState, next: CurrencyCode): RoasState {
  return switchCurrency(state, next, roasDefaults, roasCurrencyPresets);
}

/**
 * Errors for the fields the current mode uses. In find mode the ad spend must be above 0
 * (it divides); in needed mode 0 spend is fine (revenue needed 0).
 */
export function roasErrors(s: RoasState): Partial<Record<keyof RoasState, string>> {
  const all = fieldErrors(roasSchema, s);
  const used: (keyof RoasState)[] = s.mode === 'find' ? ['rev', 'spend', 'margin'] : ['spend', 'target', 'margin'];
  const out: Partial<Record<keyof RoasState, string>> = {};
  for (const k of used) if (all[k]) out[k] = all[k];
  if (s.mode === 'find' && !out.spend && s.spend === 0) out.spend = 'Enter an ad spend above 0';
  return out;
}

export function toCalcInput(s: RoasState): RoasInput {
  return { mode: s.mode, revenue: s.rev, spend: s.spend, target: s.target, margin: s.margin / 100 };
}

export { fieldErrors };
