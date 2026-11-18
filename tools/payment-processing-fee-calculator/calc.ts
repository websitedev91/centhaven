/**
 * Payment Processing Fee Calculator: pure maths (spec: docs/specs/payment-processing-fee-calculator.md).
 * Every number comes from the user (scope rule): a percentage, an optional extra percentage
 * and a fixed fee per payment. No React, no dates, no fetch. Round at display time only.
 */

export type ProcessingMode = 'gross' | 'net';

export interface ProcessingInput {
  /** 'gross' = the customer pays `amount`; 'net' = you want to receive `amount`. */
  mode: ProcessingMode;
  amount: number;
  /** Percentage fee as a fraction (0.03 = 3%). */
  percent: number;
  /** Optional extra percentage as a fraction (e.g. a surcharge the user's provider adds). */
  extra: number;
  /** Fixed fee per payment, in the payment currency. */
  fixed: number;
}

export interface ProcessingResult {
  ok: true;
  /** What the customer pays. */
  price: number;
  /** price × (percent + extra) */
  percentPart: number;
  fixedPart: number;
  totalFee: number;
  /** What reaches you (can be negative when the fee is more than the payment). */
  receive: number;
  /** totalFee ÷ price (0 when the price is 0). */
  effectiveRate: number;
  /** True when the fee is more than the payment. */
  feeExceedsPayment: boolean;
}

export interface ProcessingError {
  ok: false;
  error: string;
}

export const FEES_TOO_HIGH = 'The fees add up to 100% or more';

export function processingFee(input: ProcessingInput): ProcessingResult | ProcessingError {
  const { mode, amount, percent, extra, fixed } = input;
  const p = percent + extra;
  if (!(p < 1)) return { ok: false, error: FEES_TOO_HIGH };
  const price = mode === 'gross' ? amount : (amount + fixed) / (1 - p);
  const percentPart = price * p;
  const totalFee = percentPart + fixed;
  const receive = price - totalFee;
  return {
    ok: true,
    price,
    percentPart,
    fixedPart: fixed,
    totalFee,
    receive,
    effectiveRate: price > 0 ? totalFee / price : 0,
    feeExceedsPayment: receive < 0,
  };
}
