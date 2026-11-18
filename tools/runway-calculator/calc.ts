/**
 * Runway Calculator: pure maths (spec: docs/specs/runway-calculator.md).
 * Every number comes from the user. No React, no dates, no fetch. Round at display time only.
 */

export interface RunwayInput {
  cash: number;
  /** Monthly costs (gross burn). */
  costs: number;
  /** Monthly revenue (0 = none). */
  revenue: number;
  /** Target runway in months (0 = off). */
  target: number;
}

export interface RunwayResult {
  ok: true;
  grossBurn: number;
  /** costs − revenue; ≤ 0 means revenue covers costs. */
  netBurn: number;
  /** True when net burn ≤ 0: no runway limit from burn. */
  notBurning: boolean;
  /** Months of cash at net burn, or null when not burning. */
  runway: number | null;
  /** Whole months and leftover days (30-day months), for "about X months and Y days". */
  wholeMonths: number | null;
  extraDays: number | null;
  /** Months of cash at gross burn (no revenue), or null when costs are 0. */
  grossRunway: number | null;
  /** Target only: the highest net burn that reaches the target, and the monthly cut needed. */
  maxBurn: number | null;
  cutNeeded: number | null;
}

export function runway(input: RunwayInput): RunwayResult {
  const { cash, costs, revenue, target } = input;
  const netBurn = costs - revenue;
  const notBurning = netBurn <= 0;
  const months = notBurning ? null : cash / netBurn;
  const wholeMonths = months === null ? null : Math.floor(months);
  const extraDays = months === null ? null : Math.round((months - Math.floor(months)) * 30);
  const maxBurn = target > 0 ? cash / target : null;
  return {
    ok: true,
    grossBurn: costs,
    netBurn,
    notBurning,
    runway: months,
    wholeMonths,
    extraDays,
    grossRunway: costs > 0 ? cash / costs : null,
    maxBurn,
    cutNeeded: maxBurn === null ? null : Math.max(0, netBurn - maxBurn),
  };
}

/** Runway months with exactly one decimal ("8.0 months"), as the spec shows them. */
export function formatMonths(n: number): string {
  return `${n.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} months`;
}

/** Cash left at the start of each month until it reaches 0 (at most ~60 points). */
export function cashPath(cash: number, netBurn: number): { month: number; value: number }[] {
  if (!(netBurn > 0)) return [];
  const months = Math.ceil(cash / netBurn);
  const step = Math.max(1, Math.ceil(months / 60));
  const points: { month: number; value: number }[] = [];
  for (let m = 0; m <= months; m += step) points.push({ month: m, value: Math.max(0, cash - netBurn * m) });
  if (points.at(-1)!.month !== months) points.push({ month: months, value: 0 });
  return points;
}
