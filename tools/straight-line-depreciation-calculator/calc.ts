/**
 * Straight-Line Depreciation Calculator: pure maths
 * (spec: docs/specs/straight-line-depreciation-calculator.md).
 * The accounting method only, not any country's tax depreciation rules.
 * No React, no dates, no fetch. No rounding here: round at display time (lib/format.ts).
 */

export interface DepreciationInput {
  cost: number;
  salvage: number;
  /** Useful life in whole years. */
  lifeYears: number;
  /** Months the asset is used in the first year (1–12). 12 = bought at the start of the year. */
  firstYearMonths: number;
}

export interface ScheduleRow {
  year: number;
  depreciation: number;
  accumulated: number;
  bookValue: number;
}

export interface DepreciationResult {
  ok: true;
  depreciable: number;
  annual: number;
  monthly: number;
  /** Share of the depreciable amount written off per full year (1 ÷ life). */
  rate: number;
  schedule: ScheduleRow[];
}

export interface DepreciationError {
  ok: false;
  error: string;
}

export const SALVAGE_ABOVE_COST = "Salvage value can't be more than the cost";
export const NO_LIFE = 'Add a useful life of at least 1 year';

export function straightLine(input: DepreciationInput): DepreciationResult | DepreciationError {
  const { cost, salvage, lifeYears, firstYearMonths } = input;
  if (salvage > cost) return { ok: false, error: SALVAGE_ABOVE_COST };
  if (!(lifeYears >= 1)) return { ok: false, error: NO_LIFE };

  const depreciable = cost - salvage;
  const annual = depreciable / lifeYears;
  const partial = firstYearMonths < 12;
  const years = partial ? lifeYears + 1 : lifeYears;

  const schedule: ScheduleRow[] = [];
  let accumulated = 0;
  for (let year = 1; year <= years; year++) {
    let depreciation = annual;
    if (partial && year === 1) depreciation = (annual * firstYearMonths) / 12;
    // The last year takes exactly what is left, so the book value lands on salvage (no float drift).
    if (year === years) depreciation = depreciable - accumulated;
    accumulated = year === years ? depreciable : accumulated + depreciation;
    schedule.push({ year, depreciation, accumulated, bookValue: year === years ? salvage : cost - accumulated });
  }

  return { ok: true, depreciable, annual, monthly: annual / 12, rate: 1 / lifeYears, schedule };
}

export interface MonthRow {
  /** Month since the asset was first used, 1-based. */
  month: number;
  /** Which year of the yearly schedule this month belongs to. */
  year: number;
  depreciation: number;
  accumulated: number;
  bookValue: number;
}

/**
 * Month-by-month schedule (review #2 B4). Each month is annual ÷ 12; the first year has
 * `firstYearMonths` months, and the last month takes exactly what is left. Summing the months
 * of a year gives that year's row in the yearly schedule.
 */
export function monthlySchedule(input: DepreciationInput): MonthRow[] | DepreciationError {
  const r = straightLine(input);
  if (!r.ok) return r;
  const { cost, salvage, lifeYears, firstYearMonths } = input;
  const partial = firstYearMonths < 12;
  const total = lifeYears * 12;
  const rows: MonthRow[] = [];
  let accumulated = 0;
  for (let month = 1; month <= total; month++) {
    const year = partial ? (month <= firstYearMonths ? 1 : 2 + Math.floor((month - firstYearMonths - 1) / 12)) : 1 + Math.floor((month - 1) / 12);
    const last = month === total;
    const depreciation = last ? r.depreciable - accumulated : r.monthly;
    accumulated = last ? r.depreciable : accumulated + depreciation;
    rows.push({ month, year, depreciation, accumulated, bookValue: last ? salvage : cost - accumulated });
  }
  return rows;
}
