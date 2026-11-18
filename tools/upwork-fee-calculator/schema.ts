// zod/mini keeps the client bundle small (same validation, tree-shakable API).
import * as z from 'zod/mini';
import type { FeeMode, PercentFeeInput } from '@/lib/percent-fee';

/**
 * Pure maths (scope rule, Puru 2026-11-18): the fee % always comes from the user. The 0–50%
 * input range is our own sanity limit, not Upwork's fee range, and 10% is an example only.
 */
export const FEE_RANGE = { min: 0, max: 50 } as const;
export const FEE_RANGE_ERROR = `Enter a fee between ${FEE_RANGE.min}% and ${FEE_RANGE.max}%`;
export const EXAMPLE_FEE = 10;
export const FEE_HELP = 'Example only, use the % on your proposal.';

const num = () => z.number({ error: 'Enter a number' });

export const MODES = ['gross', 'net'] as const satisfies readonly FeeMode[];

/** USD only (Puru, 2026-11-18): no currency selector. */
export const upworkFeeSchema = z.object({
  mode: z.enum(MODES),
  amount: num().check(z.minimum(0, 'Amount can’t be negative'), z.maximum(10_000_000, 'Maximum is 10,000,000')),
  fee: num().check(z.minimum(FEE_RANGE.min, FEE_RANGE_ERROR), z.maximum(FEE_RANGE.max, FEE_RANGE_ERROR)),
});

export type UpworkFeeState = z.infer<typeof upworkFeeSchema>;

export const upworkFeeDefaults: UpworkFeeState = { mode: 'gross', amount: 1_000, fee: EXAMPLE_FEE };

export function toCalcInput(s: UpworkFeeState): PercentFeeInput {
  return { mode: s.mode, amount: s.amount, fee: s.fee / 100 };
}

/** Plan B for "Compare two fees": the same amount at a different fee %. */
export const planBSchema = z.pick(upworkFeeSchema, { fee: true });
export type PlanBState = z.infer<typeof planBSchema>;
export const planBDefaults: PlanBState = { fee: 5 };

export { fieldErrors } from '@/lib/field-errors';
