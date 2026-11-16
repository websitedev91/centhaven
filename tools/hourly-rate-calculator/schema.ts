// zod/mini keeps the client bundle small (same validation, tree-shakable API).
import * as z from 'zod/mini';
import { CURRENCIES } from '@/lib/format';
import type { HourlyRateState } from './defaults';

/** Validation for the UI/URL state (see defaults.ts for the state type, defaults and presets). */
const num = () => z.number({ error: 'Enter a number' });

export const hourlyRateSchema = z.object({
  currency: z.enum(CURRENCIES),
  targetIncome: num().check(z.minimum(0, 'Income can’t be negative'), z.maximum(100_000_000, 'Maximum is 100,000,000')),
  expenses: num().check(z.minimum(0, 'Expenses can’t be negative'), z.maximum(100_000_000, 'Maximum is 100,000,000')),
  taxRate: num().check(z.minimum(0, 'Minimum is 0%'), z.maximum(60, 'Maximum is 60%')),
  weeksOff: num().check(
    z.refine((v) => Number.isInteger(v), 'Use whole weeks'),
    z.minimum(0, 'Minimum is 0 weeks'),
    z.maximum(26, 'Maximum is 26 weeks off'),
  ),
  hoursPerWeek: num().check(z.minimum(1, 'Minimum is 1 hour'), z.maximum(80, 'Maximum is 80 hours')),
  billablePct: num().check(z.minimum(10, 'Minimum is 10%'), z.maximum(100, 'Maximum is 100%')),
});

/** Compile-time check: the Zod schema and the Zod-free state type in defaults.ts must match. */
type Same<A, B> = [A] extends [B] ? ([B] extends [A] ? true : never) : never;
const stateMatchesSchema: Same<z.infer<typeof hourlyRateSchema>, HourlyRateState> = true;
void stateMatchesSchema;

// Currency presets + defaults live in defaults.ts (no Zod) so the homepage hero can reuse them.
export {
  hourlyRateCurrencyPresets,
  hourlyRateDefaults,
  hourlyRateVariant,
  switchHourlyRateCurrency,
  toCalcInput,
  type HourlyRateField,
  type HourlyRateState,
} from './defaults';

/** Plan B for "Compare two plans" — only the time-related fields differ. */
export const planBSchema = z.pick(hourlyRateSchema, { weeksOff: true, hoursPerWeek: true, billablePct: true });
export type PlanBState = z.infer<typeof planBSchema>;
export const planBDefaults: PlanBState = { weeksOff: 6, hoursPerWeek: 30, billablePct: 90 };

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

/** First error message per field, for inline display. */
export function fieldErrors<T extends Record<string, unknown>>(schema: z.ZodMiniType<T>, state: unknown): FieldErrors<T> {
  const result = schema.safeParse(state);
  if (result.success) return {};
  const out: FieldErrors<T> = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] as keyof T | undefined;
    if (key !== undefined && out[key] === undefined) out[key] = issue.message;
  }
  return out;
}
