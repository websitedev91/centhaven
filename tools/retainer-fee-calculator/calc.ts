/**
 * Retainer Fee Calculator: pure maths (spec: docs/specs/retainer-fee-calculator.md).
 * No React, no dates, no fetch. No rounding here: round at display time (lib/format.ts).
 */

export interface RetainerInput {
  /** Your normal hourly rate. */
  rate: number;
  /** Hours committed per month. */
  hours: number;
  /** Retainer discount as a fraction (0.1 = 10%). */
  discount: number;
  /** Agreement length in months. */
  months: number;
  /** Share of committed hours the client actually uses, as a fraction (0.8 = 80%). */
  usage: number;
}

export interface RetainerResult {
  ok: true;
  monthlyFee: number;
  /** The same hours billed one by one at the normal rate. */
  hourlyBilling: number;
  discountGiven: number;
  contractValue: number;
  /** Fee ÷ hours actually used. null when usage is 0 (no hours used). */
  effectiveRate: number | null;
  hoursUsed: number;
}

export interface RetainerError {
  ok: false;
  error: string;
}

export const NO_HOURS = 'Add the hours you commit each month';

export function retainerFee(input: RetainerInput): RetainerResult | RetainerError {
  const { rate, hours, discount, months, usage } = input;
  if (!(hours > 0)) return { ok: false, error: NO_HOURS };
  const hourlyBilling = rate * hours;
  const monthlyFee = hourlyBilling * (1 - discount);
  const hoursUsed = hours * usage;
  return {
    ok: true,
    monthlyFee,
    hourlyBilling,
    discountGiven: hourlyBilling * discount,
    contractValue: monthlyFee * months,
    effectiveRate: hoursUsed > 0 ? monthlyFee / hoursUsed : null,
    hoursUsed,
  };
}
