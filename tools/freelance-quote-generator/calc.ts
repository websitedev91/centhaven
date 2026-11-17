/**
 * Freelance Quote Generator: totals (spec: docs/specs/freelance-quote-generator.md).
 * Pure: no React, no dates, no fetch. Uses the shared document maths in lib/doc-calc.ts, which
 * rounds each line, contingency, discount and tax so the printed quote adds up (approved exception).
 */
import { docTotals, type DocLine, type DocTotals } from '@/lib/doc-calc';

export interface QuoteInput {
  lines: readonly DocLine[];
  /** Fractions: 0.1 = 10%. */
  contingency: number;
  discount: number;
  taxRate: number;
}

export function quoteTotals(input: QuoteInput): DocTotals {
  return docTotals(input);
}
