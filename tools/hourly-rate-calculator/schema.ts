import { z } from 'zod';
import { CURRENCIES } from '@/lib/format';
import type { HourlyRateInput } from './calc';

/**
 * UI/URL state. Percentages are stored as whole numbers (25 = 25%) because that is what
 * users see and share; `toCalcInput` converts them to fractions for calc.ts.
 */
export const hourlyRateSchema = z.object({
  currency: z.enum(CURRENCIES),
  targetIncome: z
    .number({ error: 'Enter a number' })
    .min(0, 'Income can’t be negative')
    .max(100_000_000, 'Maximum is 100,000,000'),
  expenses: z
    .number({ error: 'Enter a number' })
    .min(0, 'Expenses can’t be negative')
    .max(100_000_000, 'Maximum is 100,000,000'),
  taxRate: z.number({ error: 'Enter a number' }).min(0, 'Minimum is 0%').max(60, 'Maximum is 60%'),
  weeksOff: z
    .number({ error: 'Enter a number' })
    .int('Use whole weeks')
    .min(0, 'Minimum is 0 weeks')
    .max(26, 'Maximum is 26 weeks off'),
  hoursPerWeek: z.number({ error: 'Enter a number' }).min(1, 'Minimum is 1 hour').max(80, 'Maximum is 80 hours'),
  billablePct: z.number({ error: 'Enter a number' }).min(10, 'Minimum is 10%').max(100, 'Maximum is 100%'),
});

export type HourlyRateState = z.infer<typeof hourlyRateSchema>;
export type HourlyRateField = keyof HourlyRateState;

export const hourlyRateDefaults: HourlyRateState = {
  currency: 'USD',
  targetIncome: 60_000,
  expenses: 6_000,
  taxRate: 25,
  weeksOff: 6,
  hoursPerWeek: 40,
  billablePct: 75,
};

/** Plan B for "Compare two plans" — only the time-related fields differ. */
export const planBSchema = hourlyRateSchema.pick({ weeksOff: true, hoursPerWeek: true, billablePct: true });
export type PlanBState = z.infer<typeof planBSchema>;
export const planBDefaults: PlanBState = { weeksOff: 6, hoursPerWeek: 30, billablePct: 90 };

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

/** First error message per field, for inline display. */
export function fieldErrors<T extends Record<string, unknown>>(schema: z.ZodType<T>, state: unknown): FieldErrors<T> {
  const result = schema.safeParse(state);
  if (result.success) return {};
  const out: FieldErrors<T> = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] as keyof T | undefined;
    if (key !== undefined && out[key] === undefined) out[key] = issue.message;
  }
  return out;
}

export function toCalcInput(s: Omit<HourlyRateState, 'currency'>): HourlyRateInput {
  return {
    targetIncome: s.targetIncome,
    expenses: s.expenses,
    taxRate: s.taxRate / 100,
    weeksOff: s.weeksOff,
    hoursPerWeek: s.hoursPerWeek,
    billablePct: s.billablePct / 100,
  };
}
