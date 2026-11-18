/**
 * Shared maths for platforms that take a percentage of the price (Upwork, Fiverr).
 * Pure: no React, no dates, no fetch. No rounding here: round at display time (lib/format.ts).
 */

export type FeeMode = 'gross' | 'net';

export interface PercentFeeInput {
  /** 'gross' = the amount is the price the client pays; 'net' = the amount is what you want to keep. */
  mode: FeeMode;
  amount: number;
  /** Fee as a fraction (0.1 = 10%). Must be below 1. */
  fee: number;
}

export interface PercentFeeResult {
  ok: true;
  /** What the client pays (contract amount / gig price). */
  price: number;
  feeAmount: number;
  /** What you keep after the platform's fee. */
  takeHome: number;
}

export interface PercentFeeError {
  ok: false;
  error: string;
}

export const FEE_TOO_HIGH = 'The fee must be below 100%';

export function percentFee({ mode, amount, fee }: PercentFeeInput): PercentFeeResult | PercentFeeError {
  if (!(fee < 1)) return { ok: false, error: FEE_TOO_HIGH };
  if (mode === 'gross') {
    const feeAmount = amount * fee;
    return { ok: true, price: amount, feeAmount, takeHome: amount - feeAmount };
  }
  const price = amount / (1 - fee);
  return { ok: true, price, feeAmount: price - amount, takeHome: amount };
}
