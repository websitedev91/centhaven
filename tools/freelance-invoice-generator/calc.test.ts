import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { addDays } from '@/lib/dates';
import { nextDocNumber } from '@/lib/doc-calc';
import { formatMoney, type CurrencyCode } from '@/lib/format';
import { embeddableTools } from '@/lib/registry';
import { parseDraft } from '@/lib/use-local-draft';
import { invoiceTotals, termDays } from './calc';
import { meta } from './meta';
import {
  INVOICE_FIRST_NUMBER,
  INVOICE_NOTE,
  OVERPAID,
  freshInvoice,
  invoiceDraftSchema,
  invoiceErrors,
  logoError,
  newInvoice,
  switchInvoiceCurrency,
  toInvoiceInput,
  type InvoiceState,
} from './schema';

const item = (id: number, desc: string, qty: number, rate: number) => ({ id: `item-${id}`, desc, qty, rate });

const CASES: { s: InvoiceState; currency: CurrencyCode }[] = [
  {
    s: { ...freshInvoice('2026-11-18'), items: [item(1, 'Website build', 1, 2_400), item(2, 'Extra pages', 3, 150)], paid: 1_000, terms: '14' },
    currency: 'USD',
  },
  {
    s: { ...freshInvoice('2026-11-18', 'GBP'), items: [item(1, 'Consulting', 12.5, 80), item(2, 'Travel', 1, 45.6)], taxRate: 20, terms: 'receipt' },
    currency: 'GBP',
  },
  {
    s: { ...freshInvoice('2026-12-15', 'INR'), items: [item(1, 'App development', 2, 25_000)], discount: 10, taxRate: 5, paid: 47_250, terms: '30' },
    currency: 'INR',
  },
];

describe('spec test cases', () => {
  it('#1 USD: total 2,850.00, paid 1,000 → balance 1,850.00, due 2 Dec 2026 (Net 14)', () => {
    const { s } = CASES[0]!;
    const t = invoiceTotals(toInvoiceInput(s));
    expect([t.subtotal, t.total, t.paid, t.balance]).toEqual([2_850, 2_850, 1_000, 1_850]);
    expect(addDays(s.issueDate, termDays(s.terms, s.customDays))).toBe('2026-12-02');
  });

  it('#2 GBP: tax 20% → 209.12, total 1,254.72; due on receipt = issue date', () => {
    const { s } = CASES[1]!;
    const t = invoiceTotals(toInvoiceInput(s));
    expect([t.subtotal, t.tax, t.total, t.balance]).toEqual([1_045.6, 209.12, 1_254.72, 1_254.72]);
    expect(addDays(s.issueDate, termDays(s.terms, s.customDays))).toBe(s.issueDate);
  });

  it('#3 INR: discount 5,000, tax 2,250, total 47,250 paid in full → balance 0; due 14 Jan 2027', () => {
    const { s } = CASES[2]!;
    const t = invoiceTotals(toInvoiceInput(s));
    expect([t.discount, t.taxable, t.tax, t.total, t.balance]).toEqual([5_000, 45_000, 2_250, 47_250, 0]);
    expect(addDays(s.issueDate, termDays(s.terms, s.customDays))).toBe('2027-01-14');
    expect(invoiceErrors(s)).toEqual({});
  });

  it('#4 paid 3,000 on a 2,850.00 total → inline error, no negative balance shown', () => {
    expect(invoiceErrors({ ...CASES[0]!.s, paid: 3_000 })).toEqual({ paid: OVERPAID });
    expect(invoiceErrors({ ...CASES[0]!.s, paid: -1 })).toEqual({ paid: 'Can’t be negative' });
  });

  it('#5 next number: INV-0001 → INV-0002, INV-0099 → INV-0100', () => {
    expect(nextDocNumber('INV-0001', INVOICE_FIRST_NUMBER)).toBe('INV-0002');
    expect(nextDocNumber('INV-0099', INVOICE_FIRST_NUMBER)).toBe('INV-0100');
  });

  it('#6 logo: 600 KB or a non-image → friendly error; a small PNG/JPG/SVG is fine', () => {
    expect(logoError({ type: 'image/png', size: 600 * 1024 })).toBe('The logo must be 500 KB or smaller.');
    expect(logoError({ type: 'application/pdf', size: 10_000 })).toBe('Use a PNG, JPG or SVG image.');
    expect(logoError({ type: 'image/gif', size: 10_000 })).toBe('Use a PNG, JPG or SVG image.');
    for (const type of ['image/png', 'image/jpeg', 'image/svg+xml']) expect(logoError({ type, size: 500 * 1024 })).toBeUndefined();
  });
});

describe('form rules', () => {
  it('a fresh invoice: INV-0001, Net 14, tax 0 (never suggested), nothing paid, no logo', () => {
    expect(freshInvoice('2026-11-18')).toMatchObject({ number: 'INV-0001', terms: '14', taxRate: 0, paid: 0, logo: '', discount: 0 });
  });

  it('payment terms → days', () => {
    expect([termDays('receipt', 9), termDays('7', 9), termDays('60', 9), termDays('custom', 9)]).toEqual([0, 7, 60, 9]);
    expect(invoiceErrors({ ...freshInvoice('2026-11-18'), terms: 'custom', customDays: 400 })).toEqual({ customDays: 'Maximum is 365 days' });
    expect(invoiceErrors({ ...freshInvoice('2026-11-18'), terms: '30', customDays: 400 })).toEqual({});
  });

  it('Start a new invoice keeps your details, logo, payment details and terms; clears client, items, PO and payments', () => {
    const prev: InvoiceState = {
      ...CASES[2]!.s,
      number: 'INV-0041',
      logo: 'data:image/png;base64,AAAA',
      po: 'PO-9',
      from: { name: 'Ravi Dev', email: 'r@example.com', phone: '', address: 'Chennai', taxId: '' },
      to: { name: 'Client', company: 'Co', address: 'Mumbai', email: '', taxId: 'T1' },
      payment: 'Bank: Example Bank',
    };
    const next = newInvoice(prev, '2026-12-20');
    expect(next.number).toBe('INV-0042');
    expect([next.logo, next.payment, next.terms, next.currency, next.issueDate]).toEqual([prev.logo, prev.payment, '30', 'INR', '2026-12-20']);
    expect(next.from).toEqual(prev.from);
    expect([next.po, next.discount, next.paid]).toEqual(['', 0, 0]);
    expect(next.to).toEqual({ name: '', company: '', address: '', email: '', taxId: '' });
    expect(next.items).toEqual([{ id: 'item-1', desc: 'Design and build', qty: 10, rate: 1_500 }]);
  });

  it('currency switch: the example rate follows; typed rates are kept', () => {
    const fresh = freshInvoice('2026-11-18');
    expect(switchInvoiceCurrency(fresh, 'AUD').items[0]!.rate).toBe(90);
    expect(switchInvoiceCurrency({ ...fresh, items: [item(1, 'x', 1, 99)] }, 'INR').items[0]!.rate).toBe(99);
  });

  it('stored drafts reload; junk is ignored', () => {
    const s = { ...CASES[0]!.s, logo: 'data:image/png;base64,AAAA' };
    expect(parseDraft(JSON.stringify(s), invoiceDraftSchema)).toEqual(s);
    expect(parseDraft(JSON.stringify({ ...s, terms: '45' }), invoiceDraftSchema)).toBeNull();
  });
});

describe('page rules (Puru, 2026-11-18)', () => {
  it('is a document tool with no embed page and the invoicing-software slot', () => {
    expect(meta.document).toBe(true);
    expect(meta.affiliateId).toBe('invoicing-software');
    expect(embeddableTools().some((t) => t.slug === meta.slug)).toBe(false);
  });

  it("Puru's exact note is on the page and in the FAQ", () => {
    expect(INVOICE_NOTE).toBe(
      'This is a simple invoice. Some countries require extra details on tax invoices (for example GST in India or VAT in the UK/EU). Check your local rules.',
    );
    expect(meta.faq.filter((f) => f.a.includes(INVOICE_NOTE)).length).toBeGreaterThanOrEqual(1);
  });
});

describe('content.mdx worked examples match the generator', () => {
  const mdx = readFileSync(join(__dirname, 'content.mdx'), 'utf8');
  it.each(CASES)('$currency example', ({ s, currency }) => {
    const t = invoiceTotals(toInvoiceInput(s));
    for (const n of [t.total, ...(t.paid > 0 && t.balance > 0 ? [t.balance] : [])]) {
      const text = `**${formatMoney(n, currency)}**`;
      expect(mdx, `content.mdx should contain "${text}"`).toContain(text);
    }
  });
});
