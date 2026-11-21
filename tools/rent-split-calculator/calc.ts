/**
 * Rent Split Calculator: pure maths (spec: docs/specs/rent-split-calculator.md).
 * Every number comes from the user. Never says which split is "fair". No React, no dates, no fetch.
 *
 * Rounding exception (Puru, 2026-11-21, CLAUDE.md rule 3): the shares must add up to the rent
 * exactly. Each share is rounded DOWN to the cent, then the leftover cents go to Person 1, 2, …
 * in order (skipping anyone whose share is 0): 1,000 ÷ 3 → 333.34 / 333.33 / 333.33.
 */

export type SplitMode = 'equal' | 'room' | 'income';
export type BillSplit = 'equal' | 'rent';

export interface SplitInput {
  mode: SplitMode;
  rent: number;
  bills: number;
  billSplit: BillSplit;
  /** Room mode: % of the rent split equally for shared space (0 = off). */
  sharedPct: number;
  /** One per person, in order. Room sizes (room mode) or incomes (income mode); ignored when equal. */
  weights: readonly number[];
}

export interface PersonShare {
  /** This person's share of the rent, as an unrounded fraction (for the % shown). */
  fraction: number;
  /** Income mode: this person's share of the total income. */
  incomeShare: number | null;
  rent: number;
  bills: number;
  total: number;
}

export interface SplitResult {
  people: PersonShare[];
  /** Room mode with a shared-space %: the part of the rent split equally, and the part split by size. */
  sharedPart: number | null;
  roomPart: number | null;
  /** Leftover cents handed out after rounding down (rent + bills), 0 when everything divided evenly. */
  leftoverCents: number;
  total: number;
}

const toCents = (amount: number) => Math.round(Number((amount * 100).toPrecision(15)));

/**
 * Split `totalCents` by `fractions` (they sum to 1): round each share down to the cent, then hand
 * the leftover cents one by one to people 1, 2, … in order, skipping anyone whose fraction is 0.
 */
export function splitCents(totalCents: number, fractions: readonly number[]): { cents: number[]; leftover: number } {
  const cents = fractions.map((f) => Math.floor(Number((totalCents * f).toPrecision(12))));
  const leftover = totalCents - cents.reduce((a, b) => a + b, 0);
  const takers = fractions.map((f, i) => (f > 0 ? i : -1)).filter((i) => i >= 0);
  const add = (person: number, delta: number) => {
    cents[person] = (cents[person] ?? 0) + delta;
  };
  let left = leftover;
  for (let k = 0; left > 0 && takers.length > 0; k++, left--) add(takers[k % takers.length] ?? 0, 1);
  // Floating-point safety: never hand out more than the total.
  for (let k = takers.length - 1; left < 0 && k >= 0; k--, left++) add(takers[k] ?? 0, -1);
  return { cents, leftover: Math.max(0, leftover) };
}

export function rentFractions(i: Pick<SplitInput, 'mode' | 'sharedPct' | 'weights'>): number[] {
  const n = i.weights.length;
  if (i.mode === 'equal') return i.weights.map(() => 1 / n);
  const total = i.weights.reduce((a, b) => a + b, 0);
  const byWeight = i.weights.map((w) => (total > 0 ? w / total : 0));
  if (i.mode === 'income') return byWeight;
  const shared = i.sharedPct / 100;
  return byWeight.map((f) => shared / n + (1 - shared) * f);
}

export function rentSplit(i: SplitInput): SplitResult {
  const n = i.weights.length;
  const fractions = rentFractions(i);
  const rent = splitCents(toCents(i.rent), fractions);
  const billFractions = i.mode === 'equal' || i.billSplit === 'equal' ? i.weights.map(() => 1 / n) : fractions;
  const bills = splitCents(toCents(i.bills), billFractions);
  const incomeTotal = i.weights.reduce((a, b) => a + b, 0);
  const people = fractions.map((fraction, k) => {
    const r = rent.cents[k]! / 100;
    const b = bills.cents[k]! / 100;
    return {
      fraction,
      incomeShare: i.mode === 'income' && incomeTotal > 0 ? i.weights[k]! / incomeTotal : null,
      rent: r,
      bills: b,
      total: (rent.cents[k]! + bills.cents[k]!) / 100,
    };
  });
  const shared = i.mode === 'room' && i.sharedPct > 0 ? (i.rent * i.sharedPct) / 100 : null;
  return {
    people,
    sharedPart: shared,
    roomPart: shared === null ? null : i.rent - shared,
    leftoverCents: rent.leftover + bills.leftover,
    total: (toCents(i.rent) + toCents(i.bills)) / 100,
  };
}
