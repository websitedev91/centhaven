/**
 * Current Ratio Calculator: pure maths (spec: docs/specs/current-ratio-calculator.md).
 * Every number comes from the user's own balance sheet. Never says what ratio is "good".
 * No React, no dates, no fetch. Round at display time only.
 */

export interface RatioInput {
  assets: number;
  liabilities: number;
  inventory: number;
  prepaid: number;
}

export interface RatioResult {
  current: number;
  quickAssets: number;
  quick: number;
  workingCapital: number;
}

export function currentRatios(i: RatioInput): RatioResult {
  const quickAssets = i.assets - i.inventory - i.prepaid;
  return {
    current: i.assets / i.liabilities,
    quickAssets,
    quick: quickAssets / i.liabilities,
    workingCapital: i.assets - i.liabilities,
  };
}
