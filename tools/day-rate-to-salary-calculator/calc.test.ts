import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { formatMoney, formatNumber, roundTo, type CurrencyCode } from '@/lib/format';
import { parseQuery, toQuery } from '@/lib/url-state';
import {
  billableDays,
  dayRateToSalary,
  NO_BILLABLE_DAYS,
  salaryToDayRate,
  type DayRateError,
  type DayRateResult,
  type DaysInput,
} from './calc';
import {
  dayRateDefaults,
  dayRateSchema,
  dayRateVariant,
  fieldErrors,
  planBDefaults,
  planBSchema,
  switchDayRateCurrency,
  toDaysInput,
} from './schema';

function ok(r: DayRateResult | DayRateError): DayRateResult {
  if (!r.ok) throw new Error(`expected a result, got: ${r.error}`);
  return r;
}
const r2 = (n: number) => roundTo(n, 2);
const DEFAULT_DAYS: DaysInput = { workingDays: 260, holidays: 25, publicHolidays: 8, sickDays: 5, gapDays: 10, uplift: 0.2 };

describe('spec test cases', () => {
  it('#1 day 500 · defaults (260/25/8/5/10) · uplift 20%', () => {
    const r = ok(dayRateToSalary({ dayRate: 500, ...DEFAULT_DAYS }));
    expect(r.billableDays).toBe(212);
    expect(r2(r.annualIncome)).toBe(106_000);
    expect(r2(r.equivalentSalary)).toBe(88_333.33);
  });

  it('#2 reverse: salary 60,000 · defaults · uplift 20% → day rate 339.62', () => {
    const r = ok(salaryToDayRate({ salary: 60_000, ...DEFAULT_DAYS }));
    expect(r2(r.dayRate)).toBe(339.62);
    expect(r2(r.equivalentSalary)).toBe(60_000);
  });

  it('#3 day 400 · 260 working · 20 holidays · 0 public · 0 sick · 20 gap · uplift 0%', () => {
    const r = ok(
      dayRateToSalary({ dayRate: 400, workingDays: 260, holidays: 20, publicHolidays: 0, sickDays: 0, gapDays: 20, uplift: 0 }),
    );
    expect(r.billableDays).toBe(220);
    expect(r2(r.annualIncome)).toBe(88_000);
    expect(r2(r.equivalentSalary)).toBe(88_000);
  });

  it('#4 holidays 60 + sick 30 + gap 120 + public 20 with 200 working days → "Add some billable days"', () => {
    const days: DaysInput = { workingDays: 200, holidays: 60, publicHolidays: 20, sickDays: 30, gapDays: 120, uplift: 0.2 };
    expect(dayRateToSalary({ dayRate: 500, ...days })).toEqual({ ok: false, error: NO_BILLABLE_DAYS });
    expect(salaryToDayRate({ salary: 60_000, ...days })).toEqual({ ok: false, error: NO_BILLABLE_DAYS });
    // Every input is inside its own range, so the schema accepts it; the calc guard catches it.
    const state = { ...dayRateDefaults, workingDays: 200, holidays: 60, publicHolidays: 20, sickDays: 30, gapDays: 120 };
    expect(fieldErrors(dayRateSchema, state)).toEqual({});
  });
});

describe('other checks', () => {
  it('derives monthly and hourly figures', () => {
    const r = ok(dayRateToSalary({ dayRate: 500, ...DEFAULT_DAYS }));
    expect(r2(r.monthlyIncome)).toBe(8_833.33);
    expect(r2(r.hourlyEquivalent)).toBe(62.5);
  });

  it('round-trips rate → salary → rate', () => {
    const a = ok(dayRateToSalary({ dayRate: 612.5, ...DEFAULT_DAYS }));
    expect(r2(ok(salaryToDayRate({ salary: a.equivalentSalary, ...DEFAULT_DAYS })).dayRate)).toBe(612.5);
  });

  it('exactly zero billable days is an error, not a divide by zero', () => {
    expect(billableDays({ ...DEFAULT_DAYS, workingDays: 200, holidays: 60, publicHolidays: 20, sickDays: 0, gapDays: 120 })).toBe(0);
    expect(salaryToDayRate({ salary: 1, ...DEFAULT_DAYS, workingDays: 200, holidays: 60, publicHolidays: 20, sickDays: 0, gapDays: 120 }).ok).toBe(false);
  });

  it('validates ranges with friendly messages', () => {
    expect(fieldErrors(dayRateSchema, { ...dayRateDefaults, workingDays: 199, uplift: 51 })).toEqual({
      workingDays: 'Minimum is 200 days',
      uplift: 'Maximum is 50%',
    });
    expect(fieldErrors(planBSchema, { rateChange: -60, gapDays: 0 })).toEqual({ rateChange: 'Minimum is −50%' });
  });

  it('converts UI percentages for the calc', () => {
    expect(toDaysInput(dayRateDefaults)).toEqual(DEFAULT_DAYS);
  });

  it('plan B default: 10% lower rate, no gaps (the content example)', () => {
    const b = ok(dayRateToSalary({ dayRate: 500 * (1 + planBDefaults.rateChange / 100), ...DEFAULT_DAYS, gapDays: planBDefaults.gapDays }));
    expect(b.billableDays).toBe(222);
    expect(r2(b.annualIncome)).toBe(99_900);
  });
});

describe('currency-dependent defaults', () => {
  const gbp = dayRateDefaults;

  it('page-load defaults are the spec defaults (GBP)', () => {
    expect(gbp).toMatchObject({ mode: 'rate', currency: 'GBP', dayRate: 500, salary: 60_000, workingDays: 260, uplift: 20 });
  });

  it.each([
    ['USD', 500, 60_000],
    ['EUR', 500, 60_000],
    ['CAD', 500, 60_000],
    ['AUD', 500, 60_000],
    ['INR', 8_000, 1_500_000],
  ] as const)('untouched amounts switch to %s defaults', (cur, dayRate, salary) => {
    const next = switchDayRateCurrency(gbp, cur);
    expect(next).toEqual({ ...gbp, currency: cur, dayRate, salary });
    expect(dayRateSchema.safeParse(next).success).toBe(true);
  });

  it('keeps typed values and never changes days, uplift or direction', () => {
    const typed = { ...gbp, mode: 'salary' as const, salary: 72_000, gapDays: 30, uplift: 15 };
    expect(switchDayRateCurrency(typed, 'INR')).toEqual({ ...typed, currency: 'INR', dayRate: 8_000 });
  });

  it('share links stay short and restore the currency defaults', () => {
    const inr = switchDayRateCurrency(gbp, 'INR');
    expect(toQuery(inr, gbp, dayRateVariant)).toBe('?currency=INR');
    expect(parseQuery('?currency=INR&gapDays=20', dayRateSchema, gbp, dayRateVariant)).toEqual({ ...inr, gapDays: 20 });
  });
});

describe('content.mdx worked examples match the calculator', () => {
  const mdx = readFileSync(join(__dirname, 'content.mdx'), 'utf8');
  const cases: { currency: CurrencyCode; dayRate: number }[] = [
    { currency: 'GBP', dayRate: 500 },
    { currency: 'USD', dayRate: 800 },
    { currency: 'INR', dayRate: 8_000 },
  ];
  it.each(cases)('$currency example', ({ currency, dayRate }) => {
    const r = ok(dayRateToSalary({ dayRate, ...DEFAULT_DAYS }));
    for (const text of [
      formatMoney(r.annualIncome, currency),
      formatMoney(r.monthlyIncome, currency),
      formatMoney(r.equivalentSalary, currency),
      formatMoney(r.hourlyEquivalent, currency),
      formatNumber(r.billableDays),
    ]) {
      expect(mdx, `content.mdx should contain "${text}"`).toContain(text);
    }
  });

  it('salary → day rate example', () => {
    expect(mdx).toContain(formatMoney(ok(salaryToDayRate({ salary: 60_000, ...DEFAULT_DAYS })).dayRate, 'GBP'));
  });
});
