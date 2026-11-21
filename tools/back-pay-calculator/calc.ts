/**
 * Back Pay Calculator: pure maths (spec: docs/specs/back-pay-calculator.md).
 * Gross amounts only. Never mentions legal rights, deadlines, interest or how to claim.
 * No React, no dates, no fetch. Round at display time only.
 */

export type BackPayMode = 'rate' | 'salary' | 'missed';

export interface BackPayInput {
  mode: BackPayMode;
  oldRate: number;
  newRate: number;
  hours: number;
  weeks: number;
  oldSalary: number;
  newSalary: number;
  amount: number;
  periods: number;
}

export interface BackPayResult {
  total: number;
  /** rate mode: new − old per hour. */
  perHour: number | null;
  /** rate and salary modes: the difference per week. */
  perWeek: number | null;
  /** salary mode: new − old per year. */
  perYear: number | null;
}

export function backPay(i: BackPayInput): BackPayResult {
  if (i.mode === 'rate') {
    const perHour = i.newRate - i.oldRate;
    const perWeek = perHour * i.hours;
    return { total: perWeek * i.weeks, perHour, perWeek, perYear: null };
  }
  if (i.mode === 'salary') {
    const perYear = i.newSalary - i.oldSalary;
    const perWeek = perYear / 52;
    return { total: perWeek * i.weeks, perHour: null, perWeek, perYear };
  }
  return { total: i.amount * i.periods, perHour: null, perWeek: null, perYear: null };
}
