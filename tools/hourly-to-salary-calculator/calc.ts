/**
 * Hourly to Salary Calculator: pure maths (spec: docs/specs/hourly-to-salary-calculator.md).
 * No React, no dates, no fetch. No rounding here: round at display time (lib/format.ts).
 * All amounts are before tax (gross).
 */

export interface WorkPattern {
  hoursPerWeek: number;
  /** Used only for the daily figure. */
  daysPerWeek: number;
  /** 52 when holidays are paid; lower for unpaid time off. */
  paidWeeks: number;
}

export interface PayResult {
  ok: true;
  hourly: number;
  annual: number;
  monthly: number;
  biweekly: number;
  weekly: number;
  daily: number;
  hoursPerYear: number;
}

export interface PayError {
  ok: false;
  error: string;
}

export const NO_HOURS = 'Add some paid hours';

function validPattern(p: WorkPattern): boolean {
  return p.hoursPerWeek > 0 && p.daysPerWeek > 0 && p.paidWeeks > 0;
}

function fromHourly(hourly: number, p: WorkPattern): PayResult {
  const hoursPerYear = p.hoursPerWeek * p.paidWeeks;
  const annual = hourly * hoursPerYear;
  return {
    ok: true,
    hourly,
    annual,
    monthly: annual / 12,
    biweekly: annual / 26,
    weekly: hourly * p.hoursPerWeek,
    daily: (hourly * p.hoursPerWeek) / p.daysPerWeek,
    hoursPerYear,
  };
}

/** Hourly wage → annual, monthly, bi-weekly, weekly and daily pay. */
export function hourlyToSalary(input: WorkPattern & { hourly: number }): PayResult | PayError {
  if (!validPattern(input)) return { ok: false, error: NO_HOURS };
  return fromHourly(input.hourly, input);
}

/** Annual salary → hourly wage (and the same breakdown). */
export function salaryToHourly(input: WorkPattern & { annual: number }): PayResult | PayError {
  if (!validPattern(input)) return { ok: false, error: NO_HOURS };
  const hourly = input.annual / (input.hoursPerWeek * input.paidWeeks);
  return fromHourly(hourly, input);
}

export const QUICK_HOURS = [30, 35, 40, 45] as const;

/**
 * Quick table: yearly pay for the same hourly wage at 30, 35, 40 and 45 hours a week
 * (hourly mode), or the hourly wage the same salary works out to (salary mode).
 */
export function quickTable(
  mode: 'hourly' | 'salary',
  amount: number,
  paidWeeks: number,
): { hoursPerWeek: number; value: number }[] {
  return QUICK_HOURS.map((h) => ({
    hoursPerWeek: h,
    value: mode === 'hourly' ? amount * h * paidWeeks : paidWeeks > 0 ? amount / (h * paidWeeks) : NaN,
  }));
}
