import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { formatMoney, type CurrencyCode } from '@/lib/format';
import { budget, compare, leftOver, totalsHundred } from './calc';
import { budgetDefaults, fieldErrors, budgetSchema, pctOf, switchBudgetCurrency, totalError, type BudgetState } from './schema';

const m = (n: number, c: CurrencyCode = 'USD') => formatMoney(n, c);
const split = (pay: number, needs: number, wants: number, savings: number) => budget({ pay, pct: { needs, wants, savings } });
const totalErr = (patch: Partial<BudgetState>) => {
  const s = { ...budgetDefaults, ...patch };
  return totalError(s, fieldErrors(budgetSchema, s));
};

describe('spec test cases', () => {
  it('#1 4,000 at 50/30/20 → 2,000 / 1,200 / 800 (a year 24,000 / 14,400 / 9,600)', () => {
    const r = split(4_000, 50, 30, 20);
    expect([m(r.needs), m(r.wants), m(r.savings)]).toEqual(['$2,000.00', '$1,200.00', '$800.00']);
    expect([m(r.needs * 12), m(r.wants * 12), m(r.savings * 12)]).toEqual(['$24,000.00', '$14,400.00', '$9,600.00']);
  });

  it('the USD defaults give case 1', () => {
    const r = budget({ pay: budgetDefaults.pay, pct: pctOf(budgetDefaults) });
    expect(m(r.savings)).toBe('$800.00');
  });

  it('#2 3,500 at 60/30/10 → 2,100 / 1,050 / 350', () => {
    const r = split(3_500, 60, 30, 10);
    expect([m(r.needs), m(r.wants), m(r.savings)]).toEqual(['$2,100.00', '$1,050.00', '$350.00']);
  });

  it('#3 50/30/25 → "Your percentages add up to 105%. They need to total 100%."', () => {
    expect(totalErr({ save: 25 })).toBe('Your percentages add up to 105%. They need to total 100%.');
    expect(totalErr({})).toBeNull();
  });

  it('#4 actual 2,300 / 1,000 / 700 → needs 300 over, wants 200 under, savings 100 below, left over 0', () => {
    const r = split(4_000, 50, 30, 20);
    expect(compare(2_300, r.needs)).toEqual({ diff: 300, status: 'over' });
    expect(compare(1_000, r.wants)).toEqual({ diff: -200, status: 'under' });
    expect(compare(700, r.savings)).toEqual({ diff: -100, status: 'under' });
    expect(m(leftOver(4_000, { needs: 2_300, wants: 1_000, savings: 700 }))).toBe('$0.00');
  });

  it('#5 INR ₹80,000 → ₹40,000.00 / ₹24,000.00 / ₹16,000.00', () => {
    const r = split(80_000, 50, 30, 20);
    expect([m(r.needs, 'INR'), m(r.wants, 'INR'), m(r.savings, 'INR')]).toEqual(['₹40,000.00', '₹24,000.00', '₹16,000.00']);
  });

  it('#6 33.33 / 33.33 / 33.34 totals 100 → 999.90 / 999.90 / 1,000.20', () => {
    expect(totalsHundred({ needs: 33.33, wants: 33.33, savings: 33.34 })).toBe(true);
    expect(totalErr({ needs: 33.33, wants: 33.33, save: 33.34 })).toBeNull();
    const r = split(3_000, 33.33, 33.33, 33.34);
    expect([m(r.needs), m(r.wants), m(r.savings)]).toEqual(['$999.90', '$999.90', '$1,000.20']);
  });

  it('#7 USD → GBP without editing: pay 4,000 → 2,800; percentages stay; a typed pay is kept', () => {
    const g = switchBudgetCurrency(budgetDefaults, 'GBP');
    expect([g.pay, g.needs, g.wants, g.save]).toEqual([2_800, 50, 30, 20]);
    expect(switchBudgetCurrency({ ...budgetDefaults, pay: 5_000 }, 'GBP').pay).toBe(5_000);
    expect(switchBudgetCurrency(budgetDefaults, 'GBP', new Set(['pay'])).pay).toBe(4_000);
  });
});

describe('edge cases', () => {
  it('pay 0 and a 0% bucket are valid', () => {
    expect(split(0, 50, 30, 20).needs).toBe(0);
    expect(totalErr({ needs: 70, wants: 30, save: 0 })).toBeNull();
  });

  it('on plan within half a cent; savings above plan', () => {
    expect(compare(800.004, 800).status).toBe('on');
    expect(compare(900, 800).status).toBe('over');
  });

  it('a % over 100 or negative is its own field error; the total message waits for valid boxes', () => {
    const s = { ...budgetDefaults, needs: 120 };
    expect(fieldErrors(budgetSchema, s).needs).toBe('Maximum is 100%');
    expect(totalError(s, fieldErrors(budgetSchema, s))).toBeNull();
    expect(fieldErrors(budgetSchema, { ...budgetDefaults, wants: -1 }).wants).toBe('Can’t be negative');
  });

  it('huge values stay finite', () => {
    expect(m(split(1_000_000_000, 50, 30, 20).needs)).not.toMatch(/e\+|NaN|Infinity/);
  });
});

describe('content.mdx worked examples match the calculator', () => {
  const mdx = readFileSync(join(__dirname, 'content.mdx'), 'utf8');
  const has = (t: string) => expect(mdx, `content.mdx should contain "${t}"`).toContain(t);

  it('cases 1, 2, 4 and 5', () => {
    const a = split(4_000, 50, 30, 20);
    [m(a.needs), m(a.wants), m(a.savings)].forEach(has);
    const b = split(3_500, 60, 30, 10);
    [m(b.needs), m(b.wants), m(b.savings)].forEach(has);
    ['$300.00', '$200.00', '$100.00'].forEach(has);
    const c = split(80_000, 50, 30, 20);
    [m(c.needs, 'INR'), m(c.wants, 'INR'), m(c.savings, 'INR')].forEach(has);
  });
});
