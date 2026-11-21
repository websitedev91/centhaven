import { describe, expect, it } from 'vitest';
import { formatMoney, type CurrencyCode } from '@/lib/format';
import { formatPct } from '@/tools/margin-vs-markup-calculator/calc';
import { partTimePay } from './calc';
import { FT_ABOVE_0, PT_TOO_MANY, partTimeDefaults, partTimeErrors, switchPartTimeCurrency, toCalcInput, type PartTimeState } from './schema';

const m = (n: number, c: CurrencyCode = 'USD') => formatMoney(n, c);
const run = (patch: Partial<PartTimeState>) => partTimePay(toCalcInput({ ...partTimeDefaults, ...patch }));
const errs = (patch: Partial<PartTimeState>) => partTimeErrors({ ...partTimeDefaults, ...patch });

describe('spec test cases', () => {
  it('#1 prorata 50,000 · 40 h · 24 h → 30,000.00 · 60% · 2,500.00 · 576.92 · 24.04', () => {
    const r = run({ mode: 'prorata', ftSalary: 50_000, ftHours: 40, ptHours: 24 });
    expect(m(r.yearly)).toBe('$30,000.00');
    expect(formatPct(r.share!)).toBe('60%');
    expect(m(r.monthly)).toBe('$2,500.00');
    expect(m(r.weekly)).toBe('$576.92');
    expect(m(r.hourly!)).toBe('$24.04');
  });

  it('#2 prorata 45,000 · 37.5 h · 22.5 h → 27,000.00 · 60% · 2,250.00 · 23.08', () => {
    const r = run({ mode: 'prorata', ftSalary: 45_000, ftHours: 37.5, ptHours: 22.5 });
    expect(m(r.yearly)).toBe('$27,000.00');
    expect(formatPct(r.share!)).toBe('60%');
    expect(m(r.monthly)).toBe('$2,250.00');
    expect(m(r.hourly!)).toBe('$23.08');
  });

  it('#3 prorata 50,000 · 40 h · 25 h → 31,250.00 · 62.5%', () => {
    const r = run({ mode: 'prorata', ftSalary: 50_000, ftHours: 40, ptHours: 25 });
    expect(m(r.yearly)).toBe('$31,250.00');
    expect(formatPct(r.share!)).toBe('62.5%');
  });

  it('#4 hourly 20 × 20 h × 52 → 20,800.00 · 1,733.33 · 400.00', () => {
    const r = run({ mode: 'hourly', rate: 20, hours: 20, weeks: 52 });
    expect(m(r.yearly)).toBe('$20,800.00');
    expect(m(r.monthly)).toBe('$1,733.33');
    expect(m(r.weekly)).toBe('$400.00');
    expect(r.share).toBeNull();
  });

  it('#5 GBP hourly £15 × 16 h × 46 weeks → £11,040.00 · £920.00 · £240.00', () => {
    const s = switchPartTimeCurrency({ ...partTimeDefaults, mode: 'hourly' }, 'GBP');
    expect(s.rate).toBe(15);
    const r = partTimePay(toCalcInput({ ...s, hours: 16, weeks: 46 }));
    expect(m(r.yearly, 'GBP')).toBe('£11,040.00');
    expect(m(r.monthly, 'GBP')).toBe('£920.00');
    expect(m(r.weekly, 'GBP')).toBe('£240.00');
  });

  it('#6 INR prorata ₹6,00,000 · 40 h · 20 h → ₹3,00,000.00 · 50% · ₹25,000.00 · ₹5,769.23', () => {
    const s = switchPartTimeCurrency(partTimeDefaults, 'INR');
    expect(s.ftSalary).toBe(600_000);
    const r = partTimePay(toCalcInput({ ...s, ptHours: 20 }));
    expect(m(r.yearly, 'INR')).toBe('₹3,00,000.00');
    expect(formatPct(r.share!)).toBe('50%');
    expect(m(r.monthly, 'INR')).toBe('₹25,000.00');
    expect(m(r.weekly, 'INR')).toBe('₹5,769.23');
  });

  it('#7 part-time hours 0 → 0.00 · 0% · hourly row hidden', () => {
    expect(errs({ ptHours: 0 })).toEqual({});
    const r = run({ ptHours: 0 });
    expect(m(r.yearly)).toBe('$0.00');
    expect(formatPct(r.share!)).toBe('0%');
    expect(r.hourly).toBeNull();
  });

  it('#8 USD → GBP without editing: salary and rate move, hours and weeks stay; a typed salary is kept', () => {
    const g = switchPartTimeCurrency(partTimeDefaults, 'GBP');
    expect([g.ftSalary, g.rate, g.ftHours, g.ptHours, g.hours, g.weeks]).toEqual([35_000, 15, 40, 24, 20, 52]);
    const typed = switchPartTimeCurrency({ ...partTimeDefaults, ftSalary: 48_000 }, 'GBP', new Set(['ftSalary']));
    expect(typed.ftSalary).toBe(48_000);
    expect(typed.rate).toBe(15);
  });
});

describe('edge cases', () => {
  it('full-time hours 0 → field error (no ÷ 0); part-time above full-time → field error; equal → 100%', () => {
    expect(errs({ ftHours: 0 }).ftHours).toBe(FT_ABOVE_0);
    expect(errs({ ptHours: 41 }).ptHours).toBe(PT_TOO_MANY);
    expect(errs({ ptHours: 40 })).toEqual({});
    expect(formatPct(run({ ptHours: 40 }).share!)).toBe('100%');
  });

  it('hours over 168, weeks over 53, negatives → field errors; weeks 0 → 0.00 (valid)', () => {
    expect(errs({ ftHours: 169 }).ftHours).toBe('Maximum is 168 hours');
    expect(errs({ mode: 'hourly', weeks: 54 }).weeks).toBe('Maximum is 53 weeks');
    expect(errs({ mode: 'hourly', rate: -1 }).rate).toBe('Can’t be negative');
    expect(errs({ mode: 'hourly', weeks: 0 })).toEqual({});
    expect(run({ mode: 'hourly', weeks: 0 }).yearly).toBe(0);
    // Fields of the other mode never block.
    expect(errs({ mode: 'hourly', ftHours: 0, ptHours: 100 })).toEqual({});
  });

  it('huge values stay finite', () => {
    const r = run({ ftSalary: 1_000_000_000, ftHours: 0.01, ptHours: 0.01 });
    expect(m(r.hourly!)).not.toMatch(/e\+|NaN|Infinity/);
  });
});
