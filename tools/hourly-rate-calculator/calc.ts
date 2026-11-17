/**
 * Freelance Hourly Rate Calculator — pure maths (spec: docs/specs/hourly-rate-calculator.md).
 * No React, no dates, no fetch. No rounding here: round at display time (lib/format.ts).
 */

export interface HourlyRateInput {
  /** Target take-home income per year, after tax. */
  targetIncome: number;
  /** Business expenses per year. */
  expenses: number;
  /** Rough total tax rate as a fraction (0.25 = 25%). Must be < 1. */
  taxRate: number;
  weeksOff: number;
  hoursPerWeek: number;
  /** Share of hours that can be billed, as a fraction (0.75 = 75%). */
  billablePct: number;
  /** Optional buffer for slow months on top of the minimum rate, as a fraction (0.1 = 10%). */
  buffer?: number;
}

export interface HourlyRateResult {
  ok: true;
  grossNeeded: number;
  billableHours: number;
  hourlyRate: number;
  dayRate: number;
  /** Minimum rate × (1 + buffer). Equals hourlyRate when there is no buffer. */
  bufferedRate: number;
  bufferedDayRate: number;
  hoursPerDay: number;
  monthlyRevenue: number;
  /** Total tax per year implied by the target take-home income. */
  taxPerYear: number;
  /** Where each billed hour goes. Sums to hourlyRate. */
  perHour: { takeHome: number; tax: number; expenses: number };
}

export interface HourlyRateError {
  ok: false;
  error: string;
}

export const NO_BILLABLE_HOURS = 'Add some billable hours';
export const INVALID_TAX_RATE = 'Tax rate must be below 100%';

export const WEEKS_PER_YEAR = 52;
export const WORKDAYS_PER_WEEK = 5;

export function calcHourlyRate(input: HourlyRateInput): HourlyRateResult | HourlyRateError {
  const { targetIncome, expenses, taxRate, weeksOff, hoursPerWeek, billablePct, buffer = 0 } = input;

  if (!(taxRate < 1)) return { ok: false, error: INVALID_TAX_RATE };

  const billableHours = (WEEKS_PER_YEAR - weeksOff) * hoursPerWeek * billablePct;
  if (!Number.isFinite(billableHours) || billableHours <= 0) return { ok: false, error: NO_BILLABLE_HOURS };

  const preTaxIncome = targetIncome / (1 - taxRate);
  const taxPerYear = preTaxIncome - targetIncome;
  const grossNeeded = preTaxIncome + expenses;
  const hourlyRate = grossNeeded / billableHours;
  const hoursPerDay = hoursPerWeek / WORKDAYS_PER_WEEK;

  return {
    ok: true,
    grossNeeded,
    billableHours,
    hourlyRate,
    dayRate: hourlyRate * hoursPerDay,
    bufferedRate: hourlyRate * (1 + buffer),
    bufferedDayRate: hourlyRate * (1 + buffer) * hoursPerDay,
    hoursPerDay,
    monthlyRevenue: grossNeeded / 12,
    taxPerYear,
    perHour: {
      takeHome: targetIncome / billableHours,
      tax: taxPerYear / billableHours,
      expenses: expenses / billableHours,
    },
  };
}
