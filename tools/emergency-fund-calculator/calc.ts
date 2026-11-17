/**
 * Emergency Fund Calculator: pure maths (spec: docs/specs/emergency-fund-calculator.md).
 * No React, no dates, no fetch. No rounding of money here: round at display time (lib/format.ts).
 *
 * The suggested number of months is a common rule of thumb, not a rule, approved by Puru
 * (2026-11-17). It is not attributed to any official body.
 */

export const INCOME_TYPES = ['steady', 'variable', 'self-employed'] as const;
export type IncomeType = (typeof INCOME_TYPES)[number];

/** Base months per income type; +1 per dependant; capped at MAX_SUGGESTED_MONTHS. */
export const BASE_MONTHS: Record<IncomeType, number> = { steady: 3, variable: 6, 'self-employed': 6 };
export const MAX_SUGGESTED_MONTHS = 12;

export function suggestedMonths(incomeType: IncomeType, dependants: number): number {
  return Math.min(MAX_SUGGESTED_MONTHS, BASE_MONTHS[incomeType] + Math.max(0, dependants));
}

export interface EmergencyFundInput {
  /** Monthly essential expenses. */
  expenses: number;
  /** Months to cover (suggested or the user's own). */
  months: number;
  saved: number;
  monthlySaving: number;
}

export interface EmergencyFundResult {
  ok: true;
  target: number;
  /** Still to save (0 when covered). */
  shortfall: number;
  /** Amount saved beyond the target (0 if not covered). */
  surplus: number;
  /** Whole months to close the gap; 0 when covered; null when there's a gap but no monthly saving. */
  monthsToBuild: number | null;
  /** saved ÷ target; null when the target is 0. */
  progress: number | null;
}

export interface EmergencyFundError {
  ok: false;
  error: string;
}

export const NO_MONTHS = 'Add at least 1 month to cover';

export function emergencyFund(input: EmergencyFundInput): EmergencyFundResult | EmergencyFundError {
  const { expenses, months, saved, monthlySaving } = input;
  if (!(months > 0)) return { ok: false, error: NO_MONTHS };
  const target = expenses * months;
  const shortfall = Math.max(target - saved, 0);
  return {
    ok: true,
    target,
    shortfall,
    surplus: Math.max(saved - target, 0),
    // Small tolerance so float noise never adds a phantom month.
    monthsToBuild: shortfall === 0 ? 0 : monthlySaving > 0 ? Math.ceil(shortfall / monthlySaving - 1e-9) : null,
    progress: target > 0 ? saved / target : null,
  };
}

/** "Help me add up my essentials" (review #2 B5): the monthly costs it asks for, in order. */
export const ESSENTIALS = ['housing', 'food', 'utilities', 'insurance', 'transport', 'loans', 'other'] as const;
export type Essential = (typeof ESSENTIALS)[number];

export function sumEssentials(values: Partial<Record<Essential, number>>): number {
  return ESSENTIALS.reduce((sum, k) => sum + Math.max(0, values[k] ?? 0), 0);
}

export interface PathPoint {
  /** Months from now. */
  month: number;
  balance: number;
}

/** Most points the growth chart needs; longer paths are sampled evenly (the last month is always kept). */
export const MAX_PATH_POINTS = 60;

/**
 * Savings balance month by month until the target is reached (review #2 B5), capped at the target.
 * Empty when there is nothing to build (already covered, or no monthly saving).
 */
export function savingsPath(saved: number, monthlySaving: number, target: number, monthsToBuild: number | null): PathPoint[] {
  if (monthsToBuild === null || monthsToBuild <= 0) return [];
  const step = Math.max(1, Math.ceil(monthsToBuild / MAX_PATH_POINTS));
  const points: PathPoint[] = [];
  for (let month = 0; month < monthsToBuild; month += step) {
    points.push({ month, balance: Math.min(saved + monthlySaving * month, target) });
  }
  points.push({ month: monthsToBuild, balance: target });
  return points;
}
