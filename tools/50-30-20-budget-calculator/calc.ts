/**
 * 50/30/20 Budget Calculator: pure maths (spec: docs/specs/50-30-20-budget-calculator.md).
 * The user enters their own take-home pay: we never work out tax. 50/30/20 is a popular
 * budgeting guideline, not a rule. No React, no dates, no fetch. Round at display time only.
 */

export type Bucket = 'needs' | 'wants' | 'savings';
export const BUCKETS: readonly Bucket[] = ['needs', 'wants', 'savings'];

export interface BudgetInput {
  pay: number;
  /** Percentages, e.g. { needs: 50, wants: 30, savings: 20 }. Must total 100. */
  pct: Record<Bucket, number>;
}

/** The three percentages total 100 (compared at 10 significant digits, so 33.33 + 33.33 + 33.34 counts). */
export function totalsHundred(pct: Record<Bucket, number>): boolean {
  return Number((pct.needs + pct.wants + pct.savings).toPrecision(10)) === 100;
}

export function percentTotal(pct: Record<Bucket, number>): number {
  return Number((pct.needs + pct.wants + pct.savings).toPrecision(10));
}

/** Monthly amount for each bucket. */
export function budget(input: BudgetInput): Record<Bucket, number> {
  const { pay, pct } = input;
  return { needs: (pay * pct.needs) / 100, wants: (pay * pct.wants) / 100, savings: (pay * pct.savings) / 100 };
}

export type Comparison = 'over' | 'under' | 'on';

/** actual − planned, and whether that is over, under or on plan (within half a cent). */
export function compare(actual: number, planned: number): { diff: number; status: Comparison } {
  const diff = actual - planned;
  return { diff, status: Math.abs(diff) < 0.005 ? 'on' : diff > 0 ? 'over' : 'under' };
}

/** Take-home pay minus everything actually spent and saved. */
export function leftOver(pay: number, actual: Record<Bucket, number>): number {
  return pay - (actual.needs + actual.wants + actual.savings);
}
