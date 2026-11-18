import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { formatMoney, formatPercent, roundTo, type CurrencyCode } from '@/lib/format';
import { FEES_TOO_HIGH, processingFee, type ProcessingError, type ProcessingMode, type ProcessingResult } from './calc';
import { meta } from './meta';
import { fieldErrors, processingDefaults, processingSchema, switchProcessingCurrency, toCalcInput } from './schema';

function ok(r: ProcessingResult | ProcessingError): ProcessingResult {
  if (!r.ok) throw new Error(`expected a result, got: ${r.error}`);
  return r;
}
const r2 = (n: number) => roundTo(n, 2);
/** Percentages as the UI holds them (3 = 3%). */
const run = (mode: ProcessingMode, amount: number, percent: number, fixed: number, extra = 0) =>
  ok(processingFee(toCalcInput({ mode, amount, percent, fixed, extra })));

describe("spec test cases (Puru's verified cases first)", () => {
  it('$100 at 3% + $0.30 → fee $3.30, receive $96.70', () => {
    const r = run('gross', 100, 3, 0.3);
    expect(r2(r.totalFee)).toBe(3.3);
    expect(r2(r.receive)).toBe(96.7);
    expect(roundTo(r.effectiveRate * 100, 2)).toBe(3.3);
  });

  it('receive $100 at 3% + $0.30 → charge $103.40, fee $3.40', () => {
    const r = run('net', 100, 3, 0.3);
    expect(r2(r.price)).toBe(103.4);
    expect(r2(r.totalFee)).toBe(3.4);
    expect(roundTo(r.price, 4)).toBe(103.4021);
  });

  it('₹10,000 at 2% + ₹10 → fee ₹210, receive ₹9,790', () => {
    const r = run('gross', 10_000, 2, 10);
    expect(r2(r.totalFee)).toBe(210);
    expect(r2(r.receive)).toBe(9_790);
  });

  it('receive ₹10,000 at 2% + ₹10 → charge ₹10,214.29', () => {
    const r = run('net', 10_000, 2, 10);
    expect(r2(r.price)).toBe(10_214.29);
    expect(r2(r.totalFee)).toBe(214.29);
  });

  it.each([100, 150])('fee %s%% → validation error, no result', (percent) => {
    expect(fieldErrors(processingSchema, { ...processingDefaults, percent }).percent).toBe('Maximum is 50%');
    // Even without the schema, the calc refuses fees of 100% or more (no divide by zero).
    expect(processingFee(toCalcInput({ ...processingDefaults, percent })).ok).toBe(false);
  });

  it('$5 at 3% + $0.30 → fee $0.45, receive $4.55, effective rate 9%', () => {
    const r = run('gross', 5, 3, 0.3);
    expect(r2(r.totalFee)).toBe(0.45);
    expect(r2(r.receive)).toBe(4.55);
    expect(roundTo(r.effectiveRate * 100, 2)).toBe(9);
  });

  it('$250 at 2.9% + $0.30 + extra 1.5% → fee $11.30, receive $238.70', () => {
    const r = run('gross', 250, 2.9, 0.3, 1.5);
    expect(r2(r.totalFee)).toBe(11.3);
    expect(r2(r.receive)).toBe(238.7);
  });

  it('$0.20 at 3% + $0.30 → fee $0.31, receive −$0.11 with a warning', () => {
    const r = run('gross', 0.2, 3, 0.3);
    expect(r2(r.totalFee)).toBe(0.31);
    expect(r2(r.receive)).toBe(-0.11);
    expect(r.feeExceedsPayment).toBe(true);
  });

  it('60% → "Maximum is 50%"', () => {
    expect(fieldErrors(processingSchema, { ...processingDefaults, percent: 60 }).percent).toBe('Maximum is 50%');
  });

  it('50% + extra 50% → "The fees add up to 100% or more", no divide by zero', () => {
    expect(Object.keys(fieldErrors(processingSchema, { ...processingDefaults, percent: 50, extra: 50 }))).toHaveLength(0);
    const r = processingFee(toCalcInput({ ...processingDefaults, mode: 'net', percent: 50, extra: 50 }));
    expect(r).toEqual({ ok: false, error: FEES_TOO_HIGH });
  });

  it('$0 payment → no crash, effective rate 0', () => {
    const r = run('gross', 0, 3, 0);
    expect(r.totalFee).toBe(0);
    expect(r.effectiveRate).toBe(0);
  });
});

describe('currency defaults', () => {
  it('starts at 100, 3% + 0.30 in USD', () => {
    expect(processingDefaults).toEqual({ mode: 'gross', currency: 'USD', amount: 100, percent: 3, fixed: 0.3, extra: 0 });
  });

  it('untouched fields follow the currency (USD → INR → GBP)', () => {
    const inr = switchProcessingCurrency(processingDefaults, 'INR');
    expect(inr).toMatchObject({ currency: 'INR', amount: 10_000, fixed: 10, percent: 3 });
    expect(switchProcessingCurrency(inr, 'GBP')).toMatchObject({ currency: 'GBP', amount: 100, fixed: 0.3 });
  });

  it('typed values are kept when the currency changes', () => {
    const edited = { ...processingDefaults, amount: 2_500, fixed: 0.5 };
    expect(switchProcessingCurrency(edited, 'INR')).toMatchObject({ currency: 'INR', amount: 2_500, fixed: 0.5 });
  });
});

describe('round trip', () => {
  it.each([
    [100, 3, 0.3, 0],
    [1_234.56, 2.9, 0.3, 1.5],
    [10_000, 2, 10, 0],
  ])('charging the reverse-mode price for %s receives the target', (amount, percent, fixed, extra) => {
    const price = run('net', amount, percent, fixed, extra).price;
    expect(r2(run('gross', price, percent, fixed, extra).receive)).toBe(amount);
  });
});

describe('scope rule', () => {
  it('uses no /rates file and names providers without stating their rates', () => {
    expect(meta.rates).toEqual([]);
    const mdx = readFileSync(join(__dirname, 'content.mdx'), 'utf8');
    expect(mdx).toContain('PayPal, Stripe, Square or any provider');
    expect(mdx).not.toMatch(/(PayPal|Stripe|Square)[^.\n]{0,40}\d+(\.\d+)?%/);
  });
});

describe('content.mdx worked examples match the calculator', () => {
  const mdx = readFileSync(join(__dirname, 'content.mdx'), 'utf8');
  const has = (t: string) => expect(mdx, `content.mdx should contain "${t}"`).toContain(t);
  const m = (n: number, c: CurrencyCode = 'USD') => formatMoney(n, c);

  it('Maya: $100 and the reverse price', () => {
    const r = run('gross', 100, 3, 0.3);
    const back = run('net', 100, 3, 0.3);
    [m(r.totalFee), m(r.receive), m(back.price), m(back.totalFee)].forEach(has);
  });

  it('Maya: $5 postcard, and the fixed-fee table', () => {
    const small = run('gross', 5, 3, 0.3);
    const big = run('gross', 100, 3, 0.3);
    [m(small.totalFee), m(small.receive), formatPercent(small.effectiveRate, 2), formatPercent(big.effectiveRate, 2)].forEach(has);
  });

  it('Arjun: ₹10,000 at 2% + ₹10', () => {
    const r = run('gross', 10_000, 2, 10);
    const back = run('net', 10_000, 2, 10);
    [m(r.totalFee, 'INR'), m(r.receive, 'INR'), m(back.price, 'INR')].forEach(has);
  });
});
