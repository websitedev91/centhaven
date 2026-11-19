/**
 * Meeting Cost Calculator: pure maths (spec: docs/specs/meeting-cost-calculator.md).
 * Every number comes from the user (hourly costs included: no average wage, no overhead %).
 * No React, no dates, no fetch. Round at display time only.
 */

export interface MeetingInput {
  /** One hourly cost per person. Same-rate mode passes `people` copies of one rate. */
  rates: readonly number[];
  minutes: number;
  /** 0 = one-off. */
  perWeek: number;
  weeksPerYear: number;
}

export interface MeetingResult {
  people: number;
  /** Sum of everyone's hourly cost. */
  hourlyTotal: number;
  meetingCost: number;
  perMinute: number;
  personHours: number;
  /** Cost of each person for this meeting, same order as `rates`. */
  shares: number[];
  /** null for a one-off meeting. */
  weekly: number | null;
  yearly: number | null;
}

export function meetingCost(input: MeetingInput): MeetingResult {
  const { rates, minutes, perWeek, weeksPerYear } = input;
  const hours = minutes / 60;
  const hourlyTotal = rates.reduce((sum, r) => sum + r, 0);
  const meeting = hourlyTotal * hours;
  const repeats = perWeek > 0;
  const weekly = repeats ? meeting * perWeek : null;
  return {
    people: rates.length,
    hourlyTotal,
    meetingCost: meeting,
    perMinute: hourlyTotal / 60,
    personHours: rates.length * hours,
    shares: rates.map((r) => r * hours),
    weekly,
    yearly: weekly === null ? null : weekly * weeksPerYear,
  };
}

/** Same-rate mode: `people` copies of one hourly cost. */
export function sameRates(people: number, rate: number): number[] {
  return Array.from({ length: people }, () => rate);
}
