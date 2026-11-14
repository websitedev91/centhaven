import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { roundTo, formatMoney, formatNumber } from '@/lib/format';
import { calcHourlyRate, NO_BILLABLE_HOURS, INVALID_TAX_RATE, type HourlyRateInput } from './calc';
import { fieldErrors, hourlyRateDefaults, hourlyRateSchema, toCalcInput, planBSchema, planBDefaults } from './schema';

function ok(input: HourlyRateInput) {
  const r = calcHourlyRate(input);
  if (!r.ok) throw new Error(`expected a result, got: ${r.error}`);
  return r;
}

const r2 = (n: number) => roundTo(n, 2);

// Spec test cases — must match exactly, rounded to 2 decimals.
describe('spec test cases', () => {
  it('#1 income 60,000 · expenses 6,000 · tax 25% · 6 weeks off · 40 h/wk · 75% billable', () => {
    const r = ok({ targetIncome: 60_000, expenses: 6_000, taxRate: 0.25, weeksOff: 6, hoursPerWeek: 40, billablePct: 0.75 });
    expect(r2(r.grossNeeded)).toBe(86_000.0);
    expect(r2(r.billableHours)).toBe(1_380);
    expect(r2(r.hourlyRate)).toBe(62.32);
    expect(r2(r.dayRate)).toBe(498.55);
    expect(r2(r.monthlyRevenue)).toBe(7_166.67);
  });

  it('#2 income 1,200,000 · expenses 120,000 · tax 10% · 4 weeks off · 40 h/wk · 60% billable', () => {
    const r = ok({ targetIncome: 1_200_000, expenses: 120_000, taxRate: 0.1, weeksOff: 4, hoursPerWeek: 40, billablePct: 0.6 });
    expect(r2(r.grossNeeded)).toBe(1_453_333.33);
    expect(r2(r.billableHours)).toBe(1_152);
    expect(r2(r.hourlyRate)).toBe(1_261.57);
    expect(r2(r.dayRate)).toBe(10_092.59);
    expect(r2(r.monthlyRevenue)).toBe(121_111.11);
  });

  it('#3 income 50,000 · no expenses · 0% tax · 2 weeks off · 30 h/wk · 100% billable', () => {
    const r = ok({ targetIncome: 50_000, expenses: 0, taxRate: 0, weeksOff: 2, hoursPerWeek: 30, billablePct: 1 });
    expect(r2(r.grossNeeded)).toBe(50_000.0);
    expect(r2(r.billableHours)).toBe(1_500);
    expect(r2(r.hourlyRate)).toBe(33.33);
    expect(r2(r.dayRate)).toBe(200.0);
    expect(r2(r.monthlyRevenue)).toBe(4_166.67);
  });

  it('#4a weeks off 27 (above the schema max of 26) gives an inline schema error, no crash', () => {
    const state = { ...hourlyRateDefaults, weeksOff: 27 };
    expect(hourlyRateSchema.safeParse(state).success).toBe(false);
    expect(fieldErrors(hourlyRateSchema, state)).toEqual({ weeksOff: 'Maximum is 26 weeks off' });
    expect(fieldErrors(planBSchema, { ...planBDefaults, weeksOff: 27 })).toEqual({ weeksOff: 'Maximum is 26 weeks off' });
  });

  it('#4b calc() with zero billable hours returns the guard error, no divide-by-zero', () => {
    const base = { targetIncome: 60_000, expenses: 6_000, taxRate: 0.25, hoursPerWeek: 40, billablePct: 0.75 };
    expect(calcHourlyRate({ ...base, weeksOff: 52 })).toEqual({ ok: false, error: NO_BILLABLE_HOURS });
    expect(calcHourlyRate({ ...base, weeksOff: 6, hoursPerWeek: 0 })).toEqual({ ok: false, error: NO_BILLABLE_HOURS });
    expect(calcHourlyRate({ ...base, weeksOff: 6, billablePct: 0 })).toEqual({ ok: false, error: NO_BILLABLE_HOURS });
    expect(calcHourlyRate({ ...base, weeksOff: 60 })).toEqual({ ok: false, error: NO_BILLABLE_HOURS });
  });
});

describe('extra checks', () => {
  it('per-hour split adds up to the hourly rate', () => {
    const r = ok(toCalcInput(hourlyRateDefaults));
    expect(r.perHour.takeHome + r.perHour.tax + r.perHour.expenses).toBeCloseTo(r.hourlyRate, 10);
    expect(r.taxPerYear).toBeCloseTo(20_000, 10);
  });

  it('guards a tax rate of 100% or more', () => {
    expect(calcHourlyRate({ ...toCalcInput(hourlyRateDefaults), taxRate: 1 })).toEqual({ ok: false, error: INVALID_TAX_RATE });
  });

  it('accepts the defaults and rejects out-of-range values', () => {
    expect(hourlyRateSchema.safeParse(hourlyRateDefaults).success).toBe(true);
    expect(fieldErrors(hourlyRateSchema, { ...hourlyRateDefaults, taxRate: 61 }).taxRate).toBe('Maximum is 60%');
    expect(fieldErrors(hourlyRateSchema, { ...hourlyRateDefaults, billablePct: 5 }).billablePct).toBe('Minimum is 10%');
    expect(fieldErrors(hourlyRateSchema, { ...hourlyRateDefaults, hoursPerWeek: 0 }).hoursPerWeek).toBe('Minimum is 1 hour');
    expect(fieldErrors(hourlyRateSchema, { ...hourlyRateDefaults, targetIncome: -1 }).targetIncome).toBeDefined();
    expect(fieldErrors(hourlyRateSchema, { ...hourlyRateDefaults, currency: 'XYZ' }).currency).toBeDefined();
  });

  it('the schema range never allows zero billable hours', () => {
    const worst = { ...hourlyRateDefaults, weeksOff: 26, hoursPerWeek: 1, billablePct: 10 };
    expect(hourlyRateSchema.safeParse(worst).success).toBe(true);
    expect(ok(toCalcInput(worst)).billableHours).toBeGreaterThan(0);
  });
});

describe('content.mdx worked examples match the calculator', () => {
  const mdx = readFileSync(join(__dirname, 'content.mdx'), 'utf8');
  const cases = [
    { currency: 'USD' as const, input: { targetIncome: 60_000, expenses: 6_000, taxRate: 0.25, weeksOff: 6, hoursPerWeek: 40, billablePct: 0.75 } },
    { currency: 'INR' as const, input: { targetIncome: 1_200_000, expenses: 120_000, taxRate: 0.1, weeksOff: 4, hoursPerWeek: 40, billablePct: 0.6 } },
    { currency: 'GBP' as const, input: { targetIncome: 50_000, expenses: 0, taxRate: 0, weeksOff: 2, hoursPerWeek: 30, billablePct: 1 } },
  ];
  it.each(cases)('$currency example', ({ currency, input }) => {
    const r = ok(input);
    for (const text of [
      formatMoney(r.hourlyRate, currency),
      formatMoney(r.dayRate, currency),
      formatMoney(r.grossNeeded, currency),
      formatMoney(r.monthlyRevenue, currency),
      formatNumber(r.billableHours),
    ]) {
      expect(mdx, `content.mdx should contain "${text}"`).toContain(text);
    }
  });
});
