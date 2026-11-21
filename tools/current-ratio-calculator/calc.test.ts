import { describe, expect, it } from 'vitest';
import { formatMoney, type CurrencyCode } from '@/lib/format';
import { formatRatio } from '@/tools/compa-ratio-calculator/calc';
import { currentRatios } from './calc';
import { LIAB_ABOVE_0, QUICK_TOO_BIG, ratioDefaults, ratioErrors, switchRatioCurrency, toCalcInput, type RatioState } from './schema';

const m = (n: number, c: CurrencyCode = 'USD') => formatMoney(n, c);
const run = (patch: Partial<RatioState>) => currentRatios(toCalcInput({ ...ratioDefaults, ...patch }));
const errs = (patch: Partial<RatioState>) => ratioErrors({ ...ratioDefaults, ...patch });

describe('spec test cases', () => {
  it('#1 USD defaults 250,000 / 125,000 · 60,000 · 10,000 → 2.00 · quick assets 180,000 · 1.44 · WC 125,000', () => {
    const r = run({});
    expect(formatRatio(r.current)).toBe('2.00');
    expect(m(r.quickAssets)).toBe('$180,000.00');
    expect(formatRatio(r.quick)).toBe('1.44');
    expect(m(r.workingCapital)).toBe('$125,000.00');
  });

  it('#2 90,000 / 120,000 · 30,000 · 0 → 0.75 · 0.50 · WC −30,000', () => {
    const r = run({ assets: 90_000, liab: 120_000, inv: 30_000, prepaid: 0 });
    expect(formatRatio(r.current)).toBe('0.75');
    expect(formatRatio(r.quick)).toBe('0.50');
    expect(r.workingCapital).toBe(-30_000);
    expect(m(-r.workingCapital)).toBe('$30,000.00');
  });

  it('#3 100,000 / 30,000 · 25,000 · 5,000 → 3.33 · 2.33 · WC 70,000', () => {
    const r = run({ assets: 100_000, liab: 30_000, inv: 25_000, prepaid: 5_000 });
    expect(formatRatio(r.current)).toBe('3.33');
    expect(formatRatio(r.quick)).toBe('2.33');
    expect(m(r.workingCapital)).toBe('$70,000.00');
  });

  it('#4 inventory and prepaid empty (0) → quick = current = 1.50', () => {
    const r = run({ assets: 150_000, liab: 100_000, inv: 0, prepaid: 0 });
    expect(formatRatio(r.current)).toBe('1.50');
    expect(formatRatio(r.quick)).toBe('1.50');
  });

  it('#5 INR defaults → 2.00 · 1.44 · WC ₹25,00,000.00', () => {
    const s = switchRatioCurrency(ratioDefaults, 'INR');
    const r = currentRatios(toCalcInput(s));
    expect([s.assets, s.liab, s.inv, s.prepaid]).toEqual([5_000_000, 2_500_000, 1_200_000, 200_000]);
    expect(formatRatio(r.current)).toBe('2.00');
    expect(formatRatio(r.quick)).toBe('1.44');
    expect(m(r.workingCapital, 'INR')).toBe('₹25,00,000.00');
  });

  it('#6 GBP defaults → 2.00 · 1.42 · WC £100,000.00', () => {
    const s = switchRatioCurrency(ratioDefaults, 'GBP');
    const r = currentRatios(toCalcInput(s));
    expect(formatRatio(r.current)).toBe('2.00');
    expect(formatRatio(r.quick)).toBe('1.42');
    expect(m(r.workingCapital, 'GBP')).toBe('£100,000.00');
  });

  it('#7 USD → INR without editing moves all four amounts; a typed amount is kept', () => {
    const i = switchRatioCurrency(ratioDefaults, 'INR');
    expect(i.assets).toBe(5_000_000);
    const typed = switchRatioCurrency({ ...ratioDefaults, liab: 99_000 }, 'INR', new Set(['liab']));
    expect(typed.liab).toBe(99_000);
    expect(typed.assets).toBe(5_000_000);
  });
});

describe('edge cases', () => {
  it('liabilities 0 → "Enter current liabilities above 0"; assets 0 → valid 0.00', () => {
    expect(errs({ liab: 0 }).liab).toBe(LIAB_ABOVE_0);
    expect(errs({ assets: 0, inv: 0, prepaid: 0 })).toEqual({});
    expect(formatRatio(run({ assets: 0, inv: 0, prepaid: 0 }).current)).toBe('0.00');
  });

  it('inventory + prepaid above current assets → field error on inventory; equal → quick 0.00 (valid)', () => {
    expect(errs({ assets: 50_000, inv: 45_000, prepaid: 10_000 }).inv).toBe(QUICK_TOO_BIG);
    expect(errs({ assets: 50_000, inv: 40_000, prepaid: 10_000 })).toEqual({});
    expect(formatRatio(run({ assets: 50_000, inv: 40_000, prepaid: 10_000 }).quick)).toBe('0.00');
  });

  it('negatives → field errors; huge values stay finite', () => {
    expect(errs({ assets: -1 }).assets).toBe('Can’t be negative');
    expect(errs({ inv: -1 }).inv).toBe('Can’t be negative');
    const r = run({ assets: 999_999_999_999, liab: 0.01, inv: 0, prepaid: 0 });
    expect(Number.isFinite(r.current)).toBe(true);
    expect(formatRatio(r.current)).not.toMatch(/e\+|NaN|Infinity/);
  });
});
