/**
 * Invoice Late Fee Calculator: pure maths (spec: docs/specs/late-fee-calculator.md).
 * Uses only the fee the user agreed with their client. Never models legal or statutory rates.
 * No React, no dates, no fetch. Round at display time only.
 */

export const FEE_TYPES = ['flat', 'oneoff', 'monthly'] as const;
export type FeeType = (typeof FEE_TYPES)[number];

export interface LateFeeInput {
  amount: number;
  daysLate: number;
  grace: number;
  type: FeeType;
  /** Fee % as a fraction (0.02 = 2%): one-off, or per 30 days. */
  pct: number;
  flat: number;
}

export interface LateFeeResult {
  ok: true;
  chargeableDays: number;
  fee: number;
  total: number;
  /** % per 30 days only: the fee for one day. */
  perDay: number | null;
}

export function lateFee(input: LateFeeInput): LateFeeResult {
  const { amount, daysLate, grace, type, pct, flat } = input;
  const chargeableDays = Math.max(0, daysLate - grace);
  const late = chargeableDays > 0;
  let fee = 0;
  let perDay: number | null = null;
  if (type === 'flat') fee = late ? flat : 0;
  else if (type === 'oneoff') fee = late ? amount * pct : 0;
  else {
    perDay = (amount * pct) / 30;
    fee = perDay * chargeableDays;
  }
  return { ok: true, chargeableDays, fee, total: amount + fee, perDay };
}
