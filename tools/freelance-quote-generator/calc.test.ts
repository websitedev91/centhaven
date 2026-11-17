import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { addDays, formatIsoDate } from '@/lib/dates';
import { formatMoney } from '@/lib/format';
import { allTools, embeddableTools } from '@/lib/registry';
import { parseDraft } from '@/lib/use-local-draft';
import { quoteTotals } from './calc';
import { meta } from './meta';
import {
  QUOTE_FIRST_NUMBER,
  QUOTE_NOTE,
  freshQuote,
  newQuote,
  quoteDraftSchema,
  quoteErrors,
  switchQuoteCurrency,
  toQuoteInput,
  type QuoteState,
} from './schema';

const item = (id: number, desc: string, qty: number, rate: number) => ({ id: `item-${id}`, desc, qty, rate });

const CASE_1: QuoteState = {
  ...freshQuote('2026-11-18'),
  items: [item(1, 'Design', 10, 75), item(2, 'Development', 20, 75), item(3, 'Hosting setup', 1, 120)],
  contingency: 10,
  discount: 5,
};
const CASE_2: QuoteState = {
  ...freshQuote('2026-11-18', 'INR'),
  items: [item(1, 'Logo design', 1, 15_000), item(2, 'Brand guide', 1, 8_000), item(3, 'Revisions', 3, 1_500)],
  taxRate: 10,
};

describe('spec test cases', () => {
  it('#1 USD: contingency 10%, discount 5% → total 2,476.65, valid until 18 Dec 2026', () => {
    const t = quoteTotals(toQuoteInput(CASE_1));
    expect(t.lineTotals).toEqual([750, 1_500, 120]);
    expect([t.subtotal, t.contingency, t.discount, t.tax, t.total]).toEqual([2_370, 237, 130.35, 0, 2_476.65]);
    expect(addDays(CASE_1.issueDate, CASE_1.validDays)).toBe('2026-12-18');
  });

  it('#2 INR: tax 10% → total ₹30,250.00', () => {
    const t = quoteTotals(toQuoteInput(CASE_2));
    expect([t.subtotal, t.tax, t.total]).toEqual([27_500, 2_750, 30_250]);
    expect(formatMoney(t.total, 'INR')).toBe('₹30,250.00');
  });

  it('#3 GBP rounding → total 97.18', () => {
    const s: QuoteState = { ...freshQuote('2026-11-18', 'GBP'), items: [item(1, 'A', 1.5, 33.33), item(2, 'B', 2, 19.99)], discount: 10, taxRate: 20 };
    const t = quoteTotals(toQuoteInput(s));
    expect([t.lineTotals[0], t.subtotal, t.discount, t.tax, t.total]).toEqual([50, 89.98, 9, 16.2, 97.18]);
  });

  it('#4 qty 0 or an empty row → 0.00, no NaN, no errors', () => {
    const s: QuoteState = { ...freshQuote('2026-11-18'), items: [item(1, '', 0, 75)] };
    expect(quoteTotals(toQuoteInput(s)).total).toBe(0);
    expect(quoteErrors(s)).toEqual({});
  });

  it('#5 issue 2026-01-31, valid 30 → 2 March 2026', () => {
    expect(formatIsoDate(addDays('2026-01-31', 30))).toBe('2 March 2026');
  });

  it('#7 currency switch: the example rate follows (75 → 1,500); a typed rate is kept', () => {
    const fresh = freshQuote('2026-11-18');
    expect(switchQuoteCurrency(fresh, 'INR').items[0]!.rate).toBe(1_500);
    expect(switchQuoteCurrency(switchQuoteCurrency(fresh, 'INR'), 'GBP').items[0]!.rate).toBe(60);
    const typed = { ...fresh, items: [{ ...fresh.items[0]!, rate: 95 }, item(2, 'Extra', 1, 75)] };
    expect(switchQuoteCurrency(typed, 'INR').items.map((i) => i.rate)).toEqual([95, 1_500]);
  });
});

describe('form rules', () => {
  it('a fresh quote: Q-0001, today, 30 days, tax 0 (never suggested), one example row', () => {
    const q = freshQuote('2026-11-18');
    expect(q).toMatchObject({ number: QUOTE_FIRST_NUMBER, issueDate: '2026-11-18', validDays: 30, taxRate: 0, contingency: 0, discount: 0 });
    expect(q.items).toEqual([{ id: 'item-1', desc: 'Design and build', qty: 10, rate: 75 }]);
  });

  it('Start a new quote keeps your details, currency and terms; clears client and items; next number', () => {
    const prev: QuoteState = {
      ...CASE_2,
      number: 'Q-0099',
      from: { name: 'Asha Design', email: 'a@example.com', phone: '1', address: 'Pune', taxId: 'X1' },
      to: { name: 'Client', company: 'Co', address: 'Delhi', email: 'c@example.com' },
      title: 'Brand',
      discount: 5,
    };
    const next = newQuote(prev, '2026-11-20');
    expect(next.number).toBe('Q-0100');
    expect(next.issueDate).toBe('2026-11-20');
    expect(next.from).toEqual(prev.from);
    expect(next.currency).toBe('INR');
    expect([next.taxLabel, next.taxRate, next.notes]).toEqual([prev.taxLabel, 10, prev.notes]);
    expect(next.to).toEqual({ name: '', company: '', address: '', email: '' });
    expect([next.title, next.discount, next.contingency]).toEqual(['', 0, 0]);
    expect(next.items).toEqual([{ id: 'item-1', desc: 'Design and build', qty: 10, rate: 1_500 }]);
  });

  it('inline errors for out-of-range values', () => {
    const s: QuoteState = { ...freshQuote('2026-11-18'), validDays: 0, contingency: 60, discount: 101, taxRate: -1, items: [item(4, 'x', 1.234, 10)] };
    expect(quoteErrors(s)).toEqual({
      validDays: 'Minimum is 1 day',
      contingency: 'Maximum is 50%',
      discount: 'Maximum is 100%',
      taxRate: 'Minimum is 0%',
      'item-4.qty': 'Use up to 2 decimals',
    });
  });

  it('stored drafts: a valid one reloads (even half-finished); junk is ignored', () => {
    const half = { ...CASE_1, discount: 150 };
    expect(parseDraft(JSON.stringify(half), quoteDraftSchema)).toEqual(half);
    expect(parseDraft('{not json', quoteDraftSchema)).toBeNull();
    expect(parseDraft(JSON.stringify({ ...CASE_1, v: 2 }), quoteDraftSchema)).toBeNull();
    expect(parseDraft(JSON.stringify({ ...CASE_1, items: [] }), quoteDraftSchema)).toBeNull();
    expect(parseDraft(null, quoteDraftSchema)).toBeNull();
  });
});

describe('page rules (Puru, 2026-11-18)', () => {
  it('is a document tool: no share link and no embed page', () => {
    expect(meta.document).toBe(true);
    expect(allTools().some((t) => t.slug === meta.slug)).toBe(true);
    expect(embeddableTools().some((t) => t.slug === meta.slug)).toBe(false);
  });

  it('uses the disabled invoicing-software affiliate slot', () => {
    expect(meta.affiliateId).toBe('invoicing-software');
  });

  it('the local-rules note is on the page and in the FAQ', () => {
    expect(QUOTE_NOTE).toContain('Check your local rules.');
    expect(meta.faq.some((f) => f.a.includes(QUOTE_NOTE))).toBe(true);
  });
});

describe('content.mdx worked examples match the generator', () => {
  const mdx = readFileSync(join(__dirname, 'content.mdx'), 'utf8');
  it.each([
    [CASE_1, 'USD'],
    [CASE_2, 'INR'],
  ] as const)('%#', (s, currency) => {
    const t = quoteTotals(toQuoteInput(s));
    for (const n of [t.subtotal, t.total]) {
      const text = `**${formatMoney(n, currency)}**`;
      expect(mdx, `content.mdx should contain "${text}"`).toContain(text);
    }
  });
});
