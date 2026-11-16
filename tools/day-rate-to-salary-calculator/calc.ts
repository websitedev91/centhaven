/**
 * Day Rate to Salary Calculator: pure maths (spec: docs/specs/day-rate-to-salary-calculator.md).
 * No React, no dates, no fetch. No rounding here: round at display time (lib/format.ts).
 * Before tax. The benefits uplift is the user's own estimate, not a rate.
 */

export interface DaysInput {
  /** 52 weeks × 5 days = 260 by default. */
  workingDays: number;
  /** Unpaid for a contractor. */
  holidays: number;
  publicHolidays: number;
  sickDays: number;
  /** Gaps between contracts, when you're not billing. */
  gapDays: number;
  /** Extra value an employee gets (pension, paid leave, insurance), as a fraction (0.2 = 20%). */
  uplift: number;
}

export interface DayRateResult {
  ok: true;
  dayRate: number;
  billableDays: number;
  annualIncome: number;
  equivalentSalary: number;
  monthlyIncome: number;
  /** Day rate ÷ 8 (an 8-hour day). */
  hourlyEquivalent: number;
}

export interface DayRateError {
  ok: false;
  error: string;
}

export const NO_BILLABLE_DAYS = 'Add some billable days';
export const HOURS_PER_DAY = 8;

export function billableDays(d: DaysInput): number {
  return d.workingDays - d.holidays - d.publicHolidays - d.sickDays - d.gapDays;
}

function result(dayRate: number, days: number, uplift: number): DayRateResult {
  const annualIncome = dayRate * days;
  return {
    ok: true,
    dayRate,
    billableDays: days,
    annualIncome,
    equivalentSalary: annualIncome / (1 + uplift),
    monthlyIncome: annualIncome / 12,
    hourlyEquivalent: dayRate / HOURS_PER_DAY,
  };
}

/** Day rate → yearly contractor income and the employee salary it roughly equals. */
export function dayRateToSalary(input: DaysInput & { dayRate: number }): DayRateResult | DayRateError {
  const days = billableDays(input);
  if (days <= 0) return { ok: false, error: NO_BILLABLE_DAYS };
  return result(input.dayRate, days, input.uplift);
}

/** Salary → the day rate a contractor needs to match it (including the benefits uplift). */
export function salaryToDayRate(input: DaysInput & { salary: number }): DayRateResult | DayRateError {
  const days = billableDays(input);
  if (days <= 0) return { ok: false, error: NO_BILLABLE_DAYS };
  return result((input.salary * (1 + input.uplift)) / days, days, input.uplift);
}
