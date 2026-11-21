import { describe, expect, it } from 'vitest';
import { formatMoney, type CurrencyCode } from '@/lib/format';
import { formatPct } from '@/tools/margin-vs-markup-calculator/calc';
import { bonus } from './calc';
import { bonusDefaults, bonusErrors, switchBonusCurrency, toCalcInput, type BonusState } from './schema';

const m = (n: number, c: CurrencyCode = 'USD') => formatMoney(n, c);
const run = (patch: Partial<BonusState>) => bonus(toCalcInput({ ...bonusDefaults, ...patch }));
const errs = (patch: Partial<BonusState>) => bonusErrors({ ...bonusDefaults, ...patch });

describe('spec test cases', () => {
  it('#1 percent 60,000 × 10% → 6,000.00 · total 66,000.00 · no per-paycheck rows', () => {
    const r = run({ mode: 'percent', salary: 60_000, pct: 10 });
    expect(m(r.bonus)).toBe('$6,000.00');
    expect(m(r.total)).toBe('$66,000.00');
    expect(r.perCheck).toBeNull();
    expect(r.payPerCheck).toBeNull();
  });

  it('#2 target 60,000 × 10% × 120% → 7,200.00 · 12% · total 67,200.00', () => {
    const r = run({ mode: 'target', salary: 60_000, target: 10, ach: 120 });
    expect(m(r.bonus)).toBe('$7,200.00');
    expect(formatPct(r.ofSalary!)).toBe('12%');
    expect(m(r.total)).toBe('$67,200.00');
  });

  it('#3 fixed 5,000 on 60,000 → 8.33% of salary · total 65,000.00', () => {
    const r = run({ mode: 'fixed', salary: 60_000, amount: 5_000 });
    expect(m(r.bonus)).toBe('$5,000.00');
    expect(formatPct(r.ofSalary!)).toBe('8.33%');
    expect(m(r.total)).toBe('$65,000.00');
  });

  it('#4 percent 60,000 × 10% over 12 paychecks → 500.00 each · pay per paycheck 5,500.00', () => {
    const r = run({ mode: 'percent', salary: 60_000, pct: 10, checks: 12 });
    expect(m(r.perCheck!)).toBe('$500.00');
    expect(m(r.payPerCheck!)).toBe('$5,500.00');
  });

  it('#5 INR target ₹12,00,000 × 10% × 120% over 26 → ₹1,44,000.00 · ₹13,44,000.00 · ₹5,538.46 · ₹51,692.31', () => {
    const s = switchBonusCurrency({ ...bonusDefaults, mode: 'target' }, 'INR');
    expect(s.salary).toBe(1_200_000);
    const r = bonus(toCalcInput({ ...s, checks: 26 }));
    expect(m(r.bonus, 'INR')).toBe('₹1,44,000.00');
    expect(formatPct(r.ofSalary!)).toBe('12%');
    expect(m(r.total, 'INR')).toBe('₹13,44,000.00');
    expect(m(r.perCheck!, 'INR')).toBe('₹5,538.46');
    expect(m(r.payPerCheck!, 'INR')).toBe('₹51,692.31');
  });

  it('#6 GBP fixed £3,000 on £40,000 → 7.5% · total £43,000.00', () => {
    const s = switchBonusCurrency({ ...bonusDefaults, mode: 'fixed' }, 'GBP');
    const r = bonus(toCalcInput(s));
    expect(m(r.bonus, 'GBP')).toBe('£3,000.00');
    expect(formatPct(r.ofSalary!)).toBe('7.5%');
    expect(m(r.total, 'GBP')).toBe('£43,000.00');
  });

  it('#7 target with 0% achievement → bonus 0.00 · 0% · total = salary', () => {
    const r = run({ mode: 'target', salary: 60_000, target: 10, ach: 0 });
    expect(m(r.bonus)).toBe('$0.00');
    expect(formatPct(r.ofSalary!)).toBe('0%');
    expect(m(r.total)).toBe('$60,000.00');
  });

  it('#8 USD → GBP without editing: salary and amount move, percentages stay; a typed salary is kept', () => {
    const g = switchBonusCurrency(bonusDefaults, 'GBP');
    expect([g.salary, g.amount, g.pct, g.target, g.ach, g.checks]).toEqual([40_000, 3_000, 10, 10, 120, 0]);
    const typed = switchBonusCurrency({ ...bonusDefaults, salary: 75_000 }, 'GBP', new Set(['salary']));
    expect(typed.salary).toBe(75_000);
    expect(typed.amount).toBe(3_000);
  });
});

describe('edge cases', () => {
  it('the default is a lump sum (Puru, 2026-11-21)', () => {
    expect(bonusDefaults.checks).toBe(0);
    expect(run({}).perCheck).toBeNull();
  });

  it('salary 0: percent → 0.00 (valid); fixed → % of salary hidden (no ÷ 0)', () => {
    expect(errs({ salary: 0 })).toEqual({});
    expect(run({ mode: 'percent', salary: 0 }).bonus).toBe(0);
    expect(run({ mode: 'fixed', salary: 0 }).ofSalary).toBeNull();
  });

  it('percentages over 1,000 and negatives → field errors; paychecks must be whole and ≤ 365', () => {
    expect(errs({ pct: 1_001 }).pct).toBe('Maximum is 1,000%');
    expect(errs({ mode: 'target', ach: -1 }).ach).toBe('Can’t be negative');
    expect(errs({ checks: 2.5 }).checks).toBe('Enter a whole number');
    expect(errs({ checks: 366 }).checks).toBe('Maximum is 365');
    // Fields of other modes never block.
    expect(errs({ mode: 'percent', amount: -1, ach: -1 })).toEqual({});
  });

  it('huge values stay finite', () => {
    const r = run({ mode: 'target', salary: 1_000_000_000, target: 1_000, ach: 1_000, checks: 1 });
    expect(Number.isFinite(r.bonus)).toBe(true);
    expect(m(r.bonus)).not.toMatch(/e\+|NaN|Infinity/);
  });
});
