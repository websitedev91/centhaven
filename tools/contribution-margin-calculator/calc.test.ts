import { describe, expect, it } from 'vitest';
import { formatMoney, type CurrencyCode } from '@/lib/format';
import { breakEven, ceilSales } from '@/tools/break-even-calculator/calc';
import { formatPct } from '@/tools/margin-vs-markup-calculator/calc';
import { contributionMargin } from './calc';
import { PRICE_ABOVE_0, marginDefaults, marginErrors, switchMarginCurrency, toCalcInput, type MarginState } from './schema';

const m = (n: number, c: CurrencyCode = 'USD') => formatMoney(n, c);
const run = (patch: Partial<MarginState>) => contributionMargin(toCalcInput({ ...marginDefaults, ...patch }));
const errs = (patch: Partial<MarginState>) => marginErrors({ ...marginDefaults, ...patch });

describe('spec test cases', () => {
  it('#1 USD defaults 50 · 30 · 1,000 · 12,000 → 20.00 · 40% · 20,000.00 · 600 units (not 601) · 30,000.00 · 8,000.00', () => {
    const r = run({});
    expect(m(r.perUnit)).toBe('$20.00');
    expect(formatPct(r.ratio)).toBe('40%');
    expect(m(r.total)).toBe('$20,000.00');
    expect(r.breakEven!.units).toBe(600);
    expect(m(r.breakEven!.revenue)).toBe('$30,000.00');
    expect(m(r.profit!)).toBe('$8,000.00');
  });

  it('#2 19.99 · 7.45 · 2,500 · 10,000 → 12.54 · 62.73% · 31,350.00 · 798 units (797.45) · 15,940.99 · 21,350.00', () => {
    const r = run({ price: 19.99, vc: 7.45, units: 2_500, fixed: 10_000 });
    expect(m(r.perUnit)).toBe('$12.54');
    expect(formatPct(r.ratio)).toBe('62.73%');
    expect(m(r.total)).toBe('$31,350.00');
    expect(r.breakEven!.units).toBe(798);
    expect(r.breakEven!.exact.toFixed(2)).toBe('797.45');
    expect(m(r.breakEven!.revenue)).toBe('$15,940.99');
    expect(m(r.profit!)).toBe('$21,350.00');
  });

  it('#3 fixed 0 → break-even and profit rows hidden', () => {
    const r = run({ fixed: 0 });
    expect(r.breakEven).toBeNull();
    expect(r.profit).toBeNull();
    expect(r.noBreakEven).toBe(false);
  });

  it('#4 50 · 55 → −5.00 · −10% · −5,000.00 · no break-even · loss of 17,000.00', () => {
    const r = run({ price: 50, vc: 55 });
    expect(r.perUnit).toBe(-5);
    expect(formatPct(r.ratio)).toBe('-10%');
    expect(r.total).toBe(-5_000);
    expect(r.noBreakEven).toBe(true);
    expect(r.breakEven).toBeNull();
    expect(r.profit).toBe(-17_000);
  });

  it('#5 50 · 50 → 0.00 · 0% · no break-even', () => {
    const r = run({ price: 50, vc: 50 });
    expect(m(r.perUnit)).toBe('$0.00');
    expect(formatPct(r.ratio)).toBe('0%');
    expect(r.noBreakEven).toBe(true);
  });

  it('#6 400 units → total 8,000.00 · loss of 4,000.00 · break-even 600', () => {
    const r = run({ units: 400 });
    expect(m(r.total)).toBe('$8,000.00');
    expect(r.profit).toBe(-4_000);
    expect(r.breakEven!.units).toBe(600);
  });

  it('#7 INR defaults ₹2,000 · ₹1,200 · 1,000 · ₹4,80,000 → ₹800.00 · 40% · ₹8,00,000.00 · 600 units · ₹3,20,000.00', () => {
    const s = switchMarginCurrency(marginDefaults, 'INR');
    const r = contributionMargin(toCalcInput(s));
    expect(m(r.perUnit, 'INR')).toBe('₹800.00');
    expect(formatPct(r.ratio)).toBe('40%');
    expect(m(r.total, 'INR')).toBe('₹8,00,000.00');
    expect(r.breakEven!.units).toBe(600);
    expect(m(r.profit!, 'INR')).toBe('₹3,20,000.00');
  });

  it('#8 USD → GBP without editing: 50 / 30 / 12,000 → 40 / 24 / 9,600; units stay; a typed price is kept', () => {
    const g = switchMarginCurrency(marginDefaults, 'GBP');
    expect([g.price, g.vc, g.fixed, g.units]).toEqual([40, 24, 9_600, 1_000]);
    const typed = switchMarginCurrency({ ...marginDefaults, price: 60 }, 'GBP', new Set(['price']));
    expect(typed.price).toBe(60);
    expect(typed.vc).toBe(24);
  });

  it('matches the Break-Even tool for the same numbers', () => {
    const be = breakEven({ fixedCosts: 12_000, price: 50, variableCost: 30, targetProfit: 0 });
    expect(be.ok && ceilSales(be.breakEvenUnits)).toBe(run({}).breakEven!.units);
    expect(be.ok && be.breakEvenRevenue).toBe(run({}).breakEven!.revenue);
  });
});

describe('edge cases', () => {
  it('price 0 → field error; variable cost 0 → ratio 100%; units 0 → total 0.00', () => {
    expect(errs({ price: 0 }).price).toBe(PRICE_ABOVE_0);
    expect(formatPct(run({ vc: 0 }).ratio)).toBe('100%');
    expect(run({ units: 0 }).total).toBe(0);
  });

  it('units must be whole; negatives → field errors', () => {
    expect(errs({ units: 2.5 }).units).toBe('Enter a whole number');
    expect(errs({ vc: -1 }).vc).toBe('Can’t be negative');
    expect(errs({ fixed: -1 }).fixed).toBe('Can’t be negative');
  });

  it('huge values stay finite', () => {
    const r = run({ price: 1_000_000_000, vc: 0.01, units: 1_000_000_000, fixed: 1_000_000_000 });
    expect(m(r.total)).not.toMatch(/e\+|NaN|Infinity/);
    expect(r.breakEven!.units).toBe(1);
  });
});
