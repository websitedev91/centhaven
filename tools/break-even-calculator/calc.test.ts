import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { formatMoney, formatNumber, formatPercent, roundTo, type CurrencyCode } from '@/lib/format';
import { parseQuery, toQuery } from '@/lib/url-state';
import { breakEven, breakEvenLines, ceilSales, PRICE_NOT_ABOVE_COST, type BreakEvenError, type BreakEvenInput, type BreakEvenResult } from './calc';
import {
  breakEvenDefaults,
  breakEvenSchema,
  breakEvenVariant,
  fieldErrors,
  planBSchema,
  switchBreakEvenCurrency,
  toCalcInput,
} from './schema';

function ok(r: BreakEvenResult | BreakEvenError): BreakEvenResult {
  if (!r.ok) throw new Error(`expected a result, got: ${r.error}`);
  return r;
}
const r2 = (n: number) => roundTo(n, 2);

describe('spec test cases', () => {
  it('#1 fixed 10,000 · price 50 · variable 30 · target profit 5,000', () => {
    const r = ok(breakEven({ fixedCosts: 10_000, price: 50, variableCost: 30, targetProfit: 5_000 }));
    expect(r2(r.contribution)).toBe(20);
    expect(roundTo(r.marginRatio * 100, 2)).toBe(40);
    expect(ceilSales(r.breakEvenUnits)).toBe(500);
    expect(r2(r.breakEvenRevenue)).toBe(25_000);
    expect(ceilSales(r.targetUnits)).toBe(750);
  });

  it('#2 fixed 3,000 · price 99 · variable 39.50 · profit 0 → exact 50.42, 51 units', () => {
    const r = ok(breakEven({ fixedCosts: 3_000, price: 99, variableCost: 39.5, targetProfit: 0 }));
    expect(r2(r.contribution)).toBe(59.5);
    expect(roundTo(r.marginRatio * 100, 2)).toBe(60.1);
    expect(r2(r.breakEvenUnits)).toBe(50.42);
    expect(ceilSales(r.breakEvenUnits)).toBe(51);
    expect(r2(r.breakEvenRevenue)).toBe(4_991.6);
  });

  it('#3 price 30 · variable 30 → error message, no crash', () => {
    expect(breakEven({ fixedCosts: 10_000, price: 30, variableCost: 30, targetProfit: 0 })).toEqual({
      ok: false,
      error: PRICE_NOT_ABOVE_COST,
    });
    expect(breakEven({ fixedCosts: 10_000, price: 20, variableCost: 30, targetProfit: 0 }).ok).toBe(false);
  });
});

describe('other checks', () => {
  it('rounds up only real fractions, never float noise', () => {
    expect(ceilSales(500)).toBe(500);
    expect(ceilSales(500.0000000001)).toBe(500);
    expect(ceilSales(500.01)).toBe(501);
    expect(ceilSales(0)).toBe(0);
  });

  it('zero fixed costs break even at zero sales', () => {
    const r = ok(breakEven({ fixedCosts: 0, price: 10, variableCost: 4, targetProfit: 0 }));
    expect(ceilSales(r.breakEvenUnits)).toBe(0);
    expect(r2(r.breakEvenRevenue)).toBe(0);
  });

  it('the FAQ example: price 55 lowers break-even to 400', () => {
    expect(ceilSales(ok(breakEven({ fixedCosts: 10_000, price: 55, variableCost: 30, targetProfit: 0 })).breakEvenUnits)).toBe(400);
  });

  it('chart lines cross at the break-even point', () => {
    const input: BreakEvenInput = { fixedCosts: 10_000, price: 50, variableCost: 30, targetProfit: 0 };
    const lines = breakEvenLines(input, 1_000, 20);
    expect(lines).toHaveLength(21);
    const mid = lines.find((p) => p.units === 500)!;
    expect(r2(mid.revenue)).toBe(r2(mid.totalCost));
    expect(lines[0]).toEqual({ units: 0, revenue: 0, totalCost: 10_000 });
  });

  it('validates ranges with friendly messages', () => {
    expect(fieldErrors(breakEvenSchema, { ...breakEvenDefaults, price: 0, fixedCosts: -1 })).toEqual({
      fixedCosts: 'Fixed costs can’t be negative',
      price: 'Minimum is 0.01',
    });
    expect(fieldErrors(planBSchema, { priceChange: -95 })).toEqual({ priceChange: 'Minimum is −90%' });
  });

  it('passes UI state straight to the calc', () => {
    expect(toCalcInput(breakEvenDefaults)).toEqual({ fixedCosts: 10_000, price: 50, variableCost: 30, targetProfit: 0 });
  });
});

describe('currency-dependent defaults', () => {
  const usd = breakEvenDefaults;

  it('page-load defaults are the spec defaults (USD, units)', () => {
    expect(usd).toEqual({ sells: 'units', currency: 'USD', fixedCosts: 10_000, price: 50, variableCost: 30, targetProfit: 0 });
  });

  it('INR uses the spec presets; typed values are kept', () => {
    expect(switchBreakEvenCurrency(usd, 'INR')).toEqual({ ...usd, currency: 'INR', fixedCosts: 100_000, price: 5_000, variableCost: 2_000 });
    const typed = { ...usd, price: 80, sells: 'projects' as const };
    expect(switchBreakEvenCurrency(typed, 'INR')).toEqual({ ...typed, currency: 'INR', fixedCosts: 100_000, variableCost: 2_000 });
    const inr = switchBreakEvenCurrency(usd, 'INR');
    expect(breakEvenSchema.safeParse(inr).success).toBe(true);
  });

  it('share links stay short and restore the currency defaults', () => {
    const inr = switchBreakEvenCurrency(usd, 'INR');
    expect(toQuery(inr, usd, breakEvenVariant)).toBe('?currency=INR');
    expect(parseQuery('?currency=INR&sells=clients', breakEvenSchema, usd, breakEvenVariant)).toEqual({ ...inr, sells: 'clients' });
  });
});

describe('content.mdx worked examples match the calculator', () => {
  const mdx = readFileSync(join(__dirname, 'content.mdx'), 'utf8');
  const cases: { input: BreakEvenInput; currency: CurrencyCode }[] = [
    { input: { fixedCosts: 10_000, price: 50, variableCost: 30, targetProfit: 5_000 }, currency: 'USD' },
    { input: { fixedCosts: 3_000, price: 99, variableCost: 39.5, targetProfit: 0 }, currency: 'GBP' },
    { input: { fixedCosts: 100_000, price: 5_000, variableCost: 2_000, targetProfit: 50_000 }, currency: 'INR' },
  ];
  it.each(cases)('$currency example', ({ input, currency }) => {
    const r = ok(breakEven(input));
    const texts = [
      `**${formatMoney(r.contribution, currency)}**`,
      `**${formatPercent(r.marginRatio, 2)}**`,
      `**${formatNumber(ceilSales(r.breakEvenUnits))}**`,
      `**${formatMoney(r.breakEvenRevenue, currency)}**`,
    ];
    if (r.breakEvenUnits % 1 > 1e-9) texts.push(`**${formatNumber(r.breakEvenUnits, 2)}**`);
    if (input.targetProfit > 0) texts.push(`**${formatNumber(ceilSales(r.targetUnits))}**`);
    for (const text of texts) expect(mdx, `content.mdx should contain "${text}"`).toContain(text);
  });
});
