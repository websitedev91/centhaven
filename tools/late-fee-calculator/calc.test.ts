import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { formatMoney, roundTo, type CurrencyCode } from '@/lib/format';
import { lateFee } from './calc';
import { meta } from './meta';
import { fieldErrors, lateFeeDefaults, lateFeeSchema, switchLateFeeCurrency, toCalcInput, type LateFeeState } from './schema';

const r2 = (n: number) => roundTo(n, 2);
const run = (s: Partial<LateFeeState>) => lateFee(toCalcInput({ ...lateFeeDefaults, ...s }));

describe('spec test cases', () => {
  it('#1 $2,000 · 45 days · 2% per 30 days → fee $60, total $2,060', () => {
    const r = run({ amount: 2_000, days: 45, type: 'monthly', pct: 2 });
    expect(r2(r.fee)).toBe(60);
    expect(r2(r.total)).toBe(2_060);
  });

  it('#2 same with 15 days grace → 30 chargeable days, fee $40', () => {
    const r = run({ amount: 2_000, days: 45, type: 'monthly', pct: 2, grace: 15 });
    expect(r.chargeableDays).toBe(30);
    expect(r2(r.fee)).toBe(40);
  });

  it('#3 $1,500 · 30 days · flat $25 → fee $25, total $1,525', () => {
    const r = run({ amount: 1_500, days: 30, type: 'flat', flat: 25 });
    expect(r.fee).toBe(25);
    expect(r.total).toBe(1_525);
  });

  it('#4 £1,200 · 10 days · one-off 5% → fee £60, total £1,260', () => {
    const r = run({ currency: 'GBP', amount: 1_200, days: 10, type: 'oneoff', pct: 5 });
    expect(r2(r.fee)).toBe(60);
    expect(r2(r.total)).toBe(1_260);
  });

  it('#5 ₹50,000 · 60 days · 1.5% per 30 days → fee ₹1,500, total ₹51,500', () => {
    const r = run({ currency: 'INR', amount: 50_000, days: 60, type: 'monthly', pct: 1.5 });
    expect(r2(r.fee)).toBe(1_500);
    expect(r2(r.total)).toBe(51_500);
  });
});

describe('edge cases', () => {
  it.each(['flat', 'oneoff', 'monthly'] as const)('%s: 0 days late → no fee', (type) => {
    expect(run({ days: 0, type }).fee).toBe(0);
  });

  it.each(['flat', 'oneoff', 'monthly'] as const)('%s: days within the grace period → no fee', (type) => {
    const r = run({ days: 10, grace: 15, type });
    expect(r.chargeableDays).toBe(0);
    expect(r.fee).toBe(0);
  });

  it('amount 0 → % fees are 0, a flat fee still applies', () => {
    expect(run({ amount: 0, type: 'monthly' }).fee).toBe(0);
    expect(run({ amount: 0, type: 'oneoff' }).fee).toBe(0);
    expect(run({ amount: 0, type: 'flat', flat: 25 }).fee).toBe(25);
  });

  it.each([
    ['amount', -1],
    ['days', -1],
    ['grace', -1],
    ['pct', -1],
    ['pct', 101],
    ['flat', -1],
  ] as const)('%s = %s → field error', (key, value) => {
    expect(fieldErrors(lateFeeSchema, { ...lateFeeDefaults, [key]: value })[key]).toBeDefined();
  });
});

describe('currency defaults', () => {
  it('untouched amount and flat fee follow the currency; typed values are kept', () => {
    expect(switchLateFeeCurrency(lateFeeDefaults, 'INR')).toMatchObject({ amount: 50_000, flat: 500 });
    expect(switchLateFeeCurrency(lateFeeDefaults, 'GBP')).toMatchObject({ amount: 2_000, flat: 20 });
    expect(switchLateFeeCurrency({ ...lateFeeDefaults, amount: 3_300 }, 'INR')).toMatchObject({ amount: 3_300, flat: 500 });
  });
});

describe('content rules (Puru, 2026-11-18)', () => {
  it('never mentions legal or statutory late-payment rates', () => {
    const copy = readFileSync(join(__dirname, 'content.mdx'), 'utf8') + JSON.stringify(meta);
    expect(copy).not.toMatch(/statutor|legal|\blaw\b|regulat|government|act of/i);
  });
});

describe('content.mdx worked examples match the calculator', () => {
  const mdx = readFileSync(join(__dirname, 'content.mdx'), 'utf8');
  const has = (t: string) => expect(mdx, `content.mdx should contain "${t}"`).toContain(t);
  const m = (n: number, c: CurrencyCode = 'USD') => formatMoney(n, c);

  it('Nina, Leo, Grace and Arjun', () => {
    const nina = run({ amount: 2_000, days: 45, type: 'monthly', pct: 2 });
    [m(nina.fee), m(nina.total), m(nina.perDay!)].forEach(has);
    has(m(run({ amount: 2_000, days: 45, type: 'monthly', pct: 2, grace: 15 }).fee));
    const leo = run({ amount: 1_500, days: 30, type: 'flat', flat: 25 });
    [m(leo.fee), m(leo.total)].forEach(has);
    const grace = run({ amount: 1_200, days: 10, type: 'oneoff', pct: 5 });
    [m(grace.fee, 'GBP'), m(grace.total, 'GBP')].forEach(has);
    const arjun = run({ amount: 50_000, days: 60, type: 'monthly', pct: 1.5 });
    [m(arjun.fee, 'INR'), m(arjun.total, 'INR')].forEach(has);
  });
});
