/**
 * Biweekly Pay Calculator: pure maths (spec: docs/specs/biweekly-pay-calculator.md).
 * Gross pay only: no tax, no deductions. Every number comes from the user.
 * No React, no dates, no fetch. Round at display time only.
 */

export type BiweeklyMode = 'salary' | 'hourly';

export interface BiweeklyInput {
  mode: BiweeklyMode;
  salary: number;
  rate: number;
  hoursPerWeek: number;
  /** Overtime hours per pay period (two weeks). 0 = off. */
  overtimeHours: number;
  /** The user's own overtime hourly rate. */
  overtimeRate: number;
}

export interface BiweeklyResult {
  biweekly: number;
  yearly: number;
  /** salary mode: the salary split over 27 paydays · hourly mode: biweekly × 27 for the year. */
  twentySeven: number;
  semiMonthly: number;
  monthly: number;
  weekly: number;
  /** Overtime pay per pay period (hourly mode), or 0. */
  overtime: number;
}

export const PAYDAYS = 26;

export function biweeklyPay(input: BiweeklyInput): BiweeklyResult {
  if (input.mode === 'salary') {
    const biweekly = input.salary / PAYDAYS;
    return summary(biweekly, input.salary, input.salary / 27, 0);
  }
  const overtime = input.overtimeHours * input.overtimeRate;
  const biweekly = input.rate * input.hoursPerWeek * 2 + overtime;
  return summary(biweekly, biweekly * PAYDAYS, biweekly * 27, overtime);
}

function summary(biweekly: number, yearly: number, twentySeven: number, overtime: number): BiweeklyResult {
  return { biweekly, yearly, twentySeven, semiMonthly: yearly / 24, monthly: yearly / 12, weekly: biweekly / 2, overtime };
}
