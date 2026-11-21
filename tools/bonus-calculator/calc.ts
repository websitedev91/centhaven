/**
 * Bonus Calculator: pure maths (spec: docs/specs/bonus-calculator.md).
 * Gross bonus only: no tax, no deductions, no withholding rules. Every number comes from the user.
 * No React, no dates, no fetch. Round at display time only.
 */

export type BonusMode = 'percent' | 'fixed' | 'target';

export interface BonusInput {
  mode: BonusMode;
  salary: number;
  /** Bonus % of salary (percent mode). */
  pct: number;
  /** Fixed bonus amount (fixed mode). */
  amount: number;
  /** Target bonus % and achievement (payout) % (target mode). */
  target: number;
  achievement: number;
  /** Paychecks the bonus is spread over; 0 = one lump sum. */
  checks: number;
}

export interface BonusResult {
  bonus: number;
  /** Bonus ÷ salary as a fraction; null when the salary is 0 (no ÷ 0). */
  ofSalary: number | null;
  total: number;
  perCheck: number | null;
  payPerCheck: number | null;
}

export function bonusOf(i: Pick<BonusInput, 'mode' | 'salary' | 'pct' | 'amount' | 'target' | 'achievement'>): number {
  if (i.mode === 'percent') return (i.salary * i.pct) / 100;
  if (i.mode === 'fixed') return i.amount;
  return (((i.salary * i.target) / 100) * i.achievement) / 100;
}

export function bonus(i: BonusInput): BonusResult {
  const b = bonusOf(i);
  const total = i.salary + b;
  const spread = i.checks > 0;
  return {
    bonus: b,
    ofSalary: i.salary > 0 ? b / i.salary : null,
    total,
    perCheck: spread ? b / i.checks : null,
    payPerCheck: spread ? total / i.checks : null,
  };
}
