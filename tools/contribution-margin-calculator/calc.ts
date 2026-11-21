/**
 * Contribution Margin Calculator: pure maths (spec: docs/specs/contribution-margin-calculator.md).
 * Price, variable cost, units and fixed costs all come from the user. Never says what margin is
 * "good". No React, no dates, no fetch. Round at display time only.
 */
import { ceilSales } from '@/tools/break-even-calculator/calc';

export interface MarginInput {
  price: number;
  variableCost: number;
  units: number;
  /** 0 = off (no break-even rows). */
  fixed: number;
}

export interface MarginResult {
  perUnit: number;
  /** CM ÷ price, as a fraction. */
  ratio: number;
  total: number;
  /** Fixed costs given and CM > 0: whole units (rounded up) and the exact figure. */
  breakEven: { units: number; exact: number; revenue: number } | null;
  /** Fixed costs given: total CM − fixed. */
  profit: number | null;
  /** Fixed costs given but CM ≤ 0: no break-even point. */
  noBreakEven: boolean;
}

export function contributionMargin(i: MarginInput): MarginResult {
  const perUnit = i.price - i.variableCost;
  const ratio = perUnit / i.price;
  const total = perUnit * i.units;
  const hasFixed = i.fixed > 0;
  const canBreakEven = hasFixed && perUnit > 0;
  const exact = canBreakEven ? i.fixed / perUnit : 0;
  return {
    perUnit,
    ratio,
    total,
    breakEven: canBreakEven ? { units: ceilSales(exact), exact, revenue: i.fixed / ratio } : null,
    profit: hasFixed ? total - i.fixed : null,
    noBreakEven: hasFixed && perUnit <= 0,
  };
}
