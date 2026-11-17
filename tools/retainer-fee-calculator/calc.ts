/**
 * Retainer Fee Calculator: pure maths (spec: docs/specs/retainer-fee-calculator.md).
 * No React, no dates, no fetch. No rounding here: round at display time (lib/format.ts).
 */

export interface RetainerInput {
  /** Your normal hourly rate. */
  rate: number;
  /** Hours committed per month. */
  hours: number;
  /**
   * Discount (negative) or premium (positive) on the hourly value, as a fraction:
   * −0.1 = 10% discount, +0.2 = 20% premium (review #2 B3, range −50% … +50%).
   */
  adjustment: number;
  /** Agreement length in months. */
  months: number;
  /** Share of committed hours the client actually uses, as a fraction (0.8 = 80%). */
  usage: number;
  /** Rate for extra hours beyond the retainer. Omit or 0 = your normal hourly rate. */
  overageRate?: number;
  /** Expected extra hours per month (default 0). */
  extraHours?: number;
}

export interface RetainerResult {
  ok: true;
  monthlyFee: number;
  /** The same hours billed one by one at the normal rate. */
  hourlyBilling: number;
  /** hourlyBilling × adjustment: negative = discount given, positive = premium added. */
  adjustmentAmount: number;
  contractValue: number;
  /** Fee ÷ hours actually used. null when usage is 0 (no hours used). */
  effectiveRate: number | null;
  hoursUsed: number;
  /** Overage rate actually used (normal rate when none is given). */
  overageRate: number;
  overagePerMonth: number;
  /** Retainer fee + extra hours. */
  monthlyTotal: number;
  /** monthlyTotal × months. */
  contractTotal: number;
}

export interface RetainerError {
  ok: false;
  error: string;
}

export const NO_HOURS = 'Add the hours you commit each month';

export function retainerFee(input: RetainerInput): RetainerResult | RetainerError {
  const { rate, hours, adjustment, months, usage, extraHours = 0 } = input;
  if (!(hours > 0)) return { ok: false, error: NO_HOURS };
  const overageRate = input.overageRate && input.overageRate > 0 ? input.overageRate : rate;
  const hourlyBilling = rate * hours;
  const monthlyFee = hourlyBilling * (1 + adjustment);
  const hoursUsed = hours * usage;
  const overagePerMonth = overageRate * Math.max(extraHours, 0);
  const monthlyTotal = monthlyFee + overagePerMonth;
  return {
    ok: true,
    monthlyFee,
    hourlyBilling,
    adjustmentAmount: hourlyBilling * adjustment,
    contractValue: monthlyFee * months,
    effectiveRate: hoursUsed > 0 ? monthlyFee / hoursUsed : null,
    hoursUsed,
    overageRate,
    overagePerMonth,
    monthlyTotal,
    contractTotal: monthlyTotal * months,
  };
}
