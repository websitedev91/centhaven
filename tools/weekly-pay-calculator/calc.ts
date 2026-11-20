/**
 * Weekly Pay Calculator: pure maths (spec: docs/specs/weekly-pay-calculator.md).
 * Gross pay only: no tax, no deductions. Every number comes from the user.
 * No React, no dates, no fetch. Round at display time only.
 */

export type WeeklyMode = 'salary' | 'hourly';

export interface WeeklyInput {
  mode: WeeklyMode;
  salary: number;
  rate: number;
  hoursPerWeek: number;
  /** Overtime hours per week. 0 = off. */
  overtimeHours: number;
  /** The user's own overtime hourly rate. */
  overtimeRate: number;
}

export interface WeeklyResult {
  weekly: number;
  yearly: number;
  /** salary mode: the salary split over 53 paydays · hourly mode: weekly × 53 for the year. */
  fiftyThree: number;
  biweekly: number;
  monthly: number;
  /** Overtime pay per week (hourly mode), or 0. */
  overtime: number;
}

export const PAYDAYS = 52;

export function weeklyPay(input: WeeklyInput): WeeklyResult {
  if (input.mode === 'salary') {
    const weekly = input.salary / PAYDAYS;
    return summary(weekly, input.salary, input.salary / 53, 0);
  }
  const overtime = input.overtimeHours * input.overtimeRate;
  const weekly = input.rate * input.hoursPerWeek + overtime;
  return summary(weekly, weekly * PAYDAYS, weekly * 53, overtime);
}

function summary(weekly: number, yearly: number, fiftyThree: number, overtime: number): WeeklyResult {
  return { weekly, yearly, fiftyThree, biweekly: weekly * 2, monthly: yearly / 12, overtime };
}
