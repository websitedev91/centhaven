/**
 * Savings Goal Calculator: pure maths (spec: docs/specs/savings-goal-calculator.md).
 * Interest is optional and always the user's own figure, compounded monthly, with each
 * deposit at the end of the month. No React, no dates, no fetch. Round at display time only.
 */

export interface SavingsGoalInput {
  goal: number;
  saved: number;
  months: number;
  /** Yearly interest as a fraction (0.04 = 4%); 0 = none. */
  rate: number;
}

export interface SavingsGoalResult {
  ok: true;
  monthly: number;
  contributions: number;
  /** goal − saved − contributions (0 when there's no interest). */
  interest: number;
  /** What the money already saved grows to by the goal date. */
  savedGrows: number;
  /** True when the money already saved reaches the goal on its own. */
  reached: boolean;
}

export interface SavingsGoalError {
  ok: false;
  error: string;
}

export const NEED_MONTHS = 'Enter at least 1 month';

export function savingsGoal(input: SavingsGoalInput): SavingsGoalResult | SavingsGoalError {
  const { goal, saved, months, rate } = input;
  if (!(months >= 1)) return { ok: false, error: NEED_MONTHS };
  const r = rate / 12;
  const growth = Math.pow(1 + r, months);
  const savedGrows = saved * growth;
  const need = goal - savedGrows;
  if (need <= 0) return { ok: true, monthly: 0, contributions: 0, interest: savedGrows - saved, savedGrows, reached: true };
  const monthly = r === 0 ? need / months : (need * r) / (growth - 1);
  const contributions = monthly * months;
  return { ok: true, monthly, contributions, interest: goal - saved - contributions, savedGrows, reached: false };
}

/** Balance at the end of each month (month 0 = now), at most ~60 points for the chart. */
export function savingsPath(input: SavingsGoalInput, monthly: number): { month: number; value: number }[] {
  const r = input.rate / 12;
  const step = Math.max(1, Math.ceil(input.months / 60));
  const points: { month: number; value: number }[] = [];
  for (let m = 0; m <= input.months; m += step) points.push({ month: m, value: balanceAt(input.saved, monthly, r, m) });
  if (points.at(-1)!.month !== input.months) points.push({ month: input.months, value: balanceAt(input.saved, monthly, r, input.months) });
  return points;
}

function balanceAt(saved: number, monthly: number, r: number, m: number): number {
  const g = Math.pow(1 + r, m);
  return saved * g + (r === 0 ? monthly * m : (monthly * (g - 1)) / r);
}
