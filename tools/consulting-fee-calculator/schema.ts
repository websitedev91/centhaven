// zod/mini keeps the client bundle small (same validation, tree-shakable API).
import * as z from 'zod/mini';
import { CURRENCIES, type CurrencyCode } from '@/lib/format';
import { currencyVariant, defaultsForCurrency, switchCurrency, type CurrencyPresets } from '@/lib/currency-defaults';
import type { ConsultingInput } from './calc';

const num = () => z.number({ error: 'Enter a number' });
const money = (msg: string) => num().check(z.minimum(0, msg), z.maximum(100_000_000, 'Maximum is 100,000,000'));

/** Percentages are whole numbers in the UI/URL (25 = 25%); toCalcInput converts them. */
export const consultingSchema = z.object({
  currency: z.enum(CURRENCIES),
  income: money('Income can’t be negative'),
  overheads: money('Overheads can’t be negative'),
  taxRate: num().check(z.minimum(0, 'Minimum is 0%'), z.maximum(60, 'Maximum is 60%')),
  billableDays: num().check(z.minimum(1, 'Minimum is 1 day'), z.maximum(260, 'Maximum is 260 days')),
  hoursPerDay: num().check(z.minimum(1, 'Minimum is 1 hour'), z.maximum(12, 'Maximum is 12 hours')),
  margin: num().check(z.minimum(0, 'Minimum is 0%'), z.maximum(60, 'Maximum is 60%')),
  projectHours: num().check(z.minimum(1, 'Minimum is 1 hour'), z.maximum(10_000, 'Maximum is 10,000 hours')),
});

export type ConsultingState = z.infer<typeof consultingSchema>;

/** Currency-dependent defaults (spec, approved): starting values for the inputs, not rates. */
export const consultingCurrencyPresets: CurrencyPresets<ConsultingState> = {
  USD: { income: 120_000, overheads: 15_000, taxRate: 25 },
  CAD: { income: 120_000, overheads: 15_000, taxRate: 25 },
  AUD: { income: 120_000, overheads: 15_000, taxRate: 25 },
  GBP: { income: 90_000, overheads: 11_000, taxRate: 25 },
  EUR: { income: 90_000, overheads: 11_000, taxRate: 25 },
  INR: { income: 3_000_000, overheads: 300_000, taxRate: 10 },
};

const base: ConsultingState = {
  currency: 'USD',
  income: 120_000,
  overheads: 15_000,
  taxRate: 25,
  billableDays: 180,
  hoursPerDay: 6,
  margin: 15,
  projectHours: 40,
};

export const consultingDefaults = defaultsForCurrency(base, consultingCurrencyPresets, 'USD');
export const consultingVariant = currencyVariant(consultingDefaults, consultingCurrencyPresets);

export function switchConsultingCurrency(state: ConsultingState, next: CurrencyCode): ConsultingState {
  return switchCurrency(state, next, consultingDefaults, consultingCurrencyPresets);
}

export function toCalcInput(s: Omit<ConsultingState, 'currency'>): ConsultingInput {
  return {
    income: s.income,
    taxRate: s.taxRate / 100,
    overheads: s.overheads,
    billableDays: s.billableDays,
    hoursPerDay: s.hoursPerDay,
    margin: s.margin / 100,
    projectHours: s.projectHours,
  };
}

/** Plan B for "Compare two plans": a different margin and number of billable days. */
export const planBSchema = z.pick(consultingSchema, { margin: true, billableDays: true });
export type PlanBState = z.infer<typeof planBSchema>;
export const planBDefaults: PlanBState = { margin: 25, billableDays: 150 };

export { fieldErrors } from '@/lib/field-errors';
