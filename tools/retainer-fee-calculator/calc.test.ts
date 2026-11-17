import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { formatMoney, roundTo, type CurrencyCode } from '@/lib/format';
import { parseQuery, toQuery } from '@/lib/url-state';
import { NO_HOURS, retainerFee, type RetainerError, type RetainerInput, type RetainerResult } from './calc';
import {
  fieldErrors,
  planBSchema,
  retainerDefaults,
  retainerSchema,
  retainerVariant,
  switchRetainerCurrency,
  toCalcInput,
} from './schema';

function ok(r: RetainerResult | RetainerError): RetainerResult {
  if (!r.ok) throw new Error(`expected a result, got: ${r.error}`);
  return r;
}
const r2 = (n: number) => roundTo(n, 2);

const CASES: { input: RetainerInput; currency: CurrencyCode }[] = [
  { input: { rate: 100, hours: 20, discount: 0.1, months: 6, usage: 0.8 }, currency: 'USD' },
  { input: { rate: 2_000, hours: 30, discount: 0.15, months: 12, usage: 1 }, currency: 'INR' },
  { input: { rate: 75, hours: 10, discount: 0, months: 3, usage: 0.5 }, currency: 'GBP' },
];

describe('spec test cases', () => {
  it('#1 rate 100 · 20 h · 10% · 6 months · usage 80%', () => {
    const r = ok(retainerFee(CASES[0]!.input));
    expect(r2(r.monthlyFee)).toBe(1_800);
    expect(r2(r.hourlyBilling)).toBe(2_000);
    expect(r2(r.discountGiven)).toBe(200);
    expect(r2(r.contractValue)).toBe(10_800);
    expect(r2(r.effectiveRate!)).toBe(112.5);
  });

  it('#2 rate 2,000 · 30 h · 15% · 12 months · usage 100%', () => {
    const r = ok(retainerFee(CASES[1]!.input));
    expect(r2(r.monthlyFee)).toBe(51_000);
    expect(r2(r.hourlyBilling)).toBe(60_000);
    expect(r2(r.discountGiven)).toBe(9_000);
    expect(r2(r.contractValue)).toBe(612_000);
    expect(r2(r.effectiveRate!)).toBe(1_700);
  });

  it('#3 rate 75 · 10 h · 0% · 3 months · usage 50%', () => {
    const r = ok(retainerFee(CASES[2]!.input));
    expect(r2(r.monthlyFee)).toBe(750);
    expect(r2(r.hourlyBilling)).toBe(750);
    expect(r2(r.discountGiven)).toBe(0);
    expect(r2(r.contractValue)).toBe(2_250);
    expect(r2(r.effectiveRate!)).toBe(150);
  });

  it('#4 usage 0%: fee shown, effective rate hidden (null), no crash', () => {
    const r = ok(retainerFee({ ...CASES[0]!.input, usage: 0 }));
    expect(r2(r.monthlyFee)).toBe(1_800);
    expect(r.effectiveRate).toBeNull();
  });
});

describe('other checks', () => {
  it('guards zero hours and validates ranges', () => {
    expect(retainerFee({ ...CASES[0]!.input, hours: 0 })).toEqual({ ok: false, error: NO_HOURS });
    expect(fieldErrors(retainerSchema, { ...retainerDefaults, hours: 0, discount: 51, months: 2.5 })).toEqual({
      hours: 'Minimum is 1 hour',
      discount: 'Maximum is 50%',
      months: 'Use whole months',
    });
    expect(fieldErrors(planBSchema, { hours: 800, discount: 10 })).toEqual({ hours: 'Maximum is 744 hours (a 31-day month)' });
  });

  it('converts UI percentages for the calc', () => {
    expect(toCalcInput(retainerDefaults)).toEqual(CASES[0]!.input);
  });
});

describe('currency-dependent defaults', () => {
  const usd = retainerDefaults;

  it.each([
    ['CAD', 100],
    ['AUD', 100],
    ['GBP', 75],
    ['EUR', 75],
    ['INR', 2_000],
  ] as const)('untouched rate switches to the %s default', (cur, rate) => {
    expect(switchRetainerCurrency(usd, cur)).toEqual({ ...usd, currency: cur, rate });
  });

  it('keeps a typed rate and never changes hours, discount, months or usage', () => {
    const typed = { ...usd, rate: 120, hours: 30, discount: 5 };
    expect(switchRetainerCurrency(typed, 'INR')).toEqual({ ...typed, currency: 'INR' });
  });

  it('share links stay short and restore the currency defaults', () => {
    const inr = switchRetainerCurrency(usd, 'INR');
    expect(toQuery(inr, usd, retainerVariant)).toBe('?currency=INR');
    expect(parseQuery('?currency=INR&hours=30', retainerSchema, usd, retainerVariant)).toEqual({ ...inr, hours: 30 });
  });
});

describe('content.mdx worked examples match the calculator', () => {
  const mdx = readFileSync(join(__dirname, 'content.mdx'), 'utf8');
  it.each(CASES)('$currency example', ({ input, currency }) => {
    const r = ok(retainerFee(input));
    for (const n of [r.monthlyFee, r.hourlyBilling, r.discountGiven, r.contractValue, r.effectiveRate!]) {
      const text = `**${formatMoney(n, currency)}**`;
      expect(mdx, `content.mdx should contain "${text}"`).toContain(text);
    }
  });

  it('the Indian example states the yearly cost of the discount correctly', () => {
    const r = ok(retainerFee(CASES[1]!.input));
    expect(mdx).toContain(formatMoney(r.discountGiven * 12, 'INR', 0));
  });
});
