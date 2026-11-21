import { describe, expect, it } from 'vitest';
import { formatMoney, type CurrencyCode } from '@/lib/format';
import { backPay } from './calc';
import { RATE_BELOW_OLD, SALARY_BELOW_OLD, backPayDefaults, backPayErrors, switchBackPayCurrency, toCalcInput, type BackPayState } from './schema';

const m = (n: number, c: CurrencyCode = 'USD') => formatMoney(n, c);
const run = (patch: Partial<BackPayState>) => backPay(toCalcInput({ ...backPayDefaults, ...patch }));
const errs = (patch: Partial<BackPayState>) => backPayErrors({ ...backPayDefaults, ...patch });

describe('spec test cases', () => {
  it('#1 rate 20 → 22 · 40 h · 12 weeks → 960.00 · 2.00 per hour · 80.00 per week', () => {
    const r = run({ mode: 'rate', oldRate: 20, newRate: 22, hours: 40, weeks: 12 });
    expect(m(r.total)).toBe('$960.00');
    expect(m(r.perHour!)).toBe('$2.00');
    expect(m(r.perWeek!)).toBe('$80.00');
  });

  it('#2 rate 18.50 → 19.75 · 37.5 h · 26 weeks → 1,218.75 · 1.25 · 46.88 per week', () => {
    const r = run({ mode: 'rate', oldRate: 18.5, newRate: 19.75, hours: 37.5, weeks: 26 });
    expect(m(r.total)).toBe('$1,218.75');
    expect(m(r.perHour!)).toBe('$1.25');
    expect(m(r.perWeek!)).toBe('$46.88');
  });

  it('#3 missed 1,500 × 3 → 4,500.00', () => {
    expect(m(run({ mode: 'missed', amount: 1_500, periods: 3 }).total)).toBe('$4,500.00');
  });

  it('#4 missed 2,250 × 2.5 → 5,625.00', () => {
    expect(m(run({ mode: 'missed', amount: 2_250, periods: 2.5 }).total)).toBe('$5,625.00');
  });

  it('#5 INR rate ₹300 → ₹330 · 40 h · 12 weeks → ₹14,400.00 · ₹1,200.00 per week', () => {
    const s = switchBackPayCurrency(backPayDefaults, 'INR');
    const r = backPay(toCalcInput(s));
    expect(m(r.total, 'INR')).toBe('₹14,400.00');
    expect(m(r.perWeek!, 'INR')).toBe('₹1,200.00');
  });

  it('#6 INR missed ₹25,000 × 3 → ₹75,000.00', () => {
    const s = switchBackPayCurrency({ ...backPayDefaults, mode: 'missed' }, 'INR');
    expect(m(backPay(toCalcInput(s)).total, 'INR')).toBe('₹75,000.00');
  });

  it('#7 GBP rate £15 → £16.50 · 40 h · 12 weeks → £720.00', () => {
    const s = switchBackPayCurrency(backPayDefaults, 'GBP');
    expect(m(backPay(toCalcInput(s)).total, 'GBP')).toBe('£720.00');
  });

  it('#8 rate new = old → 0.00 (valid)', () => {
    expect(errs({ oldRate: 20, newRate: 20 })).toEqual({});
    expect(m(run({ oldRate: 20, newRate: 20 }).total)).toBe('$0.00');
  });

  it('#9 USD → INR without editing: rates, salaries and amount move; hours, weeks, periods stay; a typed rate is kept', () => {
    const i = switchBackPayCurrency(backPayDefaults, 'INR');
    expect([i.oldRate, i.newRate, i.oldSalary, i.newSalary, i.amount, i.hours, i.weeks, i.periods]).toEqual([300, 330, 600_000, 660_000, 25_000, 40, 12, 3]);
    const typed = switchBackPayCurrency({ ...backPayDefaults, newRate: 23 }, 'INR', new Set(['newRate']));
    expect(typed.newRate).toBe(23);
    expect(typed.oldRate).toBe(300);
  });
});

describe('salary raise paid late (Puru, 2026-11-21)', () => {
  it('50,000 → 55,000 · 10 weeks → 961.54 · 5,000.00 a year · 96.15 a week', () => {
    const r = run({ mode: 'salary', oldSalary: 50_000, newSalary: 55_000, weeks: 10 });
    expect(m(r.total)).toBe('$961.54');
    expect(m(r.perYear!)).toBe('$5,000.00');
    expect(m(r.perWeek!)).toBe('$96.15');
  });

  it('INR ₹6,00,000 → ₹6,60,000 · 12 weeks → ₹13,846.15', () => {
    const s = switchBackPayCurrency({ ...backPayDefaults, mode: 'salary' }, 'INR');
    expect(m(backPay(toCalcInput(s)).total, 'INR')).toBe('₹13,846.15');
  });

  it('new salary below old → field error; equal → 0.00', () => {
    expect(errs({ mode: 'salary', oldSalary: 50_000, newSalary: 49_000 }).newSalary).toBe(SALARY_BELOW_OLD);
    expect(errs({ mode: 'salary', oldSalary: 50_000, newSalary: 50_000 })).toEqual({});
  });
});

describe('edge cases', () => {
  it('new rate below old → field error; limits → field errors; 0 weeks / periods → 0.00', () => {
    expect(errs({ oldRate: 22, newRate: 20 }).newRate).toBe(RATE_BELOW_OLD);
    expect(errs({ hours: 169 }).hours).toBe('Maximum is 168 hours');
    expect(errs({ weeks: 521 }).weeks).toBe('Maximum is 520 weeks');
    expect(errs({ mode: 'missed', periods: 1_001 }).periods).toBe('Maximum is 1,000 periods');
    expect(run({ weeks: 0 }).total).toBe(0);
    expect(run({ mode: 'missed', periods: 0 }).total).toBe(0);
  });

  it('fields of other modes never block; the pay period never changes the number', () => {
    expect(errs({ mode: 'missed', oldRate: 30, newRate: 10, oldSalary: -1 })).toEqual({});
    expect(run({ mode: 'missed', period: 'month' }).total).toBe(run({ mode: 'missed', period: 'week' }).total);
  });

  it('huge values stay finite', () => {
    const r = run({ mode: 'salary', oldSalary: 0, newSalary: 1_000_000_000, weeks: 520 });
    expect(m(r.total)).not.toMatch(/e\+|NaN|Infinity/);
  });
});
