/**
 * Part Time Salary Calculator: pure maths (spec: docs/specs/part-time-salary-calculator.md).
 * Gross pay only, no tax. Full-time hours come from the user (40 is an example); never states
 * legal full-time or part-time hours. No React, no dates, no fetch. Round at display time only.
 */

export type PartTimeMode = 'prorata' | 'hourly';

export interface PartTimeInput {
  mode: PartTimeMode;
  ftSalary: number;
  ftHours: number;
  ptHours: number;
  rate: number;
  hours: number;
  weeks: number;
}

export interface PartTimeResult {
  yearly: number;
  /** Part-time ÷ full-time hours (prorata mode only). */
  share: number | null;
  monthly: number;
  weekly: number;
  /** Hourly equivalent, based on 52 paid weeks (prorata mode, part-time hours > 0). */
  hourly: number | null;
}

export function partTimePay(i: PartTimeInput): PartTimeResult {
  if (i.mode === 'prorata') {
    const share = i.ptHours / i.ftHours;
    const yearly = i.ftSalary * share;
    return { yearly, share, monthly: yearly / 12, weekly: yearly / 52, hourly: i.ptHours > 0 ? i.ftSalary / (i.ftHours * 52) : null };
  }
  const weekly = i.rate * i.hours;
  const yearly = weekly * i.weeks;
  return { yearly, share: null, monthly: yearly / 12, weekly, hourly: null };
}
