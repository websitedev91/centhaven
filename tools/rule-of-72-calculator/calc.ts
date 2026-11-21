/**
 * Rule of 72 Calculator: pure maths (spec: docs/specs/rule-of-72-calculator.md).
 * The rate is always the user's own: never suggests, ranks or quotes a "typical" rate.
 * Assumes a steady rate with growth added once a year. No React, no dates, no fetch.
 */

export type DoubleMode = 'years' | 'rate';

export interface DoubleResult {
  /** The rule-of-72 shortcut: years (years mode) or a % rate (rate mode). */
  rule: number;
  /** The exact answer for yearly compounding, in the same unit. */
  exact: number;
}

/** Years to double at `rate` % a year. */
export function yearsToDouble(rate: number): DoubleResult {
  return { rule: 72 / rate, exact: Math.LN2 / Math.log1p(rate / 100) };
}

/** Yearly % rate needed to double in `years`. */
export function rateToDouble(years: number): DoubleResult {
  return { rule: 72 / years, exact: (2 ** (1 / years) - 1) * 100 };
}

/** Up to 2 decimals, trailing zeros dropped: 9 → "9", 9.0065 → "9.01", 7.177 → "7.18". */
export function formatShort(n: number): string {
  const r = Math.round(Number((n * 100).toPrecision(15))) / 100;
  return (Object.is(r, -0) ? 0 : r).toLocaleString('en-US', { maximumFractionDigits: 2 });
}

/** "1 year", "9.01 years". */
export function formatYears(n: number): string {
  const s = formatShort(n);
  return `${s} ${s === '1' ? 'year' : 'years'}`;
}
