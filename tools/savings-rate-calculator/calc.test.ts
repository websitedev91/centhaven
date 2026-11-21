import { describe, expect, it } from 'vitest';
import { formatMoney, type CurrencyCode } from '@/lib/format';
import { formatPct } from '@/tools/margin-vs-markup-calculator/calc';
import { savingsRate } from './calc';
import { INCOME_ABOVE_0, SAVED_TOO_MUCH, rateDefaults, rateErrors, switchRateCurrency, toCalcInput, type RateState } from './schema';

const m = (n: number, c: CurrencyCode = 'USD') => formatMoney(n, c);
const run = (patch: Partial<RateState>) => savingsRate(toCalcInput({ ...rateDefaults, ...patch }));
const errs = (patch: Partial<RateState>) => rateErrors({ ...rateDefaults, ...patch });

describe('spec test cases', () => {
  it('#1 4,000 · 600 → 15% · yearly 7,200.00 · not saved 3,400.00', () => {
    const r = run({ income: 4_000, saved: 600 });
    expect(formatPct(r.rate)).toBe('15%');
    expect(m(r.yearly)).toBe('$7,200.00');
    expect(m(r.notSaved)).toBe('$3,400.00');
    expect(r.targetAmount).toBeNull();
  });

  it('#2 5,250 · 400 → 7.62%', () => {
    expect(formatPct(run({ income: 5_250, saved: 400 }).rate)).toBe('7.62%');
  });

  it('#3 target 20% → 800.00 a month · 200.00 more', () => {
    const r = run({ target: 20 });
    expect(m(r.targetAmount!)).toBe('$800.00');
    expect(m(r.gap!)).toBe('$200.00');
  });

  it('#4 target 10% → 400.00 · 200.00 above the target', () => {
    const r = run({ target: 10 });
    expect(m(r.targetAmount!)).toBe('$400.00');
    expect(r.gap).toBe(-200);
  });

  it('#5 target 15% → exactly on target', () => {
    expect(run({ target: 15 }).gap).toBe(0);
  });

  it('#6 INR ₹80,000 · ₹12,000 · target 25% → 15% · ₹1,44,000.00 · ₹20,000.00 · ₹8,000.00 more', () => {
    const s = switchRateCurrency(rateDefaults, 'INR');
    const r = savingsRate(toCalcInput({ ...s, target: 25 }));
    expect(formatPct(r.rate)).toBe('15%');
    expect(m(r.yearly, 'INR')).toBe('₹1,44,000.00');
    expect(m(r.targetAmount!, 'INR')).toBe('₹20,000.00');
    expect(m(r.gap!, 'INR')).toBe('₹8,000.00');
  });

  it('#7 savings 0 → 0% (valid)', () => {
    expect(errs({ saved: 0 })).toEqual({});
    expect(formatPct(run({ saved: 0 }).rate)).toBe('0%');
  });

  it('#8 gross basis: same numbers (labels only)', () => {
    expect(run({ basis: 'gross' })).toEqual(run({ basis: 'net' }));
  });

  it('#9 USD → GBP without editing: 4,000 / 600 → 3,000 / 450; target unchanged; a typed income is kept', () => {
    const g = switchRateCurrency({ ...rateDefaults, target: 20 }, 'GBP');
    expect([g.income, g.saved, g.target]).toEqual([3_000, 450, 20]);
    const typed = switchRateCurrency({ ...rateDefaults, income: 5_000 }, 'GBP', new Set(['income']));
    expect(typed.income).toBe(5_000);
    expect(typed.saved).toBe(450);
  });
});

describe('edge cases', () => {
  it('the target starts off, so no suggested rate is ever shown', () => {
    expect(rateDefaults.target).toBe(0);
  });

  it('income 0 → field error; savings above income → field error; equal → 100%', () => {
    expect(errs({ income: 0 }).income).toBe(INCOME_ABOVE_0);
    expect(errs({ saved: 4_001 }).saved).toBe(SAVED_TOO_MUCH);
    expect(formatPct(run({ saved: 4_000 }).rate)).toBe('100%');
  });

  it('target over 100 or negative → field error; negatives → field errors', () => {
    expect(errs({ target: 101 }).target).toBe('Maximum is 100%');
    expect(errs({ target: -1 }).target).toBe('Can’t be negative');
    expect(errs({ saved: -1 }).saved).toBe('Can’t be negative');
  });

  it('huge values stay finite', () => {
    const r = run({ income: 1_000_000_000, saved: 999_999_999, target: 100 });
    expect(formatPct(r.rate)).not.toMatch(/e\+|NaN|Infinity/);
    expect(m(r.yearly)).not.toMatch(/e\+|NaN|Infinity/);
  });
});
