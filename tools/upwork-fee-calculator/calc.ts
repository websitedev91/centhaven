/**
 * Upwork Fee Calculator: pure maths (spec: docs/specs/upwork-fee-calculator.md).
 * The fee % is always the user's own input (scope rule: every number comes from the user).
 */
export { percentFee as upworkFee, type FeeMode, type PercentFeeError, type PercentFeeResult } from '@/lib/percent-fee';
