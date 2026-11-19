// zod/mini keeps the client bundle small (same validation, tree-shakable API).
import * as z from 'zod/mini';
import { CURRENCIES, type CurrencyCode } from '@/lib/format';
import { currencyVariant, defaultsForCurrency, switchCurrency, type CurrencyPresets } from '@/lib/currency-defaults';
import type { CplInput } from './calc';

const num = () => z.number({ error: 'Enter a number' });

export const cplSchema = z.object({
  currency: z.enum(CURRENCIES),
  spend: num().check(z.minimum(0, 'Can’t be negative'), z.maximum(10_000_000_000, 'Maximum is 10,000,000,000')),
  leads: num().check(
    z.refine((v) => Number.isInteger(v), 'Enter a whole number'),
    z.minimum(1, 'Enter at least 1 lead'),
    z.maximum(1_000_000_000, 'Maximum is 1,000,000,000'),
  ),
  conv: num().check(z.minimum(0, 'Minimum is 0%'), z.maximum(100, 'Maximum is 100%')),
});

export type CplState = z.infer<typeof cplSchema>;

/** Example values only (CurrencyPresets pattern). Leads and rate never change with currency. */
export const cplCurrencyPresets: CurrencyPresets<CplState> = {
  USD: { spend: 2_000 },
  GBP: { spend: 2_000 },
  EUR: { spend: 2_000 },
  CAD: { spend: 2_000 },
  AUD: { spend: 2_000 },
  INR: { spend: 60_000 },
};

const base: CplState = { currency: 'USD', spend: 2_000, leads: 80, conv: 10 };

export const cplDefaults = defaultsForCurrency(base, cplCurrencyPresets, 'USD');
export const cplVariant = currencyVariant(cplDefaults, cplCurrencyPresets);

export function switchCplCurrency(state: CplState, next: CurrencyCode): CplState {
  return switchCurrency(state, next, cplDefaults, cplCurrencyPresets);
}

export function toCalcInput(s: Pick<CplState, 'spend' | 'leads' | 'conv'>): CplInput {
  return { spend: s.spend, leads: s.leads, rate: s.conv / 100 };
}

/** Plan B for "Compare two channels": another channel's spend, leads and rate. */
export const planBSchema = z.pick(cplSchema, { spend: true, leads: true, conv: true });
export type PlanBState = z.infer<typeof planBSchema>;
export const planBDefaults: PlanBState = { spend: 2_000, leads: 50, conv: 20 };

export { fieldErrors } from '@/lib/field-errors';
