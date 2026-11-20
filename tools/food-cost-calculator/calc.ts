/**
 * Food Cost Calculator: pure maths (spec: docs/specs/food-cost-calculator.md).
 * Every number comes from the user, including the target food cost %. Never states an
 * "ideal" or "industry" food cost. No React, no dates, no fetch. Round at display time only.
 */

export type FoodCostMode = 'percent' | 'price' | 'period';

/** Food cost % of one dish (as a fraction) and the gross profit per plate. */
export function dishFoodCost(cost: number, price: number): { pct: number; profit: number } {
  return { pct: cost / price, profit: price - cost };
}

/** Menu price from the ingredient cost and the user's own target food cost (fraction, > 0). */
export function menuPrice(cost: number, target: number): { price: number; profit: number } {
  const price = cost / target;
  return { price, profit: price - cost };
}

/** Food cost for a period: (opening + purchases − closing) ÷ food sales. */
export function periodFoodCost(opening: number, purchases: number, closing: number, sales: number): { used: number; pct: number } {
  const used = opening + purchases - closing;
  return { used, pct: used / sales };
}
