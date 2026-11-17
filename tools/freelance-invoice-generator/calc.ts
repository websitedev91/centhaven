/**
 * Free Invoice Generator for Freelancers: totals (spec: docs/specs/freelance-invoice-generator.md).
 * Pure: no React, no dates, no fetch. Uses the shared document maths in lib/doc-calc.ts, which
 * rounds each line, discount and tax so the printed invoice adds up (approved exception).
 * No contingency on invoices.
 */
import { docTotals, type DocLine, type DocTotals } from '@/lib/doc-calc';

export interface InvoiceInput {
  lines: readonly DocLine[];
  /** Fractions: 0.1 = 10%. */
  discount: number;
  taxRate: number;
  /** Amount already paid (deposits, part payments). */
  paid: number;
}

export function invoiceTotals(input: InvoiceInput): DocTotals {
  return docTotals({ ...input, contingency: 0 });
}

/** Payment terms → days after the issue date. */
export const TERMS = ['receipt', '7', '14', '30', '60', 'custom'] as const;
export type Terms = (typeof TERMS)[number];

export function termDays(terms: Terms, customDays: number): number {
  if (terms === 'receipt') return 0;
  if (terms === 'custom') return customDays;
  return Number(terms);
}
