import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { formatMoney, formatPercent, roundTo, type CurrencyCode } from '@/lib/format';
import { parseQuery, toQuery } from '@/lib/url-state';
import { monthlySchedule, NO_LIFE, SALVAGE_ABOVE_COST, straightLine, type MonthRow, type DepreciationError, type DepreciationInput, type DepreciationResult } from './calc';
import {
  depreciationDefaults,
  depreciationSchema,
  depreciationVariant,
  fieldErrors,
  switchDepreciationCurrency,
  toCalcInput,
} from './schema';

function ok(r: DepreciationResult | DepreciationError): DepreciationResult {
  if (!r.ok) throw new Error(`expected a result, got: ${r.error}`);
  return r;
}
const r2 = (n: number) => roundTo(n, 2);

const CASES: { input: DepreciationInput; currency: CurrencyCode }[] = [
  { input: { cost: 1_500, salvage: 300, lifeYears: 3, firstYearMonths: 12 }, currency: 'USD' },
  { input: { cost: 50_000, salvage: 5_000, lifeYears: 5, firstYearMonths: 6 }, currency: 'GBP' },
  { input: { cost: 100_000, salvage: 0, lifeYears: 4, firstYearMonths: 12 }, currency: 'INR' },
];

describe('spec test cases', () => {
  it('#1 cost 1,500 · salvage 300 · 3 years · 12 months', () => {
    const r = ok(straightLine(CASES[0]!.input));
    expect(r2(r.annual)).toBe(400);
    expect(r2(r.monthly)).toBe(33.33);
    expect(roundTo(r.rate * 100, 2)).toBe(33.33);
    expect(r.schedule.map((y) => r2(y.bookValue))).toEqual([1_100, 700, 300]);
  });

  it('#2 cost 50,000 · salvage 5,000 · 5 years · 6 months in year 1', () => {
    const r = ok(straightLine(CASES[1]!.input));
    expect(r2(r.annual)).toBe(9_000);
    expect(r.schedule.map((y) => [y.year, r2(y.depreciation), r2(y.bookValue)])).toEqual([
      [1, 4_500, 45_500],
      [2, 9_000, 36_500],
      [3, 9_000, 27_500],
      [4, 9_000, 18_500],
      [5, 9_000, 9_500],
      [6, 4_500, 5_000],
    ]);
  });

  it('#3 cost 1,00,000 · salvage 0 · 4 years · 12 months', () => {
    const r = ok(straightLine(CASES[2]!.input));
    expect(r2(r.annual)).toBe(25_000);
    expect(r2(r.monthly)).toBe(2_083.33);
    expect(r.schedule.map((y) => r2(y.bookValue))).toEqual([75_000, 50_000, 25_000, 0]);
  });

  it('#4 salvage 2,000 with cost 1,500 → error, no crash', () => {
    expect(straightLine({ ...CASES[0]!.input, salvage: 2_000 })).toEqual({ ok: false, error: SALVAGE_ABOVE_COST });
  });
});

describe('other checks', () => {
  it('ends exactly on the salvage value, even with awkward numbers', () => {
    const r = ok(straightLine({ cost: 1_000, salvage: 1, lifeYears: 7, firstYearMonths: 5 }));
    const last = r.schedule.at(-1)!;
    expect(last.bookValue).toBe(1);
    expect(last.accumulated).toBe(999);
    expect(r.schedule).toHaveLength(8);
  });

  it('salvage equal to cost depreciates nothing', () => {
    const r = ok(straightLine({ cost: 500, salvage: 500, lifeYears: 2, firstYearMonths: 12 }));
    expect(r.schedule.every((y) => y.depreciation === 0 && y.bookValue === 500)).toBe(true);
  });

  it('guards and validates', () => {
    expect(straightLine({ ...CASES[0]!.input, lifeYears: 0 })).toEqual({ ok: false, error: NO_LIFE });
    expect(fieldErrors(depreciationSchema, { ...depreciationDefaults, lifeYears: 2.5, firstYearMonths: 13, cost: 0 })).toEqual({
      cost: 'Minimum is 0.01',
      lifeYears: 'Use whole years',
      firstYearMonths: 'Maximum is 12 months',
    });
  });

  it('passes UI state straight to the calc', () => {
    expect(toCalcInput(depreciationDefaults)).toEqual(CASES[0]!.input);
  });
});

describe('currency-dependent defaults', () => {
  const usd = depreciationDefaults;

  it.each([
    ['CAD', 1_500, 300],
    ['AUD', 1_500, 300],
    ['GBP', 1_200, 200],
    ['EUR', 1_200, 200],
    ['INR', 100_000, 10_000],
  ] as const)('untouched cost and salvage switch to %s defaults', (cur, cost, salvage) => {
    const next = switchDepreciationCurrency(usd, cur);
    expect(next).toEqual({ ...usd, currency: cur, cost, salvage });
    expect(depreciationSchema.safeParse(next).success).toBe(true);
  });

  it('keeps typed values and never changes life or months', () => {
    const typed = { ...usd, cost: 2_400, lifeYears: 4, firstYearMonths: 3 };
    expect(switchDepreciationCurrency(typed, 'INR')).toEqual({ ...typed, currency: 'INR', salvage: 10_000 });
  });

  it('share links stay short and restore the currency defaults', () => {
    const inr = switchDepreciationCurrency(usd, 'INR');
    expect(toQuery(inr, usd, depreciationVariant)).toBe('?currency=INR');
    expect(parseQuery('?currency=INR&lifeYears=5', depreciationSchema, usd, depreciationVariant)).toEqual({ ...inr, lifeYears: 5 });
  });
});

describe('content.mdx', () => {
  const mdx = readFileSync(join(__dirname, 'content.mdx'), 'utf8');

  it.each(CASES)('$currency worked example matches the calculator', ({ input, currency }) => {
    const r = ok(straightLine(input));
    const texts = [`**${formatMoney(r.annual, currency)}**`, ...r.schedule.map((y) => `**${formatMoney(y.bookValue, currency)}**`)];
    if (input.firstYearMonths === 12) texts.push(`**${formatMoney(r.monthly, currency)}**`);
    if (currency === 'USD') texts.push(`**${formatPercent(r.rate, 2)}**`);
    for (const text of new Set(texts.filter((t) => !(input.firstYearMonths < 12 && /36,500|27,500|18,500|9,500/.test(t))))) {
      expect(mdx, `content.mdx should contain "${text}"`).toContain(text);
    }
  });

  it('says "accounting method, not tax depreciation" near the top (Puru)', () => {
    const top = mdx.slice(0, 700);
    expect(top).toContain('Accounting method, not tax depreciation');
  });
});

describe('review #2 B4: monthly schedule (hand-checked)', () => {
  const months = (input: DepreciationInput): MonthRow[] => {
    const m = monthlySchedule(input);
    if (!Array.isArray(m)) throw new Error(m.error);
    return m;
  };

  it('#1: 36 months of 33.33; book value 1,466.67 after month 1, 1,100 after month 12, 300 at the end', () => {
    const m = months(CASES[0]!.input);
    expect(m).toHaveLength(36);
    expect(r2(m[0]!.depreciation)).toBe(33.33);
    expect([m[0]!, m[11]!, m[35]!].map((x) => r2(x.bookValue))).toEqual([1_466.67, 1_100, 300]);
    expect([m[11]!.year, m[12]!.year, m[35]!.year]).toEqual([1, 2, 3]);
  });

  it('#2 (6 months in year 1): 60 months of 750; months 1–6 are year 1, 55–60 are year 6', () => {
    const m = months(CASES[1]!.input);
    expect(m).toHaveLength(60);
    expect(r2(m[0]!.depreciation)).toBe(750);
    expect([m[5]!.year, m[6]!.year, m[53]!.year, m[54]!.year, m[59]!.year]).toEqual([1, 2, 5, 6, 6]);
    expect([m[5]!, m[59]!].map((x) => r2(x.bookValue))).toEqual([45_500, 5_000]);
  });

  it.each(CASES.map((c) => [c.currency, c.input] as const))('%s: months add up to each yearly row', (_c, input) => {
    const yearly = ok(straightLine(input)).schedule;
    const m = months(input);
    for (const y of yearly) {
      const sum = m.filter((x) => x.year === y.year).reduce((a, x) => a + x.depreciation, 0);
      expect(r2(sum)).toBe(r2(y.depreciation));
      expect(r2(m.filter((x) => x.year === y.year).at(-1)!.bookValue)).toBe(r2(y.bookValue));
    }
    expect(m.at(-1)!.bookValue).toBe(input.salvage);
  });

  it('passes errors through', () => {
    expect(monthlySchedule({ ...CASES[0]!.input, salvage: 2_000 })).toEqual({ ok: false, error: SALVAGE_ABOVE_COST });
  });
});
