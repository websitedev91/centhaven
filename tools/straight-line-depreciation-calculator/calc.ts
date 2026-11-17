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
