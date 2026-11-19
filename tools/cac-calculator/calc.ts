/**
 * CAC Calculator: pure maths (spec: docs/specs/cac-calculator.md).
 * Every number comes from the user. No React, no dates, no fetch. Round at display time only.
 */

export interface CacInput {
  marketing: number;
  /** Sales spend for the same period (0 = none). */
  sales: number;
  /** New customers won in the period (≥ 1). */
  customers: number;
  /** Customer lifetime value (0 = LTV section off). */
  ltv: number;
  /** Target LTV:CAC ratio (0 = off). Starts at 3: "a common rule of thumb". */
  target: number;
}

export interface CacResult {
  spend: number;
  cac: number;
  /** LTV ÷ CAC, or null when LTV is off or CAC is 0. */
  ratio: number | null;
  /** LTV − CAC, or null when LTV is off. */
  leftOver: number | null;
  /** Target only (LTV on, target > 0): the highest CAC that meets the target. */
  maxCac: number | null;
  /** Target only: whole new customers needed for the same spend to meet the target. */
  customersNeeded: number | null;
  /** Target only: ratio ≥ target (null when there is no ratio or no target). */
  meetsTarget: boolean | null;
}

export function cac(input: CacInput): CacResult {
  const { marketing, sales, customers, ltv, target } = input;
  const spend = marketing + sales;
  const cost = spend / customers;
  const ltvOn = ltv > 0;
  const ratio = ltvOn && cost > 0 ? ltv / cost : null;
  const targetOn = ltvOn && target > 0;
  // spend × target ÷ LTV, not spend ÷ maxCac, so 75.000001 never rounds up to 76.
  const needed = targetOn ? Math.ceil(Number(((spend * target) / ltv).toPrecision(12))) : null;
  return {
    spend,
    cac: cost,
    ratio,
    leftOver: ltvOn ? ltv - cost : null,
    maxCac: targetOn ? ltv / target : null,
    customersNeeded: needed,
    meetsTarget: targetOn && ratio !== null ? ratio >= target : null,
  };
}

/** "4.5 : 1" (one decimal, as the spec shows ratios). */
export function formatRatio(n: number): string {
  return `${n.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} : 1`;
}
