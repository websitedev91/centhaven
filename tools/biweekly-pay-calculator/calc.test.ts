import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { formatMoney, type CurrencyCode } from '@/lib/format';
import { biweeklyPay } from './calc';
import { biweeklyDefaults, biweeklyErrors, switchBiweeklyCurrency, toCalcInput, type BiweeklyState } from './schema';

const m = (n: number, c: CurrencyCode = 'USD') => formatMoney(n, c);
const run = (patch: Partial<BiweeklyState>) => biweeklyPay(toCalcInput({ ...biweeklyDefaults, ...patch }));

describe('spec test cases', () => {
  it('#1 salary 52,000 → 2,000.00 · 1,925.93 · 2,166.67 · 4,333.33 · 1,000.00', () => {
    const r = run({ mode: 'salary', salary: 52_000 });
    expect(m(r.biweekly)).toBe('$2,000.00');
    expect(m(r.twentySeven)).toBe('$1,925.93');
    expect(m(r.semiMonthly)).toBe('$2,166.67');
    expect(m(r.monthly)).toBe('$4,333.33');
    expect(m(r.weekly)).toBe('$1,000.00');
  });

  it('#2 hourly 25 × 40 → 2,000.00 · yearly 52,000.00 · 27 paydays 54,000.00', () => {
    const r = run({ mode: 'hourly', rate: 25, hours: 40 });
    expect(m(r.biweekly)).toBe('$2,000.00');
    expect(m(r.yearly)).toBe('$52,000.00');
    expect(m(r.twentySeven)).toBe('$54,000.00');
  });

  it('#3 + 4 overtime hours at 37.50 → overtime 150.00 · 2,150.00 · yearly 55,900.00', () => {
    const r = run({ mode: 'hourly', rate: 25, hours: 40, otH: 4, otRate: 37.5 });
    expect(m(r.overtime)).toBe('$150.00');
    expect(m(r.biweekly)).toBe('$2,150.00');
    expect(m(r.yearly)).toBe('$55,900.00');
  });

  it('#4 INR salary ₹12,00,000 → ₹46,153.85 · ₹44,444.44 · ₹50,000.00 · ₹1,00,000.00', () => {
    const r = run({ mode: 'salary', salary: 1_200_000 });
    expect(m(r.biweekly, 'INR')).toBe('₹46,153.85');
    expect(m(r.twentySeven, 'INR')).toBe('₹44,444.44');
    expect(m(r.semiMonthly, 'INR')).toBe('₹50,000.00');
    expect(m(r.monthly, 'INR')).toBe('₹1,00,000.00');
  });

  it('#5 GBP hourly £18.50 × 37.5 → £1,387.50 · yearly £36,075.00', () => {
    const r = run({ mode: 'hourly', rate: 18.5, hours: 37.5 });
    expect(m(r.biweekly, 'GBP')).toBe('£1,387.50');
    expect(m(r.yearly, 'GBP')).toBe('£36,075.00');
  });

  it('#6 USD → GBP without editing: 52,000 → 36,000, 25 → 18.50, hours stay; a typed salary is kept', () => {
    const g = switchBiweeklyCurrency(biweeklyDefaults, 'GBP');
    expect([g.salary, g.rate, g.hours]).toEqual([36_000, 18.5, 40]);
    expect(switchBiweeklyCurrency({ ...biweeklyDefaults, salary: 60_000 }, 'GBP').salary).toBe(60_000);
    expect(switchBiweeklyCurrency(biweeklyDefaults, 'GBP', new Set(['salary'])).salary).toBe(52_000);
  });
});

describe('edge cases', () => {
  const errs = (patch: Partial<BiweeklyState>) => biweeklyErrors({ ...biweeklyDefaults, ...patch });

  it('0 everywhere is valid and 0.00', () => {
    expect(run({ mode: 'salary', salary: 0 }).biweekly).toBe(0);
    expect(run({ mode: 'hourly', rate: 0, hours: 0 }).yearly).toBe(0);
    expect(errs({ salary: 0 })).toEqual({});
  });

  it('hours over 168 or negative → field error; hidden boxes never block', () => {
    expect(errs({ mode: 'hourly', hours: 169 }).hours).toBe('Maximum is 168 hours');
    expect(errs({ mode: 'hourly', rate: -1 }).rate).toBe('Can’t be negative');
    expect(errs({ mode: 'salary', rate: Number.NaN })).toEqual({});
    expect(errs({ mode: 'hourly', salary: Number.NaN })).toEqual({});
  });

  it('overtime hours with a rate of 0 → overtime 0.00', () => {
    expect(run({ mode: 'hourly', otH: 4, otRate: 0 }).overtime).toBe(0);
  });

  it('huge values stay finite', () => {
    const r = run({ mode: 'hourly', rate: 1_000_000, hours: 168, otH: 336, otRate: 1_000_000 });
    expect(m(r.yearly)).not.toMatch(/e\+|NaN|Infinity/);
  });
});

describe('content.mdx worked examples match the calculator', () => {
  const mdx = readFileSync(join(__dirname, 'content.mdx'), 'utf8');
  const has = (t: string) => expect(mdx, `content.mdx should contain "${t}"`).toContain(t);

  it('cases 1, 2 and 4', () => {
    const a = run({ mode: 'salary', salary: 52_000 });
    [m(a.biweekly), m(a.twentySeven), m(a.semiMonthly)].forEach(has);
    const b = run({ mode: 'hourly', rate: 25, hours: 40 });
    [m(b.yearly), m(b.twentySeven)].forEach(has);
    const c = run({ mode: 'salary', salary: 1_200_000 });
    [m(c.biweekly, 'INR'), m(c.semiMonthly, 'INR')].forEach(has);
  });
});
