/**
 * Commission Calculator: pure maths (spec: docs/specs/commission-calculator.md).
 * Every rate and tier comes from the user. Tiers are marginal: each rate applies only to the
 * sales inside its tier (Puru, 2026-11-18). No React, no dates, no fetch.
 */

export type PlanType = 'flat' | 'tiered';

export interface Tier {
  /** Sales amount where this tier starts. The first tier starts at 0. */
  from: number;
  /** Rate as a fraction (0.05 = 5%). */
  rate: number;
}

export interface CommissionInput {
  plan: PlanType;
  sales: number;
  /** Flat rate as a fraction. */
  rate: number;
  /** Active tiers in order; the first must start at 0. */
  tiers: readonly Tier[];
  base: number;
}

export interface TierRow {
  from: number;
  /** null = no upper limit. */
  to: number | null;
  inTier: number;
  rate: number;
  amount: number;
}

export interface CommissionResult {
  ok: true;
  commission: number;
  total: number;
  /** commission ÷ sales, or null when sales are 0. */
  effective: number | null;
  rows: TierRow[];
}

export interface CommissionError {
  ok: false;
  error: string;
}

export const TIERS_OUT_OF_ORDER = 'Each tier must start above the one before';

export function commission(input: CommissionInput): CommissionResult | CommissionError {
  const { plan, sales, base } = input;
  let rows: TierRow[] = [];
  let total = 0;
  if (plan === 'flat') {
    total = sales * input.rate;
  } else {
    const tiers = input.tiers;
    for (let i = 1; i < tiers.length; i++) {
      if (!(tiers[i]!.from > tiers[i - 1]!.from)) return { ok: false, error: TIERS_OUT_OF_ORDER };
    }
    rows = tiers.map((t, i) => {
      const to = i + 1 < tiers.length ? tiers[i + 1]!.from : null;
      const inTier = Math.max(0, Math.min(sales, to ?? Infinity) - t.from);
      return { from: t.from, to, inTier, rate: t.rate, amount: inTier * t.rate };
    });
    total = rows.reduce((n, r) => n + r.amount, 0);
  }
  return { ok: true, commission: total, total: base + total, effective: sales > 0 ? total / sales : null, rows };
}
