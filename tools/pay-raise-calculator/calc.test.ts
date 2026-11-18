import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { formatMoney, roundTo, type CurrencyCode } from '@/lib/format';
import { parseQuery, toQuery } from '@/lib/url-state';
import { NEED_CURRENT_PAY, payRaise, periodsPerYear, type PayRaiseError, type PayRaiseResult } from './calc';
import {
  examplePay,
  fieldErrors,
  payRaiseDefaults,
  payRaiseSchema,
  payRaiseVariant,
  switchPayContext,
  toCalcInput,
  type PayRaiseState,
} from './schema';

function ok(r: PayRaiseResult | PayRaiseError): PayRaiseResult {
  if (!r.ok) throw new Error(`expected a result, got: ${r.error}`);
  return r;
}
const r2 = (n: number) => roundTo(n, 2);
const run = (s: Partial<PayRaiseState>) => payRaise(toCalcInput({ ...payRaiseDefaults, ...s }));

describe('spec test cases', () => {
  it('#1 $60,000 a year + 5% → $63,000, raise $3,000', () => {
    const r = ok(run({ current: 60_000, raise: 5 }));
    expect(r2(r.newPay)).toBe(63_000);
    expect(r2(r.raiseAmount)).toBe(3_000);
  });

  it('#2 old $50,000, new $54,000 → 8%, $4,000 a year', () => {
    const r = ok(run({ mode: 'newpay', current: 50_000, newPay: 54_000 }));
    expect(roundTo(r.raise * 100, 4)).toBe(8);
    expect(r2(r.raisePerYear)).toBe(4_000);
  });

  it('#3 ₹12,00,000 + 10% → ₹13,20,000, raise ₹1,20,000', () => {
    const r = ok(run({ currency: 'INR', current: 1_200_000, raise: 10 }));
    expect(r2(r.newPay)).toBe(1_320_000);
    expect(r2(r.raiseAmount)).toBe(120_000);
  });

  it('#4 $25/hour + 4% at 40 h/week → $26/hour, +$2,080 a year, $54,080 a year', () => {
    const r = ok(run({ period: 'hour', hours: 40, current: 25, raise: 4 }));
    expect(r2(r.newPay)).toBe(26);
    expect(r2(r.raiseAmount)).toBe(1);
    expect(r2(r.raisePerYear)).toBe(2_080);
    expect(r2(r.newPerYear)).toBe(54_080);
  });

  it('#5 5% raise with 3% inflation → real raise 1.94% (1.9417%)', () => {
    const r = ok(run({ raise: 5, inflation: 3 }));
    expect(roundTo(r.realRaise! * 100, 4)).toBe(1.9417);
  });

  it('#6 $4,000/month → $3,800 → a 5% pay cut, −$2,400 a year', () => {
    const r = ok(run({ mode: 'newpay', period: 'month', current: 4_000, newPay: 3_800 }));
    expect(roundTo(r.raise * 100, 4)).toBe(-5);
    expect(r2(r.raisePerYear)).toBe(-2_400);
  });
});

describe('edge cases', () => {
  it('current pay 0 in new-pay mode → error, no divide by zero', () => {
    expect(run({ mode: 'newpay', current: 0, newPay: 1_000 })).toEqual({ ok: false, error: NEED_CURRENT_PAY });
  });

  it('current pay 0 in raise mode → new pay 0, no error', () => {
    expect(ok(run({ current: 0, raise: 10 })).newPay).toBe(0);
  });

  it('no inflation → no real raise row', () => {
    expect(ok(run({ inflation: 0 })).realRaise).toBeNull();
  });

  it.each([
    ['raise', -51],
    ['raise', 201],
    ['current', -1],
    ['newPay', -1],
    ['inflation', -1],
    ['hours', 0],
  ] as const)('%s = %s → field error', (key, value) => {
    expect(fieldErrors(payRaiseSchema, { ...payRaiseDefaults, [key]: value })[key]).toBeDefined();
  });

  it('periods per year', () => {
    expect([periodsPerYear('hour', 40), periodsPerYear('week', 0), periodsPerYear('month', 0), periodsPerYear('year', 0)]).toEqual([2_080, 52, 12, 1]);
  });
});

describe('example defaults per currency and period (Puru, 2026-11-18)', () => {
  it('USD: year 60,000 / month 5,000 / week 1,150 / hour 29', () => {
    expect(['year', 'month', 'week', 'hour'].map((p) => examplePay('USD', p as never).current)).toEqual([60_000, 5_000, 1_150, 29]);
  });

  it('other currencies scale the same way', () => {
    expect(['year', 'month', 'week', 'hour'].map((p) => examplePay('GBP', p as never).current)).toEqual([40_000, 3_350, 770, 19]);
    expect(['year', 'month', 'week', 'hour'].map((p) => examplePay('INR', p as never).current)).toEqual([1_200_000, 100_000, 23_080, 577]);
    for (const c of ['CAD', 'AUD'] as CurrencyCode[]) expect(examplePay(c, 'year').current).toBe(60_000);
  });

  it('new pay example is the current example + 5%', () => {
    expect(examplePay('USD', 'year').newPay).toBe(63_000);
    expect(examplePay('USD', 'week').newPay).toBe(1_207.5);
  });

  it('switching the period loads that period’s example only if the user hasn’t typed a value', () => {
    const month = switchPayContext(payRaiseDefaults, { period: 'month' });
    expect(month).toMatchObject({ period: 'month', current: 5_000, newPay: 5_250 });
    const typed = { ...payRaiseDefaults, current: 72_000 };
    expect(switchPayContext(typed, { period: 'month' })).toMatchObject({ period: 'month', current: 72_000, newPay: 5_250 });
  });

  it('switching the currency follows the same rule', () => {
    const inr = switchPayContext(payRaiseDefaults, { currency: 'INR' });
    expect(inr).toMatchObject({ currency: 'INR', current: 1_200_000, newPay: 1_260_000 });
    const hourlyTyped = { ...switchPayContext(payRaiseDefaults, { period: 'hour' }), current: 31 };
    expect(switchPayContext(hourlyTyped, { currency: 'GBP' })).toMatchObject({ currency: 'GBP', period: 'hour', current: 31, newPay: 19.95 });
  });

  it('share links restore the period’s example (currency + period read first)', () => {
    const state = switchPayContext(payRaiseDefaults, { period: 'month' });
    const q = toQuery(state, payRaiseDefaults, payRaiseVariant);
    expect(q).toBe('?period=month');
    expect(parseQuery(q, payRaiseSchema, payRaiseDefaults, payRaiseVariant)).toEqual(state);
  });
});

describe('content.mdx worked examples match the calculator', () => {
  const mdx = readFileSync(join(__dirname, 'content.mdx'), 'utf8');
  const has = (t: string) => expect(mdx, `content.mdx should contain "${t}"`).toContain(t);
  const m = (n: number, c: CurrencyCode = 'USD') => formatMoney(n, c);

  it('Emma, Daniel, Priya and Tom', () => {
    const emma = ok(run({ current: 60_000, raise: 5 }));
    [m(emma.newPay), m(emma.raiseAmount), m(emma.raiseAmount / 12)].forEach(has);
    const daniel = ok(run({ mode: 'newpay', current: 50_000, newPay: 54_000 }));
    [`${roundTo(daniel.raise * 100, 2)}%`, m(daniel.raiseAmount)].forEach(has);
    const priya = ok(run({ currency: 'INR', current: 1_200_000, raise: 10 }));
    [m(priya.newPay, 'INR'), m(priya.raiseAmount, 'INR'), m(priya.raiseAmount / 12, 'INR')].forEach(has);
    const tom = ok(run({ period: 'hour', hours: 40, current: 25, raise: 4 }));
    [m(tom.newPay), m(tom.raisePerYear), m(tom.newPerYear)].forEach(has);
    has(`${roundTo(ok(run({ raise: 5, inflation: 3 })).realRaise! * 100, 2)}%`);
  });
});
