import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { formatMoney, formatPercent } from '@/lib/format';
import { yearsToDuration as yearsMonthsText } from '@/lib/duration';
import { evenPayback, formatYears, payback } from './calc';
import { paybackDefaults, paybackErrors, switchPaybackCurrency, toCalcInput, type PaybackState } from './schema';

const m = (n: number, c: 'USD' | 'INR' = 'USD') => formatMoney(n, c);
const uneven = (investment: number, flows: number[]) => payback({ investment, flows });

describe('spec test cases', () => {
  it('#1 even 50,000 ÷ 12,500 → 4.00 years, "4 years" (no "and 0 months")', () => {
    const y = evenPayback(50_000, 12_500)!;
    expect(formatYears(y)).toBe('4.00 years');
    expect(yearsMonthsText(y)).toBe('4 years');
  });

  it('#2 even 20,000 ÷ 7,000 → 2.86 years, 2 years and 10 months', () => {
    const y = evenPayback(20_000, 7_000)!;
    expect(formatYears(y)).toBe('2.86 years');
    expect(yearsMonthsText(y)).toBe('2 years and 10 months');
  });

  it('#3 uneven 30,000 → 3.00 years exactly', () => {
    const r = uneven(30_000, [8_000, 10_000, 12_000, 15_000]);
    expect(r.rows.map((x) => x.total).slice(0, 3)).toEqual([8_000, 18_000, 30_000]);
    expect(r.paidBack && formatYears(r.years)).toBe('3.00 years');
    expect(r.paidBack && yearsMonthsText(r.years)).toBe('3 years');
  });

  it('#4 uneven 40,000 → 3.17 years, 3 years and 2 months, recovered 55,000 (15,000 more)', () => {
    const r = uneven(40_000, [10_000, 12_000, 15_000, 18_000]);
    expect(r.paidBack && formatYears(r.years)).toBe('3.17 years');
    expect(r.paidBack && yearsMonthsText(r.years)).toBe('3 years and 2 months');
    expect(m(r.total)).toBe('$55,000.00');
    expect(m(r.total - 40_000)).toBe('$15,000.00');
  });

  it('#5 uneven 100,000, five years of 10,000 → not paid back: 50,000 recovered, 50%', () => {
    const r = uneven(100_000, [10_000, 10_000, 10_000, 10_000, 10_000]);
    expect(r.paidBack).toBe(false);
    expect(m(r.total)).toBe('$50,000.00');
    expect(!r.paidBack && formatPercent(r.share)).toBe('50%');
  });

  it('#6 INR even ₹5,00,000 ÷ ₹1,50,000 → 3.33 years, 3 years and 4 months', () => {
    const y = evenPayback(500_000, 150_000)!;
    expect(formatYears(y)).toBe('3.33 years');
    expect(yearsMonthsText(y)).toBe('3 years and 4 months');
  });

  it('#7 USD uneven defaults → 3.72 years, 3 years and 9 months', () => {
    const r = payback(toCalcInput({ ...paybackDefaults, mode: 'uneven' }));
    expect(r.paidBack && formatYears(r.years)).toBe('3.72 years');
    expect(r.paidBack && yearsMonthsText(r.years)).toBe('3 years and 9 months');
  });

  it('#8 USD → INR without editing: money moves, years stay; a typed value is kept', () => {
    const i = switchPaybackCurrency(paybackDefaults, 'INR');
    expect([i.inv, i.flow, i.y1, i.y5, i.years]).toEqual([500_000, 150_000, 100_000, 200_000, 5]);
    expect(switchPaybackCurrency({ ...paybackDefaults, inv: 70_000 }, 'INR').inv).toBe(70_000);
    expect(switchPaybackCurrency(paybackDefaults, 'INR', new Set(['inv'])).inv).toBe(50_000);
  });
});

describe('edge cases', () => {
  const errs = (patch: Partial<PaybackState>) => paybackErrors({ ...paybackDefaults, ...patch });

  it('investment 0 → paid back straight away', () => {
    expect(evenPayback(0, 0)).toBe(0);
    const r = uneven(0, [0, 0]);
    expect(r.paidBack && r.years).toBe(0);
  });

  it('even mode, flow 0 → never paid back (no Infinity)', () => {
    expect(evenPayback(50_000, 0)).toBeNull();
  });

  it('11.96 months rounds into the next year', () => {
    expect(yearsMonthsText(3.997)).toBe('4 years');
  });

  it('negatives → field error; hidden year boxes never block', () => {
    expect(errs({ inv: -1 }).inv).toBe('Can’t be negative');
    // A loss year is allowed in "Different each year" (Puru, 2026-11-20); the investment can't be negative.
    expect(errs({ mode: 'uneven', y2: -1 })).toEqual({});
    expect(errs({ mode: 'uneven', y2: -20_000_000_000 }).y2).toBe('Minimum is −10,000,000,000');
    expect(errs({ mode: 'even', flow: -1 }).flow).toBe('Can’t be negative');
    expect(errs({ mode: 'uneven', y9: Number.NaN })).toEqual({});
    expect(errs({ mode: 'even', y1: Number.NaN })).toEqual({});
    expect(errs({ mode: 'uneven', years: 11 }).years).toBe('Maximum is 10 years');
    expect(errs({ mode: 'uneven', years: 0 }).years).toBe('Enter at least 1 year');
  });

  it('a 0 year in the middle is skipped over', () => {
    const r = uneven(20_000, [10_000, 0, 20_000]);
    expect(r.paidBack && formatYears(r.years)).toBe('2.50 years');
  });

  it('huge values stay finite', () => {
    const y = evenPayback(10_000_000_000, 1)!;
    expect(formatYears(y)).not.toMatch(/e\+|NaN|Infinity/);
  });
});

describe('negative yearly cash flows (Puru, 2026-11-20)', () => {
  it('50,000 with −5,000 / 20,000 × 4 → cumulative −5k, 15k, 35k, 55k → 3.75 years, 3 years and 9 months', () => {
    const r = uneven(50_000, [-5_000, 20_000, 20_000, 20_000, 20_000]);
    expect(r.rows.map((x) => x.total).slice(0, 4)).toEqual([-5_000, 15_000, 35_000, 55_000]);
    expect(r.rows[0]!.left).toBe(55_000);
    expect(r.paidBack && formatYears(r.years)).toBe('3.75 years');
    expect(r.paidBack && yearsMonthsText(r.years)).toBe('3 years and 9 months');
  });

  it('the same case through the schema (uneven mode)', () => {
    const r = payback(toCalcInput({ ...paybackDefaults, mode: 'uneven', inv: 50_000, y1: -5_000, y2: 20_000, y3: 20_000, y4: 20_000, y5: 20_000 }));
    expect(r.paidBack && r.years).toBe(3.75);
  });

  it('losses only → not paid back, with a negative share and no NaN', () => {
    const r = uneven(10_000, [-1_000, -1_000]);
    expect(r.paidBack).toBe(false);
    expect(!r.paidBack && formatPercent(r.share)).toBe('-20%');
  });
});

describe('content.mdx worked examples match the calculator', () => {
  const mdx = readFileSync(join(__dirname, 'content.mdx'), 'utf8');
  const has = (t: string) => expect(mdx, `content.mdx should contain "${t}"`).toContain(t);

  it('cases 1, 4 and 6', () => {
    const a = evenPayback(50_000, 12_500)!;
    [formatYears(a), yearsMonthsText(a)].forEach(has);
    const b = uneven(40_000, [10_000, 12_000, 15_000, 18_000]);
    if (!b.paidBack) throw new Error('case 4 pays back');
    [formatYears(b.years), yearsMonthsText(b.years), m(b.total)].forEach(has);
    const c = evenPayback(500_000, 150_000)!;
    [formatYears(c), yearsMonthsText(c)].forEach(has);
  });
});
