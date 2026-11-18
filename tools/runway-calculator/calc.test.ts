import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { formatMoney, roundTo, type CurrencyCode } from '@/lib/format';
import { cashPath, formatMonths, runway } from './calc';
import { fieldErrors, runwayDefaults, runwaySchema, switchRunwayCurrency, toCalcInput } from './schema';

const run = (cash: number, costs: number, revenue = 0, target = 0) => runway(toCalcInput({ cash, costs, revenue, target }));

describe('spec test cases', () => {
  it('#1 $120,000 · $25,000 costs · $10,000 revenue → net burn $15,000, 8.0 months, 4.8 on costs alone', () => {
    const r = run(120_000, 25_000, 10_000);
    expect(r.netBurn).toBe(15_000);
    expect(r.runway).toBe(8);
    expect(r.grossRunway).toBe(4.8);
  });

  it('#2 case 1 + 12-month target → max burn $10,000, cut $5,000 a month', () => {
    const r = run(120_000, 25_000, 10_000, 12);
    expect(r.maxBurn).toBe(10_000);
    expect(r.cutNeeded).toBe(5_000);
  });

  it('#3 $50,000 · $10,000 · no revenue → 5.0 months', () => {
    expect(run(50_000, 10_000).runway).toBe(5);
  });

  it('#4 $100,000 · $30,000 → 3.3 months, about 3 months and 10 days', () => {
    const r = run(100_000, 30_000);
    expect(roundTo(r.runway!, 1)).toBe(3.3);
    expect([r.wholeMonths, r.extraDays]).toEqual([3, 10]);
  });

  it('#5 ₹50,00,000 · ₹8,00,000 · ₹3,00,000 → net burn ₹5,00,000, 10.0 months', () => {
    const r = run(5_000_000, 800_000, 300_000);
    expect(r.netBurn).toBe(500_000);
    expect(r.runway).toBe(10);
  });
});

describe('edge cases', () => {
  it('revenue ≥ costs → not burning, no runway number', () => {
    for (const r of [run(100_000, 10_000, 10_000), run(100_000, 10_000, 15_000)]) {
      expect(r.notBurning).toBe(true);
      expect(r.runway).toBeNull();
    }
  });

  it('costs 0 → not burning, no gross runway', () => {
    const r = run(100_000, 0);
    expect(r.notBurning).toBe(true);
    expect(r.grossRunway).toBeNull();
  });

  it('cash 0 → runway 0 months', () => {
    expect(run(0, 10_000).runway).toBe(0);
  });

  it('target already met → no cut needed', () => {
    expect(run(120_000, 25_000, 10_000, 6).cutNeeded).toBe(0);
  });

  it.each([
    ['cash', -1],
    ['costs', -1],
    ['revenue', -1],
    ['target', -1],
    ['target', 121],
  ] as const)('%s = %s → field error', (key, value) => {
    expect(fieldErrors(runwaySchema, { ...runwayDefaults, [key]: value })[key]).toBeDefined();
  });

  it('the chart path runs from the cash to 0 (≤ 61 points)', () => {
    const p = cashPath(120_000, 15_000);
    expect(p[0]).toEqual({ month: 0, value: 120_000 });
    expect(p.at(-1)).toEqual({ month: 8, value: 0 });
    expect(cashPath(1_000_000, 1_000).length).toBeLessThanOrEqual(61);
    expect(cashPath(1_000, 0)).toEqual([]);
  });
});

describe('currency defaults', () => {
  it('untouched fields follow the currency; typed values are kept', () => {
    expect(switchRunwayCurrency(runwayDefaults, 'INR')).toMatchObject({ cash: 5_000_000, costs: 800_000, revenue: 300_000 });
    expect(switchRunwayCurrency({ ...runwayDefaults, cash: 90_000 }, 'INR')).toMatchObject({ cash: 90_000, costs: 800_000 });
  });
});

describe('content.mdx worked examples match the calculator', () => {
  const mdx = readFileSync(join(__dirname, 'content.mdx'), 'utf8');
  const has = (t: string) => expect(mdx, `content.mdx should contain "${t}"`).toContain(t);
  const m = (n: number, c: CurrencyCode = 'USD') => formatMoney(n, c);
  const mo = formatMonths;

  it('the five examples', () => {
    const a = run(120_000, 25_000, 10_000, 12);
    [m(a.netBurn), mo(a.runway!), mo(a.grossRunway!), m(a.maxBurn!), m(a.cutNeeded!)].forEach(has);
    has(mo(run(50_000, 10_000).runway!));
    const d = run(100_000, 30_000);
    [mo(d.runway!), `about ${d.wholeMonths} months and ${d.extraDays} days`].forEach(has);
    const e = run(5_000_000, 800_000, 300_000);
    [m(e.netBurn, 'INR'), mo(e.runway!)].forEach(has);
  });
});

describe('an empty number box (reported as NaN)', () => {
  it('is a field error, so the result waits instead of using the last value', () => {
    expect(fieldErrors(runwaySchema, { ...runwayDefaults, revenue: Number.NaN }).revenue).toBe('Enter a number');
  });
});
