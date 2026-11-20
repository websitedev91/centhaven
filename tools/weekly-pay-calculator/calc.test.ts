import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { formatMoney, type CurrencyCode } from '@/lib/format';
import { weeklyPay } from './calc';
import { switchWeeklyCurrency, toCalcInput, weeklyDefaults, weeklyErrors, type WeeklyState } from './schema';
import { biweeklyPay } from '@/tools/biweekly-pay-calculator/calc';

const m = (n: number, c: CurrencyCode = 'USD') => formatMoney(n, c);
const run = (patch: Partial<WeeklyState>) => weeklyPay(toCalcInput({ ...weeklyDefaults, ...patch }));

describe('spec test cases', () => {
  it('#1 salary 52,000 → 1,000.00 · 53-payday split 981.13 · biweekly 2,000.00 · monthly 4,333.33', () => {
    const r = run({ mode: 'salary', salary: 52_000 });
    expect(m(r.weekly)).toBe('$1,000.00');
    expect(m(r.fiftyThree)).toBe('$981.13');
    expect(m(r.biweekly)).toBe('$2,000.00');
    expect(m(r.monthly)).toBe('$4,333.33');
  });

  it('#2 hourly 25 × 40 → 1,000.00 · yearly 52,000.00 · 53-payday year 53,000.00', () => {
    const r = run({ mode: 'hourly', rate: 25, hours: 40 });
    expect(m(r.weekly)).toBe('$1,000.00');
    expect(m(r.yearly)).toBe('$52,000.00');
    expect(m(r.fiftyThree)).toBe('$53,000.00');
  });

  it('#3 + 5 overtime hours at 37.50 → 187.50 · 1,187.50 · 61,750.00 · 2,375.00 · 5,145.83', () => {
    const r = run({ mode: 'hourly', rate: 25, hours: 40, otH: 5, otRate: 37.5 });
    expect(m(r.overtime)).toBe('$187.50');
    expect(m(r.weekly)).toBe('$1,187.50');
    expect(m(r.yearly)).toBe('$61,750.00');
    expect(m(r.biweekly)).toBe('$2,375.00');
    expect(m(r.monthly)).toBe('$5,145.83');
  });

  it('#4 INR ₹12,00,000 → ₹23,076.92 · biweekly ₹46,153.85 (same as the Biweekly Pay tool) · monthly ₹1,00,000.00', () => {
    const r = run({ mode: 'salary', salary: 1_200_000 });
    expect(m(r.weekly, 'INR')).toBe('₹23,076.92');
    expect(m(r.biweekly, 'INR')).toBe('₹46,153.85');
    expect(m(r.monthly, 'INR')).toBe('₹1,00,000.00');
    const bi = biweeklyPay({ mode: 'salary', salary: 1_200_000, rate: 0, hoursPerWeek: 0, overtimeHours: 0, overtimeRate: 0 });
    expect(m(bi.biweekly, 'INR')).toBe(m(r.biweekly, 'INR'));
  });

  it('#5 GBP £18.50 × 37.5 → £693.75 · yearly £36,075.00', () => {
    const r = run({ mode: 'hourly', rate: 18.5, hours: 37.5 });
    expect(m(r.weekly, 'GBP')).toBe('£693.75');
    expect(m(r.yearly, 'GBP')).toBe('£36,075.00');
  });

  it('#6 USD → GBP without editing: 52,000 → 36,000, 25 → 18.50, hours stay; a typed salary is kept', () => {
    const g = switchWeeklyCurrency(weeklyDefaults, 'GBP');
    expect([g.salary, g.rate, g.hours]).toEqual([36_000, 18.5, 40]);
    expect(switchWeeklyCurrency({ ...weeklyDefaults, salary: 60_000 }, 'GBP').salary).toBe(60_000);
    expect(switchWeeklyCurrency(weeklyDefaults, 'GBP', new Set(['salary'])).salary).toBe(52_000);
  });
});

describe('edge cases', () => {
  const errs = (patch: Partial<WeeklyState>) => weeklyErrors({ ...weeklyDefaults, ...patch });

  it('0 everywhere is valid', () => {
    expect(run({ mode: 'salary', salary: 0 }).weekly).toBe(0);
    expect(run({ mode: 'hourly', rate: 0, hours: 0 }).yearly).toBe(0);
  });

  it('hours over 168, negatives → field errors; hidden boxes never block', () => {
    expect(errs({ mode: 'hourly', hours: 169 }).hours).toBe('Maximum is 168 hours');
    expect(errs({ mode: 'hourly', otH: 169 }).otH).toBe('Maximum is 168 hours');
    expect(errs({ mode: 'hourly', rate: -1 }).rate).toBe('Can’t be negative');
    expect(errs({ mode: 'salary', rate: Number.NaN })).toEqual({});
  });

  it('overtime hours with a rate of 0 → overtime 0', () => {
    expect(run({ mode: 'hourly', otH: 5, otRate: 0 }).overtime).toBe(0);
  });

  it('huge values stay finite', () => {
    expect(m(run({ mode: 'hourly', rate: 1_000_000, hours: 168, otH: 168, otRate: 1_000_000 }).yearly)).not.toMatch(/e\+|NaN|Infinity/);
  });
});

describe('content.mdx worked examples match the calculator', () => {
  const mdx = readFileSync(join(__dirname, 'content.mdx'), 'utf8');
  const has = (t: string) => expect(mdx, `content.mdx should contain "${t}"`).toContain(t);

  it('cases 1, 3 and 4', () => {
    const a = run({ mode: 'salary', salary: 52_000 });
    [m(a.weekly), m(a.fiftyThree), m(a.biweekly)].forEach(has);
    const b = run({ mode: 'hourly', rate: 25, hours: 40, otH: 5, otRate: 37.5 });
    [m(b.overtime), m(b.weekly), m(b.yearly)].forEach(has);
    const c = run({ mode: 'salary', salary: 1_200_000 });
    [m(c.weekly, 'INR'), m(c.monthly, 'INR')].forEach(has);
  });
});
