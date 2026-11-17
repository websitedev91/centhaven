/**
 * Totals for the quote and invoice generators (specs: docs/specs/freelance-quote-generator.md,
 * freelance-invoice-generator.md). Pure: no React, no dates, no fetch.
 *
 * Rounding exception (approved by Puru, 2026-11-18; CLAUDE.md rule 3): a printed document
 * must add up on paper, so each line total, then contingency, discount and tax, is rounded
 * to 2 decimals with the float-safe `roundTo` BEFORE summing. Every other tool rounds only
 * at display time.
 */
import { roundTo } from './format';

export interface DocLine {
  qty: number;
  rate: number;
}

export interface DocTotalsInput {
  lines: readonly DocLine[];
  /** Fractions: 0.1 = 10%. Contingency is quote-only (0 on invoices). */
  contingency?: number;
  discount?: number;
  taxRate?: number;
  /** Amount already paid (invoice only). */
  paid?: number;
}

export interface DocTotals {
  lineTotals: number[];
  subtotal: number;
  contingency: number;
  discount: number;
  taxable: number;
  tax: number;
  total: number;
  paid: number;
  /** total − paid. */
  balance: number;
}

/** Sum of already-rounded amounts, re-rounded so float noise never shows (0.1 + 0.2). */
const sum = (values: readonly number[]) => roundTo(values.reduce((a, b) => a + b, 0));

export function docTotals(input: DocTotalsInput): DocTotals {
  const lineTotals = input.lines.map((l) => roundTo(l.qty * l.rate));
  const subtotal = sum(lineTotals);
  const contingency = roundTo(subtotal * (input.contingency ?? 0));
  const discount = roundTo((subtotal + contingency) * (input.discount ?? 0));
  const taxable = sum([subtotal, contingency, -discount]);
  const tax = roundTo(taxable * (input.taxRate ?? 0));
  const total = sum([taxable, tax]);
  const paid = roundTo(input.paid ?? 0);
  return { lineTotals, subtotal, contingency, discount, taxable, tax, total, paid, balance: sum([total, -paid]) };
}

/**
 * Suggests the next document number: the last run of digits goes up by one, keeping its
 * zero padding (Q-0099 → Q-0100, INV-9999 → INV-10000, 2026-014 → 2026-015).
 * No digits → "-2" is added (ABC → ABC-2). Empty → the fallback (e.g. "INV-0001").
 */
export function nextDocNumber(current: string, fallback: string): string {
  const trimmed = current.trim();
  if (!trimmed) return fallback;
  const m = /^(.*?)(\d+)(\D*)$/.exec(trimmed);
  if (!m) return `${trimmed}-2`;
  const [, head, digits, tail] = m;
  const next = String(BigInt(digits!) + 1n).padStart(digits!.length, '0');
  return `${head}${next}${tail}`;
}
