/**
 * Conversion Rate Calculator: pure maths (spec: docs/specs/conversion-rate-calculator.md).
 * Every number comes from the user. No React, no dates, no fetch. Round at display time only.
 */

export type ConversionMode = 'rate' | 'conversions' | 'visitors';

export interface ConversionInput {
  mode: ConversionMode;
  visitors: number;
  conversions: number;
  /** Target rate as a fraction (0.04 = 4%). */
  target: number;
  goal: number;
  /** Value of one conversion. 0 = off. */
  value: number;
}

export interface ConversionResult {
  /** The rate as a fraction: found (rate mode) or the target. */
  rate: number;
  /** Conversions: counted, expected from the target (may be fractional), or the goal. */
  conversions: number;
  /** Visitors: entered, or needed (visitors mode, rounded up). */
  visitors: number;
  /** 1 ÷ rate, or null when the rate is 0. */
  visitorsPerConversion: number | null;
  revenue: number | null;
  /** Revenue ÷ visitors (rate and conversions modes only). */
  revenuePerVisitor: number | null;
}

/** 12 significant digits, so 200 ÷ 0.04 or 5,000 × 0.04 count as whole numbers. */
const clean = (n: number) => Number(n.toPrecision(12));

export function conversionRate(input: ConversionInput): ConversionResult {
  const { mode, value } = input;
  const on = value > 0;
  let rate: number;
  let conversions: number;
  let visitors: number;
  if (mode === 'rate') {
    rate = input.conversions / input.visitors;
    conversions = input.conversions;
    visitors = input.visitors;
  } else if (mode === 'conversions') {
    rate = input.target;
    conversions = input.visitors * input.target;
    visitors = input.visitors;
  } else {
    rate = input.target;
    conversions = input.goal;
    // You need whole visitors to reach the goal, so round up.
    visitors = Math.ceil(clean(input.goal / input.target));
  }
  const revenue = on ? conversions * value : null;
  return {
    rate,
    conversions,
    visitors,
    visitorsPerConversion: rate > 0 ? 1 / rate : null,
    revenue,
    revenuePerVisitor: revenue !== null && mode !== 'visitors' ? revenue / visitors : null,
  };
}

/** "About 33.3 visitors for each conversion" (1 decimal at most). */
export function formatVisitorsPerConversion(n: number): string {
  const text = clean(n).toLocaleString('en-US', { maximumFractionDigits: 1 });
  return `About ${text} ${text === '1' ? 'visitor' : 'visitors'} for each conversion`;
}

/** Row value: "about 33.3 visitors", "1 visitor". */
export function formatVisitorsEach(n: number): string {
  const c = clean(n);
  const text = c.toLocaleString('en-US', { maximumFractionDigits: 1 });
  const word = text === '1' ? 'visitor' : 'visitors';
  return Number.isInteger(c) ? `${text} ${word}` : `about ${text} ${word}`;
}

/** "6,667 visitors". */
export function formatVisitors(n: number): string {
  return `${n.toLocaleString('en-US')} ${n === 1 ? 'visitor' : 'visitors'}`;
}
