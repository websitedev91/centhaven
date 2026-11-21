// zod/mini keeps the client bundle small (same validation, tree-shakable API).
import * as z from 'zod/mini';
import { fieldErrors } from '@/lib/field-errors';
import type { DoubleMode } from './calc';

const num = () => z.number({ error: 'Enter a number' });
const positive = (msg: string) =>
  num().check(
    z.refine((v) => v > 0, msg),
    z.maximum(1_000, 'Maximum is 1,000'),
  );

export const MODES = ['years', 'rate'] as const satisfies readonly DoubleMode[];

export const RATE_ABOVE_0 = 'Enter a rate above 0';
export const YEARS_ABOVE_0 = 'Enter years above 0';

const fields = { rate: positive(RATE_ABOVE_0), years: positive(YEARS_ABOVE_0) };

export const doubleSchema = z.object({ mode: z.enum(MODES), ...fields });
export type DoubleState = z.infer<typeof doubleSchema>;

/**
 * No money and no currency: the answer is the same for any amount. 8% and 9 years are examples
 * only, labelled "Example only, not a suggestion" (Puru, 2026-11-21).
 */
export const doubleDefaults: DoubleState = { mode: 'years', rate: 8, years: 9 };

/** Errors for the field the current mode uses. */
export function doubleErrors(s: DoubleState): Partial<Record<keyof DoubleState, string>> {
  const all = fieldErrors(doubleSchema, s);
  const key = s.mode === 'years' ? 'rate' : 'years';
  return all[key] ? { [key]: all[key] } : {};
}

/** Plan B for "Compare two rates / time frames". */
export const planBSchema = z.object(fields);
export type PlanBState = z.infer<typeof planBSchema>;
export const planBDefaults: PlanBState = { rate: 6, years: 12 };

export { fieldErrors };
