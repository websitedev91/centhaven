/**
 * Break-Even Calculator: pure maths (spec: docs/specs/break-even-calculator.md).
 * No React, no dates, no fetch. No rounding of money here: round at display time (lib/format.ts).
 * Sales counts are whole things you sell, so they are rounded UP for display (ceilSales).
 */

export interface BreakEvenInput {
  /** Fixed costs per month (rent, software, salaries…). */
  fixedCosts: number;
  /** Price per unit, project or client. */
  price: number;
  /** Variable cost per unit (materials, fees, contractor cost…). */
  variableCost: number;
  /** Optional target profit per month (0 = none). */
  targetProfit: number;
}

export interface BreakEvenResult {
  ok: true;
  contribution: number;
  marginRatio: number;
  /** Exact break-even sales (not rounded). */
  breakEvenUnits: number;
  breakEvenRevenue: number;
  /** Exact sales needed for the target profit (not rounded). */
  targetUnits: number;
}

export interface BreakEvenError {
  ok: false;
  error: string;
}

export const PRICE_NOT_ABOVE_COST = 'Price must be higher than variable cost to ever break even';

export function breakEven(input: BreakEvenInput): BreakEvenResult | BreakEvenError {
  const { fixedCosts, price, variableCost, targetProfit } = input;
  if (!(price > variableCost)) return { ok: false, error: PRICE_NOT_ABOVE_COST };
  const contribution = price - variableCost;
  const marginRatio = contribution / price;
  return {
    ok: true,
    contribution,
    marginRatio,
    breakEvenUnits: fixedCosts / contribution,
    breakEvenRevenue: fixedCosts / marginRatio,
    targetUnits: (fixedCosts + targetProfit) / contribution,
  };
}

/**
 * Whole sales needed: round UP (50.42 → 51), because 50 sales would still lose money.
 * A tiny tolerance stops float noise (500.0000000001) from adding a phantom sale.
 */
export function ceilSales(exact: number): number {
  // Math.max also turns the −0 that Math.ceil(−1e-9) gives into a plain 0.
  return Math.max(0, Math.ceil(exact - 1e-9));
}

/** Revenue and total-cost lines from 0 to `maxUnits` for the break-even chart. */
export function breakEvenLines(input: BreakEvenInput, maxUnits: number, points = 20): { units: number; revenue: number; totalCost: number }[] {
  return Array.from({ length: points + 1 }, (_, i) => {
    const units = (maxUnits * i) / points;
    return { units, revenue: units * input.price, totalCost: input.fixedCosts + units * input.variableCost };
  });
}

/**
 * Margin of safety (review C10): how far current sales are above break-even, as a share of
 * current sales. Negative when below break-even. null when current sales aren't given (0).
 */
export function marginOfSafety(currentSales: number, breakEvenUnits: number): { ratio: number; units: number } | null {
  if (!(currentSales > 0)) return null;
  return { ratio: (currentSales - breakEvenUnits) / currentSales, units: currentSales - breakEvenUnits };
}

export const PRICE_STEPS = [-0.2, -0.1, 0, 0.1, 0.2] as const;

/** Break-even sales at the current price and ±10% / ±20% (null = price no longer above variable cost). */
export function priceSensitivity(input: BreakEvenInput): { change: number; price: number; breakEvenUnits: number | null }[] {
  return PRICE_STEPS.map((change) => {
    const price = input.price * (1 + change);
    const r = breakEven({ ...input, price });
    return { change, price, breakEvenUnits: r.ok ? r.breakEvenUnits : null };
  });
}
