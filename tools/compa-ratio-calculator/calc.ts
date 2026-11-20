/**
 * Compa Ratio Calculator: pure maths (spec: docs/specs/compa-ratio-calculator.md).
 * Every number comes from the user (their salary and the employer's pay range). Never says
 * what ratio is "good". No React, no dates, no fetch. Round at display time only.
 */

export type MidpointFrom = 'range' | 'own';

export function midpointOf(min: number, max: number): number {
  return (min + max) / 2;
}

export function compaRatio(salary: number, midpoint: number): number {
  return salary / midpoint;
}

/** (salary − min) ÷ (max − min), as a fraction. Below 0 or above 1 when outside the range. */
export function rangePenetration(salary: number, min: number, max: number): number {
  return (salary - min) / (max - min);
}

export type Position = 'below-range' | 'below-mid' | 'at-mid' | 'above-mid' | 'above-range';

/** Factual position words only (spec): never "good", "fair", "low" or "high". */
export function position(salary: number, midpoint: number, range: { min: number; max: number } | null): Position {
  if (range && salary < range.min) return 'below-range';
  if (range && salary > range.max) return 'above-range';
  const diff = Number((salary - midpoint).toPrecision(12));
  return diff < 0 ? 'below-mid' : diff > 0 ? 'above-mid' : 'at-mid';
}

/** "0.96" (2 decimals). */
export function formatRatio(n: number): string {
  const r = Math.round(Number((n * 100).toPrecision(15))) / 100;
  return r.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
