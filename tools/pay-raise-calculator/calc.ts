/**
 * Pay Raise Calculator: pure maths (spec: docs/specs/pay-raise-calculator.md).
 * Every number comes from the user. No React, no dates, no fetch. Round at display time only.
 */

export const PERIODS = ['hour', 'week', 'month', 'year'] as const;
export type Period = (typeof PERIODS)[number];
export type RaiseMode = 'percent' | 'newpay';

/** How many of this pay period make a year. Hourly pay uses the user's hours per week × 52. */
export function periodsPerYear(period: Period, hoursPerWeek: number): number {
  switch (period) {
    case 'hour':
      return hoursPerWeek * 52;
    case 'week':
      return 52;
    case 'month':
      return 12;
    case 'year':
      return 1;
  }
}

export interface PayRaiseInput {
  mode: RaiseMode;
  /** Current pay per period. */
  current: number;
  /** Raise as a fraction (0.05 = 5%), raise mode. */
  raise: number;
  /** New pay per period, new-pay mode. */
  newPay: number;
  /** Optional inflation as a fraction (0 = skip). */
  inflation: number;
  perYear: number;
}

export interface PayRaiseResult {
  ok: true;
  newPay: number;
  /** As a fraction; negative = pay cut. */
  raise: number;
  raiseAmount: number;
  raisePerYear: number;
  oldPerYear: number;
  newPerYear: number;
  /** (1 + raise) ÷ (1 + inflation) − 1, or null when no inflation is entered. */
  realRaise: number | null;
}

export interface PayRaiseError {
  ok: false;
  error: string;
}

export const NEED_CURRENT_PAY = 'Enter your current pay above zero';

export function payRaise(input: PayRaiseInput): PayRaiseResult | PayRaiseError {
  const { mode, current, inflation, perYear } = input;
  let newPay: number;
  let raise: number;
  if (mode === 'percent') {
    raise = input.raise;
    newPay = current * (1 + raise);
  } else {
    if (!(current > 0)) return { ok: false, error: NEED_CURRENT_PAY };
    newPay = input.newPay;
    raise = (newPay - current) / current;
  }
  const raiseAmount = newPay - current;
  return {
    ok: true,
    newPay,
    raise,
    raiseAmount,
    raisePerYear: raiseAmount * perYear,
    oldPerYear: current * perYear,
    newPerYear: newPay * perYear,
    realRaise: inflation > 0 ? (1 + raise) / (1 + inflation) - 1 : null,
  };
}
