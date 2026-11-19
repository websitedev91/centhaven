/**
 * ROAS Calculator: pure maths (spec: docs/specs/roas-calculator.md).
 * Every number comes from the user. No React, no dates, no fetch. Round at display time only.
 */

export type RoasMode = 'find' | 'needed';

export interface RoasInput {
  mode: RoasMode;
  /** Revenue from the ads (find mode). */
  revenue: number;
  spend: number;
  /** Target ROAS as a ratio, 4 = 400% (needed mode). */
  target: number;
  /** Profit margin before ad spend, as a fraction (0.4 = 40%). 0 = off. */
  margin: number;
}

export interface RoasResult {
  /** find mode: revenue ÷ spend. null in needed mode. */
  roas: number | null;
  /** needed mode: spend × target. null in find mode. */
  revenueNeeded: number | null;
  /** 1 ÷ margin, or null when the margin is off. */
  breakEven: number | null;
  /** find mode with a margin: revenue × margin − spend. */
  profitAfterAds: number | null;
  /** find: ROAS vs break-even · needed: target vs break-even. null without a margin. */
  status: 'above' | 'below' | 'even' | null;
}

/** Compare at 10 significant digits so 1 ÷ 0.5 vs 2.000000001 counts as "even". */
function compare(a: number, b: number): 'above' | 'below' | 'even' {
  const x = Number(a.toPrecision(10));
  const y = Number(b.toPrecision(10));
  return x > y ? 'above' : x < y ? 'below' : 'even';
}

export function roas(input: RoasInput): RoasResult {
  const { mode, revenue, spend, target, margin } = input;
  const breakEven = margin > 0 ? 1 / margin : null;
  if (mode === 'needed') {
    return {
      roas: null,
      revenueNeeded: spend * target,
      breakEven,
      profitAfterAds: null,
      status: breakEven === null ? null : compare(target, breakEven),
    };
  }
  const r = revenue / spend;
  return {
    roas: r,
    revenueNeeded: null,
    breakEven,
    profitAfterAds: margin > 0 ? revenue * margin - spend : null,
    status: breakEven === null ? null : compare(r, breakEven),
  };
}

/** "5.00x" */
export function formatX(n: number): string {
  return `${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}x`;
}

/** Ratio as a percentage, up to 2 decimals, trailing zeros dropped: 5 → "500%", 3.3333 → "333.33%". */
export function formatRatioPercent(n: number): string {
  return `${(Math.round(Number((n * 10_000).toPrecision(15))) / 100).toLocaleString('en-US', { maximumFractionDigits: 2 })}%`;
}
