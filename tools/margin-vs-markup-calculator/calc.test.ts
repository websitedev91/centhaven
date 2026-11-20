import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { formatMoney } from '@/lib/format';
import { findPrice, formatPct, fromCostAndPrice, marginFromMarkup, markupFromMargin } from './calc';
import { marginDefaults, marginErrors, switchMarginCurrency, type MarginState } from './schema';

const m = (n: number, c: 'USD' | 'INR' = 'USD') => formatMoney(n, c);

describe('spec test cases', () => {
  it('#1 cost 60, price 100 → profit 40, margin 40%, markup 66.67%', () => {
    const r = fromCostAndPrice(60, 100);
    expect(m(r.profit)).toBe('$40.00');
    expect(formatPct(r.margin!)).toBe('40%');
    expect(formatPct(r.markup!)).toBe('66.67%');
  });

  it('#2 find: cost 50, markup 50% → price 75, profit 25, margin 33.33%', () => {
    const r = findPrice(50, 'markup', 0.5);
    expect(m(r.price)).toBe('$75.00');
    expect(m(r.profit)).toBe('$25.00');
    expect(formatPct(r.other)).toBe('33.33%');
  });

  it('#3 find: cost 50, margin 50% → price 100, profit 50, markup 100%', () => {
    const r = findPrice(50, 'margin', 0.5);
    expect(m(r.price)).toBe('$100.00');
    expect(m(r.profit)).toBe('$50.00');
    expect(formatPct(r.other)).toBe('100%');
  });

  it('#4 convert: margin 25% → markup 33.33%', () => {
    expect(formatPct(markupFromMargin(0.25))).toBe('33.33%');
  });

  it('#5 convert: markup 25% → margin 20%', () => {
    expect(formatPct(marginFromMarkup(0.25))).toBe('20%');
  });

  it('#6 INR find: cost ₹800, margin 20% → ₹1,000.00, profit ₹200.00, markup 25%', () => {
    const r = findPrice(800, 'margin', 0.2);
    expect(m(r.price, 'INR')).toBe('₹1,000.00');
    expect(m(r.profit, 'INR')).toBe('₹200.00');
    expect(formatPct(r.other)).toBe('25%');
  });

  it('#7 cost 120, price 100 → profit −20, margin −20%, markup −16.67%', () => {
    const r = fromCostAndPrice(120, 100);
    expect(m(r.profit)).toBe('-$20.00');
    expect(formatPct(r.margin!)).toBe('-20%');
    expect(formatPct(r.markup!)).toBe('-16.67%');
  });

  it('#8 USD → INR without editing: 60 → 800, 100 → 1,000 (20% / 25%); a typed cost is kept', () => {
    const i = switchMarginCurrency(marginDefaults, 'INR');
    expect([i.cost, i.price]).toEqual([800, 1_000]);
    const r = fromCostAndPrice(i.cost, i.price);
    expect(formatPct(r.margin!)).toBe('20%');
    expect(formatPct(r.markup!)).toBe('25%');
    expect(switchMarginCurrency({ ...marginDefaults, cost: 70 }, 'INR').cost).toBe(70);
    expect(switchMarginCurrency(marginDefaults, 'INR', new Set(['cost'])).cost).toBe(60);
  });
});

describe('edge cases', () => {
  const errs = (patch: Partial<MarginState>) => marginErrors({ ...marginDefaults, ...patch });

  it('price 0 → no margin; markup still shown', () => {
    const r = fromCostAndPrice(60, 0);
    expect(r.margin).toBeNull();
    expect(formatPct(r.markup!)).toBe('-100%');
  });

  it('cost 0 → no markup; margin 100%', () => {
    const r = fromCostAndPrice(0, 100);
    expect(r.markup).toBeNull();
    expect(formatPct(r.margin!)).toBe('100%');
  });

  it('margin ≥ 100% → field error; negatives → field error', () => {
    expect(errs({ mode: 'find', margin: 100 }).margin).toBe('Margin must be below 100%');
    expect(errs({ mode: 'convert', margin: 99.99 })).toEqual({});
    expect(errs({ cost: -1 }).cost).toBe('Can’t be negative');
    expect(errs({ mode: 'find', by: 'markup', markup: -5 }).markup).toBe('Can’t be negative');
  });

  it('only the boxes of the current mode can block', () => {
    expect(errs({ mode: 'convert', cost: Number.NaN, price: Number.NaN })).toEqual({});
    expect(errs({ mode: 'find', price: Number.NaN })).toEqual({});
    expect(errs({ mode: 'find', by: 'markup', margin: Number.NaN })).toEqual({});
  });

  it('huge values stay finite', () => {
    const r = findPrice(10_000_000_000, 'margin', 0.9999);
    expect(Number.isFinite(r.price)).toBe(true);
    expect(m(r.price)).not.toMatch(/e\+|NaN|Infinity/);
  });

  it('same 50%, different meaning: 50% markup = 33.33% margin', () => {
    expect(formatPct(marginFromMarkup(0.5))).toBe('33.33%');
    expect(formatPct(markupFromMargin(0.5))).toBe('100%');
  });
});

describe('content.mdx worked examples match the calculator', () => {
  const mdx = readFileSync(join(__dirname, 'content.mdx'), 'utf8');
  const has = (t: string) => expect(mdx, `content.mdx should contain "${t}"`).toContain(t);

  it('cases 1, 2, 6 and the 50% example', () => {
    const a = fromCostAndPrice(60, 100);
    [m(a.profit), formatPct(a.margin!), formatPct(a.markup!)].forEach(has);
    const b = findPrice(50, 'markup', 0.5);
    [m(b.price), m(b.profit), formatPct(b.other)].forEach(has);
    const c = findPrice(800, 'margin', 0.2);
    [m(c.price, 'INR'), m(c.profit, 'INR'), formatPct(c.other)].forEach(has);
  });
});
