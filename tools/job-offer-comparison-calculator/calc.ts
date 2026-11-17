/**
 * Job Offer Comparison Calculator: pure maths (spec: docs/specs/job-offer-comparison-calculator.md).
 * No React, no dates, no fetch. No rounding here: round at display time (lib/format.ts).
 * Everything is before tax.
 */

/** Working days in a year before leave: 52 weeks × 5 days. */
export const WORK_DAYS_PER_YEAR = 260;

export interface OfferInput {
  /** Base salary per year. */
  salary: number;
  /** Target bonus as a fraction of salary (0.05 = 5%). */
  bonus: number;
  /** Employer retirement contribution as a fraction of salary (0.04 = 4%). */
  match: number;
  /** Other yearly benefits, as an amount. */
  benefits: number;
  /** Paid leave days per year (holidays plus public holidays). */
  leaveDays: number;
  hoursPerWeek: number;
  /** Office days per week, 0–5 (0 = fully remote). */
  officeDays: number;
  /** One-way commute in minutes. */
  commuteMins: number;
  /** Round-trip commute cost per office day. */
  commuteCost: number;
}

export interface OfferResult {
  workDays: number;
  officeDaysYear: number;
  bonus: number;
  match: number;
  benefits: number;
  salary: number;
  totalPay: number;
  commuteHours: number;
  commuteCost: number;
  /** Commute hours × the value of your time (0 when no time value is set). */
  timeCost: number;
  /** Total pay − commute cost − time cost. */
  yearlyValue: number;
  workHours: number;
  /** (Total pay − commute cost) ÷ (work hours + commute hours). */
  effectiveHourly: number;
}

export interface CompareResult {
  ok: true;
  a: OfferResult;
  b: OfferResult;
  /** yearlyValue(A) − yearlyValue(B). */
  difference: number;
  winner: 'a' | 'b' | 'tie';
}

export interface CompareError {
  ok: false;
  error: string;
}

export const TOO_MUCH_LEAVE = 'Paid leave must leave at least 1 working day in the year';

export function offerValue(o: OfferInput, timeValue: number): OfferResult | null {
  const workDays = WORK_DAYS_PER_YEAR - o.leaveDays;
  if (!(workDays > 0) || !(o.hoursPerWeek > 0)) return null;
  const officeDaysYear = (workDays * o.officeDays) / 5;
  const commuteHours = (officeDaysYear * 2 * o.commuteMins) / 60;
  const commuteCost = officeDaysYear * o.commuteCost;
  const bonus = o.salary * o.bonus;
  const match = o.salary * o.match;
  const totalPay = o.salary + bonus + match + o.benefits;
  const timeCost = commuteHours * timeValue;
  const workHours = (workDays * o.hoursPerWeek) / 5;
  return {
    workDays,
    officeDaysYear,
    salary: o.salary,
    bonus,
    match,
    benefits: o.benefits,
    totalPay,
    commuteHours,
    commuteCost,
    timeCost,
    yearlyValue: totalPay - commuteCost - timeCost,
    workHours,
    effectiveHourly: (totalPay - commuteCost) / (workHours + commuteHours),
  };
}

/** Values closer than half a cent count as equal, so float noise never picks a winner. */
const TIE = 0.005;

export function compareOffers(a: OfferInput, b: OfferInput, timeValue: number): CompareResult | CompareError {
  const ra = offerValue(a, timeValue);
  const rb = offerValue(b, timeValue);
  if (!ra || !rb) return { ok: false, error: TOO_MUCH_LEAVE };
  const difference = ra.yearlyValue - rb.yearlyValue;
  const winner = Math.abs(difference) < TIE ? 'tie' : difference > 0 ? 'a' : 'b';
  return { ok: true, a: ra, b: rb, difference: winner === 'tie' ? 0 : difference, winner };
}
