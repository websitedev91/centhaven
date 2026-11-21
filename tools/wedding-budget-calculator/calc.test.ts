import { describe, expect, it } from 'vitest';
import { formatMoney, type CurrencyCode } from '@/lib/format';
import { CATEGORIES, weddingSplit } from './calc';
import { EXAMPLE_SPLIT, fieldErrors, pctOf, switchWeddingCurrency, totalError, weddingDefaults, weddingSchema, type WeddingState } from './schema';

const m = (n: number, c: CurrencyCode = 'USD') => formatMoney(n, c);
const state = (patch: Partial<WeddingState>): WeddingState => ({ ...weddingDefaults, ...patch });
const run = (s: WeddingState) => weddingSplit(s.budget, pctOf(s), s.guests);
const cents = (xs: number[]) => xs.reduce((a, b) => a + Math.round(b * 100), 0);
const totalMsg = (s: WeddingState) => totalError(s, fieldErrors(weddingSchema, s));

describe('spec test cases', () => {
  it('#1 USD 25,000 · example split · 100 guests → 11,250 / 3,000 / 2,000 / 2,500 / 1,750 / 1,250 / 750 / 2,500 · 250.00 · 112.50', () => {
    const r = run(weddingDefaults);
    expect(r.amounts.map((x) => m(x))).toEqual(['$11,250.00', '$3,000.00', '$2,000.00', '$2,500.00', '$1,750.00', '$1,250.00', '$750.00', '$2,500.00']);
    expect(m(r.perGuest!)).toBe('$250.00');
    expect(m(r.venuePerGuest!)).toBe('$112.50');
    expect(r.leftoverCents).toBe(0);
  });

  it('#2 venue 50% → total 105% message; the example split resets it', () => {
    expect(totalMsg(state({ venue: 50 }))).toBe('Your percentages add up to 105%. They need to total 100%.');
    expect(totalMsg({ ...state({ venue: 50 }), ...EXAMPLE_SPLIT })).toBeNull();
  });

  it('#3 INR ₹15,00,000 · 150 guests → ₹10,000.00 per guest · venue ₹6,75,000.00 · ₹4,500.00 per guest', () => {
    const s = { ...switchWeddingCurrency(weddingDefaults, 'INR'), guests: 150 };
    const r = run(s);
    expect(m(r.perGuest!, 'INR')).toBe('₹10,000.00');
    expect(m(r.amounts[0]!, 'INR')).toBe('₹6,75,000.00');
    expect(m(r.venuePerGuest!, 'INR')).toBe('₹4,500.00');
  });

  it('#4 GBP £20,000 · 80 guests → £250.00 per guest · venue £9,000.00', () => {
    const s = { ...switchWeddingCurrency(weddingDefaults, 'GBP'), guests: 80 };
    const r = run(s);
    expect(m(r.perGuest!, 'GBP')).toBe('£250.00');
    expect(m(r.amounts[0]!, 'GBP')).toBe('£9,000.00');
  });

  it('#5 guests 0 → per-guest rows hidden', () => {
    const r = run(state({ guests: 0 }));
    expect(r.perGuest).toBeNull();
    expect(r.venuePerGuest).toBeNull();
  });

  it('#6 12,345 · venue 45% → 5,555.25', () => {
    expect(m(run(state({ budget: 12_345 })).amounts[0]!)).toBe('$5,555.25');
  });

  it('#7 rings 0%, other 15% → rings 0.00, other 3,750.00', () => {
    const r = run(state({ rings: 0, other: 15 }));
    expect(m(r.amounts[5]!)).toBe('$0.00');
    expect(m(r.amounts[7]!)).toBe('$3,750.00');
  });

  it('#8 USD → INR without editing: budget moves, guests and percentages stay; a typed budget is kept', () => {
    const i = switchWeddingCurrency(weddingDefaults, 'INR');
    expect([i.budget, i.guests, ...pctOf(i)]).toEqual([1_500_000, 100, 45, 12, 8, 10, 7, 5, 3, 10]);
    expect(switchWeddingCurrency(state({ budget: 30_000 }), 'INR', new Set(['budget'])).budget).toBe(30_000);
  });
});

describe('exact-cent rule (Puru, 2026-11-21): round down, leftover cents to the first categories', () => {
  it('decimal %: 1,234.56 at 45.5 / 11.5 / 8 / 10 / 7 / 5 / 3 / 10 → adds up exactly', () => {
    const s = state({ budget: 1_234.56, venue: 45.5, photo: 11.5 });
    expect(totalMsg(s)).toBeNull();
    const r = run(s);
    expect(r.amounts.map((x) => m(x))).toEqual(['$561.73', '$141.98', '$98.77', '$123.46', '$86.42', '$61.72', '$37.03', '$123.45']);
    expect(cents(r.amounts)).toBe(123_456);
    expect(r.leftoverCents).toBe(5);
  });

  it('decimal %: 1,000 at 33.33 / 33.33 / 33.34 (others 0) → 333.30 / 333.30 / 333.40', () => {
    const s = state({ budget: 1_000, venue: 33.33, photo: 33.33, attire: 33.34, flowers: 0, music: 0, rings: 0, paper: 0, other: 0 });
    expect(totalMsg(s)).toBeNull();
    expect(run(s).amounts.slice(0, 3).map((x) => m(x))).toEqual(['$333.30', '$333.30', '$333.40']);
  });

  it('999.99 with the example split → the first 7 categories take a leftover cent; total exact', () => {
    const r = run(state({ budget: 999.99 }));
    expect(r.amounts.map((x) => m(x))).toEqual(['$450.00', '$120.00', '$80.00', '$100.00', '$70.00', '$50.00', '$30.00', '$99.99']);
    expect(cents(r.amounts)).toBe(99_999);
  });

  it('a category at 0% never gets a leftover cent', () => {
    const r = run(state({ budget: 999.99, venue: 0, other: 55 }));
    expect(r.amounts[0]).toBe(0);
    expect(cents(r.amounts)).toBe(99_999);
  });
});

describe('edge cases', () => {
  it('percentages that total 99.99 → the total message; float-safe 100', () => {
    expect(totalMsg(state({ venue: 44.99 }))).toBe('Your percentages add up to 99.99%. They need to total 100%.');
    expect(totalMsg(state({ venue: 44.9, photo: 12.1 }))).toBeNull();
  });

  it('a box out of range shows its own error, not the total message', () => {
    const s = state({ venue: 101 });
    expect(fieldErrors(weddingSchema, s).venue).toBe('Maximum is 100%');
    expect(totalMsg(s)).toBeNull();
  });

  it('budget 0 → 0.00 everywhere; guests decimals → field error', () => {
    expect(run(state({ budget: 0 })).amounts.every((x) => x === 0)).toBe(true);
    expect(fieldErrors(weddingSchema, state({ guests: 2.5 })).guests).toBe('Enter a whole number');
  });

  it('huge values stay finite and still add up', () => {
    const r = run(state({ budget: 1_000_000_000, guests: 1 }));
    expect(cents(r.amounts)).toBe(100_000_000_000);
    for (const x of r.amounts) expect(m(x)).not.toMatch(/e\+|NaN|Infinity/);
    expect(CATEGORIES.length).toBe(8);
  });
});
