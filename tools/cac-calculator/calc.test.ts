import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { formatMoney, roundTo, type CurrencyCode } from '@/lib/format';
import { cac, formatRatio } from './calc';
import { cacDefaults, cacSchema, fieldErrors, switchCacCurrency, toCalcInput } from './schema';

const run = (mkt: number, sales: number, cust: number, ltv = 0, target = 0) => cac(toCalcInput({ mkt, sales, cust, ltv, target }));
const m = (n: number, c: CurrencyCode = 'USD') => formatMoney(n, c);

describe('spec test cases', () => {
  it('#1 8,000 + 4,000 · 60 customers · LTV 900 · target 3 → CAC 200, 4.5 : 1, 700 left, meets target', () => {
    const r = run(8_000, 4_000, 60, 900, 3);
    expect(r.spend).toBe(12_000);
    expect(r.cac).toBe(200);
    expect(formatRatio(r.ratio!)).toBe('4.5 : 1');
    expect(r.leftOver).toBe(700);
    expect(r.meetsTarget).toBe(true);
  });

  it('#2 5,000 · 40 customers · LTV 300 · target 3 → CAC 125, 2.4 : 1, max CAC 100, 50 customers', () => {
    const r = run(5_000, 0, 40, 300, 3);
    expect(r.cac).toBe(125);
    expect(formatRatio(r.ratio!)).toBe('2.4 : 1');
    expect(r.leftOver).toBe(175);
    expect(r.meetsTarget).toBe(false);
    expect(r.maxCac).toBe(100);
    expect(r.customersNeeded).toBe(50);
  });

  it('#3 ₹4,00,000 + ₹2,00,000 · 150 · LTV ₹18,000 → ₹6,00,000.00 spend, ₹4,000.00 CAC, 4.5 : 1', () => {
    const r = run(400_000, 200_000, 150, 18_000);
    expect(m(r.spend, 'INR')).toBe('₹6,00,000.00');
    expect(m(r.cac, 'INR')).toBe('₹4,000.00');
    expect(formatRatio(r.ratio!)).toBe('4.5 : 1');
  });

  it('#4 1,000 · 3 customers · no LTV → CAC 333.33, LTV section off', () => {
    const r = run(1_000, 0, 3);
    expect(m(r.cac)).toBe('$333.33');
    expect([r.ratio, r.leftOver, r.maxCac, r.customersNeeded, r.meetsTarget]).toEqual([null, null, null, null, null]);
  });

  it('#5 10,000 · 20 · LTV 400 · target 3 → CAC 500, 0.8 : 1, −100 left, max CAC 133.33, 75 customers', () => {
    const r = run(10_000, 0, 20, 400, 3);
    expect(r.cac).toBe(500);
    expect(formatRatio(r.ratio!)).toBe('0.8 : 1');
    expect(r.leftOver).toBe(-100);
    expect(roundTo(r.maxCac!, 2)).toBe(133.33);
    expect(r.customersNeeded).toBe(75);
  });

  it('#6 USD → GBP untouched: 6,000 / 3,000 / 675, CAC £150, same ratio; a typed value is kept', () => {
    const g = switchCacCurrency(cacDefaults, 'GBP');
    expect(g).toMatchObject({ mkt: 6_000, sales: 3_000, ltv: 675, cust: 60, target: 3 });
    const r = cac(toCalcInput(g));
    expect(r.cac).toBe(150);
    expect(formatRatio(r.ratio!)).toBe('4.5 : 1');
    expect(switchCacCurrency({ ...cacDefaults, mkt: 9_500 }, 'GBP')).toMatchObject({ mkt: 9_500, sales: 3_000 });
  });
});

describe('edge cases', () => {
  it('no spend → CAC 0 and no ratio (never Infinity)', () => {
    const r = run(0, 0, 10, 500, 3);
    expect(r.cac).toBe(0);
    expect(r.ratio).toBeNull();
    expect(r.meetsTarget).toBeNull();
  });

  it('target 0 → no target line', () => {
    const r = run(8_000, 4_000, 60, 900, 0);
    expect([r.maxCac, r.customersNeeded, r.meetsTarget]).toEqual([null, null, null]);
  });

  it.each([
    ['cust', 0, 'Enter at least 1 customer'],
    ['cust', 2.5, 'Enter a whole number'],
    ['mkt', -1, undefined],
    ['sales', -1, undefined],
    ['ltv', -1, undefined],
    ['target', -1, undefined],
    ['target', 101, undefined],
  ] as const)('%s = %s → field error', (key, value, message) => {
    const e = fieldErrors(cacSchema, { ...cacDefaults, [key]: value })[key];
    expect(e).toBeDefined();
    if (message) expect(e).toBe(message);
  });

  it('huge values stay finite', () => {
    const r = run(10_000_000_000, 10_000_000_000, 1, 10_000_000_000, 100);
    expect(Number.isFinite(r.cac) && Number.isFinite(r.ratio!) && Number.isFinite(r.customersNeeded!)).toBe(true);
  });

  it('an empty number box (NaN) is "Enter a number"', () => {
    expect(fieldErrors(cacSchema, { ...cacDefaults, cust: Number.NaN }).cust).toBe('Enter a number');
  });
});

describe('currency defaults', () => {
  it('INR presets', () => {
    expect(switchCacCurrency(cacDefaults, 'INR')).toMatchObject({ mkt: 400_000, sales: 200_000, ltv: 18_000, cust: 60 });
  });
});

describe('content.mdx worked examples match the calculator', () => {
  const mdx = readFileSync(join(__dirname, 'content.mdx'), 'utf8');
  const has = (t: string) => expect(mdx, `content.mdx should contain "${t}"`).toContain(t);

  it('the four examples', () => {
    const a = run(8_000, 4_000, 60, 900, 3);
    [m(a.spend), m(a.cac), formatRatio(a.ratio!), m(a.leftOver!)].forEach(has);
    const b = run(5_000, 0, 40, 300, 3);
    [m(b.cac, 'GBP'), formatRatio(b.ratio!), m(b.maxCac!, 'GBP'), `**${b.customersNeeded}**`].forEach(has);
    const c = run(400_000, 200_000, 150, 18_000);
    [m(c.spend, 'INR'), m(c.cac, 'INR')].forEach(has);
    const d = run(10_000, 0, 20, 400, 3);
    [m(d.cac), formatRatio(d.ratio!), m(d.leftOver!), `${d.customersNeeded} customers`].forEach(has);
  });
});
