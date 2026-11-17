import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { roundTo, formatMoney, formatNumber } from '@/lib/format';
import { calcHourlyRate, NO_BILLABLE_HOURS, INVALID_TAX_RATE, type HourlyRateInput } from './calc';
import { parseQuery, toQuery } from '@/lib/url-state';
import {
  fieldErrors,
  hourlyRateDefaults,
  hourlyRateSchema,
  hourlyRateVariant,
  planBDefaults,
  planBSchema,
  switchHourlyRateCurrency,
  toCalcInput,
} from './schema';

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

describe('currency-dependent defaults', () => {
  const usd = hourlyRateDefaults;

  it('page-load defaults are the USD preset', () => {
    expect(usd).toMatchObject({ currency: 'USD', targetIncome: 60_000, expenses: 6_000, taxRate: 25 });
  });

  it.each([
    ['CAD', 60_000, 6_000, 25],
    ['AUD', 60_000, 6_000, 25],
    ['GBP', 45_000, 4_500, 25],
    ['EUR', 45_000, 4_500, 25],
    ['INR', 1_200_000, 120_000, 10],
  ] as const)('untouched values switch to %s defaults', (cur, income, expenses, tax) => {
    const next = switchHourlyRateCurrency(usd, cur);
    expect(next).toEqual({ ...usd, currency: cur, targetIncome: income, expenses, taxRate: tax });
    expect(hourlyRateSchema.safeParse(next).success).toBe(true);
  });

  it('keeps values the user typed and switches the rest', () => {
    const typed = { ...usd, targetIncome: 90_000 };
    expect(switchHourlyRateCurrency(typed, 'INR')).toEqual({
      ...usd,
      currency: 'INR',
      targetIncome: 90_000,
      expenses: 120_000,
      taxRate: 10,
    });
    const allTyped = { ...usd, targetIncome: 70_000, expenses: 5_000, taxRate: 30 };
    expect(switchHourlyRateCurrency(allTyped, 'GBP')).toEqual({ ...allTyped, currency: 'GBP' });
  });

  it('never changes time inputs', () => {
    const s = { ...usd, weeksOff: 10, hoursPerWeek: 30, billablePct: 60 };
    expect(switchHourlyRateCurrency(s, 'INR')).toMatchObject({ weeksOff: 10, hoursPerWeek: 30, billablePct: 60 });
  });

  it('INR → GBP → USD round-trips to the original defaults', () => {
    const back = switchHourlyRateCurrency(switchHourlyRateCurrency(switchHourlyRateCurrency(usd, 'INR'), 'GBP'), 'USD');
    expect(back).toEqual(usd);
  });

  it('shared links use the linked currency defaults', () => {
    expect(parseQuery('?currency=INR', hourlyRateSchema, usd, hourlyRateVariant)).toEqual(
      switchHourlyRateCurrency(usd, 'INR'),
    );
    expect(parseQuery('?currency=GBP&targetIncome=50000', hourlyRateSchema, usd, hourlyRateVariant)).toMatchObject({
      currency: 'GBP',
      targetIncome: 50_000,
      expenses: 4_500,
    });
  });

  it('share links stay short: currency defaults are not written to the URL', () => {
    const inr = switchHourlyRateCurrency(usd, 'INR');
    expect(toQuery(inr, usd, hourlyRateVariant)).toBe('?currency=INR');
    expect(toQuery({ ...inr, targetIncome: 900_000 }, usd, hourlyRateVariant)).toBe('?currency=INR&targetIncome=900000');
    expect(toQuery(usd, usd, hourlyRateVariant)).toBe('');
    const round = parseQuery(toQuery({ ...inr, expenses: 50_000 }, usd, hourlyRateVariant), hourlyRateSchema, usd, hourlyRateVariant);
    expect(round).toEqual({ ...inr, expenses: 50_000 });
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

describe('buffer for slow months (review C6)', () => {
  const base = { targetIncome: 60_000, expenses: 6_000, taxRate: 0.25, weeksOff: 6, hoursPerWeek: 40, billablePct: 0.75 };

  it('10% buffer: 62.32 → 68.55 an hour, day rate 548.41 (hand-checked: 86,000 ÷ 1,380 × 1.1)', () => {
    const r = ok({ ...base, buffer: 0.1 });
    expect(r2(r.hourlyRate)).toBe(62.32);
    expect(r2(r.bufferedRate)).toBe(68.55);
    expect(r2(r.bufferedDayRate)).toBe(548.41);
  });

  it('25% buffer: 77.90 an hour', () => {
    expect(r2(ok({ ...base, buffer: 0.25 }).bufferedRate)).toBe(77.9);
  });

  it('no buffer (default) leaves the rate unchanged', () => {
    const r = ok(base);
    expect(r.bufferedRate).toBe(r.hourlyRate);
    expect(r.bufferedDayRate).toBe(r.dayRate);
  });

  it('defaults to 0, stays out of share links, and is validated 0–50%', () => {
    expect(hourlyRateDefaults.buffer).toBe(0);
    expect(toQuery(hourlyRateDefaults, hourlyRateDefaults, hourlyRateVariant)).toBe('');
    expect(toQuery({ ...hourlyRateDefaults, buffer: 10 }, hourlyRateDefaults, hourlyRateVariant)).toBe('?buffer=10');
    expect(fieldErrors(hourlyRateSchema, { ...hourlyRateDefaults, buffer: 51 })).toEqual({ buffer: 'Maximum is 50%' });
    expect(toCalcInput({ ...hourlyRateDefaults, buffer: 10 }).buffer).toBe(0.1);
  });
});
