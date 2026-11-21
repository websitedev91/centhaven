/**
 * Savings Rate Calculator: pure maths (spec: docs/specs/savings-rate-calculator.md).
 * Income (take-home or gross) and savings both come from the user: no tax maths. Never says
 * what % anyone should save. No React, no dates, no fetch. Round at display time only.
 */

export type IncomeBasis = 'net' | 'gross';

export interface SavingsRateInput {
  income: number;
  saved: number;
  /** The user's own target %, 0 = off. */
  target: number;
}

export interface SavingsRateResult {
  /** Savings ÷ income, as a fraction. */
  rate: number;
  yearly: number;
  notSaved: number;
  /** Target rows (null when the target is off). */
  targetAmount: number | null;
  /** targetAmount − saved: > 0 more to save, < 0 above the target. */
  gap: number | null;
}

export function savingsRate(i: SavingsRateInput): SavingsRateResult {
  const targetAmount = i.target > 0 ? (i.income * i.target) / 100 : null;
  return {
    rate: i.saved / i.income,
    yearly: i.saved * 12,
    notSaved: i.income - i.saved,
    targetAmount,
    gap: targetAmount === null ? null : targetAmount - i.saved,
  };
}
