/**
 * Payback Period Calculator: pure maths (spec: docs/specs/payback-period-calculator.md).
 * Simple payback only (no discounting). Every number comes from the user.
 * No React, no dates, no fetch. Round at display time only.
 */

export type PaybackMode = 'even' | 'uneven';

export interface PaybackInput {
  investment: number;
  /** Cash flow for each year (even mode: the same value repeated). */
  flows: readonly number[];
}

export interface YearRow {
  year: number;
  flow: number;
  total: number;
  /** Still to recover at the end of the year (never below 0). */
  left: number;
}

export type PaybackResult =
  | { paidBack: true; years: number; total: number; rows: YearRow[] }
  | { paidBack: false; total: number; share: number; rows: YearRow[] };

export function payback(input: PaybackInput): PaybackResult {
  const { investment, flows } = input;
  const rows: YearRow[] = [];
  let total = 0;
  let years: number | null = investment <= 0 ? 0 : null;
  flows.forEach((flow, i) => {
    const before = total;
    total += flow;
    rows.push({ year: i + 1, flow, total, left: Math.max(investment - total, 0) });
    if (years === null && total >= investment && flow > 0) years = i + (investment - before) / flow;
  });
  if (years !== null) return { paidBack: true, years, total, rows };
  return { paidBack: false, total, share: total / investment, rows };
}

/** Even mode: investment ÷ yearly cash flow. null when the flow is 0 ("Never paid back"). */
export function evenPayback(investment: number, flow: number): number | null {
  if (investment <= 0) return 0;
  return flow > 0 ? investment / flow : null;
}

/** Years and whole months, rounding the months; 12 months roll into the next year. */
export function splitYears(years: number): { years: number; months: number } {
  let y = Math.floor(years);
  let m = Math.round(Number(((years - y) * 12).toPrecision(12)));
  if (m === 12) {
    y += 1;
    m = 0;
  }
  return { years: y, months: m };
}

/** "4 years and 0 months" (spec wording keeps the 0). */
export function yearsMonthsText(years: number): string {
  const s = splitYears(years);
  return `${s.years.toLocaleString('en-US')} ${s.years === 1 ? 'year' : 'years'} and ${s.months} ${s.months === 1 ? 'month' : 'months'}`;
}

/** "4.00 years". */
export function formatYears(years: number): string {
  const text = years.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${text} ${text === '1.00' ? 'year' : 'years'}`;
}
