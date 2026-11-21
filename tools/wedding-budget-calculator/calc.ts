/**
 * Wedding Budget Calculator: pure maths (spec: docs/specs/wedding-budget-calculator.md).
 * The budget, guests and every category % come from the user; the starting split is an example,
 * never an "average". No React, no dates, no fetch.
 *
 * Rounding exception (Puru, 2026-11-21, CLAUDE.md rule 3): the categories must add up to the
 * budget exactly. Each is rounded DOWN to the cent, then the leftover cents go to the first
 * categories in order (skipping any at 0%), using the shared lib/split-cents.ts.
 */
import { splitCents, toCents } from '@/lib/split-cents';

export const CATEGORIES = ['venue', 'photo', 'attire', 'flowers', 'music', 'rings', 'paper', 'other'] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_NAME: Record<Category, string> = {
  venue: 'Venue & catering',
  photo: 'Photography & video',
  attire: 'Attire & beauty',
  flowers: 'Flowers & decor',
  music: 'Music & entertainment',
  rings: 'Rings',
  paper: 'Stationery',
  other: 'Other & buffer',
};

/** Percentages total 100 (float-safe: 33.33 + 33.33 + 33.34 = 100). */
export function percentTotal(pct: readonly number[]): number {
  return Number(pct.reduce((a, b) => a + b, 0).toPrecision(10));
}

export interface WeddingResult {
  /** One amount per category, in CATEGORIES order; they add up to the budget exactly. */
  amounts: number[];
  perGuest: number | null;
  venuePerGuest: number | null;
  leftoverCents: number;
}

export function weddingSplit(budget: number, pct: readonly number[], guests: number): WeddingResult {
  const { cents, leftover } = splitCents(toCents(budget), pct.map((p) => p / 100));
  const amounts = cents.map((c) => c / 100);
  return {
    amounts,
    perGuest: guests > 0 ? budget / guests : null,
    venuePerGuest: guests > 0 ? amounts[0]! / guests : null,
    leftoverCents: leftover,
  };
}
