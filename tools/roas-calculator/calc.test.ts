import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { formatMoney, type CurrencyCode } from '@/lib/format';
import { formatRatioPercent, formatX, roas } from './calc';
import { roasDefaults, roasErrors, switchRoasCurrency, toCalcInput, type RoasState } from './schema';

const find = (rev: number, spend: number, margin = 0) => roas(toCalcInput({ ...roasDefaults, mode: 'find', rev, spend, margin }));
const needed = (spend: number, target: number, margin = 0) =>
  roas(toCalcInput({ ...roasDefaults, mode: 'needed', spend, target, margin }));
const m = (n: number, c: CurrencyCode = 'USD') => formatMoney(n, c);

describe('spec test cases', () => {
  it('#1 15,000 ÷ 3,000 → 5.00x, 500%, no break-even without a margin', () => {
    const r = find(15_000, 3_000);
    expect(formatX(r.roas!)).toBe('5.00x');
    expect(formatRatioPercent(r.roas!)).toBe('500%');
    expect(r.breakEven).toBeNull();
    expect(r.profitAfterAds).toBeNull();
  });

  it('#2 + 40% margin → break-even 2.50x (250%), profit 3,000, above', () => {
    const r = find(15_000, 3_000, 40);
    expect(formatX(r.breakEven!)).toBe('2.50x');
    expect(formatRatioPercent(r.breakEven!)).toBe('250%');
    expect(m(r.profitAfterAds!)).toBe('$3,000.00');
    expect(r.status).toBe('above');
  });

  it('#3 4,000 ÷ 2,500 at 25% → 1.60x (160%), break-even 4.00x (400%), profit −1,500, below', () => {
    const r = find(4_000, 2_500, 25);
    expect(formatX(r.roas!)).toBe('1.60x');
    expect(formatRatioPercent(r.roas!)).toBe('160%');
    expect(formatX(r.breakEven!)).toBe('4.00x');
    expect(formatRatioPercent(r.breakEven!)).toBe('400%');
    expect(r.profitAfterAds).toBe(-1_500);
    expect(r.status).toBe('below');
  });

  it('#4 needed: 3,000 × 4 → 12,000', () => {
    const r = needed(3_000, 4);
    expect(r.revenueNeeded).toBe(12_000);
    expect(r.status).toBeNull();
  });

  it('#5 needed with 20% margin → break-even 5.00x, target below it', () => {
    const r = needed(3_000, 4, 20);
    expect(r.revenueNeeded).toBe(12_000);
    expect(formatX(r.breakEven!)).toBe('5.00x');
    expect(r.status).toBe('below');
  });

  it('#6 INR ₹2,50,000 ÷ ₹50,000 at 30% → 5.00x, break-even 3.33x (333.33%), profit ₹25,000.00', () => {
    const r = find(250_000, 50_000, 30);
    expect(formatX(r.roas!)).toBe('5.00x');
    expect(formatX(r.breakEven!)).toBe('3.33x');
    expect(formatRatioPercent(r.breakEven!)).toBe('333.33%');
    expect(m(r.profitAfterAds!, 'INR')).toBe('₹25,000.00');
  });

  it('#7 10,000 ÷ 5,000 at 50% → 2.00x, exactly break-even, profit 0', () => {
    const r = find(10_000, 5_000, 50);
    expect(formatX(r.roas!)).toBe('2.00x');
    expect(r.status).toBe('even');
    expect(r.profitAfterAds).toBe(0);
  });
});

describe('edge cases', () => {
  const errs = (patch: Partial<RoasState>) => roasErrors({ ...roasDefaults, ...patch });

  it('find mode: spend 0 → "Enter an ad spend above 0" (no Infinity)', () => {
    expect(errs({ mode: 'find', spend: 0 }).spend).toBe('Enter an ad spend above 0');
  });

  it('needed mode: spend 0 → revenue needed 0 (valid)', () => {
    expect(errs({ mode: 'needed', spend: 0 })).toEqual({});
    expect(needed(0, 4).revenueNeeded).toBe(0);
  });

  it('revenue 0 → 0.00x, 0%; target 0 → 0 needed', () => {
    expect(formatX(find(0, 1_000).roas!)).toBe('0.00x');
    expect(formatRatioPercent(find(0, 1_000).roas!)).toBe('0%');
    expect(needed(3_000, 0).revenueNeeded).toBe(0);
  });

  it('margin 100 → break-even 1.00x; above 100 or negative → error', () => {
    expect(formatX(find(1, 1, 100).breakEven!)).toBe('1.00x');
    expect(errs({ margin: 101 }).margin).toBeDefined();
    expect(errs({ margin: -1 }).margin).toBeDefined();
  });

  it('only the fields the mode uses are checked', () => {
    expect(errs({ mode: 'find', target: Number.NaN })).toEqual({});
    expect(errs({ mode: 'needed', rev: Number.NaN })).toEqual({});
    expect(errs({ mode: 'find', rev: Number.NaN }).rev).toBe('Enter a number');
  });
});

describe('currency defaults', () => {
  it('untouched fields follow the currency; typed values are kept', () => {
    expect(switchRoasCurrency(roasDefaults, 'INR')).toMatchObject({ rev: 250_000, spend: 50_000, target: 4, margin: 40 });
    expect(switchRoasCurrency({ ...roasDefaults, spend: 4_000 }, 'INR')).toMatchObject({ rev: 250_000, spend: 4_000 });
  });
});

describe('content.mdx worked examples match the calculator', () => {
  const mdx = readFileSync(join(__dirname, 'content.mdx'), 'utf8');
  const has = (t: string) => expect(mdx, `content.mdx should contain "${t}"`).toContain(t);

  it('the four examples', () => {
    const a = find(15_000, 3_000, 40);
    [formatX(a.roas!), formatRatioPercent(a.roas!), formatX(a.breakEven!), m(a.profitAfterAds!)].forEach(has);
    const b = find(4_000, 2_500, 25);
    [formatX(b.roas!), formatRatioPercent(b.roas!), formatX(b.breakEven!), m(b.profitAfterAds!)].forEach(has);
    const c = find(250_000, 50_000, 30);
    [formatX(c.breakEven!), formatRatioPercent(c.breakEven!), m(c.profitAfterAds!, 'INR')].forEach(has);
    const d = needed(3_000, 4, 20);
    [m(d.revenueNeeded!), formatX(d.breakEven!)].forEach(has);
  });
});
