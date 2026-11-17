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

/** Optional overtime (hourly mode only): extra hours per week paid at a multiple of the wage. */
export interface Overtime {
  hoursPerWeek: number;
  /** 1.5 = time and a half. */
  multiplier: number;
}

export interface PayResult {
  ok: true;
  hourly: number;
  /** Total yearly pay, including overtime when given. */
  annual: number;
  monthly: number;
  biweekly: number;
  /** Paid twice a month: 24 pay periods. */
  semimonthly: number;
  weekly: number;
  daily: number;
  /** Regular paid hours per year (overtime not included). */
  hoursPerYear: number;
  /** Pay for regular hours only. */
  baseAnnual: number;
  overtimeAnnual: number;
  overtimeHoursPerYear: number;
}

export interface PayError {
  ok: false;
  error: string;
}

export const NO_HOURS = 'Add some paid hours';

function validPattern(p: WorkPattern): boolean {
  return p.hoursPerWeek > 0 && p.daysPerWeek > 0 && p.paidWeeks > 0;
}

function fromHourly(hourly: number, p: WorkPattern, ot?: Overtime): PayResult {
  const hoursPerYear = p.hoursPerWeek * p.paidWeeks;
  const otHours = ot && ot.hoursPerWeek > 0 ? ot.hoursPerWeek : 0;
  const otWeekly = otHours > 0 ? hourly * ot!.multiplier * otHours : 0;
  const weekly = hourly * p.hoursPerWeek + otWeekly;
  const baseAnnual = hourly * hoursPerYear;
  const overtimeAnnual = otWeekly * p.paidWeeks;
  const annual = baseAnnual + overtimeAnnual;
  return {
    ok: true,
    hourly,
    annual,
    monthly: annual / 12,
    biweekly: annual / 26,
    semimonthly: annual / 24,
    weekly,
    daily: weekly / p.daysPerWeek,
    hoursPerYear,
    baseAnnual,
    overtimeAnnual,
    overtimeHoursPerYear: otHours * p.paidWeeks,
  };
}

/** Hourly wage → annual, monthly, bi-weekly, semi-monthly, weekly and daily pay (optional overtime). */
export function hourlyToSalary(input: WorkPattern & { hourly: number; overtime?: Overtime }): PayResult | PayError {
  if (!validPattern(input)) return { ok: false, error: NO_HOURS };
  return fromHourly(input.hourly, input, input.overtime);
}

/** Annual salary → hourly wage (and the same breakdown). Overtime doesn't apply in this direction. */
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

/** Static reference table: common hourly wages at a full-time 40 h × 52 weeks (2,080 hours). */
export const COMMON_WAGES = [15, 20, 25, 30, 35, 40, 45, 50] as const;
export const FULL_TIME_HOURS = 40 * 52;

export function commonWagesTable(): { hourly: number; annual: number; monthly: number }[] {
  return COMMON_WAGES.map((hourly) => ({ hourly, annual: hourly * FULL_TIME_HOURS, monthly: (hourly * FULL_TIME_HOURS) / 12 }));
}
