import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { formatMoney, formatNumber, roundTo, type CurrencyCode } from '@/lib/format';
import { parseQuery, toQuery } from '@/lib/url-state';
import { commonWagesTable, hourlyToSalary, NO_HOURS, quickTable, salaryToHourly, type PayError, type PayResult } from './calc';
import {
  fieldErrors,
  hourlyToSalaryDefaults,
  hourlyToSalarySchema,
  hourlyToSalaryVariant,
  overtimeOf,
  switchHourlyToSalaryCurrency,
} from './schema';

function ok(r: PayResult | PayError): PayResult {
  if (!r.ok) throw new Error(`expected a result, got: ${r.error}`);
  return r;
}
const r2 = (n: number) => roundTo(n, 2);

describe('spec test cases', () => {
  it('#1 hourly 25 · 40 h · 5 days · 52 weeks', () => {
    const r = ok(hourlyToSalary({ hourly: 25, hoursPerWeek: 40, daysPerWeek: 5, paidWeeks: 52 }));
    expect(r2(r.annual)).toBe(52_000);
    expect(r2(r.monthly)).toBe(4_333.33);
    expect(r2(r.biweekly)).toBe(2_000);
    expect(r2(r.weekly)).toBe(1_000);
    expect(r2(r.daily)).toBe(200);
    expect(r2(r.semimonthly)).toBe(2_166.67);
    expect(r.hoursPerYear).toBe(2_080);
  });

  it('#2 reverse: salary 75,000 · 40 h · 52 weeks → hourly 36.06', () => {
    const r = ok(salaryToHourly({ annual: 75_000, hoursPerWeek: 40, daysPerWeek: 5, paidWeeks: 52 }));
    expect(r2(r.hourly)).toBe(36.06);
    expect(r2(r.annual)).toBe(75_000);
  });

  it('#3 hourly 20 · 37.5 h · 5 days · 50 weeks, and the reverse of 37,500', () => {
    const r = ok(hourlyToSalary({ hourly: 20, hoursPerWeek: 37.5, daysPerWeek: 5, paidWeeks: 50 }));
    expect(r2(r.annual)).toBe(37_500);
    expect(r2(r.monthly)).toBe(3_125);
    expect(r2(r.daily)).toBe(150);
    const back = ok(salaryToHourly({ annual: 37_500, hoursPerWeek: 37.5, daysPerWeek: 5, paidWeeks: 50 }));
    expect(r2(back.hourly)).toBe(20);
  });

  it('#4 hours per week 0 gives a validation error, no crash', () => {
    const state = { ...hourlyToSalaryDefaults, hoursPerWeek: 0 };
    expect(fieldErrors(hourlyToSalarySchema, state)).toEqual({ hoursPerWeek: 'Minimum is 1 hour' });
    expect(hourlyToSalary({ hourly: 25, hoursPerWeek: 0, daysPerWeek: 5, paidWeeks: 52 })).toEqual({ ok: false, error: NO_HOURS });
    expect(salaryToHourly({ annual: 50_000, hoursPerWeek: 0, daysPerWeek: 5, paidWeeks: 52 })).toEqual({ ok: false, error: NO_HOURS });
  });
});

describe('edge cases', () => {
  it('a zero wage gives zero pay, not an error', () => {
    expect(r2(ok(hourlyToSalary({ hourly: 0, hoursPerWeek: 40, daysPerWeek: 5, paidWeeks: 52 })).annual)).toBe(0);
  });

  it('rejects out-of-range inputs with friendly messages', () => {
    const e = fieldErrors(hourlyToSalarySchema, { ...hourlyToSalaryDefaults, daysPerWeek: 8, paidWeeks: 53, hourly: -1 });
    expect(e).toEqual({ hourly: 'Wage can’t be negative', daysPerWeek: 'Maximum is 7 days', paidWeeks: 'Maximum is 52 weeks' });
  });

  it('round-trips hourly → salary → hourly', () => {
    const p = { hoursPerWeek: 42, daysPerWeek: 6, paidWeeks: 48 };
    const a = ok(hourlyToSalary({ hourly: 17.35, ...p }));
    expect(r2(ok(salaryToHourly({ annual: a.annual, ...p })).hourly)).toBe(17.35);
  });
});

describe('quick table', () => {
  it('shows yearly pay at 30, 35, 40 and 45 hours for a wage', () => {
    expect(quickTable('hourly', 25, 52).map((r) => [r.hoursPerWeek, r2(r.value)])).toEqual([
      [30, 39_000],
      [35, 45_500],
      [40, 52_000],
      [45, 58_500],
    ]);
  });

  it('shows the hourly value of a salary at each of those hours', () => {
    expect(quickTable('salary', 75_000, 52).map((r) => r2(r.value))).toEqual([48.08, 41.21, 36.06, 32.05]);
  });
});

describe('currency-dependent defaults', () => {
  const usd = hourlyToSalaryDefaults;

  it('page-load defaults are the spec defaults (USD)', () => {
    expect(usd).toEqual({
      mode: 'hourly',
      currency: 'USD',
      hourly: 25,
      salary: 75_000,
      hoursPerWeek: 40,
      daysPerWeek: 5,
      paidWeeks: 52,
      overtime: 0,
      otHours: 5,
      otMultiplier: 1.5,
    });
  });

  it.each([
    ['CAD', 25, 75_000],
    ['AUD', 25, 75_000],
    ['GBP', 15, 45_000],
    ['EUR', 15, 45_000],
    ['INR', 500, 1_000_000],
  ] as const)('untouched amounts switch to %s defaults', (cur, hourly, salary) => {
    const next = switchHourlyToSalaryCurrency(usd, cur);
    expect(next).toEqual({ ...usd, currency: cur, hourly, salary });
    expect(hourlyToSalarySchema.safeParse(next).success).toBe(true);
  });

  it('keeps typed values and never changes hours, days, weeks or direction', () => {
    const typed = { ...usd, mode: 'salary' as const, hourly: 31, hoursPerWeek: 35, paidWeeks: 48 };
    expect(switchHourlyToSalaryCurrency(typed, 'INR')).toEqual({ ...typed, currency: 'INR', salary: 1_000_000 });
  });

  it('share links stay short and restore the currency defaults', () => {
    const inr = switchHourlyToSalaryCurrency(usd, 'INR');
    expect(toQuery(inr, usd, hourlyToSalaryVariant)).toBe('?currency=INR');
    expect(parseQuery('?currency=INR&mode=salary', hourlyToSalarySchema, usd, hourlyToSalaryVariant)).toEqual({
      ...inr,
      mode: 'salary',
    });
  });
});

describe('content.mdx worked examples match the calculator', () => {
  const mdx = readFileSync(join(__dirname, 'content.mdx'), 'utf8');
  const cases: { currency: CurrencyCode; hourly: number; hoursPerWeek: number }[] = [
    { currency: 'USD', hourly: 25, hoursPerWeek: 40 },
    { currency: 'GBP', hourly: 15, hoursPerWeek: 37.5 },
    { currency: 'INR', hourly: 500, hoursPerWeek: 40 },
  ];
  it.each(cases)('$currency example', ({ currency, hourly, hoursPerWeek }) => {
    const r = ok(hourlyToSalary({ hourly, hoursPerWeek, daysPerWeek: 5, paidWeeks: 52 }));
    for (const text of [
      formatMoney(r.annual, currency),
      formatMoney(r.monthly, currency),
      formatMoney(r.biweekly, currency),
      formatMoney(r.weekly, currency),
      formatMoney(r.daily, currency),
      formatNumber(r.hoursPerYear),
    ]) {
      expect(mdx, `content.mdx should contain "${text}"`).toContain(text);
    }
  });

  it('salary → hourly example', () => {
    const r = ok(salaryToHourly({ annual: 75_000, hoursPerWeek: 40, daysPerWeek: 5, paidWeeks: 52 }));
    expect(mdx).toContain(formatMoney(r.hourly, 'USD'));
  });
});

describe('review C7: semi-monthly, overtime and common wages', () => {
  const p = { hoursPerWeek: 40, daysPerWeek: 5, paidWeeks: 52 };

  it('semi-monthly is annual ÷ 24 (75,000 salary → 3,125.00)', () => {
    expect(r2(ok(salaryToHourly({ annual: 75_000, ...p })).semimonthly)).toBe(3_125);
  });

  it('overtime: 25/h · 40 h + 5 h at 1.5× · 52 weeks (hand-checked)', () => {
    const r = ok(hourlyToSalary({ hourly: 25, ...p, overtime: { hoursPerWeek: 5, multiplier: 1.5 } }));
    expect(r2(r.weekly)).toBe(1_187.5);
    expect(r2(r.baseAnnual)).toBe(52_000);
    expect(r2(r.overtimeAnnual)).toBe(9_750);
    expect(r2(r.annual)).toBe(61_750);
    expect(r2(r.monthly)).toBe(5_145.83);
    expect(r2(r.biweekly)).toBe(2_375);
    expect(r2(r.semimonthly)).toBe(2_572.92);
    expect(r2(r.daily)).toBe(237.5);
    expect(r.overtimeHoursPerYear).toBe(260);
    expect(r.hoursPerYear).toBe(2_080);
  });

  it('overtime: 20/h · 37.5 h + 2 h at 2× · 50 weeks (hand-checked)', () => {
    const r = ok(hourlyToSalary({ hourly: 20, hoursPerWeek: 37.5, daysPerWeek: 5, paidWeeks: 50, overtime: { hoursPerWeek: 2, multiplier: 2 } }));
    expect(r2(r.weekly)).toBe(830);
    expect(r2(r.overtimeAnnual)).toBe(4_000);
    expect(r2(r.annual)).toBe(41_500);
    expect(r2(r.semimonthly)).toBe(1_729.17);
  });

  it('overtime is off by default and ignored in salary mode', () => {
    expect(hourlyToSalaryDefaults.overtime).toBe(0);
    expect(overtimeOf(hourlyToSalaryDefaults)).toBeUndefined();
    expect(overtimeOf({ ...hourlyToSalaryDefaults, overtime: 1 })).toEqual({ hoursPerWeek: 5, multiplier: 1.5 });
    expect(overtimeOf({ ...hourlyToSalaryDefaults, overtime: 1, mode: 'salary' })).toBeUndefined();
    expect(toQuery(hourlyToSalaryDefaults, hourlyToSalaryDefaults, hourlyToSalaryVariant)).toBe('');
    expect(fieldErrors(hourlyToSalarySchema, { ...hourlyToSalaryDefaults, overtime: 2, otMultiplier: 4 })).toEqual({
      overtime: 'Use 0 or 1',
      otMultiplier: 'Maximum is 3×',
    });
  });

  it('common wages table: 15 to 50 in 5s at 2,080 hours', () => {
    expect(commonWagesTable().map((r) => [r.hourly, r.annual])).toEqual([
      [15, 31_200],
      [20, 41_600],
      [25, 52_000],
      [30, 62_400],
      [35, 72_800],
      [40, 83_200],
      [45, 93_600],
      [50, 104_000],
    ]);
    expect(r2(commonWagesTable()[2]!.monthly)).toBe(4_333.33);
  });
});
