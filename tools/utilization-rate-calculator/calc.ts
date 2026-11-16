/**
 * Utilization Rate Calculator: pure maths (spec: docs/specs/utilization-rate-calculator.md).
 * No React, no dates, no fetch. No rounding here: round at display time (lib/format.ts).
 */

export interface UtilizationInput {
  billable: number;
  /** Total hours you (or the team) could work in the period. */
  available: number;
  /** Target utilization as a fraction (0.75 = 75%). */
  target: number;
  /** Hourly rate, used only for the revenue gap. */
  rate: number;
}

export interface UtilizationResult {
  ok: true;
  utilization: number;
  targetHours: number;
  /** targetHours − billable. Negative means above target. */
  gapHours: number;
  /** Revenue left on the table below target (0 at or above target). */
  revenueGap: number;
  nonBillable: number;
}

export interface UtilizationError {
  ok: false;
  error: string;
}

export const BILLABLE_OVER_AVAILABLE = "Billable hours can't be more than available hours";
export const NO_AVAILABLE_HOURS = 'Add some available hours';

export function utilizationRate(input: UtilizationInput): UtilizationResult | UtilizationError {
  const { billable, available, target, rate } = input;
  if (!(available > 0)) return { ok: false, error: NO_AVAILABLE_HOURS };
  if (billable > available) return { ok: false, error: BILLABLE_OVER_AVAILABLE };
  const targetHours = target * available;
  const gapHours = targetHours - billable;
  return {
    ok: true,
    utilization: billable / available,
    targetHours,
    gapHours,
    revenueGap: Math.max(gapHours, 0) * rate,
    nonBillable: available - billable,
  };
}
