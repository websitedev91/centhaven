import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { formatMoney, formatNumber, formatPercent, roundTo, type CurrencyCode } from '@/lib/format';
import { parseQuery, toQuery } from '@/lib/url-state';
import { clientNotice, DATE_PLACEHOLDER } from './notice';
import { incomeCurve, NEED_RATE_AND_HOURS, quickComparison, rateIncrease, type RateIncreaseError, type RateIncreaseInput, type RateIncreaseResult } from './calc';
import {
  fieldErrors,
  planBSchema,
  rateIncreaseDefaults,
  rateIncreaseSchema,
  rateIncreaseVariant,
  switchRateIncreaseCurrency,
  toCalcInput,
} from './schema';

function ok(r: RateIncreaseResult | RateIncreaseError): RateIncreaseResult {
  if (!r.ok) throw new Error(`expected a result, got: ${r.error}`);
  return r;
}
const r2 = (n: number) => roundTo(n, 2);

const CASES: { input: RateIncreaseInput; currency: CurrencyCode }[] = [
  { input: { rate: 50, hours: 100, increase: 0.2, loss: 0.1 }, currency: 'USD' },
  { input: { rate: 1_000, hours: 120, increase: 0.1, loss: 0.15 }, currency: 'INR' },
  { input: { rate: 80, hours: 60, increase: 0.25, loss: 0 }, currency: 'GBP' },
];

describe('spec test cases', () => {
  it('#1 rate 50 · 100 h · +20% · lose 10%', () => {
    const r = ok(rateIncrease(CASES[0]!.input));
    expect(r2(r.newRate)).toBe(60);
    expect(r2(r.currentRevenue)).toBe(5_000);
    expect(r2(r.newRevenue)).toBe(5_400);
    expect(r2(r.newHours)).toBe(90);
    expect(r2(r.change)).toBe(400);
    expect(roundTo(r.breakEvenLoss * 100, 2)).toBe(16.67);
  });

  it('#2 rate 1,000 · 120 h · +10% · lose 15%', () => {
    const r = ok(rateIncrease(CASES[1]!.input));
    expect(r2(r.newRate)).toBe(1_100);
    expect(r2(r.currentRevenue)).toBe(120_000);
    expect(r2(r.newRevenue)).toBe(112_200);
    expect(r2(r.newHours)).toBe(102);
    expect(r2(r.change)).toBe(-7_800);
    expect(roundTo(r.breakEvenLoss * 100, 2)).toBe(9.09);
  });

  it('#3 rate 80 · 60 h · +25% · lose 0%', () => {
    const r = ok(rateIncrease(CASES[2]!.input));
    expect(r2(r.newRate)).toBe(100);
    expect(r2(r.currentRevenue)).toBe(4_800);
    expect(r2(r.newRevenue)).toBe(6_000);
    expect(r2(r.change)).toBe(1_200);
    expect(roundTo(r.breakEvenLoss * 100, 2)).toBe(20);
  });
});

describe('other checks', () => {
  it('losing exactly the break-even share leaves income unchanged', () => {
    const r = ok(rateIncrease({ rate: 73, hours: 88, increase: 0.35, loss: 0.35 / 1.35 }));
    expect(r2(r.change)).toBe(0);
  });

  it('reports hours freed up', () => {
    expect(r2(ok(rateIncrease(CASES[0]!.input)).hoursFreed)).toBe(10);
  });

  it('guards a zero rate or zero hours without crashing', () => {
    expect(rateIncrease({ rate: 0, hours: 100, increase: 0.2, loss: 0 })).toEqual({ ok: false, error: NEED_RATE_AND_HOURS });
    expect(rateIncrease({ rate: 50, hours: 0, increase: 0.2, loss: 0 })).toEqual({ ok: false, error: NEED_RATE_AND_HOURS });
    expect(fieldErrors(rateIncreaseSchema, { ...rateIncreaseDefaults, rate: 0, hours: 800 })).toEqual({
      rate: 'Minimum is 0.01',
      hours: 'Maximum is 744 hours (a 31-day month)',
    });
    expect(fieldErrors(planBSchema, { increase: 0, loss: 101 })).toEqual({ increase: 'Minimum is 1%', loss: 'Maximum is 100%' });
  });

  it('builds the chart curve from 0% to 50% lost, crossing today at the break-even', () => {
    const curve = incomeCurve({ rate: 50, hours: 100, increase: 0.2 });
    expect(curve).toHaveLength(51);
    expect(r2(curve[0]!.income)).toBe(6_000);
    expect(r2(curve[50]!.income)).toBe(3_000);
    const above = curve.filter((p) => p.income >= 5_000).map((p) => p.loss);
    expect(Math.max(...above)).toBe(0.16);
  });

  it('converts UI percentages for the calc', () => {
    expect(toCalcInput(rateIncreaseDefaults)).toEqual({ rate: 50, hours: 100, increase: 0.2, loss: 0.1 });
  });
});

describe('currency-dependent defaults', () => {
  const usd = rateIncreaseDefaults;

  it('page-load defaults are the spec defaults (USD)', () => {
    expect(usd).toEqual({ currency: 'USD', rate: 50, hours: 100, increase: 20, loss: 10 });
  });

  it.each(['GBP', 'EUR', 'CAD', 'AUD'] as const)('untouched rate stays 50 in %s', (cur) => {
    expect(switchRateIncreaseCurrency(usd, cur)).toEqual({ ...usd, currency: cur });
  });

  it('INR uses 1,000; typed rates and other fields are kept', () => {
    expect(switchRateIncreaseCurrency(usd, 'INR')).toEqual({ ...usd, currency: 'INR', rate: 1_000 });
    const typed = { ...usd, rate: 65, hours: 80, loss: 5 };
    expect(switchRateIncreaseCurrency(typed, 'INR')).toEqual({ ...typed, currency: 'INR' });
  });

  it('share links stay short and restore the currency defaults', () => {
    const inr = switchRateIncreaseCurrency(usd, 'INR');
    expect(toQuery(inr, usd, rateIncreaseVariant)).toBe('?currency=INR');
    expect(parseQuery('?currency=INR&increase=10', rateIncreaseSchema, usd, rateIncreaseVariant)).toEqual({ ...inr, increase: 10 });
  });
});

describe('content.mdx worked examples match the calculator', () => {
  const mdx = readFileSync(join(__dirname, 'content.mdx'), 'utf8');
  it.each(CASES)('$currency example', ({ input, currency }) => {
    const r = ok(rateIncrease(input));
    for (const text of [
      formatMoney(r.newRate, currency),
      formatMoney(r.currentRevenue, currency),
      formatMoney(r.newRevenue, currency),
      formatMoney(Math.abs(r.change), currency),
      formatPercent(r.breakEvenLoss, 2),
    ]) {
      expect(mdx, `content.mdx should contain "${text}"`).toContain(text);
    }
    if (input.loss > 0) expect(mdx).toContain(`**${formatNumber(r.newHours)}**`);
  });
});

describe('review C8: yearly change, quick comparison and client notice', () => {
  it('yearly change = monthly change × 12 for the three spec cases', () => {
    expect(CASES.map(({ input }) => r2(ok(rateIncrease(input)).yearlyChange))).toEqual([4_800, -93_600, 14_400]);
  });

  it('10/20/30% at 50/h · 100 h · lose 10% (hand-checked)', () => {
    const rows = quickComparison({ rate: 50, hours: 100, loss: 0.1 }).map(({ increase, result }) => [
      increase,
      r2(result.newRate),
      r2(result.newRevenue),
      r2(result.change),
      roundTo(result.breakEvenLoss * 100, 2),
    ]);
    expect(rows).toEqual([
      [0.1, 55, 4_950, -50, 9.09],
      [0.2, 60, 5_400, 400, 16.67],
      [0.3, 65, 5_850, 850, 23.08],
    ]);
  });

  it('client notice fills in both rates and the date, with a placeholder until a date is picked', () => {
    const withDate = clientNotice({ oldRate: '$50.00', newRate: '$60.00', effectiveDate: '1 January 2027' });
    expect(withDate).toContain('my hourly rate will change from $50.00 to $60.00, starting 1 January 2027.');
    expect(withDate.startsWith('Hi [client name],')).toBe(true);
    expect(withDate.trim().endsWith('[your name]')).toBe(true);
    expect(clientNotice({ oldRate: '$50.00', newRate: '$60.00' })).toContain(`starting ${DATE_PLACEHOLDER}.`);
  });
});
