// zod/mini keeps the client bundle small (same validation, tree-shakable API).
import * as z from 'zod/mini';
import { CURRENCIES, type CurrencyCode } from '@/lib/format';
import { currencyVariant, defaultsForCurrency, switchCurrency, type CurrencyPresets } from '@/lib/currency-defaults';
import { fieldErrors } from '@/lib/field-errors';
import type { CpcInput, CpcMode } from './calc';

const num = () => z.number({ error: 'Enter a number' });
const money = () => num().check(z.minimum(0, 'Can’t be negative'), z.maximum(10_000_000_000, 'Maximum is 10,000,000,000'));
const clicks = () =>
  num().check(
    z.refine((v) => Number.isInteger(v), 'Enter a whole number'),
    z.minimum(1, 'Enter at least 1 click'),
    z.maximum(1_000_000_000, 'Maximum is 1,000,000,000'),
  );
const rate = () => num().check(z.minimum(0, 'Minimum is 0%'), z.maximum(100, 'Maximum is 100%'));

export const MODES = ['find', 'clicks'] as const satisfies readonly CpcMode[];

export const cpcSchema = z.object({
  mode: z.enum(MODES),
  currency: z.enum(CURRENCIES),
  spend: money(),
  clicks: clicks(),
  budget: money(),
  cpc: num().check(z.minimum(0.01, 'Enter a cost per click above 0'), z.maximum(1_000_000, 'Maximum is 1,000,000')),
  conv: rate(),
});

export type CpcState = z.infer<typeof cpcSchema>;

/** Example values only (CurrencyPresets pattern). Clicks and the rate never change with currency. */
export const cpcCurrencyPresets: CurrencyPresets<CpcState> = {
  USD: { spend: 500, budget: 1_000, cpc: 1.25 },
  GBP: { spend: 500, budget: 1_000, cpc: 1.25 },
  EUR: { spend: 500, budget: 1_000, cpc: 1.25 },
  CAD: { spend: 500, budget: 1_000, cpc: 1.25 },
  AUD: { spend: 500, budget: 1_000, cpc: 1.25 },
  INR: { spend: 20_000, budget: 50_000, cpc: 25 },
};

const base: CpcState = { mode: 'find', currency: 'USD', spend: 500, clicks: 250, budget: 1_000, cpc: 1.25, conv: 4 };

export const cpcDefaults = defaultsForCurrency(base, cpcCurrencyPresets, 'USD');
export const cpcVariant = currencyVariant(cpcDefaults, cpcCurrencyPresets);

export function switchCpcCurrency(state: CpcState, next: CurrencyCode, touched?: ReadonlySet<string>): CpcState {
  return switchCurrency(state, next, cpcDefaults, cpcCurrencyPresets, touched);
}

/** Errors for the fields the current mode uses. A negative CPC says "Can’t be negative". */
export function cpcErrors(s: CpcState): Partial<Record<keyof CpcState, string>> {
  const all = fieldErrors(cpcSchema, s);
  const used: (keyof CpcState)[] = s.mode === 'find' ? ['spend', 'clicks', 'conv'] : ['budget', 'cpc', 'conv'];
  const out: Partial<Record<keyof CpcState, string>> = {};
  for (const k of used) if (all[k]) out[k] = all[k];
  if (out.cpc && s.cpc < 0) out.cpc = 'Can’t be negative';
  else if (out.cpc && s.cpc > 0 && s.cpc < 0.01) out.cpc = 'Minimum is 0.01';
  return out;
}

export function toCalcInput(s: CpcState): CpcInput {
  return { mode: s.mode, money: s.mode === 'find' ? s.spend : s.budget, clicks: s.clicks, cpc: s.cpc, rate: s.conv / 100 };
}

/** Plan B for "Compare two campaigns" (find mode): another campaign's spend, clicks and rate. */
export const planBSchema = z.pick(cpcSchema, { spend: true, clicks: true, conv: true });
export type PlanBState = z.infer<typeof planBSchema>;
export const planBDefaults: PlanBState = { spend: 300, clicks: 120, conv: 5 };

export { fieldErrors };
