/**
 * Rate Increase Calculator: pure maths (spec: docs/specs/rate-increase-calculator.md).
 * No React, no dates, no fetch. No rounding here: round at display time (lib/format.ts).
 */

export interface RateIncreaseInput {
  /** Current rate per hour. */
  rate: number;
  /** Billable hours per month now. */
  hours: number;
  /** Rate increase as a fraction (0.2 = +20%). */
  increase: number;
  /** Share of work that may leave after the increase, as a fraction (0.1 = 10%). */
  loss: number;
}

export interface RateIncreaseResult {
  ok: true;
  newRate: number;
  currentRevenue: number;
  newHours: number;
  hoursFreed: number;
  newRevenue: number;
  /** newRevenue − currentRevenue (negative = you earn less). */
  change: number;
  /** change × 12 */
  yearlyChange: number;
  /** The share of work you can lose and still earn the same as today. */
  breakEvenLoss: number;
}

export interface RateIncreaseError {
  ok: false;
  error: string;
}

export const NEED_RATE_AND_HOURS = 'Enter a rate and hours above zero';

export function rateIncrease(input: RateIncreaseInput): RateIncreaseResult | RateIncreaseError {
  const { rate, hours, increase, loss } = input;
  if (!(rate > 0) || !(hours > 0)) return { ok: false, error: NEED_RATE_AND_HOURS };
  const newRate = rate * (1 + increase);
  const currentRevenue = rate * hours;
  const newHours = hours * (1 - loss);
  const newRevenue = newRate * newHours;
  return {
    ok: true,
    newRate,
    currentRevenue,
    newHours,
    hoursFreed: hours - newHours,
    newRevenue,
    change: newRevenue - currentRevenue,
    yearlyChange: (newRevenue - currentRevenue) * 12,
    breakEvenLoss: increase / (1 + increase),
  };
}

/**
 * Monthly income at the new rate for work lost from 0% to `maxLoss`, in whole-percent steps
 * (the chart's line). Today's income is the flat reference line.
 */
export function incomeCurve(input: Omit<RateIncreaseInput, 'loss'>, maxLoss = 0.5): { loss: number; income: number }[] {
  const steps = Math.round(maxLoss * 100);
  return Array.from({ length: steps + 1 }, (_, i) => {
    const loss = i / 100;
    return { loss, income: input.rate * (1 + input.increase) * input.hours * (1 - loss) };
  });
}

export const QUICK_INCREASES = [0.1, 0.2, 0.3] as const;

/** Quick comparison at the user's expected loss of work: +10%, +20% and +30%. */
export function quickComparison(input: Omit<RateIncreaseInput, 'increase'>): { increase: number; result: RateIncreaseResult }[] {
  return QUICK_INCREASES.flatMap((increase) => {
    const result = rateIncrease({ ...input, increase });
    return result.ok ? [{ increase, result }] : [];
  });
}
