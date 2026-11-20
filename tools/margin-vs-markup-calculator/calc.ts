/**
 * Margin vs Markup Calculator: pure maths (spec: docs/specs/margin-vs-markup-calculator.md).
 * Every number comes from the user. No React, no dates, no fetch. Round at display time only.
 *
 * Margin = profit as a share of the price. Markup = profit as a share of the cost.
 * Percentages are fractions here (0.4 = 40%).
 */

export type MarginMode = 'price' | 'find' | 'convert';
export type PriceFrom = 'margin' | 'markup';

export interface CostPriceResult {
  profit: number;
  /** null when the price is 0 ("No price, so there's no margin"). */
  margin: number | null;
  /** null when the cost is 0 ("No cost, so markup can't be worked out"). */
  markup: number | null;
}

/** Cost and price mode. Both 0 is caught by the schema ("Enter a cost or a price above 0"). */
export function fromCostAndPrice(cost: number, price: number): CostPriceResult {
  const profit = price - cost;
  return { profit, margin: price > 0 ? profit / price : null, markup: cost > 0 ? profit / cost : null };
}

export interface FindPriceResult {
  price: number;
  profit: number;
  /** The percentage the user did not enter: markup when priced from a margin, and the other way round. */
  other: number;
}

/** Find a price: cost + a margin (below 1) or a markup. */
export function findPrice(cost: number, by: PriceFrom, pct: number): FindPriceResult {
  const price = by === 'margin' ? cost / (1 - pct) : cost * (1 + pct);
  return { price, profit: price - cost, other: by === 'margin' ? markupFromMargin(pct) : marginFromMarkup(pct) };
}

export function markupFromMargin(margin: number): number {
  return margin / (1 - margin);
}

export function marginFromMarkup(markup: number): number {
  return markup / (1 + markup);
}

/** Fraction as a percentage, up to 2 decimals, trailing zeros dropped: 0.4 → "40%", 2/3 → "66.67%". */
export function formatPct(fraction: number): string {
  const n = Math.round(Number((fraction * 10_000).toPrecision(15))) / 100;
  return `${(Object.is(n, -0) ? 0 : n).toLocaleString('en-US', { maximumFractionDigits: 2 })}%`;
}
