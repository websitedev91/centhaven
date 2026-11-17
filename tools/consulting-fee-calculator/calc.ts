/**
 * Consulting Fee Calculator: pure maths (spec: docs/specs/consulting-fee-calculator.md).
 * No React, no dates, no fetch. No rounding here: round at display time (lib/format.ts).
 */

export interface ConsultingInput {
  /** Target take-home income per year, after tax. */
  income: number;
  /** Rough total tax rate as a fraction (0.25 = 25%). Must be < 1. */
  taxRate: number;
  /** Overheads per year. */
  overheads: number;
  billableDays: number;
  hoursPerDay: number;
  /** Profit margin as a share of the price, as a fraction (0.15 = 15% of every hour billed). Must be < 1. */
  margin: number;
  /** Estimated hours for the project fee. */
  projectHours: number;
}

export interface ConsultingResult {
  ok: true;
  /** Rate card: half-day = hours per day ÷ 2, week = 5 days. */
  halfDayRate: number;
  weekRate: number;
  grossNeeded: number;
  billableHours: number;
  /** Rate that only covers costs (no margin). */
  costRate: number;
  hourlyRate: number;
  dayRate: number;
  projectFee: number;
  annualRevenue: number;
  marginPerYear: number;
  /** Where each billed hour goes. Sums to hourlyRate. */
  perHour: { takeHome: number; tax: number; overheads: number; margin: number };
}

export interface ConsultingError {
  ok: false;
  error: string;
}

export const NO_BILLABLE_DAYS = 'Add some billable days';
export const INVALID_TAX_RATE = 'Tax rate must be below 100%';
export const INVALID_MARGIN = 'Profit margin must be below 100%';

export function consultingFee(input: ConsultingInput): ConsultingResult | ConsultingError {
  const { income, taxRate, overheads, billableDays, hoursPerDay, margin, projectHours } = input;
  if (!(taxRate < 1)) return { ok: false, error: INVALID_TAX_RATE };
  if (!(margin < 1)) return { ok: false, error: INVALID_MARGIN };
  const billableHours = billableDays * hoursPerDay;
  if (!(billableHours > 0)) return { ok: false, error: NO_BILLABLE_DAYS };

  const grossIncome = income / (1 - taxRate);
  const grossNeeded = grossIncome + overheads;
  const costRate = grossNeeded / billableHours;
  // True margin (review #2): the margin is a share of the price, so 15% margin = 15% of every hour billed.
  const hourlyRate = costRate / (1 - margin);
  const annualRevenue = hourlyRate * billableHours;

  return {
    ok: true,
    grossNeeded,
    billableHours,
    costRate,
    hourlyRate,
    dayRate: hourlyRate * hoursPerDay,
    halfDayRate: (hourlyRate * hoursPerDay) / 2,
    weekRate: hourlyRate * hoursPerDay * 5,
    projectFee: hourlyRate * projectHours,
    annualRevenue,
    marginPerYear: annualRevenue - grossNeeded,
    perHour: {
      takeHome: income / billableHours,
      tax: (grossIncome - income) / billableHours,
      overheads: overheads / billableHours,
      margin: hourlyRate - costRate,
    },
  };
}
