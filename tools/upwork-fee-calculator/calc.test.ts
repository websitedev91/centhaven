import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { formatMoney, roundTo } from '@/lib/format';
import { upworkFee, type PercentFeeError, type PercentFeeResult } from './calc';
import { meta } from './meta';
import { FEE_HELP, FEE_RANGE, FEE_RANGE_ERROR, fieldErrors, toCalcInput, upworkFeeDefaults, upworkFeeSchema } from './schema';

function ok(r: PercentFeeResult | PercentFeeError): PercentFeeResult {
  if (!r.ok) throw new Error(`expected a result, got: ${r.error}`);
  return r;
}
const r2 = (n: number) => roundTo(n, 2);
const run = (mode: 'gross' | 'net', amount: number, fee: number) => ok(upworkFee(toCalcInput({ mode, amount, fee })));

describe('spec test cases', () => {
  it('#1 take-home $20 at 10% → charge $22.22', () => {
    const r = run('net', 20, 10);
    expect(r2(r.price)).toBe(22.22);
    expect(r2(r.feeAmount)).toBe(2.22);
    expect(r.takeHome).toBe(20);
  });

  it('#2 charging $1,000 at 10% → take-home $900', () => {
    const r = run('gross', 1_000, 10);
    expect(r2(r.takeHome)).toBe(900);
    expect(r2(r.feeAmount)).toBe(100);
  });

  it('#3 charging $2,000 at 15% → take-home $1,700', () => {
    const r = run('gross', 2_000, 15);
    expect(r2(r.takeHome)).toBe(1_700);
    expect(r2(r.feeAmount)).toBe(300);
  });

  it('#4 charging $500 at 0% → take-home $500', () => {
    const r = run('gross', 500, 0);
    expect(r.takeHome).toBe(500);
    expect(r.feeAmount).toBe(0);
  });

  it('#5 take-home $850 at 15% → charge $1,000', () => {
    const r = run('net', 850, 15);
    expect(r2(r.price)).toBe(1_000);
    expect(r2(r.feeAmount)).toBe(150);
  });

  it.each([51, -1])('#6 fee %s%% → inline error, no result', (fee) => {
    const errors = fieldErrors(upworkFeeSchema, { ...upworkFeeDefaults, fee });
    expect(errors.fee).toBe(FEE_RANGE_ERROR);
    expect(FEE_RANGE_ERROR).toBe('Enter a fee between 0% and 50%');
  });
});

describe('defaults and limits (pure maths, no rates)', () => {
  it('defaults to the 10% example fee and a $1,000 contract', () => {
    expect(upworkFeeDefaults).toEqual({ mode: 'gross', amount: 1_000, fee: 10 });
    expect(Object.keys(fieldErrors(upworkFeeSchema, upworkFeeDefaults))).toHaveLength(0);
    expect(FEE_HELP).toBe('Example only, use the % on your proposal.');
  });

  it('accepts 0–50%', () => {
    expect(FEE_RANGE).toEqual({ min: 0, max: 50 });
    for (const fee of [0, 15, 50]) expect(fieldErrors(upworkFeeSchema, { ...upworkFeeDefaults, fee }).fee).toBeUndefined();
  });

  it('uses no /rates file', () => {
    expect(meta.rates).toEqual([]);
  });

  it("doesn't state an Upwork fee range in the copy", () => {
    const copy = readFileSync(join(__dirname, 'content.mdx'), 'utf8') + JSON.stringify(meta);
    expect(copy).not.toMatch(/0% (to|and|–) 15%|0–15%/);
  });
});

describe('round trip', () => {
  it.each([0, 3.5, 10, 15, 50])('charging the reverse-mode price at %s%% takes home the target', (fee) => {
    const price = run('net', 1_234.56, fee).price;
    expect(r2(run('gross', price, fee).takeHome)).toBe(1_234.56);
  });
});

describe('content.mdx worked examples match the calculator', () => {
  const mdx = readFileSync(join(__dirname, 'content.mdx'), 'utf8');
  const money = (n: number) => formatMoney(n, 'USD');

  it('Alex: $1,000 at 10%', () => {
    const r = run('gross', 1_000, 10);
    for (const t of [money(r.feeAmount), money(r.takeHome), money(run('net', 1_000, 10).price)]) expect(mdx).toContain(t);
  });

  it('Priya: keep $850 at 15%', () => {
    const r = run('net', 850, 15);
    const naive = run('gross', 850, 15).takeHome;
    for (const t of [money(r.price), money(r.feeAmount), money(r.takeHome), money(naive), money(850 - naive)]) expect(mdx).toContain(t);
  });

  it('Sam: $20 an hour at 10%', () => {
    const r = run('net', 20, 10);
    for (const t of [money(r.price), money(r.feeAmount)]) expect(mdx).toContain(t);
    expect(mdx).toContain(`$${30 * 20}`);
    expect(mdx).toContain(`$${30 * run('gross', 20, 10).takeHome}`);
  });
});
