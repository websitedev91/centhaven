// zod/mini keeps the client bundle small (same validation, tree-shakable API).
import * as z from 'zod/mini';
import { nextDocNumber } from '@/lib/doc-calc';
import {
  DOC_LIMITS,
  addError,
  emptyFrom,
  exampleItem,
  fromSchema,
  itemErrors,
  lineItemSchema,
  percentError,
  switchItemsCurrency,
  type DocErrors,
} from '@/lib/doc-schema';
import { CURRENCIES, type CurrencyCode } from '@/lib/format';
import { TERMS, invoiceTotals, type InvoiceInput } from './calc';

/** Saved in this browser only (shared rule 2). Bump the version if the shape changes. */
export const INVOICE_DRAFT_KEY = 'centhaven:invoice-draft:v1';
export const INVOICE_FIRST_NUMBER = 'INV-0001';

/** Puru's exact wording (2026-11-18). */
export const INVOICE_NOTE =
  'This is a simple invoice. Some countries require extra details on tax invoices (for example GST in India or VAT in the UK/EU). Check your local rules.';

export const LOGO_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml'] as const;
export const LOGO_MAX_BYTES = 500 * 1024;

/** Checks a picked logo file before it is read; returns a friendly error or undefined. */
export function logoError(file: { type: string; size: number }): string | undefined {
  if (!(LOGO_TYPES as readonly string[]).includes(file.type)) return 'Use a PNG, JPG or SVG image.';
  if (file.size > LOGO_MAX_BYTES) return 'The logo must be 500 KB or smaller.';
  return undefined;
}

const clientSchema = z.object({ name: z.string(), company: z.string(), address: z.string(), email: z.string(), taxId: z.string() });

/** Types only: limits are inline errors (invoiceErrors), so a half-finished draft still reloads. */
export const invoiceDraftSchema = z.object({
  v: z.literal(1),
  currency: z.enum(CURRENCIES),
  /** Data URL of the logo, or ''. Kept in this browser only, never uploaded. */
  logo: z.string(),
  number: z.string(),
  po: z.string(),
  issueDate: z.string(),
  terms: z.enum(TERMS),
  customDays: z.number(),
  from: fromSchema,
  to: clientSchema,
  items: z.array(lineItemSchema).check(z.minLength(1), z.maxLength(DOC_LIMITS.items)),
  discount: z.number(),
  taxLabel: z.string(),
  taxRate: z.number(),
  paid: z.number(),
  payment: z.string(),
  notes: z.string(),
});

export type InvoiceState = z.infer<typeof invoiceDraftSchema>;

export const INVOICE_DEFAULT_NOTES = 'Thank you for your business.';

/** A fresh invoice (first visit or after Clear form). `today` is '' during the server render. */
export function freshInvoice(today: string, currency: CurrencyCode = 'USD'): InvoiceState {
  return {
    v: 1,
    currency,
    logo: '',
    number: INVOICE_FIRST_NUMBER,
    po: '',
    issueDate: today,
    terms: '14',
    customDays: 21,
    from: { ...emptyFrom },
    to: { name: '', company: '', address: '', email: '', taxId: '' },
    items: [exampleItem(currency)],
    discount: 0,
    taxLabel: 'Tax',
    taxRate: 0,
    paid: 0,
    payment: '',
    notes: INVOICE_DEFAULT_NOTES,
  };
}

/**
 * "Start a new invoice": keeps your details, logo, payment details, currency, terms, tax line
 * and notes; clears the client, PO, items, discount and amount paid; suggests the next number.
 */
export function newInvoice(prev: InvoiceState, today: string): InvoiceState {
  return {
    ...freshInvoice(today, prev.currency),
    number: nextDocNumber(prev.number, INVOICE_FIRST_NUMBER),
    logo: prev.logo,
    terms: prev.terms,
    customDays: prev.customDays,
    from: { ...prev.from },
    taxLabel: prev.taxLabel,
    taxRate: prev.taxRate,
    payment: prev.payment,
    notes: prev.notes,
  };
}

/** Currency switch: example line rates follow the currency until edited (switchCurrency). */
export function switchInvoiceCurrency(s: InvoiceState, next: CurrencyCode): InvoiceState {
  if (next === s.currency) return s;
  return { ...s, currency: next, items: switchItemsCurrency(s.items, s.currency, next) };
}

export function toInvoiceInput(s: InvoiceState): InvoiceInput {
  return { lines: s.items, discount: s.discount / 100, taxRate: s.taxRate / 100, paid: s.paid };
}

export const OVERPAID = 'Amount paid is more than the total';

export function invoiceErrors(s: InvoiceState): DocErrors {
  const out: DocErrors = itemErrors(s.items);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s.issueDate) && s.issueDate !== '') out.issueDate = 'Pick a date';
  if (s.terms === 'custom') {
    addError(
      out,
      'customDays',
      !Number.isInteger(s.customDays) ? 'Use whole days' : s.customDays < 0 ? 'Minimum is 0 days' : s.customDays > 365 ? 'Maximum is 365 days' : undefined,
    );
  }
  addError(out, 'discount', percentError(s.discount, 100));
  addError(out, 'taxRate', percentError(s.taxRate, 100));
  if (!Number.isFinite(s.paid) || s.paid < 0) out.paid = 'Can’t be negative';
  else if (Object.keys(out).length === 0 && s.paid > invoiceTotals(toInvoiceInput(s)).total) out.paid = OVERPAID;
  return out;
}
